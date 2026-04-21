import React from 'react'
import { cn } from '../utils/cn'

const VARIANT_MAP = {
  eligible:               { bg: 'bg-emerald-500/12', text: 'text-emerald-400', border: 'border-emerald-500/25', glow: 'shadow-[0_0_8px_rgba(16,185,129,0.2)]' },
  not_eligible:           { bg: 'bg-rose-500/12', text: 'text-rose-400', border: 'border-rose-500/25', glow: 'shadow-[0_0_8px_rgba(244,63,94,0.2)]' },
  manual_review:          { bg: 'bg-amber-500/12', text: 'text-amber-400', border: 'border-amber-500/25', glow: 'shadow-[0_0_8px_rgba(245,158,11,0.2)]' },
  financial:              { bg: 'bg-blue-500/12', text: 'text-blue-400', border: 'border-blue-500/25', glow: '' },
  technical:              { bg: 'bg-violet-500/12', text: 'text-violet-400', border: 'border-violet-500/25', glow: '' },
  compliance:             { bg: 'bg-cyan-500/12', text: 'text-cyan-400', border: 'border-cyan-500/25', glow: '' },
  mandatory:              { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', glow: '' },
  optional:               { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20', glow: '' },
  low:                    { bg: 'bg-emerald-500/12', text: 'text-emerald-400', border: 'border-emerald-500/25', glow: '' },
  medium:                 { bg: 'bg-amber-500/12', text: 'text-amber-400', border: 'border-amber-500/25', glow: '' },
  high:                   { bg: 'bg-rose-500/12', text: 'text-rose-400', border: 'border-rose-500/25', glow: '' },
  draft:                  { bg: 'bg-slate-500/12', text: 'text-slate-400', border: 'border-slate-500/20', glow: '' },
  criteria_ready:         { bg: 'bg-blue-500/12', text: 'text-blue-400', border: 'border-blue-500/25', glow: '' },
  evaluation_ready:       { bg: 'bg-emerald-500/12', text: 'text-emerald-400', border: 'border-emerald-500/25', glow: '' },
  ai_assisted:            { bg: 'bg-violet-500/12', text: 'text-violet-300', border: 'border-violet-500/30', glow: 'shadow-[0_0_10px_rgba(139,92,246,0.15)]' },
  offline_deterministic:  { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20', glow: '' },
  sqlite_audit_ledger:    { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', glow: '' },
}

const FALLBACK = { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20', glow: '' }

function titleize(str) {
  return String(str || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export function StatusBadge({ status, label, className }) {
  const variant = VARIANT_MAP[status] || FALLBACK
  const text = label || titleize(status)
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-[3px] rounded-full text-[10px] font-bold tracking-wide border',
      'transition-all duration-200',
      variant.bg, variant.text, variant.border, variant.glow,
      className
    )}>
      {/* Subtle dot indicator */}
      <span className={cn(
        'w-1 h-1 rounded-full mr-1.5 shrink-0',
        variant.text.replace('text-', 'bg-')
      )} />
      {text}
    </span>
  )
}
