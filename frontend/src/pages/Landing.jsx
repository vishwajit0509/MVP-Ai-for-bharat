import React from 'react'
import { Link } from 'react-router-dom'
import {
  Shield, ArrowRight, Sparkles, CheckCircle2, FileText, Users,
  Upload, Eye, Zap, AlertCircle, Download, Clock
} from 'lucide-react'

export function Landing() {
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

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-800 relative overflow-hidden">
      <div className="absolute inset-0 gradient-mesh pointer-events-none" />

      <main className="relative z-10 px-7 lg:px-10 py-12 lg:py-20">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <section className="glass-card card-hover-glow p-8 lg:p-12 shimmer mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <Shield className="w-6 h-6 text-slate-950" />
              </div>
              <p className="section-eyebrow mb-0">AI-POWERED PROCUREMENT INTELLIGENCE</p>
            </div>

            <h1 className="text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight">
              CRPF Tender Intelligence Platform
            </h1>
            <p className="mt-5 text-slate-600 text-lg leading-relaxed max-w-3xl">
              Analyze tender clauses, evaluate bidder eligibility, and maintain a verifiable
              audit trail in one unified workspace built for transparent decision-making.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {[
                'Criteria Extraction',
                'Bidder Evaluation Matrix',
                'Human Review Queue',
                'Decision Audit Trail',
              ].map((item) => (
                <div
                  key={item}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 bg-white/85 border border-slate-200 text-sm font-medium text-slate-700"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-10">
              <Link to="/dashboard" className="btn-primary px-8 py-3.5 text-base font-bold">
                <Sparkles className="w-5 h-5" />
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </section>

          {/* Features Section */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-black text-slate-950 tracking-tight mb-4">
                Powerful Features for Smart Procurement
              </h2>
              <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                End-to-end procurement evaluation with AI-powered insights and human oversight
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, idx) => {
                const Icon = feature.icon
                return (
                  <div
                    key={idx}
                    className="glass-card p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/20 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-950 mb-2">{feature.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Workflow Section */}
          <section className="glass-card p-8 lg:p-12">
            <h2 className="text-2xl lg:text-3xl font-black text-slate-950 tracking-tight mb-8">
              How It Works
            </h2>

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
                <div key={item.step} className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0">
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
