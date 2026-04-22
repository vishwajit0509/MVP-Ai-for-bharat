import React, { useRef } from 'react'
import { Link } from "react-router-dom"
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  Shield, ArrowRight, Sparkles, CheckCircle2, FileText, Users,
  Upload, Eye, Zap, AlertCircle, Download, Clock
} from 'lucide-react'

export function Landing() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  // Decorative animations mimicking the requested scroll animation behavior
  const squareX = useTransform(scrollYProgress, [0, 1], ['0rem', '15rem'])
  const squareRotate = useTransform(scrollYProgress, [0, 1], ['0turn', '1turn'])

  const circleY = useTransform(scrollYProgress, [0, 1], ['0rem', '-20rem'])
  const circleRotate = useTransform(scrollYProgress, [0, 1], ['0turn', '-0.5turn'])

  const features = [
    {
      icon: Upload,
      title: 'Upload & Create Workspace',
      description: 'Upload tender documents and create a procurement workspace for efficient organization and collaboration.',
    },
    {
      icon: FileText,
      title: 'Extract Criteria',
      description: 'Extract eligibility criteria into structured, reviewable records for systematic evaluation.',
    },
    {
      icon: Users,
      title: 'Manage Submissions',
      description: 'Upload bidder submission packs with PDFs, images, text files, DOCX files, and more.',
    },
    {
      icon: Eye,
      title: 'Evaluate Bidders',
      description: 'Evaluate each bidder at the criterion level with evidence, found values, and detailed reasons.',
    },
    {
      icon: CheckCircle2,
      title: 'Mark Eligibility',
      description: 'Mark bidders as Eligible, Not Eligible, or Manual Review with clear decision trails.',
    },
    {
      icon: AlertCircle,
      title: 'Human Review Queue',
      description: 'Resolve ambiguous checks through an intuitive human-in-the-loop review queue.',
    },
    {
      icon: Download,
      title: 'Export Reports',
      description: 'Export consolidated reports as printable HTML, CSV, or JSON for further analysis.',
    },
    {
      icon: Clock,
      title: 'Audit Trail',
      description: 'Maintain a complete audit trail for document ingestion, extraction, evaluation, and review decisions.',
    },
  ]

  const highlights = [
    'Audit-ready from first upload',
    'Built for committee review, not black-box scoring',
    'Clear evidence trails for every verdict',
  ]

  return (
    <div ref={containerRef} className="min-h-screen bg-[#f7f9fc] text-slate-800 relative overflow-hidden">
      <div className="absolute inset-0 editorial-surface pointer-events-none" />

      {/* Decorative animated elements mimicking AnimeJS scroll demo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          className="absolute top-40 right-[15%] w-24 h-24 bg-emerald-400 rounded-3xl opacity-20 blur-[2px] hidden lg:block"
          style={{ x: squareX, rotate: squareRotate }}
        />
        <motion.div
          className="absolute bottom-[20%] left-[10%] w-32 h-32 bg-amber-500 rounded-full opacity-10 blur-[4px] hidden lg:block"
          style={{ y: circleY, rotate: circleRotate }}
        />
      </div>

      <main className="relative z-10 px-7 lg:px-10 py-12 lg:py-20">
        <div className="max-w-7xl mx-auto">
          <section className="mb-16 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="glass-card p-8 lg:p-12 landing-panel">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-[0_10px_30px_rgba(180,83,9,0.22)]">
                  <Shield className="w-6 h-6 text-slate-950" />
                </div>
                <p className="section-eyebrow mb-0">PROCUREMENT INTELLIGENCE SYSTEM</p>
              </div>

              <h1 className="text-4xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[0.96] max-w-4xl">
                Tender review that feels like a real control room, not a generic AI demo.
              </h1>
              <p className="mt-6 text-slate-600 text-lg leading-relaxed max-w-3xl">
                Structure clauses, compare bidders, and preserve a human-readable decision trail in a workspace designed for scrutiny.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  'Criteria Extraction',
                  'Bidder Matrix',
                  'Manual Review Queue',
                  'Decision Audit Trail',
                ].map((item) => (
                  <div
                    key={item}
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2 bg-white/88 border border-stone-200 text-sm font-medium text-slate-700"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link to="/dashboard" className="btn-primary px-8 py-3.5 text-base font-bold">
                  <Sparkles className="w-5 h-5" />
                  Open Workspace
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <p className="text-sm text-slate-500 max-w-xs">
                  Built for procurement teams that need confident records, not just fast summaries.
                </p>
              </div>
            </div>

            <aside className="glass-card p-6 lg:p-7 landing-side-panel">
              <p className="section-eyebrow">Why It Feels Different</p>
              <div className="space-y-4">
                {highlights.map((item, index) => (
                  <div key={item} className="rounded-2xl border border-stone-200/90 bg-white/84 p-4">
                    <div className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-amber-700">
                      0{index + 1}
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-900 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </aside>
          </section>

          <section className="mb-16">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mb-10">
              <div>
                <p className="section-eyebrow">Capabilities</p>
                <h2 className="text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">
                  A calmer, clearer review workflow
                </h2>
              </div>
              <p className="text-slate-600 text-lg max-w-2xl">
                Every screen is tuned to help evaluators verify, compare, and defend decisions under pressure.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, idx) => {
                const Icon = feature.icon
                return (
                  <div key={idx} className="glass-card p-6 landing-feature-card">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-amber-700" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-950 mb-2">{feature.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="glass-card p-8 lg:p-12">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8">
              <div>
                <p className="section-eyebrow">Workflow</p>
                <h2 className="text-2xl lg:text-3xl font-black text-slate-950 tracking-tight">
                  How review moves through the system
                </h2>
              </div>
              <p className="text-sm text-slate-500 max-w-xl">
                The experience stays grounded in evidence, with AI assisting extraction and humans retaining judgement.
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  step: '1',
                  title: 'Create Workspace',
                  description: 'Upload your tender document and initialize a procurement workspace',
                },
                {
                  step: '2',
                  title: 'Extract Criteria',
                  description: 'AI automatically extracts and structures eligibility criteria for review',
                },
                {
                  step: '3',
                  title: 'Upload Submissions',
                  description: 'Import bidder documents in any format - PDFs, images, DOCX, or text',
                },
                {
                  step: '4',
                  title: 'Evaluate Bidders',
                  description: 'Review each bidder against criteria with detailed evidence and findings',
                },
                {
                  step: '5',
                  title: 'Make Decisions',
                  description: 'Mark bidders as Eligible, Not Eligible, or route to Manual Review',
                },
                {
                  step: '6',
                  title: 'Export & Audit',
                  description: 'Generate reports and maintain complete audit trail of all decisions',
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-4 items-start rounded-2xl border border-stone-200/80 bg-white/72 px-4 py-4">
                  <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">{item.step}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-950 mb-1">{item.title}</h3>
                    <p className="text-slate-600 text-sm">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link to="/dashboard" className="btn-primary px-8 py-3.5 text-base font-bold inline-flex">
                <Zap className="w-5 h-5" />
                Start Evaluating Now
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
