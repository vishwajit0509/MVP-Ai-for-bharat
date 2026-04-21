import React, { useState, useRef } from 'react'
import { Loader2, Upload, PlusCircle } from 'lucide-react'
import { Modal } from './Modal'
import { api } from '../../api/client'
import toast from 'react-hot-toast'

export function CreateTenderModal({ open, onClose, onCreated }) {
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState([])
  const formRef = useRef()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!files.length) { toast.error('Attach at least one tender document.'); return }
    setLoading(true)
    try {
      const fd = new FormData(formRef.current)
      files.forEach(f => fd.append('files', f))
      const data = await api.createTender(fd)
      onCreated(data.selected_tender)
      formRef.current.reset()
      setFiles([])
      onClose()
      toast.success('Tender workspace created successfully.')
    } catch (err) {
      toast.error(err.message || 'Could not create tender.')
    } finally {
      setLoading(false)
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    setFiles(Array.from(e.dataTransfer.files))
  }

  return (
    <Modal open={open} onClose={onClose} title="Create Tender Workspace" width="max-w-xl">
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="form-label">Tender Title</label>
          <input
            name="title"
            required
            className="form-input"
            placeholder="e.g., Supply of Bulletproof Vests — Batch 2025"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="form-label">Procuring Authority</label>
            <input
              name="authority"
              required
              defaultValue="Central Reserve Police Force"
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">Reference Number</label>
            <input
              name="reference_no"
              className="form-input"
              placeholder="CRPF/HQ/2025/…"
            />
          </div>
        </div>
        <div>
          <label className="form-label">Summary</label>
          <textarea
            name="summary"
            rows={2}
            className="form-input resize-none"
            placeholder="Brief description of procurement scope…"
          />
        </div>
        {/* Drop zone */}
        <div>
          <label className="form-label">Tender Documents</label>
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            className="border-2 border-dashed border-white/10 hover:border-amber-500/40 rounded-xl p-6 text-center
                       transition-colors cursor-pointer group"
            onClick={() => document.getElementById('tender-file-input').click()}
          >
            <Upload className="w-6 h-6 text-slate-600 group-hover:text-amber-500 mx-auto mb-2 transition-colors" />
            <p className="text-sm text-slate-500 group-hover:text-slate-400">
              Drop files here or <span className="text-amber-500 font-semibold">browse</span>
            </p>
            <p className="text-xs text-slate-600 mt-1">PDF, DOCX, TXT, MD, PNG, JPG</p>
            {files.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
                {files.map((f, i) => (
                  <span key={i} className="px-2 py-0.5 bg-amber-500/15 text-amber-400 text-xs rounded-full border border-amber-500/20">
                    {f.name}
                  </span>
                ))}
              </div>
            )}
          </div>
          <input
            id="tender-file-input"
            type="file"
            accept=".pdf,.docx,.txt,.md,.png,.jpg,.jpeg"
            multiple
            className="hidden"
            onChange={e => setFiles(Array.from(e.target.files))}
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</>
              : <><PlusCircle className="w-4 h-4" /> Create Workspace</>
            }
          </button>
        </div>
      </form>
    </Modal>
  )
}
