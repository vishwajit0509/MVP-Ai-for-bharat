import React from 'react'
import { motion } from 'framer-motion'
import { Pencil, Sparkles, Lock, Unlock } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import { cn } from '../utils/cn'

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
      <div className="flex-1 h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className={`h-full bg-gradient-to-r ${color} rounded-full`}
        />
      </div>
      <span className="text-[11px] font-mono font-bold text-slate-500 w-9 text-right tabular-nums">{pct}%</span>
    </div>
  )
}

export function CriteriaGrid({ criteria, onEditCriterion }) {
  if (!criteria?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-4 shadow-sm">
          <Sparkles className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-slate-700 text-lg font-semibold">No criteria extracted yet</p>
        <p className="text-slate-500 text-base mt-1.5">Upload tender documents to begin AI extraction.</p>
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
          className="glass-card p-6 group hover:border-amber-200 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
        >
          {/* Hover glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.03] to-transparent opacity-0
                          group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <div className="font-mono text-[11px] font-black tracking-[0.2em] text-gradient mb-1.5">
                  {criterion.code}
                </div>
                <h3 className="font-bold text-slate-950 text-base leading-snug">{criterion.title}</h3>
              </div>
              <div className="flex flex-col gap-1.5 items-end shrink-0">
                <StatusBadge status={criterion.category?.toLowerCase()} label={criterion.category} />
                <div className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-md border backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5",
                  criterion.is_mandatory
                    ? "bg-rose-500/[0.05] border-rose-500/20 shadow-[0_2px_8px_rgba(244,63,94,0.04)]"
                    : "bg-slate-500/[0.05] border-slate-500/20"
                )}>
                  {criterion.is_mandatory ? (
                    <>
                      <Lock className="w-3 h-3 text-rose-500" />
                      <span className="text-[10px] leading-none font-bold uppercase tracking-wider text-rose-600 translate-y-[0.5px]">Required</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3 h-3 text-slate-400" />
                      <span className="text-[10px] leading-none font-bold uppercase tracking-wider text-slate-500 translate-y-[0.5px]">Optional</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">
              {criterion.description}
            </p>

            {/* Threshold */}
            {criterion.threshold_text && (
              <div className="text-sm text-slate-600 rounded-xl px-4 py-3 mb-4
                              border border-amber-200 bg-amber-50/70">
                <span className="text-gradient font-bold text-[11px] uppercase tracking-wider">Threshold</span>
                <div className="mt-0.5 text-slate-600">{criterion.threshold_text}</div>
              </div>
            )}

            {/* Confidence + Edit */}
            <div className="space-y-2 mt-auto">
              <ConfidenceBar value={criterion.extraction_confidence} />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-600 font-mono uppercase tracking-wider">AI Confidence</span>
                <button
                  onClick={() => onEditCriterion(criterion)}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-500
                             hover:text-amber-500 transition-all px-3 py-2 rounded-lg
                             hover:bg-amber-500/10 group/btn"
                >
                  <Pencil className="w-3.5 h-3.5 group-hover/btn:rotate-[-12deg] transition-transform" />
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
