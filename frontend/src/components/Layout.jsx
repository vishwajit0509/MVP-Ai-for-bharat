import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Shield, LayoutDashboard, FileText, Users, ClipboardList,
  ScrollText, ChevronLeft, ChevronRight, Menu, X,
  PlusCircle, UserPlus, PlayCircle, Zap, Sparkles
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
  const [collapsed, setCollapsed] = useState(false)
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

  function handleSidebarToggle() {
    setCollapsed(current => {
      toast(current ? 'Sidebar expanded.' : 'Sidebar collapsed.', { id: 'sidebar-toggle' })
      return !current
    })
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full particles-bg">
      {/* Indian Tricolor bar */}
      <div className="h-1 tricolor-bar w-full shrink-0" />

      {/* Brand */}
      <div className={cn(
        'flex items-center gap-4 px-6 py-7 border-b border-slate-200/80',
        collapsed && 'justify-center px-3'
      )}>
        <Link
          to="/"
          className={cn(
            'flex items-center gap-4 min-w-0 rounded-xl transition-all duration-200 hover:bg-amber-50/70',
            collapsed ? 'p-2' : 'px-2 py-1.5 -mx-2'
          )}
        >
          <div className="relative w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group">
            {/* Animated gradient bg behind logo */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700
                            opacity-90 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 rounded-xl animate-pulse opacity-30
                            bg-gradient-to-br from-amber-300 to-transparent" />
            <Shield className="w-6 h-6 text-slate-950 relative z-10" />
            {/* Outer glow */}
            <div className="absolute -inset-1 rounded-2xl bg-amber-500/20 blur-md -z-10" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-[10px] font-mono font-black tracking-[0.3em] uppercase text-gradient leading-none">
                CRPF Console
              </div>
              <div className="text-[15px] font-bold text-slate-950 mt-1 tracking-tight leading-tight">
                Tender Intelligence
              </div>
            </div>
          )}
        </Link>
      </div>

      {/* Workspace selector */}
      {!collapsed && (
        <div className="px-5 py-5 border-b border-slate-200/80">
          <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-[0.2em] mb-2.5 px-1 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500/60 animate-pulse" />
            Active Workspace
          </div>
          <select
            id="tender-selector"
            value={tender?.id || ''}
            onChange={handleTenderSelect}
            className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-xl
                       px-4 py-3 focus:outline-none focus:ring-1 focus:ring-amber-500/40
                       focus:border-amber-500/30 transition-all cursor-pointer appearance-none
                       hover:bg-amber-50/60 hover:border-amber-200"
          >
            {!tenders.length ? (
              <option value="">No workspaces yet</option>
            ) : tenders.map(t => (
              <option key={t.id} value={t.id}>
                {t.title.length > 36 ? t.title.slice(0, 35) + '…' : t.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-5 px-4 space-y-1.5">
        {NAV_SECTIONS.map(({ id, label, icon: Icon, num }) => {
          const isActive = activeSection === id
          return (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className={cn(
                'w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-[15px] transition-all duration-300 group relative',
                isActive
                  ? 'text-amber-700'
                  : 'text-slate-500 hover:text-slate-900 border border-transparent',
                collapsed && 'justify-center px-2'
              )}
            >
              {/* Active background glow */}
              {isActive && (
                <>
                  <div className="absolute inset-0 rounded-xl bg-amber-100/80 border border-amber-300/70" />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-200/55 to-transparent" />
                  {/* Left accent bar */}
                  <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-gradient-to-b from-amber-400 to-amber-600" />
                </>
              )}
              {!collapsed && (
                <span className={cn(
                  'font-mono text-[10px] font-bold shrink-0 relative z-10 tracking-wider',
                  isActive ? 'text-amber-700' : 'text-slate-400 group-hover:text-slate-500'
                )}>
                  {num}
                </span>
              )}
              <Icon className={cn(
                'w-5 h-5 shrink-0 relative z-10 transition-transform duration-300',
                isActive ? 'text-amber-600' : '',
                !isActive && 'group-hover:scale-110'
              )} />
              {!collapsed && (
                <span className="font-semibold truncate relative z-10">{label}</span>
              )}
            </button>
          )
        })}
      </nav>

      {/* System status */}
      {!collapsed && system && (
        <div className="px-5 py-5 border-t border-slate-200/80">
          <div className="glass-card px-4 py-3 flex items-center gap-2.5">
            {system.mode === 'ai_assisted' ? (
              <>
                <div className="relative">
                  <Sparkles className="w-4 h-4 text-violet-600" />
                  <div className="absolute -inset-1 bg-violet-500/20 rounded-full blur-sm" />
                </div>
                <span className="text-[11px] font-mono font-medium text-violet-700">
                  AI Assisted Mode
                </span>
              </>
            ) : (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                <span className="text-[10px] font-mono text-slate-500">Offline Mode</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={handleSidebarToggle}
        className="hidden lg:flex items-center justify-center h-12 border-t border-slate-200/80
                   text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-all duration-200"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-[#f7f9fc]">
      {/* Desktop sidebar */}
      <aside className={cn(
        'hidden lg:flex flex-col shrink-0 border-r border-slate-200/80 transition-all duration-300 shadow-[8px_0_28px_rgba(15,23,42,0.05)]',
        'bg-gradient-to-b from-white via-[#fffaf0] to-[#f7fbf7]',
        collapsed ? 'w-20' : 'w-72'
      )}>
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-950/35 backdrop-blur-md"
            onClick={() => {
              setMobileOpen(false)
              toast('Menu closed.', { id: 'mobile-menu' })
            }}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-80
                   bg-gradient-to-b from-white via-[#fffaf0] to-[#f7fbf7]
                   border-r border-slate-200/80 z-50 shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="shrink-0 h-20 border-b border-slate-200/80 flex items-center gap-4 px-6
                           bg-white/85 backdrop-blur-xl relative z-20">
          {/* Subtle top line glow */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

          <button
            className="lg:hidden text-slate-500 hover:text-amber-600 transition-colors"
            onClick={handleMobileToggle}
          >
            <Menu className="w-6 h-6" />
          </button>

          <Link to="/" className="lg:hidden flex items-center gap-2 font-bold text-base text-slate-800">
            <Shield className="w-5 h-5 text-amber-500" />
            <span className="text-gradient">CRPF Console</span>
          </Link>

          <div className="flex-1" />

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              id="btn-new-tender"
              onClick={handleNewTenderClick}
              className="btn-ghost text-sm py-2.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">New Tender</span>
            </button>
            <button
              id="btn-add-bidder"
              onClick={handleAddBidderClick}
              disabled={!tender}
              className="btn-ghost text-sm py-2.5 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:transform-none"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Bidder</span>
            </button>
            <button
              id="btn-evaluate"
              onClick={handleEvaluateClick}
              disabled={!tender || evaluating}
              className="btn-primary text-sm py-2.5"
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

        {/* Scrollable content */}
        <main ref={mainRef} className="flex-1 overflow-y-auto scroll-smooth scroll-pt-20 scrollbar-thin noise-overlay bg-[#f7f9fc]">
          {children}
        </main>
      </div>
    </div>
  )
}
