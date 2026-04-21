from __future__ import annotations

import shutil
from pathlib import Path
from typing import Any

from app.analysis import effective_verdict, evaluate_bidder, extract_criteria_from_tender, extract_text_from_path, json_dumps, make_id, summarize_bidder_status, utc_now
from app.config import GOOGLE_API_KEY, REPORTS_DIR, UPLOADS_DIR
from app.db import connect


def log_event(connection, tender_id: str, event_type: str, details: dict, actor: str = "system", bidder_id: str | None = None, evaluation_id: str | None = None) -> None:
    connection.execute(
        """
        INSERT INTO audit_events (id, tender_id, bidder_id, evaluation_id, actor, event_type, details_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (make_id("evt"), tender_id, bidder_id, evaluation_id, actor, event_type, json_dumps(details), utc_now()),
    )


def fetch_one(query: str, params: tuple[Any, ...] = ()) -> dict | None:
    with connect() as connection:
        row = connection.execute(query, params).fetchone()
        return dict(row) if row else None


def fetch_all(query: str, params: tuple[Any, ...] = ()) -> list[dict]:
    with connect() as connection:
        rows = connection.execute(query, params).fetchall()
        return [dict(row) for row in rows]


def get_tender_count() -> int:
    row = fetch_one("SELECT COUNT(*) AS count FROM tenders")
    return int(row["count"]) if row else 0


def save_uploaded_file(tender_id: str, filename: str, source_path: Path | None = None, file_bytes: bytes | None = None, bidder_id: str | None = None) -> Path:
    target_dir = UPLOADS_DIR / tender_id / ("tender" if bidder_id is None else bidder_id)
    target_dir.mkdir(parents=True, exist_ok=True)
    destination = target_dir / filename

    if source_path:
        shutil.copy2(source_path, destination)
    else:
        destination.write_bytes(file_bytes or b"")

    return destination


def insert_document_record(connection, tender_id: str, role: str, file_path: Path, extraction: dict, bidder_id: str | None = None) -> str:
    document_id = make_id("doc")
    connection.execute(
        """
        INSERT INTO documents (
            id, tender_id, bidder_id, role, filename, file_path, extension, extraction_method,
            extraction_confidence, extraction_status, notes, extracted_text, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            document_id,
            tender_id,
            bidder_id,
            role,
            file_path.name,
            str(file_path),
            extraction["extension"],
            extraction["extraction_method"],
            extraction["extraction_confidence"],
            extraction["extraction_status"],
            extraction["notes"],
            extraction["extracted_text"],
            utc_now(),
        ),
    )
    return document_id


def create_tender(title: str, authority: str, reference_no: str, summary: str, files: list[tuple[str, bytes]]) -> str:
    tender_id = make_id("tender")
    now = utc_now()

    with connect() as connection:
        connection.execute(
            """
            INSERT INTO tenders (id, title, authority, reference_no, summary, status, ai_mode, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                tender_id,
                title,
                authority,
                reference_no,
                summary,
                "draft",
                "ai_assisted" if GOOGLE_API_KEY else "offline_deterministic",
                now,
                now,
            ),
        )
        log_event(
            connection,
            tender_id,
            "tender.created",
            {"title": title, "reference_no": reference_no, "authority": authority},
            actor="officer",
        )

        combined_text_parts: list[str] = []
        source_document_id = None
        for filename, file_bytes in files:
            destination = save_uploaded_file(tender_id, filename, file_bytes=file_bytes)
            extraction_result = extract_text_from_path(destination).__dict__
            document_id = insert_document_record(connection, tender_id, "tender", destination, extraction_result)
            source_document_id = source_document_id or document_id
            combined_text_parts.append(extraction_result["extracted_text"])
            log_event(
                connection,
                tender_id,
                "document.ingested",
                {
                    "role": "tender",
                    "filename": filename,
                    "extraction_method": extraction_result["extraction_method"],
                    "confidence": extraction_result["extraction_confidence"],
                },
            )

        combined_text = " ".join(part for part in combined_text_parts if part)
        criteria = extract_criteria_from_tender(combined_text, source_document_id or "")

        for criterion in criteria:
            connection.execute(
                """
                INSERT INTO criteria (
                    id, tender_id, code, category, rule_type, title, description, threshold_text,
                    threshold_value, unit, is_mandatory, extraction_confidence, source_document_id,
                    source_excerpt, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    criterion["id"],
                    tender_id,
                    criterion["code"],
                    criterion["category"],
                    criterion["rule_type"],
                    criterion["title"],
                    criterion["description"],
                    criterion["threshold_text"],
                    criterion["threshold_value"],
                    criterion["unit"],
                    1 if criterion["is_mandatory"] else 0,
                    criterion["extraction_confidence"],
                    criterion["source_document_id"],
                    criterion["source_excerpt"],
                    now,
                    now,
                ),
            )

        connection.execute(
            "UPDATE tenders SET status = ?, updated_at = ? WHERE id = ?",
            ("criteria_ready", now, tender_id),
        )
        log_event(connection, tender_id, "criteria.extracted", {"criteria_count": len(criteria)})

    return tender_id


