const BASE = 'http://127.0.0.1:8000'

async function req(method, path, body) {
  const opts = { method, headers: {} }
  if (body instanceof FormData) {
    opts.body = body
  } else if (body) {
    opts.headers['Content-Type'] = 'application/json'
    opts.body = JSON.stringify(body)
  }
  const res = await fetch(`${BASE}${path}`, opts)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`)
  return data
}

export const api = {
  fetchBootstrap: (tenderId) =>
    req('GET', `/api/bootstrap${tenderId ? `?tender_id=${encodeURIComponent(tenderId)}` : ''}`),

  createTender: (formData) =>
    req('POST', '/api/tenders', formData),

  addBidder: (tenderId, formData) =>
    req('POST', `/api/tenders/${tenderId}/bidders`, formData),

  runEvaluation: (tenderId) =>
    req('POST', `/api/tenders/${tenderId}/evaluate`),

  updateCriterion: (tenderId, criterionId, payload) =>
    req('PUT', `/api/tenders/${tenderId}/criteria/${criterionId}`, payload),

  resolveReview: (evaluationId, decision, note) =>
    req('POST', `/api/evaluations/${evaluationId}/review`, { decision, note }),

  getReportJsonUrl: (tenderId) => `${BASE}/api/reports/${tenderId}.json`,
  getReportCsvUrl: (tenderId) => `${BASE}/api/reports/${tenderId}.csv`,
  getReportPageUrl: (tenderId) => `${BASE}/reports/${tenderId}`,
  getDocumentUrl: (documentId) => `${BASE}/documents/${documentId}`,
}
