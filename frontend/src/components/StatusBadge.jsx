import React from 'react'
import { cn } from '../utils/cn'

const VARIANT_MAP = {
  eligible:               { bg: 'bg-emerald-500/[0.08]', text: 'text-emerald-600', border: 'border-emerald-500/20', glow: 'shadow-[0_2px_10px_rgba(16,185,129,0.06)]' },
  not_eligible:           { bg: 'bg-rose-500/[0.08]', text: 'text-rose-600', border: 'border-rose-500/20', glow: 'shadow-[0_2px_10px_rgba(244,63,94,0.06)]' },
  manual_review:          { bg: 'bg-amber-500/[0.08]', text: 'text-amber-600', border: 'border-amber-500/20', glow: 'shadow-[0_2px_10px_rgba(245,158,11,0.06)]' },
  financial:              { bg: 'bg-blue-500/[0.08]', text: 'text-blue-600', border: 'border-blue-500/20', glow: 'shadow-[0_2px_10px_rgba(59,130,246,0.06)]' },
  technical:              { bg: 'bg-violet-500/[0.08]', text: 'text-violet-600', border: 'border-violet-500/20', glow: 'shadow-[0_2px_10px_rgba(139,92,246,0.06)]' },
  compliance:             { bg: 'bg-cyan-500/[0.08]', text: 'text-cyan-600', border: 'border-cyan-500/20', glow: 'shadow-[0_2px_10px_rgba(6,182,212,0.06)]' },
  mandatory:              { bg: 'bg-rose-500/[0.08]', text: 'text-rose-600', border: 'border-rose-500/20', glow: '' },
  optional:               { bg: 'bg-slate-500/[0.08]', text: 'text-slate-600', border: 'border-slate-500/20', glow: '' },
  low:                    { bg: 'bg-emerald-500/[0.08]', text: 'text-emerald-600', border: 'border-emerald-500/20', glow: '' },
  medium:                 { bg: 'bg-amber-500/[0.08]', text: 'text-amber-600', border: 'border-amber-500/20', glow: '' },
  high:                   { bg: 'bg-rose-500/[0.08]', text: 'text-rose-600', border: 'border-rose-500/20', glow: '' },
  high_risk:              { bg: 'bg-rose-500/[0.08]', text: 'text-rose-600', border: 'border-rose-500/20', glow: 'shadow-[0_2px_10px_rgba(244,63,94,0.06)]' },
  draft:                  { bg: 'bg-slate-500/[0.08]', text: 'text-slate-600', border: 'border-slate-500/20', glow: '' },
  criteria_ready:         { bg: 'bg-blue-500/[0.08]', text: 'text-blue-600', border: 'border-blue-500/20', glow: '' },
  evaluation_ready:       { bg: 'bg-emerald-500/[0.08]', text: 'text-emerald-600', border: 'border-emerald-500/20', glow: '' },
  ai_assisted:            { bg: 'bg-violet-500/[0.08]', text: 'text-violet-600', border: 'border-violet-500/20', glow: 'shadow-[0_0_10px_rgba(139,92,246,0.1)]' },
  offline_deterministic:  { bg: 'bg-slate-500/[0.08]', text: 'text-slate-600', border: 'border-slate-500/20', glow: '' },
  sqlite_audit_ledger:    { bg: 'bg-cyan-500/[0.08]', text: 'text-cyan-600', border: 'border-cyan-500/20', glow: '' },
}

const FALLBACK = { bg: 'bg-slate-500/[0.08]', text: 'text-slate-600', border: 'border-slate-500/20', glow: '' }

function titleize(str) {
  return String(str || '').replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase())
}

export function StatusBadge({ status, label, className }) {
  const variant = VARIANT_MAP[status?.toLowerCase()] || FALLBACK
  const text = titleize(label || status)
  return (
    <span className={cn(
      'inline-flex items-center justify-center px-3.5 py-1.5 rounded-full text-[11px] leading-none font-bold tracking-wide border backdrop-blur-sm',
      'transition-all duration-300 hover:-translate-y-0.5',
      variant.bg, variant.text, variant.border, variant.glow,
      className
    )}>
      {/* Subtle dot indicator */}
      <span className={cn(
        'w-1.5 h-1.5 rounded-full mr-2 shrink-0 animate-pulse',
        variant.text.replace('text-', 'bg-')
      )} />
      <span className="translate-y-[0.5px]">{text}</span>
    </span>
  )
}