def create_bidder(
    tender_id: str,
    name: str,
    organization_type: str,
    city: str,
    state: str,
    files: list[tuple[str, bytes]],
) -> str:
    bidder_id = make_id("bidder")
    now = utc_now()

    with connect() as connection:
        connection.execute(
            """
            INSERT INTO bidders (id, tender_id, name, organization_type, city, state, overall_status, risk_level, summary, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                bidder_id,
                tender_id,
                name,
                organization_type,
                city,
                state,
                "manual_review",
                "medium",
                "Bidder uploaded and awaiting evaluation.",
                now,
                now,
            ),
        )

        for filename, file_bytes in files:
            destination = save_uploaded_file(tender_id, filename, file_bytes=file_bytes, bidder_id=bidder_id)
            extraction_result = extract_text_from_path(destination).__dict__
            insert_document_record(connection, tender_id, "bidder", destination, extraction_result, bidder_id=bidder_id)
            log_event(
                connection,
                tender_id,
                "document.ingested",
                {
                    "role": "bidder",
                    "filename": filename,
                    "bidder_name": name,
                    "extraction_method": extraction_result["extraction_method"],
                    "confidence": extraction_result["extraction_confidence"],
                },
                bidder_id=bidder_id,
            )

        log_event(connection, tender_id, "bidder.created", {"bidder_name": name}, bidder_id=bidder_id)

    run_bidder_evaluation(tender_id, bidder_id)
    return bidder_id


def update_criterion(tender_id: str, criterion_id: str, payload: dict) -> None:
    now = utc_now()
    with connect() as connection:
        connection.execute(
            """
            UPDATE criteria
            SET category = ?, title = ?, description = ?, threshold_text = ?, threshold_value = ?, unit = ?, is_mandatory = ?, updated_at = ?
            WHERE id = ? AND tender_id = ?
            """,
            (
                payload["category"],
                payload["title"],
                payload["description"],
                payload["threshold_text"],
                payload.get("threshold_value"),
                payload.get("unit"),
                1 if payload["is_mandatory"] else 0,
                now,
                criterion_id,
                tender_id,
            ),
        )
        log_event(connection, tender_id, "criterion.updated", {"criterion_id": criterion_id, "title": payload["title"]}, actor="officer")


def refresh_tender_criteria(tender_id: str) -> None:
    tender_documents = fetch_all(
        "SELECT * FROM documents WHERE tender_id = ? AND role = 'tender' ORDER BY created_at",
        (tender_id,),
    )
    combined_text = " ".join(document["extracted_text"] or "" for document in tender_documents)
    source_document_id = tender_documents[0]["id"] if tender_documents else ""
    criteria = extract_criteria_from_tender(combined_text, source_document_id)
    now = utc_now()

    with connect() as connection:
        connection.execute("DELETE FROM evaluations WHERE tender_id = ?", (tender_id,))
        connection.execute("DELETE FROM criteria WHERE tender_id = ?", (tender_id,))
        for index, criterion in enumerate(criteria, start=1):
            connection.execute(
                """
                INSERT INTO criteria (
                    id, tender_id, code, category, rule_type, title, description, threshold_text,
                    threshold_value, unit, is_mandatory, extraction_confidence, source_document_id,
                    source_excerpt, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    criterion["id"],
                    tender_id,
                    f"CRIT-{index:03d}",
                    criterion["category"],
                    criterion["rule_type"],
                    criterion["title"],
                    criterion["description"],
                    criterion["threshold_text"],
                    criterion["threshold_value"],
                    criterion["unit"],
                    1 if criterion["is_mandatory"] else 0,
                    criterion["extraction_confidence"],
                    criterion["source_document_id"],
                    criterion["source_excerpt"],
                    now,
                    now,
                ),
            )
        connection.execute("UPDATE tenders SET status = ?, updated_at = ? WHERE id = ?", ("criteria_ready", now, tender_id))
        log_event(connection, tender_id, "criteria.refreshed", {"criteria_count": len(criteria)}, actor="system")


