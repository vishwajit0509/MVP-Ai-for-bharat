import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'

export function Modal({ open, onClose, title, children, width = 'max-w-lg' }) {
  const overlayRef = useRef()

  function handleClose() {
    toast(`${title} closed.`, { id: 'modal-close' })
    onClose()
  }

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') handleClose() }
    if (open) {
      window.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-slate-950/35 backdrop-blur-md"
            onClick={handleClose}
          />
          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', damping: 22, stiffness: 320 }}
            className={`relative w-full ${width} glass-card border border-slate-200
                        shadow-[0_35px_80px_rgba(15,23,42,0.18)]`}
          >
            {/* Top accent line */}
            <div className="h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

            {/* Header */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-slate-200">
              <h2 className="font-bold text-slate-950 text-lg">{title}</h2>
              <button
                onClick={handleClose}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500
                           hover:text-slate-950 hover:bg-slate-100 transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Body */}
            <div className="px-7 py-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
