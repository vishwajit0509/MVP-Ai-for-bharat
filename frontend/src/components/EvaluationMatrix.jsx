import React from 'react'
import { motion } from 'framer-motion'
import { StatusBadge } from './StatusBadge'
import { AlertTriangle } from 'lucide-react'

export function EvaluationMatrix({ criteria, bidders }) {
  if (!bidders?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-4 shadow-sm">
          <AlertTriangle className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-slate-700 text-lg font-semibold">No bidder submissions yet</p>
        <p className="text-slate-500 text-base mt-1.5">Add bidder packs to generate the evaluation matrix.</p>
      </div>
    )
  }

  const evalMap = {}
  bidders.forEach(b => {
    evalMap[b.id] = {}
    b.evaluations.forEach(ev => { evalMap[b.id][ev.criterion_id] = ev })
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card overflow-hidden"
    >
      {/* Subtle top accent */}
      <div className="h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

      <div className="overflow-x-auto scrollbar-thin">
        <table className="data-table min-w-max">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-white min-w-[220px]">
                <span className="text-gradient">Criterion</span>
              </th>
              <th className="min-w-[200px]">Threshold</th>
              {bidders.map(b => (
                <th key={b.id} className="min-w-[180px]">
                  <div className="font-semibold text-slate-700 normal-case text-sm tracking-normal mb-1.5">
                    {b.name}
                  </div>
                  <StatusBadge status={b.overall_status} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {criteria.map((criterion, ri) => (
              <tr key={criterion.id}
                  className={ri % 2 === 0 ? 'bg-slate-50/70' : 'bg-transparent'}>
                <td className="sticky left-0 z-10 bg-white border-r border-slate-200">
                  <div className="font-mono text-[11px] font-black tracking-[0.15em] text-gradient">
                    {criterion.code}
                  </div>
                  <div className="text-slate-700 text-sm mt-1 font-medium leading-snug">
                    {criterion.title}
                  </div>
                </td>
                <td className="text-slate-600 text-sm max-w-[220px] leading-relaxed">
                  {criterion.threshold_text || criterion.description?.slice(0, 90) || '—'}
                </td>
                {bidders.map(b => {
                  const ev = evalMap[b.id]?.[criterion.id]
                  if (!ev) return (
                    <td key={b.id} className="text-center">
                      <span className="text-slate-700 text-lg">—</span>
                    </td>
                  )
                  return (
                    <td key={b.id}>
                      <StatusBadge status={ev.effective_verdict} className="mb-1.5" />
                      <div className="text-xs font-mono text-slate-500 mt-1.5 max-w-[170px] truncate leading-relaxed">
                        {ev.found_value || ev.verdict_reason}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
