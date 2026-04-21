import React, { useState, useEffect } from 'react'
import { Loader2, Save } from 'lucide-react'
import { Modal } from './Modal'
import { api } from '../../api/client'
import toast from 'react-hot-toast'

export function EditCriterionModal({ open, onClose, criterion, tenderId, onSaved }) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    category: 'Financial',
    title: '',
    description: '',
    threshold_text: '',
    threshold_value: '',
    unit: '',
    is_mandatory: true,
  })

  useEffect(() => {
    if (criterion) {
      setForm({
        category: criterion.category || 'Financial',
        title: criterion.title || '',
        description: criterion.description || '',
        threshold_text: criterion.threshold_text || '',
        threshold_value: criterion.threshold_value ?? '',
        unit: criterion.unit || '',
        is_mandatory: Boolean(criterion.is_mandatory),
      })
    }
  }, [criterion])

  function set(key) {
    return e => setForm(f => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const toastId = toast.loading('Saving criterion...')
    try {
      const payload = {
        ...form,
        threshold_value: form.threshold_value !== '' ? Number(form.threshold_value) : null,
        unit: form.unit || null,
      }
      const data = await api.updateCriterion(tenderId, criterion.id, payload)
      onSaved(data.selected_tender)
      onClose()
      toast.success('Criterion updated and bidders re-evaluated.', { id: toastId })
    } catch (err) {
      toast.error(err.message || 'Could not update criterion.', { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  if (!criterion) return null

  return (
    <Modal open={open} onClose={onClose} title="Edit Criterion" width="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="form-label">Category</label>
            <select value={form.category} onChange={set('category')} className="form-input">
              <option>Financial</option>
              <option>Technical</option>
              <option>Compliance</option>
            </select>
          </div>
          <div className="flex items-end pb-2.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_mandatory}
                onChange={set('is_mandatory')}
                className="w-4 h-4 rounded border-slate-300 bg-white accent-amber-500"
              />
              <span className="text-sm text-slate-700 font-medium">Mandatory criterion</span>
            </label>
          </div>
        </div>
        <div>
          <label className="form-label">Title</label>
          <input required value={form.title} onChange={set('title')} className="form-input" />
        </div>
        <div>
          <label className="form-label">Description</label>
          <textarea
            required
            value={form.description}
            onChange={set('description')}
            rows={3}
            className="form-input resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="form-label">Threshold Text</label>
            <input
              value={form.threshold_text}
              onChange={set('threshold_text')}
              className="form-input"
              placeholder="e.g., Minimum ₹5 Cr turnover"
            />
          </div>
          <div>
            <label className="form-label">Threshold Value</label>
            <input
              type="number"
              step="0.01"
              value={form.threshold_value}
              onChange={set('threshold_value')}
              className="form-input"
              placeholder="5000000"
            />
          </div>
        </div>
        <div>
          <label className="form-label">Unit</label>
          <input
            value={form.unit}
            onChange={set('unit')}
            className="form-input"
            placeholder="INR / years / units"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => { toast('Criterion editor closed.', { id: 'criterion-editor' }); onClose() }} className="btn-ghost flex-1 justify-center">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
              : <><Save className="w-4 h-4" /> Save & Re-evaluate</>
            }
          </button>
        </div>
      </form>
    </Modal>
  )
}
