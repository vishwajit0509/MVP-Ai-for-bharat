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
    const toastId = toast.loading('Adding bidder submission...')
    try {
      const fd = new FormData(formRef.current)
      files.forEach(f => fd.append('files', f))
      const data = await api.addBidder(tenderId, fd)
      onAdded(data.selected_tender)
      formRef.current.reset()
      setFiles([])
      onClose()
      toast.success('Bidder submission added and evaluated.', { id: toastId })
    } catch (err) {
      toast.error(err.message || 'Could not add bidder.', { id: toastId })
    } finally {
      setLoading(false)
    }
  }

  function selectFiles(nextFiles) {
    const selected = Array.from(nextFiles)
    setFiles(selected)
    if (selected.length) {
      toast.success(`${selected.length} bidder document${selected.length === 1 ? '' : 's'} attached.`, { id: 'bidder-files' })
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
            onDrop={e => { e.preventDefault(); selectFiles(e.dataTransfer.files) }}
            onDragOver={e => e.preventDefault()}
            className="border-2 border-dashed border-slate-300 hover:border-violet-500/50 rounded-xl p-7 text-center
                       transition-colors cursor-pointer group"
            onClick={() => document.getElementById('bidder-file-input').click()}
          >
            <Upload className="w-7 h-7 text-slate-600 group-hover:text-violet-500 mx-auto mb-3 transition-colors" />
            <p className="text-base text-slate-600">
              Drop files or <span className="text-violet-600 font-semibold">browse</span>
            </p>
            {files.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5 justify-center">
                {files.map((f, i) => (
                  <span key={i} className="px-2.5 py-1 bg-violet-500/15 text-violet-600 text-xs rounded-full border border-violet-500/20">
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
            onChange={e => selectFiles(e.target.files)}
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => { toast('Bidder form closed.', { id: 'add-bidder' }); onClose() }} className="btn-ghost flex-1 justify-center">Cancel</button>
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
