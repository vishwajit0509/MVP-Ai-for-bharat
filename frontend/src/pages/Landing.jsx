import React, { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useInView,
} from "framer-motion";
import {
  Shield,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  FileText,
  Users,
  Upload,
  Eye,
  Zap,
  AlertCircle,
  Download,
  Clock,
  ChevronRight,
} from "lucide-react";

/* ─────────────────── Animated Counter ─────────────────── */
function AnimatedCounter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = null;
    const duration = 1400;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

/* ─────────────────── Word-by-word Reveal ─────────────────── */
function WordReveal({ text, delay = 0, className = "" }) {
  return (
    <span className={className} style={{ display: "block" }}>
      {text.split(" ").map((word, i) => (
        <motion.span
          key={i}
          className="inline-block"
          style={{ marginRight: "0.28em" }}
          initial={{ opacity: 0, y: 48, rotateX: -25 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{
            duration: 0.75,
            delay: delay + i * 0.09,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

/* ─────────────────── Scroll Reveal Wrapper ─────────────────── */
function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────── Bento Card ─────────────────── */
function BentoCard({
  icon: Icon,
  title,
  description,
  accent = "default",
  className = "",
  extra,
}) {
  const iconColors = {
    amber: {
      bg: "rgba(245,158,11,0.1)",
      border: "rgba(245,158,11,0.22)",
      icon: "#b45309",
    },
    emerald: {
      bg: "rgba(16,185,129,0.09)",
      border: "rgba(16,185,129,0.18)",
      icon: "#059669",
    },
    default: {
      bg: "rgba(2,6,23,0.05)",
      border: "rgba(2,6,23,0.09)",
      icon: "#64748b",
    },
  };
  const c = iconColors[accent] || iconColors.default;

  return (
    <motion.div
      className={`bento-card ${className}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true, margin: "-40px" }}
    >
      <div
        className="icon-box"
        style={{ background: c.bg, border: `1px solid ${c.border}` }}
      >
        <Icon style={{ width: 18, height: 18, color: c.icon }} />
      </div>
      <h3 className="bento-title">{title}</h3>
      <p className="bento-desc">{description}</p>
      {extra && <div className="bento-extra">{extra}</div>}
    </motion.div>
  );
}

/* ─────────────────── Main Landing ─────────────────── */
export function Landing() {
  const containerRef = useRef(null);
  const heroRef = useRef(null);

  const workflowRef = useRef(null)
  const { scrollYProgress: workflowScroll } = useScroll({ 
    target: workflowRef, 
    offset: ["start center", "end center"] 
  })
  const lineHeight = useTransform(workflowScroll, [0, 1], ["0%", "100%"])

  const mouseX = useMotionValue(
    typeof window !== "undefined" ? window.innerWidth / 2 : 600,
  );
  const mouseY = useMotionValue(300);
  const glowX = useSpring(mouseX, { stiffness: 90, damping: 28 });
  const glowY = useSpring(mouseY, { stiffness: 90, damping: 28 });

  const { scrollYProgress } = useScroll({ target: containerRef });
  const heroParallax = useTransform(scrollYProgress, [0, 0.35], ["0%", "-12%"]);
  const heroFade = useTransform(scrollYProgress, [0, 0.25], [1, 0.4]);

  const handleMouseMove = (e) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  const marqueeItems = [
    "Criteria Extraction",
    "Bidder Evaluation",
    "Decision Audit Trail",
    "Manual Review Queue",
    "Eligibility Matrix",
    "Submission Management",
    "Report Export",
    "Committee Review",
    "Evidence Trails",
    "Procurement Intelligence",
  ];

  return (
    <div
      ref={containerRef}
      className="landing-root"
      onMouseMove={handleMouseMove}
    >
      
      {/* ── Global Styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,900;1,9..144,200&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

        .landing-root {
          background: #f7f9fc;
          color: #1e293b;
          font-family: 'DM Sans', system-ui, sans-serif;
          overflow-x: hidden;
        }

        /* Grain overlay */
        .landing-root::before {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 60;
          opacity: 0.028;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px 200px;
        }

        .display { font-family: 'Fraunces', Georgia, serif; }

        /* ── Hero ── */
        .hero-section {
          position: relative;
          min-height: 100vh;
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 100px 0 80px;
          overflow: hidden;
        }
        .hero-content {
          position: relative;
          z-index: 20;
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 clamp(24px, 5vw, 96px);
          width: 100%;
        }
        .chip {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 16px;
          background: rgba(245,158,11,0.1);
          border: 1px solid rgba(245,158,11,0.25);
          border-radius: 100px;
          font-size: 11px;
          font-weight: 700;
          color: #92400e;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .chip-dark {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 16px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 100px;
          font-size: 11px;
          font-weight: 700;
          color: #a8a29e;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .hero-headline {
          font-family: 'Fraunces', Georgia, serif;
          font-weight: 900;
          color: #020617;
          line-height: 0.91;
          letter-spacing: -0.035em;
          font-size: clamp(52px, 8.5vw, 128px);
          perspective: 1000px;
        }
        .hero-headline .muted { color: #94a3b8; }
        .hero-headline .outlined {
          -webkit-text-stroke: 2px #b45309;
          color: transparent;
        }
        .hero-headline .gold { color: #d97706; }

        .hero-sub {
          color: #64748b;
          font-size: clamp(16px, 1.4vw, 20px);
          line-height: 1.7;
          max-width: 560px;
        }

        /* ── Buttons ── */
        /* ── Buttons ── */
        .btn-primary-gold {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 15px 30px;
          background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
          color: #1c1917;
          font-weight: 700;
          font-size: 15px;
          border-radius: 100px;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
          position: relative;
          overflow: hidden;
          white-space: nowrap;
          z-index: 1;
        }
        .btn-primary-gold::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%);
          opacity: 0;
          transition: opacity 0.25s;
          border-radius: inherit;
          z-index: -1;
        }
        .btn-primary-gold:hover::after { opacity: 1; }
        .btn-primary-gold:hover { transform: scale(1.04); box-shadow: 0 10px 40px rgba(245,158,11,0.38); }
        .btn-primary-gold > * { position: relative; z-index: 1; }

        .btn-outline {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 14px 24px;
          background: transparent;
          border: 1.5px solid rgba(2,6,23,0.14);
          color: #475569;
          font-weight: 600;
          font-size: 15px;
          border-radius: 100px;
          text-decoration: none;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .btn-outline:hover { background: white; border-color: rgba(2,6,23,0.28); color: #1e293b; }

        /* ── Stat Cards ── */
        .stat-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-top: 64px;
        }
        @media(max-width: 768px) { .stat-row { grid-template-columns: repeat(2,1fr); } }
        .stat-card {
          background: rgba(255,255,255,0.72);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(231,229,228,0.85);
          border-radius: 20px;
          padding: 24px;
        }
        .stat-num {
          font-family: 'Fraunces', Georgia, serif;
          font-weight: 900;
          font-size: clamp(32px, 3vw, 44px);
          line-height: 1;
          color: #020617;
        }
        .stat-label {
          font-size: 13px;
          color: #94a3b8;
          margin-top: 8px;
          line-height: 1.4;
        }

        /* ── Marquee ── */
        .marquee-strip {
          background: #020617;
          padding: 18px 0;
          overflow: hidden;
          width: 100%;
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: scroll-left 28s linear infinite;
        }
        @keyframes scroll-left {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .marquee-item {
          display: flex;
          align-items: center;
          white-space: nowrap;
          padding: 0 28px;
          color: #78716c;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.04em;
        }
        .marquee-dot {
          color: #d97706;
          font-size: 18px;
          margin-left: 28px;
        }

        /* ── Features Section ── */
        .features-section {
          width: 100%;
          padding: clamp(64px, 8vw, 120px) clamp(24px, 5vw, 96px);
          max-width: 1440px;
          margin: 0 auto;
        }
        .section-headline {
          font-family: 'Fraunces', Georgia, serif;
          font-weight: 900;
          color: #020617;
          line-height: 0.95;
          letter-spacing: -0.03em;
          font-size: clamp(36px, 4vw, 64px);
        }
        .section-headline .gold { color: #d97706; }

        /* Bento Grid */
        .bento-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-auto-rows: 210px;
          gap: 16px;
          margin-top: 48px;
        }
        @media (max-width: 900px) {
          .bento-grid { grid-template-columns: repeat(2,1fr); }
          .col-span-2 { grid-column: span 1 !important; }
          .row-span-2 { grid-row: span 1 !important; }
        }
        @media (max-width: 600px) {
          .bento-grid { grid-template-columns: 1fr; }
        }
        .bento-card {
          background: rgba(255,255,255,0.82);
          border: 1px solid rgba(231,229,228,0.9);
          border-radius: 20px;
          padding: 24px;
          transition: all 0.35s cubic-bezier(0.16,1,0.3,1);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .bento-card:hover {
          transform: translateY(-3px);
          border-color: rgba(245,158,11,0.28);
          box-shadow: 0 16px 48px rgba(0,0,0,0.07);
        }
        .icon-box {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
          flex-shrink: 0;
        }
        .bento-title {
          font-size: 15px;
          font-weight: 700;
          color: #020617;
          margin-bottom: 8px;
          line-height: 1.3;
        }
        .bento-desc {
          font-size: 13px;
          color: #64748b;
          line-height: 1.65;
          flex: 1;
        }
        .bento-extra {
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid rgba(231,229,228,0.8);
          font-size: 11px;
          font-weight: 700;
          color: #92400e;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .col-span-2 { grid-column: span 2; }
        .row-span-2 { grid-row: span 2; }

        /* Featured bento card */
        .bento-card.featured {
          background: linear-gradient(145deg, #fffbeb, #fef3c7);
          border-color: rgba(245,158,11,0.2);
        }

       /* ── Sticky Timeline Workflow Section ── */
        .workflow-section {
          background: #ffffff;
          position: relative;
          padding: clamp(80px, 10vw, 160px) clamp(24px, 5vw, 96px);
          overflow: hidden;
          width: 100%;
        }
        .workflow-container {
          max-width: 1440px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: clamp(40px, 8vw, 120px);
          position: relative;
        }
        @media (max-width: 960px) {
          .workflow-container { grid-template-columns: 1fr; }
          .workflow-left { position: static !important; margin-bottom: 48px; }
        }
        
        .workflow-left {
          position: sticky;
          top: 160px;
          height: fit-content;
        }
        
        .workflow-right {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 40px;
          padding-left: 32px;
        }
        
        /* The background track */
        .timeline-track {
          position: absolute;
          left: 0;
          top: 24px;
          bottom: 24px;
          width: 2px;
          background: rgba(231,229,228, 0.8);
          border-radius: 2px;
        }
        
        /* The animated amber fill */
        .timeline-fill {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          background: linear-gradient(to bottom, #fbbf24, #d97706);
          border-radius: 2px;
          transform-origin: top;
        }
        
        .workflow-card-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        
        /* The Node */
        .timeline-node {
          position: absolute;
          left: -32px; 
          transform: translateX(-50%);
          width: 44px;
          height: 44px;
          background: #ffffff;
          border: 2px solid rgba(231,229,228, 0.9);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Fraunces', Georgia, serif;
          font-weight: 900;
          font-size: 15px;
          color: #94a3b8;
          z-index: 10;
          transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }
        
        /* Hover Effects */
        .workflow-card-wrap:hover .timeline-node {
          border-color: #d97706;
          color: #d97706;
          box-shadow: 0 0 0 6px rgba(245,158,11,0.1);
          transform: translateX(-50%) scale(1.1);
        }
        
        .workflow-card {
          background: #ffffff;
          border: 1px solid rgba(231,229,228,0.9);
          border-radius: 24px;
          padding: 36px 40px;
          width: 100%;
          box-shadow: 0 10px 40px -10px rgba(0,0,0,0.03);
          transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
          position: relative;
          overflow: hidden;
        }
        
        .workflow-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(251,191,36,0.04) 0%, transparent 100%);
          opacity: 0;
          transition: opacity 0.4s;
        }
        
        .workflow-card-wrap:hover .workflow-card {
          transform: translateX(16px);
          border-color: rgba(245,158,11,0.3);
          box-shadow: 0 24px 64px -12px rgba(245,158,11,0.12);
        }
        
        .workflow-card-wrap:hover .workflow-card::before {
          opacity: 1;
        }
        
        .workflow-card-title {
          font-weight: 700;
          font-size: 20px;
          color: #020617;
          margin-bottom: 12px;
          letter-spacing: -0.01em;
          position: relative;
          z-index: 2;
        }
        
        .workflow-card-desc {
          font-size: 15px;
          color: #64748b;
          line-height: 1.7;
          position: relative;
          z-index: 2;
        }
        
        /* Giant background icon inside the card */
        .workflow-icon {
          position: absolute;
          right: -24px;
          bottom: -24px;
          width: 160px;
          height: 160px;
          color: rgba(2,6,23,0.02);
          transform: rotate(-15deg);
          transition: all 0.5s cubic-bezier(0.16,1,0.3,1);
          z-index: 1;
        }
        
        .workflow-card-wrap:hover .workflow-icon {
          color: rgba(245,158,11,0.06);
          transform: rotate(0deg) scale(1.1);
        }

        /* ── CTA Section ── */
        .cta-section {
          position: relative;
          width: 100%;
          padding: clamp(80px, 10vw, 130px) clamp(24px, 5vw, 96px);
          text-align: center;
          overflow: hidden;
        }
        .cta-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg,
            rgba(251,191,36,0.045) 0%,
            rgba(245,158,11,0.08) 45%,
            rgba(180,83,9,0.045) 100%
          );
          pointer-events: none;
        }
        .cta-section::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, #f59e0b 50%, transparent 100%);
        }
        .cta-headline {
          font-family: 'Fraunces', Georgia, serif;
          font-weight: 900;
          color: #020617;
          line-height: 0.95;
          letter-spacing: -0.03em;
          font-size: clamp(40px, 5vw, 76px);
          margin-bottom: 20px;
        }
        .cta-sub {
          color: #64748b;
          font-size: 18px;
          max-width: 480px;
          margin: 0 auto 40px;
          line-height: 1.65;
        }
        .cta-checks {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 28px;
          margin-top: 40px;
        }
        .check-item {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
        }

        /* ── Floating amber shapes ── */
        .bg-orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }

        /* ── Hero CTA row ── */
        .hero-cta-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px;
          margin-top: 36px;
        }
      `}</style>

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section ref={heroRef} className="hero-section">
        {/* Background: grid pattern */}
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: 0.022,
            pointerEvents: "none",
            zIndex: 1,
          }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="pg"
              width="64"
              height="64"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 64 0 L 0 0 0 64"
                fill="none"
                stroke="#334155"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pg)" />
        </svg>

        {/* Ambient amber orbs */}
        <div
          className="bg-orb"
          style={{
            width: 560,
            height: 560,
            top: -120,
            right: -80,
            background:
              "radial-gradient(circle, rgba(251,191,36,0.14) 0%, transparent 70%)",
            zIndex: 1,
          }}
        />
        <div
          className="bg-orb"
          style={{
            width: 420,
            height: 420,
            bottom: -60,
            left: -60,
            background:
              "radial-gradient(circle, rgba(217,119,6,0.09) 0%, transparent 70%)",
            zIndex: 1,
          }}
        />

        {/* Cursor-tracking glow */}
        <motion.div
          style={{
            position: "absolute",
            width: 700,
            height: 700,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(251,191,36,0.11) 0%, transparent 68%)",
            x: glowX,
            y: glowY,
            translateX: "-50%",
            translateY: "-50%",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />

        {/* Decorative floating badge top-right */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "absolute",
            top: "clamp(80px, 12vw, 140px)",
            right: "clamp(24px, 5vw, 96px)",
            background: "rgba(255,255,255,0.88)",
            border: "1px solid rgba(231,229,228,0.9)",
            borderRadius: 16,
            padding: "14px 18px",
            zIndex: 20,
            backdropFilter: "blur(12px)",
            display: "none",
          }}
          className="lg:block"
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#92400e",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            AUDIT READY
          </div>
          {[
            { dot: "#22c55e", text: "Evidence on every verdict" },
            { dot: "#f59e0b", text: "Committee-grade records" },
            { dot: "#3b82f6", text: "Full decision chain" },
          ].map((it) => (
            <div
              key={it.text}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                fontSize: 12,
                color: "#64748b",
                marginTop: 5,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: it.dot,
                  flexShrink: 0,
                  display: "inline-block",
                }}
              />
              {it.text}
            </div>
          ))}
        </motion.div>

        {/* Content */}
        <motion.div
          className="hero-content"
          style={{ y: heroParallax, opacity: heroFade }}
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ marginBottom: 28 }}
          >
            <span className="chip">
              <Shield style={{ width: 10, height: 10 }} />
              Procurement Intelligence System
            </span>
          </motion.div>

          <div className="hero-headline-group">
            <h1 className="hero-headline">
              <WordReveal text="Tender review" delay={0.1} />
              <WordReveal text="that feels like a" delay={0.2} className="muted" />
              
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.72, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: 'inline-block', position: 'relative', padding: '0 8px', marginTop: '8px' }}
              >
                {/* Snapping HUD Brackets */}
                <motion.div 
                  className="hud-bracket hud-top-left"
                  initial={{ opacity: 0, x: -30, y: -30 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ delay: 1.3, type: "spring", stiffness: 120, damping: 14 }}
                />
                
                <span className="outlined display">real control</span>{' '}
                <span className="gold display">room.</span>
                
                <motion.div 
                  className="hud-bracket hud-bottom-right"
                  initial={{ opacity: 0, x: 30, y: 30 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ delay: 1.3, type: "spring", stiffness: 120, damping: 14 }}
                />

                {/* Blinking Live Status Indicator */}
                <motion.span 
                  className="live-dot"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.8, duration: 0.4 }}
                />
              </motion.span>
            </h1>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              alignItems: "flex-end",
              gap: 48,
              marginTop: 36,
            }}
          >
            <motion.p
              className="hero-sub"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.85 }}
            >
              Structure clauses, compare bidders, and preserve a human-readable
              decision trail — designed for committees that need{" "}
              <em style={{ color: "#b45309", fontStyle: "italic" }}>
                confident records
              </em>
              , not just fast summaries.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.0 }}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                alignItems: "flex-end",
              }}
            >
              {[
                "Criteria Extraction",
                "Bidder Matrix",
                "Manual Review Queue",
                "Decision Audit Trail",
              ].map((tag, i) => (
                <motion.div
                  key={tag}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 1.1 + i * 0.07,
                    duration: 0.5,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "7px 14px",
                    background: "rgba(255,255,255,0.82)",
                    border: "1px solid rgba(231,229,228,0.9)",
                    borderRadius: 100,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#475569",
                    backdropFilter: "blur(8px)",
                    whiteSpace: "nowrap",
                  }}
                >
                  <CheckCircle2
                    style={{ width: 13, height: 13, color: "#059669" }}
                  />
                  {tag}
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* CTAs */}
          <motion.div
            className="hero-cta-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.05 }}
          >
            <Link to="/dashboard" className="btn-primary-gold">
              <Sparkles style={{ width: 16, height: 16 }} />
              Open Workspace
              <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
            <a href="#features" className="btn-outline">
              See how it works
              <ChevronRight style={{ width: 14, height: 14 }} />
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="stat-row"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.25 }}
          >
            {[
              { label: "Faster evaluation", val: 8, suffix: "×" },
              { label: "Evidence-backed verdicts", val: 100, suffix: "%" },
              { label: "Export formats", val: 3, suffix: "" },
              { label: "Audit decision stages", val: 6, suffix: "" },
            ].map((s) => (
              <div key={s.label} className="stat-card">
                <div className="stat-num display">
                  <AnimatedCounter target={s.val} suffix={s.suffix} />
                </div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Bottom fade into marquee */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 80,
            pointerEvents: "none",
            zIndex: 10,
            background: "linear-gradient(to bottom, transparent, #020617)",
          }}
        />
      </section>

      {/* ═══════════════════ MARQUEE ═══════════════════ */}
      <div className="marquee-strip">
        <div className="marquee-track">
          {[0, 1].map((gi) => (
            <div key={gi} style={{ display: "flex", alignItems: "center" }}>
              {marqueeItems.map((item, i) => (
                <React.Fragment key={`${gi}-${i}`}>
                  <span className="marquee-item">{item}</span>
                  <span className="marquee-dot">◆</span>
                </React.Fragment>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════ FEATURES BENTO ═══════════════════ */}
      <div id="features">
        <div className="features-section">
          <Reveal>
            <span
              className="chip"
              style={{ marginBottom: 20, display: "inline-flex" }}
            >
              Capabilities
            </span>
            <h2 className="section-headline">
              Every screen built
              <br />
              for <span className="gold">scrutiny & speed.</span>
            </h2>
            <p
              style={{
                color: "#64748b",
                fontSize: 17,
                maxWidth: 560,
                marginTop: 16,
                lineHeight: 1.65,
              }}
            >
              Tuned to help evaluators verify, compare, and defend decisions —
              under pressure, on the record.
            </p>
          </Reveal>

          <div className="bento-grid">
            {/* Wide - Upload */}
            <BentoCard
              className="col-span-2 featured"
              icon={Upload}
              title="Upload & Create Workspace"
              description="Drop in tender documents to immediately initialize a structured procurement workspace — organized, labeled, and ready for multi-user review."
              accent="amber"
              extra={
                <>
                  <CheckCircle2
                    style={{ width: 12, height: 12, color: "#d97706" }}
                  />{" "}
                  Instant workspace from any document format
                </>
              }
            />

            {/* Tall - Evaluate */}
            <BentoCard
              className="row-span-2"
              icon={Eye}
              title="Deep Bidder Evaluation"
              description="Evaluate each bidder criterion-by-criterion. Every verdict surfaces the evidence excerpt, the found value, and a complete reasoning chain that committees can challenge or confirm — no black box."
              accent="default"
              extra={
                <>
                  <CheckCircle2
                    style={{ width: 12, height: 12, color: "#d97706" }}
                  />{" "}
                  Criterion-level evidence on every check
                </>
              }
            />

            {/* Normal - Extract */}
            <BentoCard
              icon={FileText}
              title="Extract Criteria"
              description="AI pulls all eligibility clauses into structured, reviewable records — no manual copy-pasting."
              accent="amber"
            />

            {/* Normal - Submissions */}
            <BentoCard
              icon={Users}
              title="Manage Submissions"
              description="Import bidder packs as PDFs, images, DOCX, or plain text — all in one organized view."
            />

            {/* Wide - Eligibility */}
            <BentoCard
              className="col-span-2"
              icon={CheckCircle2}
              title="Mark Eligibility with Full Decision Trails"
              description="Flag bidders as Eligible, Not Eligible, or route to Manual Review. Every decision links back to the source clause and the evaluator's reasoning — nothing gets lost, everything is defensible."
              accent="emerald"
              extra={
                <>
                  <CheckCircle2
                    style={{ width: 12, height: 12, color: "#059669" }}
                  />{" "}
                  Full decision chain preserved automatically
                </>
              }
            />

            {/* Normal - Review Queue */}
            <BentoCard
              icon={AlertCircle}
              title="Human Review Queue"
              description="Ambiguous checks route to a dedicated queue so no edge case slips through unresolved."
            />

            {/* Normal - Export */}
            <BentoCard
              icon={Download}
              title="Export Reports"
              description="Printable HTML, CSV, or JSON — consolidated reports ready for committee handoff or archiving."
              accent="amber"
            />

            {/* Normal - Audit */}
            <BentoCard
              icon={Clock}
              title="Immutable Audit Trail"
              description="Complete timestamped log of every ingestion, extraction, evaluation, and manual override — always on record."
            />
          </div>
        </div>
      </div>

      {/* ═══════════════════ WORKFLOW (Dark) ═══════════════════ */}
      {/* ═══════════════════ WORKFLOW (Sticky Timeline) ═══════════════════ */}
      <section className="workflow-section" ref={workflowRef}>
        {/* Ambient Background Glow */}
        <div style={{
          position: 'absolute', top: '15%', left: '-10%',
          width: 800, height: 800, borderRadius: '50%', opacity: 0.04, pointerEvents: 'none',
          background: 'radial-gradient(circle, #f59e0b 0%, transparent 60%)',
        }} />

        <div className="workflow-container">
          
          {/* LEFT: Sticky Header */}
          <div className="workflow-left">
            <Reveal>
              <span className="chip" style={{ marginBottom: 24, display: 'inline-flex' }}>The Pipeline</span>
              <h2 className="section-headline" style={{ fontSize: 'clamp(40px, 4.5vw, 64px)', lineHeight: 0.95 }}>
                From upload to<br />
                <span className="gold">audit-ready.</span>
              </h2>
              <p style={{ color: '#64748b', fontSize: 18, marginTop: 24, lineHeight: 1.65 }}>
                Evidence in. Audit trail out. We’ve designed a sequential, watertight process that keeps humans in control at every critical juncture while AI handles the heavy lifting.
              </p>
              
              <div style={{ marginTop: 48 }}>
                <Link to="/dashboard" className="btn-primary-gold" style={{ fontSize: 16, padding: '16px 36px' }}>
                  <Zap style={{ width: 18, height: 18 }} />
                  Start Evaluating Now
                  <ArrowRight style={{ width: 18, height: 18 }} />
                </Link>
              </div>
            </Reveal>
          </div>

          {/* RIGHT: Scrolling Timeline */}
          <div className="workflow-right">
            
            {/* The Animated Line */}
            <div className="timeline-track">
              <motion.div className="timeline-fill" style={{ height: lineHeight }} />
            </div>

            {[
              { step: '01', title: 'Create Workspace', desc: 'Upload your tender document and initialize a procurement workspace with a single action.', icon: Upload },
              { step: '02', title: 'Extract Criteria', desc: 'AI automatically extracts and structures all eligibility criteria — no copy-pasting required.', icon: FileText },
              { step: '03', title: 'Upload Submissions', desc: 'Import bidder documents in any format: PDFs, images, DOCX, or plain text.', icon: Users },
              { step: '04', title: 'Evaluate Bidders', desc: 'Review each bidder against every criterion with full evidence citations and findings.', icon: Eye },
              { step: '05', title: 'Make Decisions', desc: 'Mark bidders as Eligible, Not Eligible, or route to Manual Review — all logged automatically.', icon: AlertCircle },
              { step: '06', title: 'Export & Audit', desc: 'Generate committee-ready reports and access the complete timestamped decision trail.', icon: Download },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.step}
                  className="workflow-card-wrap"
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  viewport={{ once: true, margin: '-20%' }}
                >
                  <div className="timeline-node">{item.step}</div>
                  
                  <div className="workflow-card">
                    <Icon className="workflow-icon" />
                    <div className="workflow-card-title">{item.title}</div>
                    <div className="workflow-card-desc">{item.desc}</div>
                  </div>
                </motion.div>
              )
            })}
          </div>
          
        </div>
      </section>

      {/* ═══════════════════ CTA ═══════════════════ */}
      <section className="cta-section">
        <div
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: 1440,
            margin: "0 auto",
          }}
        >
          <Reveal>
            <span
              className="chip"
              style={{ marginBottom: 24, display: "inline-flex" }}
            >
              Get Started
            </span>
            <h2 className="cta-headline">
              Built for committees
              <br />
              <span
                style={{
                  color: "#d97706",
                  fontFamily: "Fraunces, Georgia, serif",
                }}
              >
                that need records.
              </span>
            </h2>
            <p className="cta-sub">
              Not black-box scores. Not vague summaries. A full evidence trail
              that stands up to scrutiny — every time.
            </p>

            <div style={{ display: "flex", justifyContent: "center" }}>
              <Link
                to="/dashboard"
                className="btn-primary-gold"
                style={{ fontSize: 16, padding: "17px 38px" }}
              >
                <Sparkles style={{ width: 18, height: 18 }} />
                Open Workspace
                <ArrowRight style={{ width: 18, height: 18 }} />
              </Link>
            </div>

            <div className="cta-checks">
              {[
                "Audit-ready from first upload",
                "Built for committee review, not black-box scoring",
                "Clear evidence trails for every verdict",
              ].map((item) => (
                <div key={item} className="check-item">
                  <CheckCircle2
                    style={{
                      width: 14,
                      height: 14,
                      color: "#059669",
                      flexShrink: 0,
                    }}
                  />
                  {item}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
