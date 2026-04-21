import React from 'react'
import { motion } from 'framer-motion'
import { Pencil, Sparkles, Lock, Unlock } from 'lucide-react'
import { StatusBadge } from './StatusBadge'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}
const item = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 20, stiffness: 260 } },
}

function ConfidenceBar({ value }) {
  const pct = Math.round((value || 0) * 100)
  const color = pct >= 80 ? 'from-emerald-400 to-emerald-600' :
                pct >= 50 ? 'from-amber-400 to-amber-600' : 'from-rose-400 to-rose-600'
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className={`h-full bg-gradient-to-r ${color} rounded-full`}
        />
      </div>
      <span className="text-[10px] font-mono font-bold text-slate-500 w-8 text-right tabular-nums">{pct}%</span>
    </div>
  )
}

export function CriteriaGrid({ criteria, onEditCriterion }) {
  if (!criteria?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
          <Sparkles className="w-7 h-7 text-slate-700" />
        </div>
        <p className="text-slate-400 font-semibold">No criteria extracted yet</p>
        <p className="text-slate-600 text-sm mt-1.5">Upload tender documents to begin AI extraction.</p>
      </div>
    )
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
    >
      {criteria.map(criterion => (
        <motion.article
          key={criterion.id}
          variants={item}
          className="glass-card p-5 group hover:border-white/[0.1] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
        >
          {/* Hover glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.03] to-transparent opacity-0
                          group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <div className="font-mono text-[10px] font-black tracking-[0.2em] text-gradient mb-1">
                  {criterion.code}
                </div>
                <h3 className="font-bold text-slate-100 text-sm leading-snug">{criterion.title}</h3>
              </div>
              <div className="flex flex-col gap-1.5 items-end shrink-0">
                <StatusBadge status={criterion.category?.toLowerCase()} label={criterion.category} />
                <div className="flex items-center gap-1">
                  {criterion.is_mandatory ? (
                    <Lock className="w-2.5 h-2.5 text-rose-400/60" />
                  ) : (
                    <Unlock className="w-2.5 h-2.5 text-slate-600" />
                  )}
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${
                    criterion.is_mandatory ? 'text-rose-400/70' : 'text-slate-600'
                  }`}>
                    {criterion.is_mandatory ? 'Required' : 'Optional'}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-slate-400 text-xs leading-relaxed mb-3 line-clamp-3">
              {criterion.description}
            </p>

            {/* Threshold */}
            {criterion.threshold_text && (
              <div className="text-xs text-slate-500 rounded-xl px-3.5 py-2.5 mb-4
                              border border-amber-500/10 bg-amber-500/[0.03]">
                <span className="text-gradient font-bold text-[10px] uppercase tracking-wider">Threshold</span>
                <div className="mt-0.5 text-slate-400">{criterion.threshold_text}</div>
              </div>
            )}

            {/* Confidence + Edit */}
            <div className="space-y-2 mt-auto">
              <ConfidenceBar value={criterion.extraction_confidence} />
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-slate-600 font-mono uppercase tracking-wider">AI Confidence</span>
                <button
                  onClick={() => onEditCriterion(criterion)}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500
                             hover:text-amber-400 transition-all px-2.5 py-1.5 rounded-lg
                             hover:bg-amber-500/10 group/btn"
                >
                  <Pencil className="w-3 h-3 group-hover/btn:rotate-[-12deg] transition-transform" />
                  Edit
                </button>
              </div>
            </div>
          </div>
        </motion.article>
      ))}
    </motion.div>
  )
}
