from __future__ import annotations

import json
import re
import uuid
import zipfile
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable
from xml.etree import ElementTree

import PIL.Image
from pypdf import PdfReader

from app.config import GOOGLE_API_KEY, KNOWN_IMAGE_TRANSCRIPTS


VERDICT_ELIGIBLE = "eligible"
VERDICT_NOT_ELIGIBLE = "not_eligible"
VERDICT_MANUAL_REVIEW = "manual_review"


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def make_id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:10]}"


def slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def normalize_whitespace(text: str) -> str:
    return re.sub(r"\s+", " ", text or "").strip()


def strip_indian_number(value: str) -> float:
    cleaned = value.replace(",", "").strip()
    return float(cleaned)


def parse_money_value(text: str) -> float | None:
    lowered = text.lower()
    candidates: list[float] = []

    for pattern, multiplier in (
        (r"(?:\b(?:rs\.?|rupees?|inr)\b|₹)\s*(\d[\d,]*(?:\.\d+)?)", 1),
        (r"(\d[\d,]*(?:\.\d+)?)\s*crore", 10_000_000),
        (r"(\d[\d,]*(?:\.\d+)?)\s*lakh", 100_000),
        (r"(\d[\d,]{4,}(?:\.\d+)?)", 1),
    ):
        for match in re.finditer(pattern, lowered):
            raw = match.group(1).strip()
            if not raw or not any(char.isdigit() for char in raw):
                continue
            candidates.append(strip_indian_number(raw) * multiplier)

    return max(candidates) if candidates else None


def format_money(amount: float | None) -> str:
    if amount is None:
        return "Not specified"
    return f"INR {amount:,.0f}"


def parse_years_value(text: str) -> float | None:
    match = re.search(r"(\d+(?:\.\d+)?)\s*(?:\([^)]*\)\s*)?years?", text, re.IGNORECASE)
    if match:
        return float(match.group(1))
    return None


