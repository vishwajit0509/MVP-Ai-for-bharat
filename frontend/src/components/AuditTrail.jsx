import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { formatDate, tryParse } from '../utils/cn'
import { Clock, User, ChevronDown, ChevronUp } from 'lucide-react'

const EVENT_COLORS = {
  'tender.created':     { dot: 'bg-blue-500', ring: 'ring-blue-500/20', line: 'from-blue-500/40' },
  'bidder.created':     { dot: 'bg-violet-500', ring: 'ring-violet-500/20', line: 'from-violet-500/40' },
  'bidder.evaluated':   { dot: 'bg-amber-500', ring: 'ring-amber-500/20', line: 'from-amber-500/40' },
  'criteria.extracted': { dot: 'bg-cyan-500', ring: 'ring-cyan-500/20', line: 'from-cyan-500/40' },
  'criteria.refreshed': { dot: 'bg-cyan-400', ring: 'ring-cyan-400/20', line: 'from-cyan-400/40' },
  'criterion.updated':  { dot: 'bg-orange-500', ring: 'ring-orange-500/20', line: 'from-orange-500/40' },
  'document.ingested':  { dot: 'bg-slate-500', ring: 'ring-slate-500/20', line: 'from-slate-500/40' },
  'review.resolved':    { dot: 'bg-emerald-500', ring: 'ring-emerald-500/20', line: 'from-emerald-500/40' },
}

const FALLBACK_COLOR = { dot: 'bg-slate-600', ring: 'ring-slate-600/20', line: 'from-slate-600/40' }

function formatDetails(json) {
  const obj = tryParse(json)
  return Object.entries(obj)
    .filter(([, v]) => v !== null && v !== undefined && v !== '')
    .map(([k, v]) => `${k}: ${v}`)
    .join(' · ')
    .slice(0, 160)
}

export function AuditTrail({ auditEvents }) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? auditEvents : auditEvents?.slice(0, 12)

  if (!auditEvents?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
          <Clock className="w-7 h-7 text-slate-700" />
        </div>
        <p className="text-slate-400 font-semibold">No audit events yet</p>
        <p className="text-slate-600 text-sm mt-1.5">Events will appear as actions are taken.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="relative pl-6">
        {/* Vertical line */}
        <div className="absolute left-[9px] top-2 bottom-2 w-px bg-gradient-to-b from-amber-500/20 via-white/[0.04] to-transparent" />

        <div className="space-y-1">
          {visible.map((event, i) => {
            const colors = EVENT_COLORS[event.event_type] || FALLBACK_COLOR
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.025, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex gap-4 py-2 group"
              >
                {/* Dot with ring */}
                <div className="absolute -left-6 mt-[7px]">
                  <div className={`w-[11px] h-[11px] rounded-full ${colors.dot}
                                   ring-[3px] ${colors.ring} ring-offset-1 ring-offset-[#060a13]`} />
                </div>

                {/* Card */}
                <div className="flex-1 glass-card px-4 py-3 group-hover:border-white/[0.08] transition-all duration-200">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-slate-200">
                        {event.event_type}
                      </span>
                      <span className="text-[9px] font-mono text-slate-600 flex items-center gap-1">
                        <User className="w-2.5 h-2.5" />
                        {event.actor}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-600 font-mono tabular-nums flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {formatDate(event.created_at)}
                    </span>
                  </div>
                  {event.details_json && (
                    <div className="text-[10px] text-slate-600 mt-1.5 font-mono truncate leading-relaxed">
                      {formatDetails(event.details_json)}
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {auditEvents.length > 12 && (
        <button
          onClick={() => setShowAll(s => !s)}
          className="btn-ghost w-full justify-center text-sm mt-4 py-2.5"
        >
          {showAll ? (
            <><ChevronUp className="w-4 h-4" /> Show less</>
          ) : (
            <><ChevronDown className="w-4 h-4" /> Show all {auditEvents.length} events</>
          )}
        </button>
      )}
    </div>
  )
}
