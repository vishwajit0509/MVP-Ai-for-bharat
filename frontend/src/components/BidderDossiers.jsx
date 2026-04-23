import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, FileText, ExternalLink, Building2 } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import { api } from '../api/client'
import toast from 'react-hot-toast'

function DocumentChip({ doc }) {
  return (
    <a
      href={api.getDocumentUrl(doc.id)}
      target="_blank"
      rel="noreferrer"
      onClick={() => toast(`Opening ${doc.filename}.`, { id: `document-${doc.id}` })}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg
                 bg-white border border-slate-200 shadow-sm
                 text-sm text-slate-700 hover:text-amber-700 hover:border-amber-300
                 hover:bg-amber-50 transition-colors group"
    >
      <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500" />
      <span className="truncate max-w-[160px] font-medium">{doc.filename}</span>
      <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-amber-400" />
    </a>
  )
}

function BidderCard({ bidder }) {
  const [open, setOpen] = useState(bidder.overall_status !== 'eligible')

  const riskColors = {
    low: 'bg-emerald-500',
    medium: 'bg-amber-500',
    high: 'bg-rose-500',
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
    >
      {/* Very subtle top line indicator instead of heavy gradient */}
      <div className={`h-[3px] w-full ${riskColors[bidder.risk_level] || 'bg-slate-200'}`} />

      {/* Header */}
      <button
        onClick={() => {
          setOpen(o => {
            toast(o ? 'Bidder dossier collapsed.' : 'Bidder dossier expanded.', { id: `bidder-${bidder.id}` })
            return !o
          })
        }}
        className="w-full flex items-start gap-4 p-5 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
          <Building2 className="w-5 h-5 text-slate-400" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 text-base">{bidder.name}</h3>
          <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-500">
            <span>{bidder.organization_type || 'Bidder'}</span>
            <span>·</span>
            <span>{[bidder.city, bidder.state].filter(Boolean).join(', ') || 'Location not specified'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <StatusBadge status={bidder.overall_status} />
          <StatusBadge status={bidder.risk_level} label={`${bidder.risk_level} risk`} />
          <div className="text-slate-400 transition-transform duration-200 ml-2"
               style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>
      </button>

      {/* Expandable body */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-100 p-5 bg-slate-50/50 space-y-6">
              {bidder.documents?.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-900 mb-3">Evidence Documents</div>
                  <div className="flex flex-wrap gap-2">
                    {bidder.documents.map(doc => (
                      <DocumentChip key={doc.id} doc={doc} />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="text-xs font-semibold text-slate-900 mb-3">Criterion Evaluations</div>
                <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Criterion</th>
                        <th>Verdict</th>
                        <th>Found Value</th>
                        <th>Evidence</th>
                        <th>Confidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bidder.evaluations?.length > 0 ? bidder.evaluations.map(ev => (
                        <tr key={ev.id}>
                          <td className="whitespace-nowrap">
                            <span className="font-mono text-xs font-bold text-slate-900">
                              {ev.criterion_code}
                            </span>
                            <span className="text-slate-400 mx-2">·</span>
                            <span className="text-sm text-slate-600">{ev.criterion_title}</span>
                          </td>
                          <td><StatusBadge status={ev.effective_verdict} /></td>
                          <td className="font-mono text-sm text-slate-700">{ev.found_value || '—'}</td>
                          <td className="max-w-[220px] text-sm text-slate-600 truncate" title={ev.source_excerpt || ev.verdict_reason}>
                            {ev.source_excerpt || ev.verdict_reason}
                          </td>
                          <td>
                            <span className="text-sm font-medium text-slate-500">
                              {Math.round((ev.confidence || 0) * 100)}%
                            </span>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={5} className="text-center text-slate-500 py-8 text-sm">
                            No evaluations yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  )
}

export function BidderDossiers({ bidders }) {
  if (!bidders?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-slate-300 rounded-2xl bg-slate-50/50">
        <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center mb-4 shadow-sm">
          <Building2 className="w-6 h-6 text-slate-400" />
        </div>
        <p className="text-slate-900 text-sm font-semibold">No bidder submissions yet</p>
        <p className="text-slate-500 text-sm mt-1">Add bidder packs to this workspace.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {bidders.map(bidder => (
        <BidderCard key={bidder.id} bidder={bidder} />
      ))}
    </div>
  )
}