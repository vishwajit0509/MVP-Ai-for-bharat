import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Printer, Download, FileJson, Zap, Sparkles, ArrowRight } from 'lucide-react'
import { Layout } from '../components/Layout'
import { MetricCards } from '../components/MetricCards'
import { CriteriaGrid } from '../components/CriteriaGrid'
import { EvaluationMatrix } from '../components/EvaluationMatrix'
import { BidderDossiers } from '../components/BidderDossiers'
import { ReviewQueue } from '../components/ReviewQueue'
import { AuditTrail } from '../components/AuditTrail'
import { StatusBadge } from '../components/StatusBadge'
import { CreateTenderModal } from '../components/modals/CreateTenderModal'
import { AddBidderModal } from '../components/modals/AddBidderModal'
import { EditCriterionModal } from '../components/modals/EditCriterionModal'
import { useTender } from '../hooks/useTender'
import { api } from '../api/client'
import { formatDate } from '../utils/cn'
import toast from 'react-hot-toast'

function Section({ id, eyebrow, title, children, alt }) {
  return (
    <section
      id={`section-${id}`}
      className={`px-7 lg:px-10 py-12 scroll-mt-20 relative ${alt ? '' : ''}`}
    >
      {/* Section divider line */}
      <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <p className="section-eyebrow">{eyebrow}</p>
          <h2 className="text-3xl font-bold text-slate-950 tracking-tight">{title}</h2>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-30px' }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>
      </div>
    </section>
  )
}

