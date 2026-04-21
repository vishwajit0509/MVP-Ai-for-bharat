from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv


ROOT_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT_DIR / "data"
PLATFORM_DIR = DATA_DIR / "platform"
UPLOADS_DIR = PLATFORM_DIR / "uploads"
REPORTS_DIR = PLATFORM_DIR / "reports"
DB_PATH = PLATFORM_DIR / "procurement.db"
TEMPLATES_DIR = ROOT_DIR / "templates"
STATIC_DIR = ROOT_DIR / "static"

load_dotenv(ROOT_DIR / ".env")

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "").strip()

SAMPLE_TENDER_FILE = ROOT_DIR / "data" / "tenders" / "CRPF_Rulebook.pdf"
SAMPLE_BIDDER_FILES = {
    "AlphaCorp Construction Solutions": [
        ROOT_DIR / "data" / "bidders" / "Bidder_A_AlphaCorp" / "Annual_Turnover.pdf",
        ROOT_DIR / "data" / "bidders" / "Bidder_A_AlphaCorp" / "GST_Certificate.pdf",
    ],
    "BetaTech Infrastructure Ltd.": [
        ROOT_DIR / "data" / "bidders" / "Bidder_B_BetaTech" / "Financial_Report.pdf",
    ],
    "Gamma Infra Projects": [
        ROOT_DIR / "data" / "bidders" / "Bidder_C_GammaInfra" / "Scanned_Work_Proof.jpeg",
    ],
}

KNOWN_IMAGE_TRANSCRIPTS = {
    "Scanned_Work_Proof.jpeg": (
        "TO WHOM IT MAY CONCERN. SUBJECT: PROJECT COMPLETION AND EXPERIENCE "
        "CERTIFICATE. This is to certify that M/s Gamma Infra Projects, headquartered "
        "in Pune, Maharashtra, was awarded the contract for the Modernization of State "
        "Highway 14 under Contract Ref No. PWD/SH14/2021-09. The agency mobilized "
        "resources efficiently and demonstrated excellent project management skills. "
        "We confirm that Gamma Infra has been actively undertaking and completing heavy "
        "civil construction projects for our department for the past 4 years. Their work "
        "quality has been satisfactory and within safety parameters. Issued by: Chief "
        "Engineer, Public Works Department."
    ),
}


def ensure_platform_dirs() -> None:
    for path in (PLATFORM_DIR, UPLOADS_DIR, REPORTS_DIR):
        path.mkdir(parents=True, exist_ok=True)

