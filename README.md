# CRPF Tender Intelligence Console

A full-stack procurement evaluation workspace for the CRPF tender-analysis theme.

This repo now runs as a real web application, not just a console MVP. It ingests tender documents and bidder submissions, extracts structured eligibility criteria, evaluates each bidder against every criterion, produces explainable verdicts, surfaces manual-review cases, and keeps an audit trail for every action.

## What the app does

- Upload a tender document and create a procurement workspace.
- Extract eligibility criteria into structured, reviewable records.
- Upload bidder submission packs with PDFs, images, text files, or DOCX files.
- Evaluate each bidder at the criterion level with evidence, found values, and reasons.
- Mark bidders as `Eligible`, `Not Eligible`, or `Manual Review`.
- Resolve ambiguous checks through a human-in-the-loop review queue.
- Export consolidated reports as printable HTML, CSV, or JSON.
- Maintain an audit trail for document ingestion, extraction, evaluation, and review decisions.

## Stack

- `FastAPI` for the backend and JSON APIs
- `Jinja2` and vanilla JS for the frontend
- `SQLite` as the local audit ledger and report store
- `PyPDF` for PDF text extraction
- `python-dotenv` for optional API-key configuration
- Optional Gemini Vision OCR when `GOOGLE_API_KEY` is configured

## Why SQLite instead of MongoDB here?

For this working local build, SQLite is the right fit:

- zero setup for demo and judging
- strong auditability for joins across tenders, bidders, criteria, evidence, and review decisions
- easy export and inspection

If you want, this data layer can be swapped for MongoDB later, but the self-contained hackathon build is better served by an embedded audit-grade database.

## Current product flow

1. Tender uploaded
2. Criteria extracted and normalized
3. Bidder documents ingested and parsed
4. Rule-by-rule evaluation runs
5. Ambiguous checks land in the review queue
6. Officer decisions update bidder status and audit history
7. Consolidated report is exported

## Offline mode vs AI-assisted mode

The app works out of the box in `offline_deterministic` mode:

- PDFs, text files, and DOCX files are parsed locally
- bundled demo image evidence uses a seeded transcript
- unparsed scanned files are surfaced for manual review instead of silently failing

If you add `GOOGLE_API_KEY` in `.env`, image OCR upgrades to Gemini Vision automatically.

## Local setup

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000
```

Open:

- App: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- Printable seeded report: open it from the dashboard's `Print Report` action after startup

## Seeded demo workspace

On first startup, the app auto-loads the bundled CRPF mock tender and three bidder packs:

- `AlphaCorp Construction Solutions`
- `BetaTech Infrastructure Ltd.`
- `Gamma Infra Projects`

This gives you an immediate dashboard with:

- extracted tender criteria
- per-bidder evaluation matrix
- manual review queue
- audit trail
- exportable report

## Main files

```text
main.py                 FastAPI app and routes
app/db.py               SQLite schema and connection helpers
app/analysis.py         document parsing, criteria extraction, and evaluation logic
app/repository.py       persistence, reporting, and workflow orchestration
app/seed.py             demo workspace bootstrap
templates/index.html    main application shell
templates/report.html   printable report view
static/styles.css       product UI styling
static/app.js           frontend rendering and interactions
```

## Product features implemented

- Tender workspace selector
- Tender creation modal
- Bidder upload modal
- Criteria editor
- Evaluation matrix
- Bidder dossier panels
- Manual review resolution
- Audit event stream
- CSV export
- JSON export
- Printable report page

## Notes

- The legacy `src/` prototype code is still in the repo, but the live product now runs through `main.py` and the `app/` package.
- Scanned image handling is designed to never silently disqualify a bidder. If OCR is unavailable or low confidence, the system routes that criterion to manual review.
