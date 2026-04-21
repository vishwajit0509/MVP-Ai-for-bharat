from __future__ import annotations

import csv
import io
import json
from typing import Literal

from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse, PlainTextResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, Field

from app.config import STATIC_DIR, TEMPLATES_DIR
from app.db import init_db
from app.repository import (
    build_report_csv_rows,
    build_report_json,
    create_bidder,
    create_tender,
    fetch_one,
    get_bootstrap_payload,
    get_tender_detail,
    resolve_review,
    run_full_evaluation,
    update_criterion,
)
from app.seed import seed_demo_data


app = FastAPI(
    title="CRPF Tender Intelligence Console",
    description="Audit-first tender evaluation workspace for CRPF procurement teams.",
    version="2.0.0",
)
templates = Jinja2Templates(directory=str(TEMPLATES_DIR))
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


class CriterionUpdate(BaseModel):
    category: str
    title: str
    description: str
    threshold_text: str
    threshold_value: float | None = None
    unit: str | None = None
    is_mandatory: bool = True


class ReviewDecision(BaseModel):
    decision: Literal["eligible", "not_eligible", "manual_review"]
    note: str = Field(default="", max_length=1200)


@app.on_event("startup")
def startup() -> None:
    init_db()
    seed_demo_data()


@app.get("/", response_class=HTMLResponse)
def index(request: Request) -> HTMLResponse:
    return templates.TemplateResponse(request=request, name="index.html", context={})


@app.get("/reports/{tender_id}", response_class=HTMLResponse)
def report_view(request: Request, tender_id: str) -> HTMLResponse:
    report = build_report_json(tender_id)
    if not report:
        raise HTTPException(status_code=404, detail="Tender report not found")
    return templates.TemplateResponse(request=request, name="report.html", context={"report": report})


@app.get("/health", response_class=PlainTextResponse)
def health() -> str:
    return "ok"


@app.get("/documents/{document_id}")
def document_file(document_id: str) -> FileResponse:
    document = fetch_one("SELECT * FROM documents WHERE id = ?", (document_id,))
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return FileResponse(document["file_path"], filename=document["filename"])


@app.get("/api/bootstrap")
def bootstrap(tender_id: str | None = None) -> JSONResponse:
    return JSONResponse(get_bootstrap_payload(tender_id))


@app.post("/api/tenders")
async def create_tender_api(
    title: str = Form(...),
    authority: str = Form(...),
    reference_no: str = Form(""),
    summary: str = Form(""),
    files: list[UploadFile] = File(...),
) -> JSONResponse:
    payload = []
    for uploaded_file in files:
        file_bytes = await uploaded_file.read()
        if uploaded_file.filename:
            payload.append((uploaded_file.filename, file_bytes))

    if not payload:
        raise HTTPException(status_code=400, detail="At least one tender document is required")

    tender_id = create_tender(title=title, authority=authority, reference_no=reference_no, summary=summary, files=payload)
    return JSONResponse({"ok": True, "selected_tender": get_tender_detail(tender_id)})


@app.post("/api/tenders/{tender_id}/bidders")
async def create_bidder_api(
    tender_id: str,
    name: str = Form(...),
    organization_type: str = Form(""),
    city: str = Form(""),
    state: str = Form(""),
    files: list[UploadFile] = File(...),
) -> JSONResponse:
    if not get_tender_detail(tender_id):
        raise HTTPException(status_code=404, detail="Tender not found")

    payload = []
    for uploaded_file in files:
        file_bytes = await uploaded_file.read()
        if uploaded_file.filename:
            payload.append((uploaded_file.filename, file_bytes))

    if not payload:
        raise HTTPException(status_code=400, detail="At least one bidder document is required")

    create_bidder(
        tender_id=tender_id,
        name=name,
        organization_type=organization_type,
        city=city,
        state=state,
        files=payload,
    )
    return JSONResponse({"ok": True, "selected_tender": get_tender_detail(tender_id)})


@app.post("/api/tenders/{tender_id}/evaluate")
def evaluate_tender_api(tender_id: str) -> JSONResponse:
    if not get_tender_detail(tender_id):
        raise HTTPException(status_code=404, detail="Tender not found")
    run_full_evaluation(tender_id)
    return JSONResponse({"ok": True, "selected_tender": get_tender_detail(tender_id)})


@app.put("/api/tenders/{tender_id}/criteria/{criterion_id}")
def update_criterion_api(tender_id: str, criterion_id: str, payload: CriterionUpdate) -> JSONResponse:
    if not get_tender_detail(tender_id):
        raise HTTPException(status_code=404, detail="Tender not found")
    update_criterion(tender_id, criterion_id, payload.model_dump())
    run_full_evaluation(tender_id)
    return JSONResponse({"ok": True, "selected_tender": get_tender_detail(tender_id)})


@app.post("/api/evaluations/{evaluation_id}/review")
def review_evaluation_api(evaluation_id: str, payload: ReviewDecision) -> JSONResponse:
    evaluation = resolve_review(evaluation_id, payload.decision, payload.note)
    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    return JSONResponse({"ok": True, "selected_tender": get_tender_detail(evaluation["tender_id"])})


@app.get("/api/reports/{tender_id}.json")
def report_json_api(tender_id: str) -> JSONResponse:
    report = build_report_json(tender_id)
    if not report:
        raise HTTPException(status_code=404, detail="Tender report not found")
    return JSONResponse(report)


@app.get("/api/reports/{tender_id}.csv")
def report_csv_api(tender_id: str) -> StreamingResponse:
    tender = get_tender_detail(tender_id)
    if not tender:
        raise HTTPException(status_code=404, detail="Tender report not found")

    rows = build_report_csv_rows(tender)
    stream = io.StringIO()
    writer = csv.writer(stream)
    writer.writerows(rows)
    stream.seek(0)

    filename = f"{tender['reference_no'] or tender['id']}-evaluation-report.csv"
    headers = {"Content-Disposition": f'attachment; filename="{filename}"'}
    return StreamingResponse(iter([stream.getvalue()]), media_type="text/csv", headers=headers)


@app.get("/api/tenders/{tender_id}")
def tender_detail_api(tender_id: str) -> JSONResponse:
    detail = get_tender_detail(tender_id)
    if not detail:
        raise HTTPException(status_code=404, detail="Tender not found")
    return JSONResponse(detail)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
