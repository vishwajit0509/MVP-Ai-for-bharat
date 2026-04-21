import React from 'react'
import { Link } from 'react-router-dom'
import { Shield, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react'

export function Landing() {
  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-800 relative overflow-hidden">
      <div className="absolute inset-0 gradient-mesh pointer-events-none" />

      <main className="relative z-10 px-7 lg:px-10 py-12 lg:py-20">
        <div className="max-w-6xl mx-auto">
          <section className="glass-card card-hover-glow p-8 lg:p-12 shimmer">
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
        </div>
      </main>
    </div>
  )
}
