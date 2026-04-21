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
      className={`px-6 lg:px-8 py-10 scroll-mt-16 relative ${alt ? '' : ''}`}
    >
      {/* Section divider line */}
      <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <p className="section-eyebrow">{eyebrow}</p>
          <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
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

  async function handleEvaluate() {
    if (!tender) return
    setEvaluating(true)
    try {
      const data = await api.runEvaluation(tender.id)
      updateSelectedTender(data.selected_tender)
      toast.success('Evaluation completed successfully.')
    } catch (err) {
      toast.error(err.message || 'Evaluation failed.')
    } finally {
      setEvaluating(false)
    }
  }

  if (loading && !tender) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#060a13]">
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
        onNewTender={() => setNewTenderOpen(true)}
        onAddBidder={() => {
          if (!tender) { toast.error('Create or select a tender first.'); return }
          setAddBidderOpen(true)
        }}
        onEvaluate={handleEvaluate}
        evaluating={evaluating}
      >
        {!tender ? (
          /* ─── Premium Empty State ─── */
          <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6 relative">
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

              <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight mb-3">
                CRPF Tender Intelligence
              </h1>
              <p className="text-lg text-slate-500 max-w-lg mx-auto leading-relaxed mb-8">
                Create a workspace to begin AI-powered eligibility analysis
                and audit-first bidder evaluation.
              </p>
              <button
                onClick={() => setNewTenderOpen(true)}
                className="btn-primary px-8 py-3.5 text-sm font-bold"
              >
                <Sparkles className="w-4 h-4" />
                Create First Workspace
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Feature pills */}
              <div className="flex flex-wrap justify-center gap-3 mt-10">
                {['AI Criteria Extraction', 'Automated Evaluation', 'Full Audit Trail', 'Export Reports'].map(f => (
                  <div key={f} className="px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06]
                                          text-[11px] text-slate-500 font-medium">
                    {f}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          <>
            {/* ─── Hero Section ─── */}
            <div className="px-6 lg:px-8 pt-8 pb-8 relative gradient-mesh">
              <div className="max-w-7xl mx-auto relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col lg:flex-row lg:items-start gap-6"
                >
                  {/* Tender info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap mb-2">
                      <p className="section-eyebrow">{tender.authority || 'Procurement Authority'}</p>
                      {system && (
                        <StatusBadge
                          status={system.mode}
                          label={system.mode === 'ai_assisted' ? '✦ AI Assisted' : 'Offline Mode'}
                        />
                      )}
                    </div>
                    <h1 className="text-2xl lg:text-3xl font-black text-white leading-snug tracking-tight mb-2.5">
                      {tender.title}
                    </h1>
                    {tender.summary && (
                      <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">{tender.summary}</p>
                    )}

                    {/* Meta grid */}
                    <div className="flex flex-wrap gap-6 mt-5">
                      {[
                        { label: 'Reference', value: tender.reference_no || 'Pending', mono: true },
                        { label: 'Status', badge: tender.status },
                        { label: 'Open Reviews', value: tender.review_queue?.length ?? 0, color: 'text-amber-400' },
                        { label: 'Audit Coverage', value: `${tender.metrics?.audit_coverage ?? 0}%`, color: 'text-emerald-400' },
                        { label: 'Last Updated', value: formatDate(tender.updated_at), mono: true },
                      ].map(item => (
                        <div key={item.label}>
                          <span className="text-[9px] font-mono font-bold text-slate-600 uppercase tracking-[0.15em]">
                            {item.label}
                          </span>
                          {item.badge ? (
                            <div className="mt-1"><StatusBadge status={item.badge} /></div>
                          ) : (
                            <div className={`text-sm font-bold mt-0.5 tabular-nums
                                            ${item.mono ? 'font-mono text-xs text-slate-300' : ''}
                                            ${item.color || 'text-white'}`}>
                              {item.value}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Export actions */}
                  <div className="flex flex-row lg:flex-col gap-2 shrink-0">
                    {[
                      { href: api.getReportPageUrl(tender.id), icon: Printer, label: 'Print Report', target: '_blank' },
                      { href: api.getReportCsvUrl(tender.id), icon: Download, label: 'Export CSV' },
                      { href: api.getReportJsonUrl(tender.id), icon: FileJson, label: 'Open JSON', target: '_blank' },
                    ].map(({ href, icon: Icon, label, target }) => (
                      <a key={label} href={href} target={target} rel="noreferrer"
                         className="btn-ghost text-xs py-2">
                        <Icon className="w-3.5 h-3.5" /> {label}
                      </a>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>

            {/* ─── Metrics ─── */}
            <section id="section-metrics" className="px-6 lg:px-8 py-6 scroll-mt-16">
              <div className="max-w-7xl mx-auto">
                <MetricCards metrics={tender.metrics} />
              </div>
            </section>

            {/* ─── Criteria ─── */}
            <Section id="criteria" eyebrow="01 · Tender Understanding" title="Eligibility Criteria">
              <CriteriaGrid criteria={tender.criteria} onEditCriterion={c => setEditCriterion(c)} />
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
