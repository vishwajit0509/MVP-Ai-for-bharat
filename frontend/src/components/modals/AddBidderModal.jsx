import React, { useState, useRef } from 'react'
import { Loader2, Upload, UserPlus } from 'lucide-react'
import { Modal } from './Modal'
import { api } from '../../api/client'
import toast from 'react-hot-toast'

export function AddBidderModal({ open, onClose, tenderId, onAdded }) {
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState([])
  const formRef = useRef()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!files.length) { toast.error('Attach at least one bidder document.'); return }
    if (!tenderId) { toast.error('No tender workspace selected.'); return }
    setLoading(true)
    try {
      const fd = new FormData(formRef.current)
      files.forEach(f => fd.append('files', f))
      const data = await api.addBidder(tenderId, fd)
      onAdded(data.selected_tender)
      formRef.current.reset()
      setFiles([])
      onClose()
      toast.success('Bidder submission added and evaluated.')
    } catch (err) {
      toast.error(err.message || 'Could not add bidder.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Bidder Submission" width="max-w-lg">
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="form-label">Company / Bidder Name</label>
          <input
            name="name"
            required
            className="form-input"
            placeholder="e.g., Apex Defense Systems Pvt. Ltd."
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="form-label">Organisation Type</label>
            <input
              name="organization_type"
              className="form-input"
              placeholder="PSU / Private / JV"
            />
          </div>
          <div>
            <label className="form-label">City</label>
            <input name="city" className="form-input" placeholder="New Delhi" />
          </div>
          <div>
            <label className="form-label">State</label>
            <input name="state" className="form-input" placeholder="Delhi" />
          </div>
        </div>
        {/* Drop zone */}
        <div>
          <label className="form-label">Submission Documents</label>
          <div
            onDrop={e => { e.preventDefault(); setFiles(Array.from(e.dataTransfer.files)) }}
            onDragOver={e => e.preventDefault()}
            className="border-2 border-dashed border-white/10 hover:border-violet-500/40 rounded-xl p-5 text-center
                       transition-colors cursor-pointer group"
            onClick={() => document.getElementById('bidder-file-input').click()}
          >
            <Upload className="w-5 h-5 text-slate-600 group-hover:text-violet-400 mx-auto mb-2 transition-colors" />
            <p className="text-sm text-slate-500">
              Drop files or <span className="text-violet-400 font-semibold">browse</span>
            </p>
            {files.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5 justify-center">
                {files.map((f, i) => (
                  <span key={i} className="px-2 py-0.5 bg-violet-500/15 text-violet-400 text-xs rounded-full border border-violet-500/20">
                    {f.name}
                  </span>
                ))}
              </div>
            )}
          </div>
          <input
            id="bidder-file-input"
            type="file"
            accept=".pdf,.docx,.txt,.md,.png,.jpg,.jpeg"
            multiple
            className="hidden"
            onChange={e => setFiles(Array.from(e.target.files))}
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding…</>
              : <><UserPlus className="w-4 h-4" /> Add & Evaluate</>
            }
          </button>
        </div>
      </form>
    </Modal>
  )
}