def run_bidder_evaluation(tender_id: str, bidder_id: str) -> None:
    criteria = fetch_all("SELECT * FROM criteria WHERE tender_id = ? ORDER BY code", (tender_id,))
    documents = fetch_all("SELECT * FROM documents WHERE bidder_id = ? ORDER BY filename", (bidder_id,))
    existing_evaluations = {
        row["criterion_id"]: row
        for row in fetch_all(
            "SELECT * FROM evaluations WHERE tender_id = ? AND bidder_id = ?",
            (tender_id, bidder_id),
        )
    }
    evaluations = evaluate_bidder(criteria, documents)
    for evaluation in evaluations:
        existing = existing_evaluations.get(evaluation["criterion_id"])
        evaluation["review_decision"] = existing.get("review_decision") if existing else None
        evaluation["reviewer_note"] = existing.get("reviewer_note") if existing else None
        evaluation["reviewed_at"] = existing.get("reviewed_at") if existing else None
    status, risk_level, summary = summarize_bidder_status(criteria, evaluations)
    now = utc_now()

    with connect() as connection:
        for evaluation in evaluations:
            connection.execute(
                """
                INSERT INTO evaluations (
                    id, tender_id, bidder_id, criterion_id, verdict, verdict_reason, confidence, source_document_id,
                    source_excerpt, found_value, rule_value, review_decision, reviewer_note, reviewed_at, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(bidder_id, criterion_id) DO UPDATE SET
                    verdict = excluded.verdict,
                    verdict_reason = excluded.verdict_reason,
                    confidence = excluded.confidence,
                    source_document_id = excluded.source_document_id,
                    source_excerpt = excluded.source_excerpt,
                    found_value = excluded.found_value,
                    rule_value = excluded.rule_value,
                    updated_at = excluded.updated_at
                """,
                (
                    evaluation["id"],
                    tender_id,
                    bidder_id,
                    evaluation["criterion_id"],
                    evaluation["verdict"],
                    evaluation["verdict_reason"],
                    evaluation["confidence"],
                    evaluation["source_document_id"],
                    evaluation["source_excerpt"],
                    evaluation["found_value"],
                    evaluation["rule_value"],
                    evaluation.get("review_decision"),
                    evaluation.get("reviewer_note"),
                    evaluation.get("reviewed_at"),
                    now,
                    now,
                ),
            )

        connection.execute(
            """
            UPDATE bidders
            SET overall_status = ?, risk_level = ?, summary = ?, updated_at = ?
            WHERE id = ? AND tender_id = ?
            """,
            (status, risk_level, summary, now, bidder_id, tender_id),
        )

        log_event(
            connection,
            tender_id,
            "bidder.evaluated",
            {"bidder_id": bidder_id, "status": status, "criteria_count": len(evaluations)},
            bidder_id=bidder_id,
        )

        connection.execute("UPDATE tenders SET status = ?, updated_at = ? WHERE id = ?", ("evaluation_ready", now, tender_id))


def run_full_evaluation(tender_id: str) -> None:
    bidders = fetch_all("SELECT id FROM bidders WHERE tender_id = ?", (tender_id,))
    for bidder in bidders:
        run_bidder_evaluation(tender_id, bidder["id"])


def resolve_review(evaluation_id: str, decision: str, note: str) -> dict | None:
    evaluation = fetch_one("SELECT * FROM evaluations WHERE id = ?", (evaluation_id,))
    if not evaluation:
        return None

    now = utc_now()
    with connect() as connection:
        connection.execute(
            """
            UPDATE evaluations
            SET review_decision = ?, reviewer_note = ?, reviewed_at = ?, updated_at = ?
            WHERE id = ?
            """,
            (decision, note, now, now, evaluation_id),
        )
        log_event(
            connection,
            evaluation["tender_id"],
            "review.resolved",
            {"evaluation_id": evaluation_id, "decision": decision, "note": note},
            actor="officer",
            bidder_id=evaluation["bidder_id"],
            evaluation_id=evaluation_id,
        )

    run_bidder_evaluation(evaluation["tender_id"], evaluation["bidder_id"])
    return fetch_one("SELECT * FROM evaluations WHERE id = ?", (evaluation_id,))


