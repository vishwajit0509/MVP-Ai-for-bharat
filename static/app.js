const state = {
  payload: null,
  selectedTenderId: null,
};

document.addEventListener("DOMContentLoaded", () => {
  bindStaticEvents();
  loadApp();
});

function bindStaticEvents() {
  document.addEventListener("click", async (event) => {
    const actionTarget = event.target.closest("[data-action]");
    if (actionTarget) {
      const action = actionTarget.dataset.action;

      if (action === "open-tender-dialog") {
        document.getElementById("tender-dialog").showModal();
      }

      if (action === "open-bidder-dialog") {
        const tender = currentTender();
        if (!tender) {
          setStatus("Create or select a tender workspace first.", "error");
          return;
        }
        const form = document.getElementById("bidder-form");
        form.elements.tender_id.value = tender.id;
        document.getElementById("bidder-dialog").showModal();
      }

      if (action === "run-evaluation") {
        const tender = currentTender();
        if (!tender) return;
        setStatus("Running full evaluation cycle…", "info");
        const response = await fetch(`/api/tenders/${tender.id}/evaluate`, { method: "POST" });
        const payload = await response.json();
        if (!response.ok) {
          setStatus(payload.detail || "Evaluation failed.", "error");
          return;
        }
        state.payload.selected_tender = payload.selected_tender;
        renderApp();
        setStatus("Evaluation completed successfully.", "success");
      }

      if (action === "edit-criterion") {
        openCriterionDialog(actionTarget.dataset.criterionId);
      }

      if (action === "close-dialog") {
        document.getElementById(actionTarget.dataset.dialog).close();
      }
    }

    const scrollTarget = event.target.closest("[data-scroll-target]");
    if (scrollTarget) {
      const section = document.getElementById(scrollTarget.dataset.scrollTarget);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  });

  document.addEventListener("submit", async (event) => {
    if (event.target.id === "tender-form") {
      event.preventDefault();
      await submitTenderForm(event.target);
    }
    if (event.target.id === "bidder-form") {
      event.preventDefault();
      await submitBidderForm(event.target);
    }
    if (event.target.id === "criterion-form") {
      event.preventDefault();
      await submitCriterionForm(event.target);
    }
    if (event.target.matches(".review-form")) {
      event.preventDefault();
      await submitReviewForm(event.target);
    }
  });

  document.getElementById("tender-selector").addEventListener("change", async (event) => {
    state.selectedTenderId = event.target.value || null;
    await loadApp(state.selectedTenderId);
  });
}

async function loadApp(tenderId = null) {
  const query = tenderId ? `?tender_id=${encodeURIComponent(tenderId)}` : "";
  const response = await fetch(`/api/bootstrap${query}`);
  const payload = await response.json();
  state.payload = payload;
  state.selectedTenderId = payload.selected_tender?.id || tenderId;
  renderApp();
}

function currentTender() {
  return state.payload?.selected_tender || null;
}

function renderApp() {
  renderSelector();
  renderHero();
  renderCriteria();
  renderMatrix();
  renderBidders();
  renderReviewQueue();
  renderAuditTrail();
}

function renderSelector() {
  const selector = document.getElementById("tender-selector");
  const tenders = state.payload?.tenders || [];
  if (!tenders.length) {
    selector.innerHTML = `<option value="">No workspaces yet</option>`;
    return;
  }
  selector.innerHTML = tenders
    .map(
      (tender) =>
        `<option value="${tender.id}" ${tender.id === currentTender()?.id ? "selected" : ""}>
          ${escapeHtml(truncateText(tender.title, 48))}
        </option>`
    )
    .join("");
}

function renderHero() {
  const heroPanel = document.getElementById("hero-panel");
  const metricPanel = document.getElementById("metric-panel");
  const tender = currentTender();
  const system = state.payload?.system;

  if (!tender) {
    heroPanel.innerHTML = `
      <article class="hero-panel empty-state">
        <div style="text-align:center;padding:40px 20px">
          <div style="font-size:2.5rem;margin-bottom:16px;opacity:0.3">🛡</div>
          <div style="font-weight:600;color:var(--ink-dim);margin-bottom:8px">No tender workspace selected</div>
          <div style="color:var(--muted);font-size:0.85rem">Create a new workspace to begin the evaluation cycle.</div>
        </div>
      </article>`;
    metricPanel.innerHTML = "";
    return;
  }

  heroPanel.innerHTML = `
    <article class="hero-panel">
      <div class="hero-title-row">
        <div style="min-width:0">
          <div class="eyebrow">${escapeHtml(tender.authority || "Procurement Authority")}</div>
          <h2>${escapeHtml(tender.title)}</h2>
          <p class="hero-copy">${escapeHtml(tender.summary || "Tender workspace ready for evaluation.")}</p>
        </div>
        <div class="badges" style="flex-shrink:0;align-items:flex-start">
          ${renderBadge(tender.status, tender.status.replaceAll("_", " "))}
          ${system ? renderBadge(system.mode, system.mode.replaceAll("_", " ")) : ""}
          ${system ? renderBadge(system.database, system.database + " ledger") : ""}
        </div>
      </div>
      <div class="hero-meta">
        <div class="hero-meta-item">
          <span>Reference</span>
          <strong>${escapeHtml(tender.reference_no || "Pending")}</strong>
        </div>
        <div class="hero-meta-item">
          <span>Open Reviews</span>
          <strong>${tender.review_queue.length}</strong>
        </div>
        <div class="hero-meta-item">
          <span>Audit Coverage</span>
          <strong>${tender.metrics.audit_coverage}%</strong>
        </div>
        <div class="hero-meta-item">
          <span>Last Updated</span>
          <strong>${formatDate(tender.updated_at)}</strong>
        </div>
      </div>
      <div class="hero-actions">
        <a class="icon-button ghost" href="/reports/${tender.id}" target="_blank" rel="noreferrer">
          <span class="button-icon">⎙</span>
          <span>Print Report</span>
        </a>
        <a class="icon-button ghost" href="/api/reports/${tender.id}.csv">
          <span class="button-icon">⇩</span>
          <span>Export CSV</span>
        </a>
        <a class="icon-button ghost" href="/api/reports/${tender.id}.json" target="_blank" rel="noreferrer">
          <span class="button-icon">{ }</span>
          <span>Open JSON</span>
        </a>
      </div>
    </article>
  `;

  metricPanel.innerHTML = `
    <article class="metric-panel">
      <h3>Evaluation Snapshot</h3>
      <div class="metric-grid">
        ${metricCard("Criteria", tender.metrics.criteria_count, "Clauses extracted")}
        ${metricCard("Bidders", tender.metrics.bidder_count, "Submissions attached")}
        ${metricCard("Eligible", tender.metrics.eligible_count, "All checks passed")}
        ${metricCard("Need Review", tender.metrics.review_count, "Awaiting judgement")}
        ${metricCard("Not Eligible", tender.metrics.rejected_count, "Mandatory failure")}
        ${metricCard("Documents", tender.metrics.document_count, "Files in ledger")}
      </div>
    </article>
  `;
}

function metricCard(label, value, note) {
  return `
    <div class="metric-card">
      <span>${escapeHtml(label)}</span>
      <strong>${value}</strong>
      <small>${escapeHtml(note)}</small>
    </div>
  `;
}

function renderCriteria() {
  const container = document.getElementById("criteria-grid");
  const tender = currentTender();
  if (!tender) { container.innerHTML = ""; return; }

  if (!tender.criteria.length) {
    container.innerHTML = `<div class="empty-state">No criteria extracted yet — upload tender documents to begin.</div>`;
    return;
  }

  container.innerHTML = tender.criteria
    .map(
      (criterion) => `
        <article class="criteria-card">
          <div class="card-header">
            <div style="min-width:0">
              <div class="eyebrow">${escapeHtml(criterion.code)}</div>
              <h3>${escapeHtml(criterion.title)}</h3>
            </div>
            <div class="badges" style="flex-shrink:0;align-items:flex-start">
              ${renderBadge(criterion.category.toLowerCase(), criterion.category)}
              ${renderBadge(criterion.is_mandatory ? "mandatory" : "optional", criterion.is_mandatory ? "Mandatory" : "Optional")}
            </div>
          </div>
          <div class="criteria-text">${escapeHtml(criterion.description)}</div>
          ${criterion.threshold_text ? `<div class="criterion-footnote"><strong>Threshold</strong> · ${escapeHtml(criterion.threshold_text)}</div>` : ""}
          <div class="criteria-actions">
            <span>Confidence ${Math.round((criterion.extraction_confidence || 0) * 100)}%</span>
            <button class="tiny-button" data-action="edit-criterion" data-criterion-id="${criterion.id}">
              Edit
            </button>
          </div>
        </article>
      `
    )
    .join("");
}

function renderMatrix() {
  const container = document.getElementById("matrix-wrapper");
  const tender = currentTender();
  if (!tender) { container.innerHTML = ""; return; }

  if (!tender.bidders.length) {
    container.innerHTML = `<div class="matrix-shell empty-state">Add bidder submissions to generate the evaluation matrix.</div>`;
    return;
  }

  const bidderColumns = tender.bidders
    .map((b) => `<th>${escapeHtml(b.name)}</th>`)
    .join("");

  const bidderEvaluationMap = {};
  tender.bidders.forEach((b) => {
    bidderEvaluationMap[b.id] = {};
    b.evaluations.forEach((e) => { bidderEvaluationMap[b.id][e.criterion_id] = e; });
  });

  const rows = tender.criteria
    .map((criterion) => {
      const cells = tender.bidders
        .map((bidder) => {
          const ev = bidderEvaluationMap[bidder.id][criterion.id];
          if (!ev) return `<td class="matrix-cell"><span style="color:var(--muted)">—</span></td>`;
          return `
            <td class="matrix-cell">
              ${renderBadge(ev.effective_verdict, ev.effective_verdict.replaceAll("_", " "))}
              <span class="matrix-note">${escapeHtml(ev.found_value || ev.verdict_reason)}</span>
            </td>
          `;
        })
        .join("");

      return `
        <tr>
          <td style="white-space:nowrap">
            <span style="font-family:'IBM Plex Mono',monospace;font-size:0.78rem;color:var(--gold);font-weight:600">${escapeHtml(criterion.code)}</span><br />
            <span style="color:var(--ink-dim);font-size:0.82rem">${escapeHtml(criterion.title)}</span>
          </td>
          <td style="font-size:0.82rem;color:var(--muted);max-width:220px">${escapeHtml(criterion.threshold_text || criterion.description)}</td>
          ${cells}
        </tr>
      `;
    })
    .join("");

  container.innerHTML = `
    <div class="matrix-shell">
      <div class="matrix-table-wrap">
        <table class="matrix-table">
          <thead>
            <tr>
              <th>Criterion</th>
              <th>Threshold</th>
              ${bidderColumns}
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `;
}

function renderBidders() {
  const container = document.getElementById("bidders-list");
  const tender = currentTender();
  if (!tender) { container.innerHTML = ""; return; }

  if (!tender.bidders.length) {
    container.innerHTML = `<div class="empty-state">No bidder submissions yet — add bidder packs to this workspace.</div>`;
    return;
  }

  container.innerHTML = tender.bidders
    .map((bidder) => {
      const docs = bidder.documents
        .map(
          (doc) => `
            <div class="document-chip">
              <a href="/documents/${doc.id}" target="_blank" rel="noreferrer">${escapeHtml(doc.filename)}</a>
              <small>${escapeHtml(doc.extraction_method)}</small>
            </div>
          `
        )
        .join("");

      const evals = bidder.evaluations
        .map(
          (ev) => `
            <tr>
              <td style="font-size:0.82rem">${escapeHtml(ev.criterion_code)} · ${escapeHtml(ev.criterion_title)}</td>
              <td>${renderBadge(ev.effective_verdict, ev.effective_verdict.replaceAll("_", " "))}</td>
              <td style="font-family:'IBM Plex Mono',monospace;font-size:0.78rem">${escapeHtml(ev.found_value || "—")}</td>
              <td style="color:var(--muted);font-size:0.8rem;max-width:260px">${escapeHtml(ev.source_excerpt || ev.verdict_reason)}</td>
              <td style="font-family:'IBM Plex Mono',monospace;font-size:0.78rem;white-space:nowrap">${Math.round((ev.confidence || 0) * 100)}%</td>
            </tr>
          `
        )
        .join("");

      return `
        <article class="bidder-card">
          <details ${bidder.overall_status !== "eligible" ? "open" : ""}>
            <summary>
              <div class="bidder-head">
                <div style="min-width:0">
                  <h3>${escapeHtml(bidder.name)}</h3>
                  <p class="bidder-meta">${escapeHtml(bidder.organization_type || "Bidder")} · ${escapeHtml([bidder.city, bidder.state].filter(Boolean).join(", ") || "Location not specified")}</p>
                  <p class="muted" style="margin:0;font-size:0.82rem">${escapeHtml(bidder.summary || "")}</p>
                </div>
                <div class="bidder-tags">
                  ${renderBadge(bidder.overall_status, bidder.overall_status.replaceAll("_", " "))}
                  ${renderBadge(bidder.risk_level, `${bidder.risk_level} risk`)}
                </div>
              </div>
            </summary>
            <div class="bidder-body">
              <div class="document-strip">${docs || `<span class="muted">No documents stored.</span>`}</div>
              <div class="matrix-table-wrap">
                <table class="evaluation-table">
                  <thead>
                    <tr>
                      <th>Criterion</th>
                      <th>Verdict</th>
                      <th>Found Value</th>
                      <th>Evidence</th>
                      <th>Confidence</th>
                    </tr>
                  </thead>
                  <tbody>${evals || `<tr><td colspan="5" style="color:var(--muted);text-align:center;padding:20px">No evaluations yet.</td></tr>`}</tbody>
                </table>
              </div>
            </div>
          </details>
        </article>
      `;
    })
    .join("");
}

function renderReviewQueue() {
  const container = document.getElementById("review-list");
  const tender = currentTender();
  if (!tender) { container.innerHTML = ""; return; }

  if (!tender.review_queue.length) {
    container.innerHTML = `<div class="empty-state">✓ No open review items — all criteria have resolved verdicts.</div>`;
    return;
  }

  container.innerHTML = tender.review_queue
    .map(
      (item) => `
        <article class="review-card">
          <div class="badges">
            ${renderBadge("manual_review", "Needs Review")}
            ${renderBadge(item.criterion_is_mandatory ? "mandatory" : "optional", item.criterion_is_mandatory ? "Mandatory" : "Optional")}
          </div>
          <div>
            <h3>${escapeHtml(item.bidder_name)}</h3>
            <p class="review-details">${escapeHtml(item.criterion_code)} · ${escapeHtml(item.criterion_title)}</p>
          </div>
          <div class="muted" style="font-size:0.85rem">${escapeHtml(item.verdict_reason)}</div>
          <div class="document-meta">${escapeHtml(item.source_excerpt || "No evidence snippet extracted automatically.")}</div>
          <form class="review-form" data-evaluation-id="${item.id}">
            <select name="decision">
              <option value="eligible">Mark Eligible</option>
              <option value="manual_review" selected>Keep in Review</option>
              <option value="not_eligible">Mark Not Eligible</option>
            </select>
            <textarea name="note" placeholder="Officer note for the audit trail…"></textarea>
            <button type="submit" class="icon-button accent" style="width:100%;justify-content:center">
              <span class="button-icon">✓</span>
              <span>Save Review Decision</span>
            </button>
          </form>
        </article>
      `
    )
    .join("");
}

function renderAuditTrail() {
  const container = document.getElementById("audit-list");
  const tender = currentTender();
  if (!tender) { container.innerHTML = ""; return; }

  if (!tender.audit_events.length) {
    container.innerHTML = `<div class="empty-state">No audit events captured yet.</div>`;
    return;
  }

  container.innerHTML = tender.audit_events
    .slice(0, 20)
    .map((event) => {
      const details = tryParse(event.details_json);
      const summary = JSON.stringify(details)
        .replace(/[{}"]/g, "")
        .replaceAll(",", " · ")
        .slice(0, 120);
      return `
        <article class="audit-card">
          <strong>${escapeHtml(event.event_type)}</strong>
          <div class="audit-meta">${escapeHtml(event.actor)} · ${formatDate(event.created_at)}</div>
          <div class="muted">${escapeHtml(summary)}</div>
        </article>
      `;
    })
    .join("");
}

/* ── FORM HANDLERS ──────────────────────────── */

async function submitTenderForm(form) {
  const payload = new FormData(form);
  setStatus("Creating tender workspace…", "info");
  const response = await fetch("/api/tenders", { method: "POST", body: payload });
  const data = await response.json();
  if (!response.ok) {
    setStatus(data.detail || "Could not create tender workspace.", "error");
    return;
  }
  form.reset();
  document.getElementById("tender-dialog").close();
  state.selectedTenderId = data.selected_tender.id;
  await loadApp(state.selectedTenderId);
  setStatus("Tender workspace created successfully.", "success");
}

async function submitBidderForm(form) {
  const tenderId = form.elements.tender_id.value;
  const payload = new FormData(form);
  setStatus("Uploading documents and running criterion checks…", "info");
  const response = await fetch(`/api/tenders/${tenderId}/bidders`, { method: "POST", body: payload });
  const data = await response.json();
  if (!response.ok) {
    setStatus(data.detail || "Could not add bidder.", "error");
    return;
  }
  form.reset();
  form.elements.tender_id.value = tenderId;
  document.getElementById("bidder-dialog").close();
  state.payload.selected_tender = data.selected_tender;
  renderApp();
  setStatus("Bidder submission added and evaluated.", "success");
}

function openCriterionDialog(criterionId) {
  const tender = currentTender();
  const criterion = tender?.criteria.find((item) => item.id === criterionId);
  if (!criterion) return;
  const form = document.getElementById("criterion-form");
  form.elements.tender_id.value = tender.id;
  form.elements.criterion_id.value = criterion.id;
  form.elements.category.value = criterion.category;
  form.elements.title.value = criterion.title;
  form.elements.description.value = criterion.description;
  form.elements.threshold_text.value = criterion.threshold_text || "";
  form.elements.threshold_value.value = criterion.threshold_value ?? "";
  form.elements.unit.value = criterion.unit || "";
  form.elements.is_mandatory.checked = Boolean(criterion.is_mandatory);
  document.getElementById("criterion-dialog").showModal();
}

async function submitCriterionForm(form) {
  const tenderId = form.elements.tender_id.value;
  const criterionId = form.elements.criterion_id.value;
  const payload = {
    category: form.elements.category.value,
    title: form.elements.title.value,
    description: form.elements.description.value,
    threshold_text: form.elements.threshold_text.value,
    threshold_value: form.elements.threshold_value.value ? Number(form.elements.threshold_value.value) : null,
    unit: form.elements.unit.value || null,
    is_mandatory: form.elements.is_mandatory.checked,
  };
  setStatus("Saving criterion and re-evaluating bidders…", "info");
  const response = await fetch(`/api/tenders/${tenderId}/criteria/${criterionId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    setStatus(data.detail || "Could not update criterion.", "error");
    return;
  }
  document.getElementById("criterion-dialog").close();
  state.payload.selected_tender = data.selected_tender;
  renderApp();
  setStatus("Criterion updated and bidders re-evaluated.", "success");
}

async function submitReviewForm(form) {
  const evaluationId = form.dataset.evaluationId;
  const payload = {
    decision: form.elements.decision.value,
    note: form.elements.note.value,
  };
  setStatus("Saving review decision…", "info");
  const response = await fetch(`/api/evaluations/${evaluationId}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    setStatus(data.detail || "Could not save review.", "error");
    return;
  }
  state.payload.selected_tender = data.selected_tender;
  renderApp();
  setStatus("Review decision stored in audit trail.", "success");
}

/* ── HELPERS ──────────────────────────────── */

function renderBadge(kind, label) {
  return `<span class="badge ${escapeAttribute(kind)}">${escapeHtml(titleize(label))}</span>`;
}

function setStatus(message, tone = "info") {
  const banner = document.getElementById("status-banner");
  banner.textContent = message;
  banner.className = `status-banner ${tone}`;
  window.clearTimeout(setStatus._tid);
  setStatus._tid = window.setTimeout(() => banner.classList.add("hidden"), 3500);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
  return String(value ?? "").replace(/[^a-z0-9_-]/gi, "_");
}

function titleize(value) {
  return String(value || "")
    .replaceAll("_", " ")
    .split(" ")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

function formatDate(value) {
  if (!value) return "Unknown";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(d);
}

function tryParse(value) {
  try { return JSON.parse(value); } catch { return {}; }
}

function truncateText(value, max) {
  const t = String(value || "");
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}