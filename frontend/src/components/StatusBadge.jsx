import React from 'react'
import { cn } from '../utils/cn'

const VARIANT_MAP = {
  eligible:               { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', glow: 'shadow-[0_0_8px_rgba(16,185,129,0.12)]' },
  not_eligible:           { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', glow: 'shadow-[0_0_8px_rgba(244,63,94,0.12)]' },
  manual_review:          { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', glow: 'shadow-[0_0_8px_rgba(245,158,11,0.12)]' },
  financial:              { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', glow: '' },
  technical:              { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', glow: '' },
  compliance:             { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', glow: '' },
  mandatory:              { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', glow: '' },
  optional:               { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', glow: '' },
  low:                    { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', glow: '' },
  medium:                 { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', glow: '' },
  high:                   { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', glow: '' },
  draft:                  { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', glow: '' },
  criteria_ready:         { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', glow: '' },
  evaluation_ready:       { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', glow: '' },
  ai_assisted:            { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', glow: 'shadow-[0_0_10px_rgba(139,92,246,0.1)]' },
  offline_deterministic:  { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', glow: '' },
  sqlite_audit_ledger:    { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', glow: '' },
}

const FALLBACK = { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', glow: '' }

function titleize(str) {
  return String(str || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export function StatusBadge({ status, label, className }) {
  const variant = VARIANT_MAP[status] || FALLBACK
  const text = label || titleize(status)
  return (
    <span className={cn(
      'inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wide border',
      'transition-all duration-200',
      variant.bg, variant.text, variant.border, variant.glow,
      className
    )}>
      {/* Subtle dot indicator */}
      <span className={cn(
        'w-1.5 h-1.5 rounded-full mr-1.5 shrink-0',
        variant.text.replace('text-', 'bg-')
      )} />
      {text}
    </span>
  )
}
