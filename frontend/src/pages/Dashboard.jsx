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
import { useScrollContainer } from '../components/Layout'
import toast from 'react-hot-toast'

function Section({ id, eyebrow, title, children }) {
  const scrollContainerRef = useScrollContainer()

  return (
    <section
      id={`section-${id}`}
      className="px-7 lg:px-10 py-12 scroll-mt-20 relative"
    >
      <div className="absolute top-0 left-8 right-8 h-px bg-slate-200/60" />

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px', root: scrollContainerRef }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <p className="section-eyebrow text-slate-500">{eyebrow}</p>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h2>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-30px', root: scrollContainerRef }}
          transition={{ duration: 0.4, delay: 0.1 }}
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
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 mx-auto rounded-xl bg-amber-100 flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-amber-600 animate-pulse" />
          </div>
          <p className="text-slate-900 font-semibold text-sm">Loading workspace…</p>
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
          <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-xl"
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-amber-500" />
              </div>

              <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">
                Procurement Intelligence
              </h1>
              <p className="text-slate-500 text-base leading-relaxed mb-8">
                Create a workspace to extract criteria from tender documents and begin your audit-ready bidder evaluation.
              </p>
              
              <button
                onClick={openNewTenderForm}
                className="btn-primary"
              >
                <Sparkles className="w-4 h-4" />
                Create First Workspace
              </button>
            </motion.div>
          </div>
        ) : (
          <>
            {/* ─── Hero Section ─── */}
            <div className="px-7 lg:px-10 pt-12 pb-10 border-b border-slate-200 bg-white">
              <div className="max-w-7xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col lg:flex-row lg:items-start gap-6"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {tender.authority || 'Procurement Authority'}
                      </span>
                      {system && (
                        <StatusBadge
                          status={system.mode}
                          label={system.mode === 'ai_assisted' ? 'AI Assisted' : 'Offline Mode'}
                        />
                      )}
                    </div>
                    
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
                      {tender.title}
                    </h1>
                    
                    {tender.summary && (
                      <p className="text-slate-600 text-sm max-w-3xl line-clamp-2">{tender.summary}</p>
                    )}

                    <div className="flex items-center gap-6 mt-6">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-500 mb-1">Status</span>
                        <StatusBadge status={tender.status} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-500 mb-1">Reference No.</span>
                        <span className="text-sm font-mono font-medium text-slate-900">{tender.reference_no || 'Pending'}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-500 mb-1">Reviews Pending</span>
                        <span className="text-sm font-medium text-amber-600">{tender.review_queue?.length ?? 0}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={scrollToMetrics}
                      className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors"
                    >
                      Scroll to metrics
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Export actions */}
                  <div className="flex flex-row lg:flex-col gap-2 shrink-0">
                    {[
                      { href: api.getReportPageUrl(tender.id), icon: Printer, label: 'Print Report', target: '_blank' },
                      { href: api.getReportCsvUrl(tender.id), icon: Download, label: 'Export CSV' },
                    ].map(({ href, icon: Icon, label, target }) => (
                      <a key={label} href={href} target={target} rel="noreferrer"
                         className="btn-ghost">
                        <Icon className="w-4 h-4 text-slate-400" /> {label}
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
            <Section id="criteria" eyebrow="Step 1" title="Eligibility Criteria">
              <CriteriaGrid criteria={tender.criteria} onEditCriterion={openCriterionEditor} />
            </Section>

            {/* ─── Matrix ─── */}
            <Section id="matrix" eyebrow="Step 2" title="Evaluation Matrix">
              <EvaluationMatrix criteria={tender.criteria} bidders={tender.bidders} />
            </Section>

            {/* ─── Bidders ─── */}
            <Section id="bidders" eyebrow="Step 3" title="Bidder Dossiers">
              <BidderDossiers bidders={tender.bidders} />
            </Section>

            {/* ─── Review Queue ─── */}
            <Section id="review" eyebrow="Step 4" title="Manual Review Queue">
              <ReviewQueue reviewQueue={tender.review_queue} onResolved={r => updateSelectedTender(r)} />
            </Section>

            {/* ─── Audit Trail ─── */}
            <Section id="audit" eyebrow="Log" title="Decision Trail">
              <AuditTrail auditEvents={tender.audit_events} />
            </Section>

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