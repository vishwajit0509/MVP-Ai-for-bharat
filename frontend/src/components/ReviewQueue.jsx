import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Loader2, AlertTriangle, MessageSquare } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import { api } from '../api/client'
import toast from 'react-hot-toast'

function ReviewCard({ item, onResolved }) {
  const [decision, setDecision] = useState('manual_review')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const data = await api.resolveReview(item.id, decision, note)
      onResolved(data.selected_tender)
      toast.success('Review decision saved to audit trail.')
    } catch (err) {
      toast.error(err.message || 'Could not save review.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden"
    >
      {/* Amber accent top */}
      <div className="h-px bg-gradient-to-r from-amber-500/40 via-amber-500/10 to-transparent" />

      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            {/* Icon */}
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/15 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-white text-[15px]">{item.bidder_name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                <span className="font-mono font-bold text-gradient tracking-wider">{item.criterion_code}</span>
                <span className="text-slate-700 mx-1.5">·</span>
                {item.criterion_title}
              </p>
            </div>
          </div>
          <div className="flex gap-1.5 shrink-0">
            <StatusBadge status="manual_review" label="Needs Review" />
            <StatusBadge
              status={item.criterion_is_mandatory ? 'mandatory' : 'optional'}
              label={item.criterion_is_mandatory ? 'Mandatory' : 'Optional'}
            />
          </div>
        </div>

        <p className="text-sm text-slate-400 leading-relaxed">{item.verdict_reason}</p>

        {item.source_excerpt && (
          <blockquote className="border-l-2 border-amber-500/30 pl-4 py-2 text-xs text-slate-500 italic leading-relaxed
                                 bg-amber-500/[0.02] rounded-r-xl">
            <MessageSquare className="w-3 h-3 text-amber-600 mb-1.5 inline-block mr-1 -mt-0.5" />
            {item.source_excerpt}
          </blockquote>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 pt-3 border-t border-white/[0.04]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="form-label">Decision</label>
              <select
                value={decision}
                onChange={e => setDecision(e.target.value)}
                className="form-input"
              >
                <option value="eligible">✓ Mark Eligible</option>
                <option value="manual_review">⏳ Keep in Review</option>
                <option value="not_eligible">✕ Mark Not Eligible</option>
              </select>
            </div>
            <div>
              <label className="form-label">Officer Note</label>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Brief note for audit trail…"
                className="form-input"
              />
            </div>
          </div>
          <button type="submit" disabled={saving}
                  className="btn-primary w-full justify-center py-3">
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
              : <><CheckCircle2 className="w-4 h-4" /> Save Review Decision</>
            }
          </button>
        </form>
      </div>
    </motion.article>
  )
}

export function ReviewQueue({ reviewQueue, onResolved }) {
  if (!reviewQueue?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/15 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-7 h-7 text-emerald-500/60" />
        </div>
        <p className="text-slate-300 font-bold">All clear — nothing in the review queue</p>
        <p className="text-slate-600 text-sm mt-1.5">All criteria have resolved verdicts.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="glass-card px-4 py-3 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        <span className="text-sm text-slate-400">
          <span className="font-bold text-amber-400 tabular-nums">{reviewQueue.length}</span>
          {' '}item{reviewQueue.length !== 1 ? 's' : ''} awaiting officer judgement
        </span>
      </div>
      {reviewQueue.map(item => (
        <ReviewCard key={item.id} item={item} onResolved={onResolved} />
      ))}
    </div>
  )
}
