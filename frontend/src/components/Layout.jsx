import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Shield, LayoutDashboard, FileText, Users, ClipboardList,
  ScrollText, Menu, X,
  PlusCircle, UserPlus, Zap
} from 'lucide-react'
import { cn } from '../utils/cn'
import toast from 'react-hot-toast'

const NAV_SECTIONS = [
  { id: 'metrics', label: 'Overview', icon: LayoutDashboard, num: '00' },
  { id: 'criteria', label: 'Criteria', icon: FileText, num: '01' },
  { id: 'matrix', label: 'Matrix', icon: ClipboardList, num: '02' },
  { id: 'bidders', label: 'Bidders', icon: Users, num: '03' },
  { id: 'review', label: 'Review Queue', icon: ScrollText, num: '04' },
  { id: 'audit', label: 'Audit Trail', icon: ScrollText, num: '05' },
]

export function Layout({
  tender, tenders, system, onTenderChange,
  onNewTender, onAddBidder, onEvaluate,
  evaluating, children
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('metrics')
  const mainRef = useRef(null)
  const scrollTargetRef = useRef(null)
  const scrollReleaseTimerRef = useRef(null)

  useEffect(() => {
    const main = mainRef.current
    if (!main || !tender) return undefined

    let frame = 0
    const sectionIds = NAV_SECTIONS.map(section => section.id)

    const updateActiveSection = () => {
      frame = 0
      const mainTop = main.getBoundingClientRect().top
      const threshold = mainTop + 112
      const existingSections = []
      let current = sectionIds[0]
      let bestTop = Number.NEGATIVE_INFINITY

      if (scrollTargetRef.current) {
        const target = document.getElementById(`section-${scrollTargetRef.current}`)
        const distance = target ? Math.abs(target.getBoundingClientRect().top - threshold) : 0
        const atScrollEnd = main.scrollTop + main.clientHeight >= main.scrollHeight - 8
        if (target && distance > 34 && !atScrollEnd) return
        scrollTargetRef.current = null
      }

      sectionIds.forEach(id => {
        const el = document.getElementById(`section-${id}`)
        if (!el) return
        existingSections.push(id)
        const top = el.getBoundingClientRect().top - threshold
        if (top <= 0 && top > bestTop) {
          bestTop = top
          current = id
        }
      })

      if (bestTop === Number.NEGATIVE_INFINITY && existingSections.length) {
        current = existingSections.reduce((nearest, id) => {
          const nearestEl = document.getElementById(`section-${nearest}`)
          const currentEl = document.getElementById(`section-${id}`)
          if (!nearestEl || !currentEl) return nearest
          const nearestDistance = Math.abs(nearestEl.getBoundingClientRect().top - threshold)
          const currentDistance = Math.abs(currentEl.getBoundingClientRect().top - threshold)
          return currentDistance < nearestDistance ? id : nearest
        }, existingSections[0])
      }

      if (existingSections.length && main.scrollTop + main.clientHeight >= main.scrollHeight - 8) {
        current = existingSections[existingSections.length - 1]
      }

      setActiveSection(previous => previous === current ? previous : current)
    }

    const requestUpdate = () => {
      if (frame) return
      frame = requestAnimationFrame(updateActiveSection)
    }

    const timeout = window.setTimeout(updateActiveSection, 80)
    main.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    return () => {
      window.clearTimeout(timeout)
      window.clearTimeout(scrollReleaseTimerRef.current)
      if (frame) cancelAnimationFrame(frame)
      main.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
    }
  }, [tender])

  function scrollTo(id) {
    const el = document.getElementById(`section-${id}`)
    if (el) {
      const label = NAV_SECTIONS.find(section => section.id === id)?.label || 'section'
      scrollTargetRef.current = id
      window.clearTimeout(scrollReleaseTimerRef.current)
      scrollReleaseTimerRef.current = window.setTimeout(() => {
        scrollTargetRef.current = null
      }, 1100)
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveSection(id)
      setMobileOpen(false)
      toast(`Showing ${label}.`, { id: 'section-navigation' })
    }
  }

  async function handleTenderSelect(e) {
    const id = e.target.value || null
    const selected = tenders.find(t => t.id === id)
    const toastId = toast.loading(selected ? 'Switching workspace...' : 'Loading workspace...')
    try {
      await onTenderChange(id)
      toast.success(selected ? `Switched to ${selected.title}.` : 'Workspace updated.', { id: toastId })
    } catch (err) {
      toast.error(err.message || 'Could not switch workspace.', { id: toastId })
    }
  }

  function handleNewTenderClick() {
    toast('Opening tender form.', { id: 'new-tender' })
    onNewTender()
  }

  function handleAddBidderClick() {
    toast('Opening bidder form.', { id: 'add-bidder' })
    onAddBidder()
  }

  function handleEvaluateClick() {
    onEvaluate()
  }

  function handleMobileToggle() {
    setMobileOpen(open => {
      toast(open ? 'Menu closed.' : 'Menu opened.', { id: 'mobile-menu' })
      return !open
    })
  }


  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f7f9fc]">
      {/* Main Navigation Bar - Section navigation at top */}
      <header className="shrink-0 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl relative z-30">
        {/* Subtle top line glow */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
        
        <div className="flex items-center h-16 px-6 gap-4">
          {/* Brand + Mobile menu */}
          <Link to="/" className="flex items-center gap-2 font-bold text-base text-slate-800 mr-4">
            <Shield className="w-5 h-5 text-amber-500" />
            <span className="text-gradient hidden sm:inline">CRPF</span>
          </Link>

          {/* Navigation sections - horizontal */}
          <nav className="hidden lg:flex items-center gap-1 flex-1">
            {NAV_SECTIONS.map(({ id, label, icon: Icon, num }) => {
              const isActive = activeSection === id
              return (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className={cn(
                    'flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm transition-all duration-300 group relative whitespace-nowrap',
                    isActive
                      ? 'text-amber-700 bg-amber-100/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
                  )}
                >
                  <Icon className={cn(
                    'w-4 h-4 transition-transform duration-300',
                    isActive ? 'text-amber-600' : '',
                    !isActive && 'group-hover:scale-110'
                  )} />
                  <span className="font-medium text-sm">{label}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-3.5 right-3.5 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full" />
                  )}
                </button>
              )
            })}
          </nav>

          <div className="flex-1 lg:flex-none" />

          {/* Mobile menu toggle */}
          <button
            className="lg:hidden text-slate-500 hover:text-amber-600 transition-colors"
            onClick={handleMobileToggle}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation - slides down when menu is open */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-slate-200/80 bg-slate-50/50 px-4 py-3 max-h-64 overflow-y-auto">
            <nav className="flex flex-col gap-2">
              {NAV_SECTIONS.map(({ id, label, icon: Icon }) => {
                const isActive = activeSection === id
                return (
                  <button
                    key={id}
                    onClick={() => scrollTo(id)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-300 w-full',
                      isActive
                        ? 'text-amber-700 bg-amber-100/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
                    )}
                  >
                    <Icon className={cn('w-4 h-4', isActive ? 'text-amber-600' : '')} />
                    <span className="font-medium">{label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Secondary navbar with action buttons */}
      <header className="shrink-0 h-16 border-b border-slate-200/80 flex items-center gap-6 px-6
                         bg-white/70 backdrop-blur-sm relative z-20">
        {/* Active Workspace Section */}
        <div className="hidden sm:flex items-center gap-4">
          {/* Workspace Label and Selector */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Active Workspace
            </label>
            <select
              id="tender-selector-topbar"
              value={tender?.id || ''}
              onChange={handleTenderSelect}
              className="bg-white border border-slate-200 text-slate-800 text-sm rounded-lg
                         px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500/40
                         focus:border-amber-500/30 transition-all cursor-pointer appearance-none
                         hover:bg-amber-50/60 hover:border-amber-200 min-w-xs"
            >
              {!tenders.length ? (
                <option value="">No workspaces</option>
              ) : tenders.map(t => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1" />

        {/* System Status */}
        {system && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-mono font-semibold">
            {system.mode === 'ai_assisted' ? (
              <>
                <div className="w-2 h-2 rounded-full bg-violet-500" />
                <span className="text-violet-700">AI Assisted Mode</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-slate-400" />
                <span className="text-slate-600">Offline Mode</span>
              </>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            id="btn-new-tender"
            onClick={handleNewTenderClick}
            className="btn-ghost text-sm py-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">New Tender</span>
          </button>
          <button
            id="btn-add-bidder"
            onClick={handleAddBidderClick}
            disabled={!tender}
            className="btn-ghost text-sm py-2 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:transform-none"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Bidder</span>
          </button>
          <button
            id="btn-evaluate"
            onClick={handleEvaluateClick}
            disabled={!tender || evaluating}
            className="btn-primary text-sm py-2"
          >
            {evaluating ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                <span className="hidden sm:inline">Running…</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">Evaluate</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Scrollable content */}
        <main ref={mainRef} className="flex-1 overflow-y-auto scroll-smooth scroll-pt-20 scrollbar-thin noise-overlay bg-[#f7f9fc]">
          {children}
        </main>
      </div>
    </div>
  )
}
