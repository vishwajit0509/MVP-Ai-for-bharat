import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, FileText, ExternalLink, Building2 } from 'lucide-react'
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
      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl
                 bg-white border border-slate-200
                 text-sm text-slate-600 hover:text-amber-700 hover:border-amber-300
                 hover:bg-amber-50 transition-all duration-200 group/chip"
    >
      <FileText className="w-3.5 h-3.5 shrink-0 opacity-50 group-hover/chip:opacity-100 transition-opacity" />
      <span className="truncate max-w-[160px] font-medium">{doc.filename}</span>
      <span className="text-[9px] text-slate-600 font-mono">{doc.extraction_method}</span>
      <ExternalLink className="w-3 h-3 shrink-0 opacity-0 group-hover/chip:opacity-60 transition-opacity" />
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
        onClick={() => {
          setOpen(o => {
            toast(o ? 'Bidder dossier collapsed.' : 'Bidder dossier expanded.', { id: `bidder-${bidder.id}` })
            return !o
          })
        }}
        className="w-full flex items-start gap-5 p-6 hover:bg-slate-50/80 transition-colors text-left"
      >
        {/* Avatar */}
        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
          <Building2 className="w-6 h-6 text-slate-500" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-950 text-lg leading-snug">{bidder.name}</h3>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span className="text-sm text-slate-500">
              {bidder.organization_type || 'Bidder'}
            </span>
            <span className="text-slate-700">·</span>
            <span className="text-sm text-slate-600">
              {[bidder.city, bidder.state].filter(Boolean).join(', ') || 'Location not specified'}
            </span>
          </div>
          {bidder.summary && (
            <p className="text-sm text-slate-600 mt-1.5 line-clamp-1">{bidder.summary}</p>
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
            <div className="border-t border-slate-200 p-6 space-y-6">
              {/* Documents */}
              {bidder.documents?.length > 0 && (
                <div>
                  <div className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" />
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
                <div className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-[0.2em] mb-3">
                  Criterion Evaluations
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-200 scrollbar-thin">
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
                            <span className="text-xs text-slate-600">{ev.criterion_title}</span>
                          </td>
                          <td><StatusBadge status={ev.effective_verdict} /></td>
                          <td className="font-mono text-xs text-slate-700">{ev.found_value || '—'}</td>
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
        <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-4 shadow-sm">
          <Building2 className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-slate-700 text-lg font-semibold">No bidder submissions yet</p>
        <p className="text-slate-500 text-base mt-1.5">Add bidder packs to this workspace.</p>
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