def parse_project_count(text: str) -> float | None:
    patterns = [
        r"(\d+)\s*(?:similar\s+)?projects?",
        r"minimum of\s+(\d+)",
        r"at least\s+(\d+)\s*(?:similar\s+)?projects?",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return float(match.group(1))
    return None


def text_to_sentences(text: str) -> list[str]:
    content = normalize_whitespace(text).replace(" .", ".")
    if not content:
        return []
    sentences = re.split(r"(?<=[.!?])\s+", content)
    return [sentence.strip() for sentence in sentences if sentence.strip()]


def best_sentence(text: str, keywords: Iterable[str]) -> str:
    sentences = text_to_sentences(text)
    keyword_set = [keyword.lower() for keyword in keywords]
    for sentence in sentences:
        lowered = sentence.lower()
        if all(keyword in lowered for keyword in keyword_set):
            return sentence
    for sentence in sentences:
        lowered = sentence.lower()
        if any(keyword in lowered for keyword in keyword_set):
            return sentence
    return sentences[0] if sentences else ""


def split_tender_clauses(text: str) -> list[str]:
    normalized = normalize_whitespace(text)
    clauses = re.split(r"(?=\b\d+\.\d+\b)", normalized)
    cleaned = [clause.strip() for clause in clauses if clause.strip()]
    if cleaned:
        return cleaned
    return [sentence for sentence in text_to_sentences(normalized) if sentence]


@dataclass
class ExtractedDocument:
    filename: str
    extension: str
    extracted_text: str
    extraction_method: str
    extraction_confidence: float
    extraction_status: str
    notes: str


def try_gemini_ocr(image_path: Path) -> tuple[str, str, float, str]:
    if not GOOGLE_API_KEY:
        return "", "image_pending_ocr", 0.18, "OCR unavailable in offline mode."

    import google.generativeai as genai

    genai.configure(api_key=GOOGLE_API_KEY)
    prompt = (
        "Extract all readable text from this government procurement document image. "
        "Preserve key numbers, dates, company names, certifications, contract references, "
        "and financial values."
    )
    image = PIL.Image.open(image_path)
    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content([prompt, image])
    extracted = normalize_whitespace(getattr(response, "text", ""))
    if extracted:
        return extracted, "gemini_vision", 0.88, "Image OCR completed with Gemini Vision."
    return "", "image_pending_ocr", 0.18, "OCR returned no readable text."


def extract_text_from_path(file_path: Path) -> ExtractedDocument:
    extension = file_path.suffix.lower()
    notes = ""

    if extension == ".pdf":
        text = "\n".join((page.extract_text() or "") for page in PdfReader(str(file_path)).pages)
        normalized = normalize_whitespace(text)
        if normalized:
            return ExtractedDocument(
                filename=file_path.name,
                extension=extension,
                extracted_text=normalized,
                extraction_method="pdf_text",
                extraction_confidence=0.94,
                extraction_status="complete",
                notes="Embedded PDF text extracted successfully.",
            )
        return ExtractedDocument(
            filename=file_path.name,
            extension=extension,
            extracted_text="",
            extraction_method="scanned_pdf_pending_ocr",
            extraction_confidence=0.2,
            extraction_status="needs_review",
            notes="No embedded text found. OCR is required for scanned PDFs.",
        )

    if extension == ".docx":
        with zipfile.ZipFile(file_path) as archive:
            xml_content = archive.read("word/document.xml")
        root = ElementTree.fromstring(xml_content)
        namespace = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
        chunks = [node.text for node in root.findall(".//w:t", namespace) if node.text]
        text = normalize_whitespace(" ".join(chunks))
        return ExtractedDocument(
            filename=file_path.name,
            extension=extension,
            extracted_text=text,
            extraction_method="docx_xml",
            extraction_confidence=0.9 if text else 0.2,
            extraction_status="complete" if text else "needs_review",
            notes="DOCX content extracted from document XML." if text else "The DOCX file had no readable body text.",
        )

    if extension in {".txt", ".md"}:
        text = normalize_whitespace(file_path.read_text(encoding="utf-8", errors="ignore"))
        return ExtractedDocument(
            filename=file_path.name,
            extension=extension,
            extracted_text=text,
            extraction_method="plain_text",
            extraction_confidence=0.96 if text else 0.2,
            extraction_status="complete" if text else "needs_review",
            notes="Text file ingested directly." if text else "The text file is empty.",
        )

    if extension in {".png", ".jpg", ".jpeg", ".webp"}:
        if file_path.name in KNOWN_IMAGE_TRANSCRIPTS:
            return ExtractedDocument(
                filename=file_path.name,
                extension=extension,
                extracted_text=KNOWN_IMAGE_TRANSCRIPTS[file_path.name],
                extraction_method="seed_transcript",
                extraction_confidence=0.86,
                extraction_status="complete",
                notes="Representative OCR transcript bundled with the demo seed.",
            )

        sidecar = file_path.with_suffix(".txt")
        if sidecar.exists():
            return ExtractedDocument(
                filename=file_path.name,
                extension=extension,
                extracted_text=normalize_whitespace(sidecar.read_text(encoding="utf-8", errors="ignore")),
                extraction_method="sidecar_transcript",
                extraction_confidence=0.83,
                extraction_status="complete",
                notes="OCR transcript loaded from a sidecar text file.",
            )

        text, method, confidence, notes = try_gemini_ocr(file_path)
        return ExtractedDocument(
            filename=file_path.name,
            extension=extension,
            extracted_text=text,
            extraction_method=method,
            extraction_confidence=confidence,
            extraction_status="complete" if text else "needs_review",
            notes=notes,
        )

    return ExtractedDocument(
        filename=file_path.name,
        extension=extension,
        extracted_text="",
        extraction_method="unsupported",
        extraction_confidence=0.05,
        extraction_status="needs_review",
        notes="This file type is stored but not yet parsed automatically.",
    )


def infer_mandatory(clause: str, global_context: str) -> bool:
    lowered = clause.lower()
    if any(token in lowered for token in ("mandatory", "must", "shall", "strictly required", "non-negotiable")):
        return True
    if any(token in lowered for token in ("optional", "desirable", "preferred", "preferably", "may")):
        return False
    return "mandatory eligibility criteria" in global_context.lower()


def extract_criteria_from_tender(tender_text: str, source_document_id: str) -> list[dict]:
    clauses = split_tender_clauses(tender_text)
    criteria: list[dict] = []
    seen_keys: set[tuple[str, str]] = set()

    for index, clause in enumerate(clauses, start=1):
        lowered = clause.lower()
        is_mandatory = infer_mandatory(clause, tender_text)
        category = None
        rule_type = None
        title = None
        threshold_text = None
        threshold_value = None
        unit = None
        confidence = 0.72

        if any(token in lowered for token in ("turnover", "financial turnover", "gross revenue", "annual revenue")):
            category = "Financial"
            rule_type = "turnover"
            title = "Minimum annual turnover"
            threshold_value = parse_money_value(clause)
            threshold_text = (
                f"At least {format_money(threshold_value)} in annual turnover"
                if threshold_value
                else "Minimum annual turnover required"
            )
            unit = "INR"
            confidence = 0.94
        elif "gst" in lowered:
            category = "Compliance"
            rule_type = "gst"
            title = "Valid GST registration"
            threshold_text = "Valid and active GST registration certificate"
            confidence = 0.95
        elif "iso" in lowered and "9001" in lowered:
            category = "Compliance"
            rule_type = "iso_9001"
            title = "ISO 9001 certification"
            threshold_text = "Valid ISO 9001 certificate"
            confidence = 0.93
        elif "experience" in lowered or "past performance" in lowered:
            category = "Technical"
            if "similar project" in lowered:
                rule_type = "project_count"
                title = "Similar projects completed"
                threshold_value = parse_project_count(clause)
                threshold_text = (
                    f"At least {int(threshold_value)} similar projects"
                    if threshold_value
                    else "Prior similar project experience required"
                )
                unit = "count"
                confidence = 0.9
            else:
                rule_type = "experience_years"
                title = "Relevant operational experience"
                threshold_value = parse_years_value(clause)
                threshold_text = (
                    f"At least {int(threshold_value)} years of relevant experience"
                    if threshold_value
                    else "Relevant experience required"
                )
                unit = "years"
                confidence = 0.9
        elif any(token in lowered for token in ("certificate", "registration", "license", "licence", "affidavit")):
            category = "Compliance"
            rule_type = "document_check"
            title = "Mandatory document evidence"
            threshold_text = best_sentence(clause, ("certificate",))
            confidence = 0.74
        if not category or not rule_type or not title:
            continue

        unique_key = (rule_type, threshold_text or title)
        if unique_key in seen_keys:
            continue
        seen_keys.add(unique_key)

        criteria.append(
            {
                "id": make_id("crit"),
                "code": f"CRIT-{index:03d}",
                "category": category,
                "rule_type": rule_type,
                "title": title,
                "description": normalize_whitespace(clause),
                "threshold_text": threshold_text or title,
                "threshold_value": threshold_value,
                "unit": unit,
                "is_mandatory": is_mandatory,
                "extraction_confidence": confidence,
                "source_document_id": source_document_id,
                "source_excerpt": best_sentence(clause, tuple(title.lower().split()[:2])),
            }
        )

    if criteria:
        return criteria

    return [
        {
            "id": make_id("crit"),
            "code": "CRIT-001",
            "category": "Compliance",
            "rule_type": "document_check",
            "title": "Manual tender review required",
            "description": "The tender did not yield structured criteria in offline mode.",
            "threshold_text": "Manual officer review required",
            "threshold_value": None,
            "unit": None,
            "is_mandatory": True,
            "extraction_confidence": 0.2,
            "source_document_id": source_document_id,
            "source_excerpt": best_sentence(tender_text, ("tender",)),
        }
    ]


def build_text_snippet(text: str, phrase: str | None = None) -> str:
    if not text:
        return ""
    if phrase:
        sentence = best_sentence(text, (phrase,))
        if sentence:
            return sentence[:280]
    sentence = text_to_sentences(text)
    return sentence[0][:280] if sentence else text[:280]


def extract_numeric_evidence(documents: list[dict], keywords: Iterable[str], parser) -> tuple[dict | None, float | None, str]:
    best_doc = None
    best_value = None
    best_snippet = ""

    for document in documents:
        content = document.get("extracted_text") or ""
        if not content:
            continue
        lowered = content.lower()
        if not any(keyword in lowered for keyword in keywords):
            continue
        value = parser(content)
        if value is None:
            continue
        if best_value is None or value > best_value:
            best_doc = document
            best_value = value
            best_snippet = build_text_snippet(content, next(iter(keywords), None))

    return best_doc, best_value, best_snippet


def evaluate_turnover(criterion: dict, documents: list[dict]) -> dict:
    threshold = criterion.get("threshold_value")
    document, found_value, snippet = extract_numeric_evidence(
        documents,
        ("turnover", "revenue", "financial"),
        parse_money_value,
    )
    if found_value is None:
        return {
            "verdict": VERDICT_MANUAL_REVIEW,
            "reason": "No machine-readable turnover value was found in the bidder submissions.",
            "confidence": 0.42,
            "source_document_id": None,
            "source_excerpt": "The uploaded documents did not contain a readable turnover figure.",
            "found_value": "Not found",
            "rule_value": criterion.get("threshold_text"),
        }

    if threshold is not None and found_value >= threshold:
        return {
            "verdict": VERDICT_ELIGIBLE,
            "reason": f"Turnover evidence of {format_money(found_value)} meets the required threshold.",
            "confidence": min(0.98, 0.7 + (document.get("extraction_confidence") or 0.0) / 3),
            "source_document_id": document["id"],
            "source_excerpt": snippet,
            "found_value": format_money(found_value),
            "rule_value": format_money(threshold),
        }

    return {
        "verdict": VERDICT_NOT_ELIGIBLE,
        "reason": f"Turnover evidence of {format_money(found_value)} is below the required threshold.",
        "confidence": min(0.97, 0.68 + (document.get("extraction_confidence") or 0.0) / 3),
        "source_document_id": document["id"] if document else None,
        "source_excerpt": snippet,
        "found_value": format_money(found_value),
        "rule_value": format_money(threshold),
    }


def evaluate_gst(criterion: dict, documents: list[dict]) -> dict:
    pattern = re.compile(r"\b\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]\b")
    for document in documents:
        content = document.get("extracted_text") or ""
        if "gst" not in content.lower():
            continue
        match = pattern.search(content.upper())
        if not match:
            continue
        snippet = build_text_snippet(content, "gst")
        lowered = content.lower()
        if any(flag in lowered for flag in ("inactive", "cancelled", "suspended")):
            return {
                "verdict": VERDICT_NOT_ELIGIBLE,
                "reason": "The GST record is present but marked inactive or cancelled.",
                "confidence": 0.91,
                "source_document_id": document["id"],
                "source_excerpt": snippet,
                "found_value": match.group(0),
                "rule_value": criterion.get("threshold_text"),
            }

        return {
            "verdict": VERDICT_ELIGIBLE,
            "reason": "A valid GSTIN is present and the certificate indicates an active registration.",
            "confidence": 0.94,
            "source_document_id": document["id"],
            "source_excerpt": snippet,
            "found_value": match.group(0),
            "rule_value": criterion.get("threshold_text"),
        }

    return {
        "verdict": VERDICT_MANUAL_REVIEW,
        "reason": "No readable GST registration certificate was found in the bidder submission set.",
        "confidence": 0.4,
        "source_document_id": None,
        "source_excerpt": "GST evidence is missing or unreadable.",
        "found_value": "Not found",
        "rule_value": criterion.get("threshold_text"),
    }


def evaluate_experience_years(criterion: dict, documents: list[dict]) -> dict:
    threshold = criterion.get("threshold_value")
    document, found_value, snippet = extract_numeric_evidence(
        documents,
        ("experience", "years", "project", "completed"),
        parse_years_value,
    )
    if found_value is None:
        return {
            "verdict": VERDICT_MANUAL_REVIEW,
            "reason": "Experience evidence is missing or could not be read confidently.",
            "confidence": 0.38,
            "source_document_id": None,
            "source_excerpt": "No reliable experience duration could be extracted.",
            "found_value": "Not found",
            "rule_value": criterion.get("threshold_text"),
        }

    if threshold is not None and found_value >= threshold:
        return {
            "verdict": VERDICT_ELIGIBLE,
            "reason": f"Documented experience of {found_value:.0f} years meets the requirement.",
            "confidence": min(0.95, 0.68 + (document.get("extraction_confidence") or 0.0) / 3),
            "source_document_id": document["id"],
            "source_excerpt": snippet,
            "found_value": f"{found_value:.0f} years",
            "rule_value": criterion.get("threshold_text"),
        }

    return {
        "verdict": VERDICT_NOT_ELIGIBLE,
        "reason": f"Documented experience of {found_value:.0f} years is below the required threshold.",
        "confidence": min(0.94, 0.66 + (document.get("extraction_confidence") or 0.0) / 3),
        "source_document_id": document["id"] if document else None,
        "source_excerpt": snippet,
        "found_value": f"{found_value:.0f} years",
        "rule_value": criterion.get("threshold_text"),
    }


def evaluate_project_count(criterion: dict, documents: list[dict]) -> dict:
    threshold = criterion.get("threshold_value")
    document, found_value, snippet = extract_numeric_evidence(
        documents,
        ("project", "completed", "similar"),
        parse_project_count,
    )
    if found_value is None:
        return {
            "verdict": VERDICT_MANUAL_REVIEW,
            "reason": "The number of similar completed projects could not be verified automatically.",
            "confidence": 0.4,
            "source_document_id": None,
            "source_excerpt": "Project count evidence is missing or ambiguous.",
            "found_value": "Not found",
            "rule_value": criterion.get("threshold_text"),
        }

    if threshold is not None and found_value >= threshold:
        return {
            "verdict": VERDICT_ELIGIBLE,
            "reason": f"The bidder shows {int(found_value)} similar completed projects, which satisfies the requirement.",
            "confidence": min(0.95, 0.68 + (document.get("extraction_confidence") or 0.0) / 3),
            "source_document_id": document["id"],
            "source_excerpt": snippet,
            "found_value": f"{int(found_value)} projects",
            "rule_value": criterion.get("threshold_text"),
        }

    return {
        "verdict": VERDICT_NOT_ELIGIBLE,
        "reason": f"The bidder shows only {int(found_value)} similar completed projects, below the tender requirement.",
        "confidence": min(0.94, 0.66 + (document.get("extraction_confidence") or 0.0) / 3),
        "source_document_id": document["id"] if document else None,
        "source_excerpt": snippet,
        "found_value": f"{int(found_value)} projects",
        "rule_value": criterion.get("threshold_text"),
    }


def evaluate_iso(criterion: dict, documents: list[dict]) -> dict:
    pattern = re.compile(r"\bISO[\s-]*9001\b", re.IGNORECASE)
    for document in documents:
        content = document.get("extracted_text") or ""
        match = pattern.search(content)
        if not match:
            continue
        lowered = content.lower()
        snippet = build_text_snippet(content, "iso")
        if any(flag in lowered for flag in ("expired", "revoked", "cancelled")):
            return {
                "verdict": VERDICT_NOT_ELIGIBLE,
                "reason": "The ISO 9001 certificate appears expired or invalid.",
                "confidence": 0.88,
                "source_document_id": document["id"],
                "source_excerpt": snippet,
                "found_value": match.group(0).upper(),
                "rule_value": criterion.get("threshold_text"),
            }
        return {
            "verdict": VERDICT_ELIGIBLE,
            "reason": "ISO 9001 certification evidence is present in the submitted documents.",
            "confidence": 0.9,
            "source_document_id": document["id"],
            "source_excerpt": snippet,
            "found_value": match.group(0).upper(),
            "rule_value": criterion.get("threshold_text"),
        }

    return {
        "verdict": VERDICT_MANUAL_REVIEW,
        "reason": "No readable ISO 9001 evidence was found automatically.",
        "confidence": 0.38,
        "source_document_id": None,
        "source_excerpt": "Certification evidence is missing or unreadable.",
        "found_value": "Not found",
        "rule_value": criterion.get("threshold_text"),
    }


def evaluate_generic_document(criterion: dict, documents: list[dict]) -> dict:
    keywords = [
        token
        for token in re.findall(r"[A-Za-z]{3,}", criterion.get("description") or "")
        if token.lower() not in {"must", "shall", "required", "valid", "active", "copy", "attach"}
    ]
    selected = keywords[:3] or [criterion.get("title", "document")]
    for document in documents:
        content = (document.get("extracted_text") or "").lower()
        if not content:
            continue
        if any(keyword.lower() in content for keyword in selected):
            return {
                "verdict": VERDICT_ELIGIBLE,
                "reason": "The bidder submitted a document that directly references the required compliance item.",
                "confidence": 0.71,
                "source_document_id": document["id"],
                "source_excerpt": build_text_snippet(document.get("extracted_text") or "", selected[0]),
                "found_value": document["filename"],
                "rule_value": criterion.get("threshold_text"),
            }
    return {
        "verdict": VERDICT_MANUAL_REVIEW,
        "reason": "The required document could not be confirmed automatically and should be checked by an officer.",
        "confidence": 0.33,
        "source_document_id": None,
        "source_excerpt": "Automated parsing did not locate a direct document match.",
        "found_value": "Not found",
        "rule_value": criterion.get("threshold_text"),
    }


EVALUATORS = {
    "turnover": evaluate_turnover,
    "gst": evaluate_gst,
    "experience_years": evaluate_experience_years,
    "project_count": evaluate_project_count,
    "iso_9001": evaluate_iso,
    "document_check": evaluate_generic_document,
    "technical_check": evaluate_generic_document,
}


def evaluate_bidder(criteria: list[dict], documents: list[dict]) -> list[dict]:
    evaluations: list[dict] = []
    for criterion in criteria:
        evaluator = EVALUATORS.get(criterion.get("rule_type"), evaluate_generic_document)
        result = evaluator(criterion, documents)
        evaluations.append(
            {
                "id": make_id("eval"),
                "criterion_id": criterion["id"],
                "verdict": result["verdict"],
                "verdict_reason": result["reason"],
                "confidence": result["confidence"],
                "source_document_id": result["source_document_id"],
                "source_excerpt": result["source_excerpt"],
                "found_value": result["found_value"],
                "rule_value": result["rule_value"],
                "created_at": utc_now(),
                "updated_at": utc_now(),
            }
        )
    return evaluations


def effective_verdict(evaluation: dict) -> str:
    return evaluation.get("review_decision") or evaluation.get("verdict")


def summarize_bidder_status(criteria: list[dict], evaluations: list[dict]) -> tuple[str, str, str]:
    criteria_by_id = {criterion["id"]: criterion for criterion in criteria}
    status = VERDICT_ELIGIBLE
    reasons: list[str] = []

    for evaluation in evaluations:
        verdict = effective_verdict(evaluation)
        criterion = criteria_by_id.get(evaluation["criterion_id"], {})
        if criterion.get("is_mandatory") and verdict == VERDICT_NOT_ELIGIBLE:
            status = VERDICT_NOT_ELIGIBLE
            reasons.append(f"Failed mandatory criterion {criterion.get('code', '')}.")
        elif criterion.get("is_mandatory") and verdict == VERDICT_MANUAL_REVIEW and status != VERDICT_NOT_ELIGIBLE:
            status = VERDICT_MANUAL_REVIEW
            reasons.append(f"Manual review required for {criterion.get('code', '')}.")

    risk_level = {
        VERDICT_ELIGIBLE: "low",
        VERDICT_MANUAL_REVIEW: "medium",
        VERDICT_NOT_ELIGIBLE: "high",
    }[status]

    summary = {
        VERDICT_ELIGIBLE: "All mandatory criteria are currently satisfied with machine-readable evidence.",
        VERDICT_MANUAL_REVIEW: "The bidder has no clear disqualifier, but at least one mandatory criterion needs officer review.",
        VERDICT_NOT_ELIGIBLE: "At least one mandatory criterion has clear evidence of non-compliance.",
    }[status]

    if reasons:
        summary = f"{summary} {' '.join(reasons[:2])}"

    return status, risk_level, summary


def json_dumps(value: dict) -> str:
    return json.dumps(value, ensure_ascii=True)
