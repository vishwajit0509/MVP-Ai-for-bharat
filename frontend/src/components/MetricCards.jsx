import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileCheck, Users, CheckCircle2, AlertCircle, XCircle, FileText,
  TrendingUp, TrendingDown
} from 'lucide-react'

const CARDS = [
  {
    key: 'criteria_count', label: 'Criteria', sub: 'Clauses extracted',
    icon: FileText,
    gradient: 'from-blue-600/30 via-blue-500/15 to-transparent',
    borderColor: 'border-blue-500/20',
    accentColor: 'from-blue-400 to-blue-600',
    iconColor: 'text-blue-400',
    glowColor: 'shadow-[0_0_30px_rgba(59,130,246,0.12)]',
  },
  {
    key: 'bidder_count', label: 'Bidders', sub: 'Submissions attached',
    icon: Users,
    gradient: 'from-violet-600/30 via-violet-500/15 to-transparent',
    borderColor: 'border-violet-500/20',
    accentColor: 'from-violet-400 to-violet-600',
    iconColor: 'text-violet-400',
    glowColor: 'shadow-[0_0_30px_rgba(139,92,246,0.12)]',
  },
  {
    key: 'eligible_count', label: 'Eligible', sub: 'All checks passed',
    icon: CheckCircle2,
    gradient: 'from-emerald-600/30 via-emerald-500/15 to-transparent',
    borderColor: 'border-emerald-500/20',
    accentColor: 'from-emerald-400 to-emerald-600',
    iconColor: 'text-emerald-400',
    glowColor: 'shadow-[0_0_30px_rgba(16,185,129,0.12)]',
  },
  {
    key: 'review_count', label: 'Need Review', sub: 'Awaiting judgement',
    icon: AlertCircle,
    gradient: 'from-amber-600/30 via-amber-500/15 to-transparent',
    borderColor: 'border-amber-500/20',
    accentColor: 'from-amber-400 to-amber-600',
    iconColor: 'text-amber-400',
    glowColor: 'shadow-[0_0_30px_rgba(245,158,11,0.12)]',
  },
  {
    key: 'rejected_count', label: 'Not Eligible', sub: 'Mandatory failure',
    icon: XCircle,
    gradient: 'from-rose-600/30 via-rose-500/15 to-transparent',
    borderColor: 'border-rose-500/20',
    accentColor: 'from-rose-400 to-rose-600',
    iconColor: 'text-rose-400',
    glowColor: 'shadow-[0_0_30px_rgba(244,63,94,0.12)]',
  },
  {
    key: 'document_count', label: 'Documents', sub: 'Files in ledger',
    icon: FileCheck,
    gradient: 'from-cyan-600/30 via-cyan-500/15 to-transparent',
    borderColor: 'border-cyan-500/20',
    accentColor: 'from-cyan-400 to-cyan-600',
    iconColor: 'text-cyan-400',
    glowColor: 'shadow-[0_0_30px_rgba(6,182,212,0.12)]',
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}
const item = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 18, stiffness: 250 } },
}

/* ── Animated Counter ── */
function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef()

  useEffect(() => {
    const target = Number(value) || 0
    const start = ref.current || 0
    const delta = target - start
    if (delta === 0) { setDisplay(target); return }
    const duration = Math.min(800, Math.abs(delta) * 120)
    let startTime = null

    function animate(ts) {
      if (!startTime) startTime = ts
      const progress = Math.min((ts - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setDisplay(Math.round(start + delta * eased))
      if (progress < 1) requestAnimationFrame(animate)
      else ref.current = target
    }
    requestAnimationFrame(animate)
    return () => { ref.current = target }
  }, [value])

  return <span>{display}</span>
}

export function MetricCards({ metrics }) {
  if (!metrics) return null
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4"
    >
      {CARDS.map(({ key, label, sub, icon: Icon, gradient, borderColor, accentColor, iconColor, glowColor }) => (
        <motion.div
          key={key}
          variants={item}
          className={`relative rounded-2xl border ${borderColor} bg-white/90 p-6 overflow-hidden
                      ${glowColor} card-hover-glow hover:scale-[1.03] transition-all duration-300 cursor-default group shimmer`}
        >
          {/* Background gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
          {/* Subtle inner shine */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent opacity-0
                          group-hover:opacity-100 transition-opacity duration-300" />
          {/* Left accent bar */}
          <div className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-gradient-to-b ${accentColor} opacity-60`} />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">{label}</span>
              <div className="relative">
                <Icon className={`w-5 h-5 ${iconColor} opacity-80`} />
              </div>
            </div>
            <div className="text-5xl font-black text-slate-950 leading-none tracking-tight tabular-nums">
              <AnimatedNumber value={metrics[key] ?? 0} />
            </div>
            <div className="mt-3 text-xs text-slate-500 font-medium">{sub}</div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
