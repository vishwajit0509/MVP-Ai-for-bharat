from __future__ import annotations

from pathlib import Path

from app.config import SAMPLE_BIDDER_FILES, SAMPLE_TENDER_FILE
from app.repository import (
    create_bidder,
    create_tender,
    fetch_all,
    fetch_one,
    get_tender_count,
    refresh_tender_criteria,
    run_full_evaluation,
)


def seed_demo_data() -> None:
    tender = fetch_one("SELECT * FROM tenders WHERE reference_no = ?", ("CRPF/PROC/2026-004",))
    if tender:
        tender_id = tender["id"]
    elif get_tender_count() == 0:
        tender_id = create_tender(
            title="CRPF Base Camp Construction and Maintenance Services",
            authority="Central Reserve Police Force",
            reference_no="CRPF/PROC/2026-004",
            summary=(
                "Representative tender workspace seeded from the bundled CRPF mock documents. "
                "The platform extracts eligibility criteria, evaluates each bidder, and keeps "
                "every machine judgement tied to evidence."
            ),
            files=[(SAMPLE_TENDER_FILE.name, SAMPLE_TENDER_FILE.read_bytes())],
        )
    else:
        return

    bidder_profiles = {
        "AlphaCorp Construction Solutions": ("Private Limited Company", "Mumbai", "Maharashtra"),
        "BetaTech Infrastructure Ltd.": ("Public Limited Company", "Noida", "Uttar Pradesh"),
        "Gamma Infra Projects": ("Engineering Partnership", "Pune", "Maharashtra"),
    }
    existing_bidders = {
        row["name"]
        for row in fetch_all("SELECT name FROM bidders WHERE tender_id = ?", (tender_id,))
    }
    criteria_rule_types = {
        row["rule_type"]
        for row in fetch_all("SELECT rule_type FROM criteria WHERE tender_id = ?", (tender_id,))
    }
    if not criteria_rule_types or "technical_check" in criteria_rule_types:
        refresh_tender_criteria(tender_id)

    for bidder_name, file_paths in SAMPLE_BIDDER_FILES.items():
        if bidder_name in existing_bidders:
            continue
        org_type, city, state = bidder_profiles[bidder_name]
        create_bidder(
            tender_id=tender_id,
            name=bidder_name,
            organization_type=org_type,
            city=city,
            state=state,
            files=[(path.name, Path(path).read_bytes()) for path in file_paths],
        )

    run_full_evaluation(tender_id)
