import React from 'react'
import { motion } from 'framer-motion'
import { StatusBadge } from './StatusBadge'
import { AlertTriangle } from 'lucide-react'

export function EvaluationMatrix({ criteria, bidders }) {
  if (!bidders?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
          <AlertTriangle className="w-7 h-7 text-slate-700" />
        </div>
        <p className="text-slate-400 font-semibold">No bidder submissions yet</p>
        <p className="text-slate-600 text-sm mt-1.5">Add bidder packs to generate the evaluation matrix.</p>
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
              <th className="sticky left-0 z-10 bg-[#0a0f1a] min-w-[220px]">
                <span className="text-gradient">Criterion</span>
              </th>
              <th className="min-w-[200px]">Threshold</th>
              {bidders.map(b => (
                <th key={b.id} className="min-w-[180px]">
                  <div className="font-semibold text-slate-200 normal-case text-xs tracking-normal mb-1">
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
                  className={ri % 2 === 0 ? 'bg-white/[0.01]' : 'bg-transparent'}>
                <td className="sticky left-0 z-10 bg-[#0a0f1a] border-r border-white/[0.04]">
                  <div className="font-mono text-[10px] font-black tracking-[0.15em] text-gradient">
                    {criterion.code}
                  </div>
                  <div className="text-slate-300 text-xs mt-0.5 font-medium leading-snug">
                    {criterion.title}
                  </div>
                </td>
                <td className="text-slate-500 text-xs max-w-[200px] leading-relaxed">
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
                      <div className="text-[10px] font-mono text-slate-500 mt-1 max-w-[150px] truncate leading-relaxed">
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
