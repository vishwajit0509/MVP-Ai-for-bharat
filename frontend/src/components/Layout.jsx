import React, { useState } from 'react'
import {
  Shield, LayoutDashboard, FileText, Users, ClipboardList,
  ScrollText, ChevronLeft, ChevronRight, Menu, X,
  PlusCircle, UserPlus, PlayCircle, Zap, Sparkles
} from 'lucide-react'
import { cn } from '../utils/cn'

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

  function scrollTo(id) {
    const el = document.getElementById(`section-${id}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveSection(id)
      setMobileOpen(false)
    }
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full particles-bg">
      {/* Indian Tricolor bar */}
      <div className="h-1 tricolor-bar w-full shrink-0" />

      {/* Brand */}
      <div className={cn(
        'flex items-center gap-3 px-5 py-6 border-b border-white/[0.04]',
        collapsed && 'justify-center px-3'
      )}>
        <div className="relative w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group">
          {/* Animated gradient bg behind logo */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700
                          opacity-90 group-hover:opacity-100 transition-opacity" />
          <div className="absolute inset-0 rounded-xl animate-pulse opacity-30
                          bg-gradient-to-br from-amber-300 to-transparent" />
          <Shield className="w-5 h-5 text-slate-950 relative z-10" />
          {/* Outer glow */}
          <div className="absolute -inset-1 rounded-2xl bg-amber-500/20 blur-md -z-10" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-[9px] font-mono font-black tracking-[0.3em] uppercase text-gradient leading-none">
              CRPF Console
            </div>
            <div className="text-[13px] font-bold text-white mt-0.5 tracking-tight leading-tight">
              Tender Intelligence
            </div>
          </div>
        )}
      </div>

      {/* Workspace selector */}
      {!collapsed && (
        <div className="px-4 py-4 border-b border-white/[0.04]">
          <div className="text-[9px] font-mono font-bold text-slate-600 uppercase tracking-[0.2em] mb-2 px-1 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500/60 animate-pulse" />
            Active Workspace
          </div>
          <select
            id="tender-selector"
            value={tender?.id || ''}
            onChange={e => onTenderChange(e.target.value || null)}
            className="w-full bg-white/[0.03] border border-white/[0.06] text-slate-200 text-xs rounded-xl
                       px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500/40
                       focus:border-amber-500/30 transition-all cursor-pointer appearance-none
                       hover:bg-white/[0.05] hover:border-white/[0.1]"
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
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {NAV_SECTIONS.map(({ id, label, icon: Icon, num }) => {
          const isActive = activeSection === id
          return (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-300 group relative',
                isActive
                  ? 'text-amber-300'
                  : 'text-slate-500 hover:text-slate-200 border border-transparent',
                collapsed && 'justify-center px-2'
              )}
            >
              {/* Active background glow */}
              {isActive && (
                <>
                  <div className="absolute inset-0 rounded-xl bg-amber-500/10 border border-amber-500/20" />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/10 to-transparent" />
                  {/* Left accent bar */}
                  <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-gradient-to-b from-amber-400 to-amber-600" />
                </>
              )}
              {!collapsed && (
                <span className={cn(
                  'font-mono text-[9px] font-bold shrink-0 relative z-10 tracking-wider',
                  isActive ? 'text-amber-500' : 'text-slate-700 group-hover:text-slate-500'
                )}>
                  {num}
                </span>
              )}
              <Icon className={cn(
                'w-4 h-4 shrink-0 relative z-10 transition-transform duration-300',
                isActive ? 'text-amber-400' : '',
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
        <div className="px-4 py-4 border-t border-white/[0.04]">
          <div className="glass-card px-3 py-2.5 flex items-center gap-2">
            {system.mode === 'ai_assisted' ? (
              <>
                <div className="relative">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  <div className="absolute -inset-1 bg-violet-500/20 rounded-full blur-sm" />
                </div>
                <span className="text-[10px] font-mono font-medium text-violet-300">
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
        onClick={() => setCollapsed(c => !c)}
        className="hidden lg:flex items-center justify-center h-11 border-t border-white/[0.04]
                   text-slate-600 hover:text-amber-400 hover:bg-white/[0.03] transition-all duration-200"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-[#060a13]">
      {/* Desktop sidebar */}
      <aside className={cn(
        'hidden lg:flex flex-col shrink-0 border-r border-white/[0.04] transition-all duration-300',
        'bg-gradient-to-b from-[#0a1020] via-[#080e1a] to-[#060a13]',
        collapsed ? 'w-16' : 'w-64'
      )}>
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-[#060a13]/90 backdrop-blur-md"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72
                   bg-gradient-to-b from-[#0a1020] via-[#080e1a] to-[#060a13]
                   border-r border-white/[0.04] z-50 shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="shrink-0 h-16 border-b border-white/[0.04] flex items-center gap-3 px-5
                           bg-[#060a13]/80 backdrop-blur-xl relative z-20">
          {/* Subtle top line glow */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

          <button
            className="lg:hidden text-slate-400 hover:text-amber-400 transition-colors"
            onClick={() => setMobileOpen(o => !o)}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="lg:hidden flex items-center gap-2 font-bold text-sm text-slate-200">
            <Shield className="w-4 h-4 text-amber-500" />
            <span className="text-gradient">CRPF Console</span>
          </div>

          <div className="flex-1" />

          {/* Action buttons */}
          <div className="flex items-center gap-2.5">
            <button
              id="btn-new-tender"
              onClick={onNewTender}
              className="btn-ghost text-xs py-2"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Tender</span>
            </button>
            <button
              id="btn-add-bidder"
              onClick={onAddBidder}
              disabled={!tender}
              className="btn-ghost text-xs py-2 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:transform-none"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Bidder</span>
            </button>
            <button
              id="btn-evaluate"
              onClick={onEvaluate}
              disabled={!tender || evaluating}
              className="btn-primary text-xs py-2"
            >
              {evaluating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                  <span className="hidden sm:inline">Running…</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Evaluate</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin noise-overlay">
          {children}
        </main>
      </div>
    </div>
  )
}