export function Dashboard() {
  const { tender, tenders, system, loading, loadBootstrap, updateSelectedTender } = useTender()
  const [evaluating, setEvaluating] = useState(false)
  const [newTenderOpen, setNewTenderOpen] = useState(false)
  const [addBidderOpen, setAddBidderOpen] = useState(false)
  const [editCriterion, setEditCriterion] = useState(null)

  useEffect(() => { loadBootstrap() }, [])

  async function handleTenderChange(id) { await loadBootstrap(id) }

  function openNewTenderForm() {
    toast('Opening tender form.', { id: 'new-tender' })
    setNewTenderOpen(true)
  }

  function openAddBidderForm() {
    if (!tender) { toast.error('Create or select a tender first.'); return }
    toast('Opening bidder form.', { id: 'add-bidder' })
    setAddBidderOpen(true)
  }

  function openCriterionEditor(criterion) {
    toast('Opening criterion editor.', { id: 'criterion-editor' })
    setEditCriterion(criterion)
  }

  function scrollToMetrics() {
    toast('Showing overview.', { id: 'section-navigation' })
    document.getElementById('section-metrics')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function handleEvaluate() {
    if (!tender) return
    setEvaluating(true)
    const toastId = toast.loading('Running evaluation...')
    try {
      const data = await api.runEvaluation(tender.id)
      updateSelectedTender(data.selected_tender)
      toast.success('Evaluation completed successfully.', { id: toastId })
    } catch (err) {
      toast.error(err.message || 'Evaluation failed.', { id: toastId })
    } finally {
      setEvaluating(false)
    }
  }

  if (loading && !tender) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f7f9fc]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative mx-auto mb-6 w-16 h-16">
            <div className="absolute inset-0 rounded-2xl bg-amber-500/20 animate-ping" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700
                            flex items-center justify-center">
              <Shield className="w-8 h-8 text-slate-950" />
            </div>
          </div>
          <p className="text-slate-400 font-semibold">Loading workspace…</p>
          <p className="text-slate-600 text-sm mt-1">Initializing tender intelligence engine</p>
        </motion.div>
      </div>
    )
  }

  return (
    <>
      <Layout
        tender={tender}
        tenders={tenders}
        system={system}
        onTenderChange={handleTenderChange}
        onNewTender={openNewTenderForm}
        onAddBidder={openAddBidderForm}
        onEvaluate={handleEvaluate}
        evaluating={evaluating}
      >
        {!tender ? (
          /* ─── Premium Empty State ─── */
          <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-7 relative">
            {/* Background gradient mesh */}
            <div className="absolute inset-0 gradient-mesh" />

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10"
            >
              {/* Animated logo */}
              <div className="relative mx-auto mb-8 w-24 h-24">
                <div className="absolute inset-0 rounded-3xl bg-amber-500/10 animate-pulse" />
                <div className="absolute -inset-2 rounded-[28px] bg-gradient-to-br from-amber-500/10 to-transparent blur-xl" />
                <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400/20 via-amber-500/10 to-transparent
                                border border-amber-500/20 flex items-center justify-center">
                  <Shield className="w-12 h-12 text-amber-500/60" />
                </div>
              </div>

              <h1 className="text-4xl lg:text-5xl font-black text-slate-950 tracking-tight mb-4">
                CRPF Tender Intelligence
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-9">
                Create a workspace to begin AI-powered eligibility analysis
                and audit-first bidder evaluation.
              </p>
              <button
                onClick={openNewTenderForm}
                className="btn-primary px-9 py-4 text-base font-bold"
              >
                <Sparkles className="w-5 h-5" />
                Create First Workspace
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* Feature pills */}
              <div className="flex flex-wrap justify-center gap-3 mt-10">
                {['AI Criteria Extraction', 'Automated Evaluation', 'Full Audit Trail', 'Export Reports'].map(f => (
                  <div key={f} className="px-4 py-2 rounded-full bg-white/80 border border-slate-200
                                          text-xs text-slate-600 font-medium shadow-sm">
                    {f}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          <>
            {/* ─── Hero Section ─── */}
            <div className="px-7 lg:px-10 pt-12 pb-12 relative gradient-mesh landing-animated overflow-hidden">
              <div className="max-w-7xl mx-auto relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col lg:flex-row lg:items-start gap-8"
                >
                  {/* Tender info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-3">
                      <p className="section-eyebrow">{tender.authority || 'Procurement Authority'}</p>
                      {system && (
                        <StatusBadge
                          status={system.mode}
                          label={system.mode === 'ai_assisted' ? '✦ AI Assisted' : 'Offline Mode'}
                        />
                      )}
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-black text-slate-950 leading-snug tracking-tight mb-3">
                      {tender.title}
                    </h1>
                    {tender.summary && (
                      <p className="text-slate-600 text-base leading-relaxed max-w-3xl">{tender.summary}</p>
                    )}

                    {/* Meta grid */}
                    <div className="flex flex-wrap gap-7 mt-6">
                      {[
                        { label: 'Reference', value: tender.reference_no || 'Pending', mono: true },
                        { label: 'Status', badge: tender.status },
                        { label: 'Open Reviews', value: tender.review_queue?.length ?? 0, color: 'text-amber-600' },
                        { label: 'Audit Coverage', value: `${tender.metrics?.audit_coverage ?? 0}%`, color: 'text-emerald-600' },
                        { label: 'Last Updated', value: formatDate(tender.updated_at), mono: true },
                      ].map(item => (
                        <div key={item.label}>
                          <span className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-[0.15em]">
                            {item.label}
                          </span>
                          {item.badge ? (
                            <div className="mt-1"><StatusBadge status={item.badge} /></div>
                          ) : (
                            <div className={`text-base font-bold mt-1 tabular-nums
                                            ${item.mono ? 'font-mono text-sm text-slate-600' : ''}
                                            ${item.color || 'text-slate-950'}`}>
                              {item.value}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <motion.button
                      type="button"
                      onClick={scrollToMetrics}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="mt-7 inline-flex items-center gap-2.5 rounded-xl border border-amber-200 bg-white/75 px-5 py-2.5
                                 text-sm font-bold text-amber-700 shadow-sm transition-all hover:-translate-y-0.5
                                 hover:border-amber-300 hover:bg-amber-50"
                    >
                      View workspace
                      <ArrowRight className="w-4 h-4 rotate-90" />
                    </motion.button>
                  </div>

                  {/* Export actions */}
                  <div className="flex flex-row lg:flex-col gap-2 shrink-0">
                    {[
                      { href: api.getReportPageUrl(tender.id), icon: Printer, label: 'Print Report', target: '_blank' },
                      { href: api.getReportCsvUrl(tender.id), icon: Download, label: 'Export CSV' },
                      { href: api.getReportJsonUrl(tender.id), icon: FileJson, label: 'Open JSON', target: '_blank' },
                    ].map(({ href, icon: Icon, label, target }) => (
                      <a key={label} href={href} target={target} rel="noreferrer"
                         onClick={() => toast(`Opening ${label}.`, { id: `open-${label}` })}
                         className="btn-ghost text-sm py-2.5">
                        <Icon className="w-4 h-4" /> {label}
                      </a>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>

            {/* ─── Metrics ─── */}
            <section id="section-metrics" className="px-7 lg:px-10 py-8 scroll-mt-20">
              <div className="max-w-7xl mx-auto">
                <MetricCards metrics={tender.metrics} />
              </div>
            </section>

            {/* ─── Criteria ─── */}
            <Section id="criteria" eyebrow="01 · Tender Understanding" title="Eligibility Criteria">
              <CriteriaGrid criteria={tender.criteria} onEditCriterion={openCriterionEditor} />
            </Section>

            {/* ─── Matrix ─── */}
            <Section id="matrix" eyebrow="02 · Criterion-Level Verdicts" title="Evaluation Matrix">
              <EvaluationMatrix criteria={tender.criteria} bidders={tender.bidders} />
            </Section>

            {/* ─── Bidders ─── */}
            <Section id="bidders" eyebrow="03 · Evidence Pack" title="Bidder Dossiers">
              <BidderDossiers bidders={tender.bidders} />
            </Section>

            {/* ─── Review Queue ─── */}
            <Section id="review" eyebrow="04 · Human-in-the-Loop" title="Manual Review Queue">
              <ReviewQueue reviewQueue={tender.review_queue} onResolved={r => updateSelectedTender(r)} />
            </Section>

            {/* ─── Audit Trail ─── */}
            <Section id="audit" eyebrow="05 · Auditability" title="Decision Trail">
              <AuditTrail auditEvents={tender.audit_events} />
            </Section>

            {/* Footer padding */}
            <div className="h-16" />
          </>
        )}
      </Layout>

      {/* Modals */}
      <CreateTenderModal
        open={newTenderOpen}
        onClose={() => setNewTenderOpen(false)}
        onCreated={t => loadBootstrap(t.id)}
      />
      <AddBidderModal
        open={addBidderOpen}
        onClose={() => setAddBidderOpen(false)}
        tenderId={tender?.id}
        onAdded={t => updateSelectedTender(t)}
      />
      <EditCriterionModal
        open={!!editCriterion}
        onClose={() => setEditCriterion(null)}
        criterion={editCriterion}
        tenderId={tender?.id}
        onSaved={t => updateSelectedTender(t)}
      />
    </>
  )
}