def serialize_tender(tender: dict) -> dict:
    bidders = fetch_all("SELECT * FROM bidders WHERE tender_id = ? ORDER BY created_at", (tender["id"],))
    criteria = fetch_all("SELECT * FROM criteria WHERE tender_id = ? ORDER BY code", (tender["id"],))
    documents = fetch_all("SELECT * FROM documents WHERE tender_id = ? ORDER BY created_at", (tender["id"],))
    evaluations = fetch_all(
        """
        SELECT e.*, c.code AS criterion_code, c.title AS criterion_title, c.is_mandatory AS criterion_is_mandatory
        FROM evaluations e
        JOIN criteria c ON c.id = e.criterion_id
        WHERE e.tender_id = ?
        ORDER BY c.code, e.created_at
        """,
        (tender["id"],),
    )
    audit_events = fetch_all("SELECT * FROM audit_events WHERE tender_id = ? ORDER BY created_at DESC", (tender["id"],))

    bidder_map: dict[str, dict] = {}
    for bidder in bidders:
        bidder_copy = dict(bidder)
        bidder_copy["documents"] = [doc for doc in documents if doc["bidder_id"] == bidder["id"]]
        bidder_copy["evaluations"] = [
            {
                **evaluation,
                "effective_verdict": effective_verdict(evaluation),
            }
            for evaluation in evaluations
            if evaluation["bidder_id"] == bidder["id"]
        ]
        bidder_map[bidder["id"]] = bidder_copy

    review_queue = [
        {
            **evaluation,
            "effective_verdict": effective_verdict(evaluation),
            "bidder_name": bidder_map[evaluation["bidder_id"]]["name"],
        }
        for evaluation in evaluations
        if effective_verdict(evaluation) == "manual_review"
    ]

    eligible_count = sum(1 for bidder in bidders if bidder["overall_status"] == "eligible")
    rejected_count = sum(1 for bidder in bidders if bidder["overall_status"] == "not_eligible")
    review_count = sum(1 for bidder in bidders if bidder["overall_status"] == "manual_review")
    auditable_checks = sum(1 for evaluation in evaluations if evaluation.get("source_document_id"))
    coverage = round((auditable_checks / len(evaluations)) * 100, 1) if evaluations else 0.0

    return {
        **tender,
        "criteria": criteria,
        "bidders": list(bidder_map.values()),
        "documents": [doc for doc in documents if doc["bidder_id"] is None],
        "review_queue": review_queue,
        "audit_events": audit_events,
        "metrics": {
            "bidder_count": len(bidders),
            "criteria_count": len(criteria),
            "document_count": len(documents),
            "eligible_count": eligible_count,
            "rejected_count": rejected_count,
            "review_count": review_count,
            "audit_coverage": coverage,
        },
    }


def list_tenders() -> list[dict]:
    tenders = fetch_all("SELECT * FROM tenders ORDER BY updated_at DESC")
    serialized = []
    for tender in tenders:
        metrics = serialize_tender(tender)["metrics"]
        serialized.append({**tender, "metrics": metrics})
    return serialized


def get_tender_detail(tender_id: str) -> dict | None:
    tender = fetch_one("SELECT * FROM tenders WHERE id = ?", (tender_id,))
    if not tender:
        return None
    return serialize_tender(tender)


def get_bootstrap_payload(selected_tender_id: str | None = None) -> dict:
    tenders = list_tenders()
    selected = None
    if selected_tender_id:
        selected = get_tender_detail(selected_tender_id)
    elif tenders:
        selected = get_tender_detail(tenders[0]["id"])

    return {
        "system": {
            "mode": "ai_assisted" if GOOGLE_API_KEY else "offline_deterministic",
            "database": "sqlite_audit_ledger",
            "report_dir": str(REPORTS_DIR),
        },
        "tenders": tenders,
        "selected_tender": selected,
    }


def build_report_json(tender_id: str) -> dict | None:
    tender = get_tender_detail(tender_id)
    if not tender:
        return None

    return {
        "tender": {
            "id": tender["id"],
            "title": tender["title"],
            "authority": tender["authority"],
            "reference_no": tender["reference_no"],
            "status": tender["status"],
            "summary": tender["summary"],
            "created_at": tender["created_at"],
            "updated_at": tender["updated_at"],
        },
        "criteria": tender["criteria"],
        "bidders": tender["bidders"],
        "review_queue": tender["review_queue"],
        "audit_events": tender["audit_events"][:25],
        "metrics": tender["metrics"],
    }


def build_report_csv_rows(tender: dict) -> list[list[str]]:
    rows = [[
        "Bidder",
        "Criterion Code",
        "Criterion",
        "Mandatory",
        "Verdict",
        "Evidence",
        "Found Value",
        "Rule Value",
        "Reviewer Note",
    ]]
    for bidder in tender["bidders"]:
        for evaluation in bidder["evaluations"]:
            rows.append(
                [
                    bidder["name"],
                    evaluation["criterion_code"],
                    evaluation["criterion_title"],
                    "Yes" if evaluation["criterion_is_mandatory"] else "No",
                    evaluation["effective_verdict"],
                    evaluation.get("source_excerpt") or "",
                    evaluation.get("found_value") or "",
                    evaluation.get("rule_value") or "",
                    evaluation.get("reviewer_note") or "",
                ]
            )
    return rows
