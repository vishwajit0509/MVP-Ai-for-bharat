import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, FileText, ExternalLink, Building2 } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import { api } from '../api/client'

function DocumentChip({ doc }) {
  return (
    <a
      href={api.getDocumentUrl(doc.id)}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                 bg-white/[0.03] border border-white/[0.06]
                 text-xs text-slate-300 hover:text-amber-400 hover:border-amber-500/30
                 hover:bg-amber-500/[0.04] transition-all duration-200 group/chip"
    >
      <FileText className="w-3 h-3 shrink-0 opacity-50 group-hover/chip:opacity-100 transition-opacity" />
      <span className="truncate max-w-[140px] font-medium">{doc.filename}</span>
      <span className="text-[9px] text-slate-600 font-mono">{doc.extraction_method}</span>
      <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-0 group-hover/chip:opacity-60 transition-opacity" />
    </a>
  )
}

function BidderCard({ bidder }) {
  const [open, setOpen] = useState(bidder.overall_status !== 'eligible')

  const riskColors = {
    low: 'from-emerald-500/20',
    medium: 'from-amber-500/20',
    high: 'from-rose-500/20',
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden group"
    >
      {/* Risk-colored top accent */}
      <div className={`h-px bg-gradient-to-r ${riskColors[bidder.risk_level] || 'from-slate-500/20'} via-transparent to-transparent`} />

      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start gap-4 p-5 hover:bg-white/[0.02] transition-colors text-left"
      >
        {/* Avatar */}
        <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
          <Building2 className="w-5 h-5 text-slate-600" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-[15px] leading-snug">{bidder.name}</h3>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span className="text-[11px] text-slate-500">
              {bidder.organization_type || 'Bidder'}
            </span>
            <span className="text-slate-700">·</span>
            <span className="text-[11px] text-slate-600">
              {[bidder.city, bidder.state].filter(Boolean).join(', ') || 'Location not specified'}
            </span>
          </div>
          {bidder.summary && (
            <p className="text-[11px] text-slate-600 mt-1 line-clamp-1">{bidder.summary}</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={bidder.overall_status} />
          <StatusBadge status={bidder.risk_level} label={`${bidder.risk_level} risk`} />
          <div className="text-slate-600 ml-1 transition-transform duration-200"
               style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            <ChevronDown className="w-4 h-4" />
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
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/[0.04] p-5 space-y-5">
              {/* Documents */}
              {bidder.documents?.length > 0 && (
                <div>
                  <div className="text-[9px] font-mono font-bold text-slate-600 uppercase tracking-[0.2em] mb-2.5 flex items-center gap-1.5">
                    <FileText className="w-3 h-3" />
                    Evidence Documents
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {bidder.documents.map(doc => (
                      <DocumentChip key={doc.id} doc={doc} />
                    ))}
                  </div>
                </div>
              )}

              {/* Evaluation table */}
              <div>
                <div className="text-[9px] font-mono font-bold text-slate-600 uppercase tracking-[0.2em] mb-2.5">
                  Criterion Evaluations
                </div>
                <div className="overflow-x-auto rounded-xl border border-white/[0.04] scrollbar-thin">
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
                            <span className="font-mono text-[10px] text-gradient font-black tracking-wider">
                              {ev.criterion_code}
                            </span>
                            <span className="text-slate-700 mx-1.5">·</span>
                            <span className="text-xs text-slate-400">{ev.criterion_title}</span>
                          </td>
                          <td><StatusBadge status={ev.effective_verdict} /></td>
                          <td className="font-mono text-xs text-slate-300">{ev.found_value || '—'}</td>
                          <td className="max-w-[220px] text-xs text-slate-500 truncate">
                            {ev.source_excerpt || ev.verdict_reason}
                          </td>
                          <td>
                            <span className="font-mono text-xs text-slate-500 tabular-nums">
                              {Math.round((ev.confidence || 0) * 100)}%
                            </span>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={5} className="text-center text-slate-600 py-8">
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
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
          <Building2 className="w-7 h-7 text-slate-700" />
        </div>
        <p className="text-slate-400 font-semibold">No bidder submissions yet</p>
        <p className="text-slate-600 text-sm mt-1.5">Add bidder packs to this workspace.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {bidders.map(bidder => (
        <BidderCard key={bidder.id} bidder={bidder} />
      ))}
    </div>
  )
}
