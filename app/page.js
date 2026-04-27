'use client'
import Link from 'next/link'
import LiveCounter from '@/components/LiveCounter'
import FAQSection from '@/components/FAQSection'  // ← ADD

// ← ADD THIS BLOCK
const faqSchema = {
  '@context': 'https://schema.org',
  '@type':    'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name:    'Kya Sehat24 bilkul free hai?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:    'Haan — report analysis, Medicine AI Chat, PDF download sab bilkul free hai. Koi hidden charge nahi, koi credit card nahi.'
      }
    },
    {
      '@type': 'Question',
      name:    'Mera data safe hai?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:    'Aapki report sirf analysis ke liye process hoti hai. Hum aapka data bina permission ke store nahi karte. Privacy hamari priority hai.'
      }
    },
    {
      '@type': 'Question',
      name:    'Kaunse reports supported hain?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:    'Blood test CBC, LFT, KFT, HbA1c, Lipid Profile, Thyroid, MRI, CT Scan, X-Ray, Ultrasound, Pathology — kisi bhi Indian lab ki report. SRL, Lal PathLabs, Apollo, Metropolis, Thyrocare sab chalte hain.'
      }
    },
    {
      '@type': 'Question',
      name:    'Kya yeh doctor ka replacement hai?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:    'Bilkul nahi. Sehat24 educational information deta hai — doctor ka substitute nahi. Koi bhi health decision doctor ki salah ke baad lein.'
      }
    },
    {
      '@type': 'Question',
      name:    'Hindi ke alawa aur languages mein milega?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:    'Abhi Hindi aur English available hain. Tamil, Telugu, Marathi, Bengali jald aa rahe hain.'
      }
    },
  ]
}



export default function Home() {
  return (
    <>
    <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;1,9..144,300;1,9..144,400&family=Figtree:wght@400;500;600;700;800&display=swap');

        :root {
          --font-display: 'Fraunces', Georgia, serif;
          --font-body: 'Figtree', system-ui, sans-serif;

          --teal-900: #042f2e;
          --teal-700: #0f766e;
          --teal-600: #0d9488;
          --teal-400: #2dd4bf;
          --teal-100: #ccfbf1;
          --teal-50:  #f0fdfa;

          --ink:      #0c1a1a;
          --ink-muted: #374151;
          --ink-faint: #6b7280;
          --ink-ghost: #9ca3af;

          --surface:  #ffffff;
          --canvas:   #f9fafb;
          --border:   #e5e7eb;
          --border-light: #f3f4f6;

          --dark-900: #060d0d;
          --dark-800: #0d1a1a;
          --dark-700: #122222;

          --radius-sm: 10px;
          --radius-md: 16px;
          --radius-lg: 24px;
          --radius-xl: 32px;

          --shadow-sm: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
          --shadow-md: 0 4px 16px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04);
          --shadow-lg: 0 12px 40px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.06);
          --shadow-teal: 0 8px 32px rgba(13,148,136,0.25);
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: var(--font-body);
          color: var(--ink);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* ── Type Scale ── */
        .t-overline {
          font-family: var(--font-body);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ink-ghost);
        }
        .t-caption {
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 500;
          color: var(--ink-ghost);
          line-height: 1.5;
        }
        .t-body-sm {
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 400;
          color: var(--ink-muted);
          line-height: 1.65;
        }
        .t-body {
          font-family: var(--font-body);
          font-size: 15px;
          font-weight: 400;
          color: var(--ink-muted);
          line-height: 1.75;
        }
        .t-body-lg {
          font-family: var(--font-body);
          font-size: 17px;
          font-weight: 400;
          color: var(--ink-muted);
          line-height: 1.8;
        }
        .t-label {
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 600;
          color: var(--ink);
        }
        .t-h4 {
          font-family: var(--font-body);
          font-size: 15px;
          font-weight: 700;
          color: var(--ink);
          line-height: 1.4;
        }
        .t-h3 {
          font-family: var(--font-display);
          font-size: 22px;
          font-weight: 400;
          color: var(--ink);
          line-height: 1.3;
        }
        .t-h2 {
          font-family: var(--font-display);
          font-size: 36px;
          font-weight: 400;
          color: var(--ink);
          line-height: 1.2;
        }
        .t-h1 {
          font-family: var(--font-display);
          font-size: 60px;
          font-weight: 300;
          color: white;
          line-height: 1.08;
          letter-spacing: -1.5px;
        }

        /* ── Animations ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes float {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-14px); }
        }
        @keyframes floatB {
          0%,100% { transform: translateY(0) rotate(0deg); }
          50%     { transform: translateY(-10px) rotate(6deg); }
        }
        @keyframes shimmer {
          0%   { background-position: -300% center; }
          100% { background-position: 300% center; }
        }
        @keyframes pulse-dot {
          0%,100% { opacity: 1; transform: scale(1); }
          50%     { opacity: 0.4; transform: scale(0.7); }
        }
        @keyframes scan {
          0%   { transform: translateY(-8px); opacity: 0; }
          20%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(48px); opacity: 0; }
        }

        .a1 { animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.05s both; }
        .a2 { animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.18s both; }
        .a3 { animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.30s both; }
        .a4 { animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.42s both; }
        .a5 { animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.54s both; }

        .f1 { animation: float  7s ease-in-out infinite; }
        .f2 { animation: floatB 9s ease-in-out infinite 1s; }
        .f3 { animation: float  6s ease-in-out infinite 2s; }
        .f4 { animation: floatB 8s ease-in-out infinite 0.5s; }

        .shimmer {
          background: linear-gradient(90deg,
            rgba(255,255,255,0.5) 0%,
            rgba(255,255,255,1)   30%,
            rgba(45,212,191,1)    50%,
            rgba(255,255,255,1)   70%,
            rgba(255,255,255,0.5) 100%);
          background-size: 300% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 5s linear infinite;
        }

        /* ── Buttons ── */
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          border-radius: var(--radius-md);
          background: var(--teal-600);
          color: white;
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.22,1,0.36,1);
          box-shadow: var(--shadow-teal);
          letter-spacing: -0.1px;
        }
        .btn-primary:hover {
          background: var(--teal-700);
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(13,148,136,0.35);
        }
        .btn-primary:active { transform: translateY(0); }

        .btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          border-radius: var(--radius-md);
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.85);
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.12);
          cursor: pointer;
          transition: all 0.2s;
          backdrop-filter: blur(8px);
        }
        .btn-ghost:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.2);
          transform: translateY(-1px);
        }

        .btn-outline {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          border-radius: var(--radius-md);
          background: var(--surface);
          color: var(--teal-600);
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          border: 1.5px solid var(--teal-100);
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-outline:hover {
          border-color: var(--teal-600);
          background: var(--teal-50);
          transform: translateY(-1px);
        }

        /* ── Cards ── */
        .card {
          background: var(--surface);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          transition: all 0.25s cubic-bezier(0.22,1,0.36,1);
        }
        .card:hover {
          border-color: var(--border);
          box-shadow: var(--shadow-md);
          transform: translateY(-3px);
        }
        .card-teal {
          background: var(--teal-50);
          border: 1px solid var(--teal-100);
          border-radius: var(--radius-lg);
          transition: all 0.25s;
        }

        /* ── Misc ── */
        .dot-live {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #22c55e;
          animation: pulse-dot 2s ease-in-out infinite;
          display: inline-block;
        }

        .section-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }

        .divider {
          width: 1px; height: 20px;
          background: rgba(255,255,255,0.12);
          display: inline-block;
        }

        /* ── Responsive ── */
        @media (max-width: 720px) {
          .t-h1  { font-size: 40px !important; letter-spacing: -0.5px !important; }
          .t-h2  { font-size: 28px !important; }
          .t-h3  { font-size: 19px !important; }
          .r-hide  { display: none !important; }
          .r-col   { grid-template-columns: 1fr !important; }
          .r-col-2 { grid-template-columns: 1fr 1fr !important; }
          .r-pad   { padding: 48px 20px !important; }
          .r-hero-pad { padding: 90px 20px 64px !important; }
        }
      `}</style>

      <main style={{ background: 'var(--canvas)' }}>
        
        {/* ══════════ HERO ══════════ */}
        <section style={{
          background: 'linear-gradient(160deg, #060d0d 0%, #0d1a1a 55%, #061a14 100%)',
          minHeight: '100vh',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center'
        }}>

          {/* Grid texture */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: `
              linear-gradient(rgba(13,148,136,0.07) 1px, transparent 1px),
              linear-gradient(90deg, rgba(13,148,136,0.07) 1px, transparent 1px)
            `,
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)'
          }} />

          {/* Glow blobs */}
          <div style={{ position: 'absolute', top: '15%', left: '5%', width: 480, height: 480, background: 'radial-gradient(circle, rgba(13,148,136,0.14) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '5%', right: '8%', width: 320, height: 320, background: 'radial-gradient(circle, rgba(45,212,191,0.08) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />

          {/* Floating icons */}
          <div className="r-hide" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {[
              { icon: '🩸', top: '18%', left: '7%',   size: 48, cls: 'f1', op: 0.55 },
              { icon: '🧬', top: '62%', left: '6%',   size: 38, cls: 'f2', op: 0.35 },
              { icon: '💊', top: '22%', right: '7%',  size: 52, cls: 'f3', op: 0.5  },
              { icon: '🔬', top: '68%', right: '8%',  size: 42, cls: 'f4', op: 0.38 },
              { icon: '🧪', top: '8%',  right: '22%', size: 32, cls: 'f1', op: 0.28 },
              { icon: '🫀', top: '82%', left: '18%',  size: 36, cls: 'f2', op: 0.28 },
            ].map((f, i) => (
              <div key={i} className={f.cls} style={{
                position: 'absolute', top: f.top, left: f.left, right: f.right,
                fontSize: f.size, opacity: f.op,
                filter: 'drop-shadow(0 0 16px rgba(13,148,136,0.4))',
                userSelect: 'none'
              }}>
                {f.icon}
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="r-hero-pad" style={{ maxWidth: 860, margin: '0 auto', padding: '100px 24px 80px', position: 'relative', zIndex: 2, textAlign: 'center', width: '100%' }}>

            {/* Live badge */}
            <div className="a1" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(13,148,136,0.12)',
              border: '1px solid rgba(13,148,136,0.3)',
              borderRadius: 100, padding: '7px 16px',
              marginBottom: 40
            }}>
              <span className="dot-live" />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, color: 'var(--teal-400)', letterSpacing: '0.08em' }}>
                LIVE — INDIA'S AI HEALTH COMPANION
              </span>
            </div>

            {/* Headline */}
            <h1 className="a2 t-h1" style={{ marginBottom: 20 }}>
              Woh report jo<br />
              <em className="shimmer" style={{ fontStyle: 'italic' }}>samajh nahi aayi</em>
              {' '}—<br />ab samjho.
            </h1>

            {/* Sub */}
            <p className="a3" style={{
              fontFamily: 'var(--font-body)',
              fontSize: 17,
              color: 'rgba(255,255,255,0.5)',
              lineHeight: 1.75,
              maxWidth: 480,
              margin: '0 auto 44px',
              fontWeight: 400
            }}>
              Blood test, MRI, X-Ray — koi bhi report upload karo.{' '}
              <span style={{ color: 'var(--teal-400)', fontWeight: 600 }}>30 seconds</span>{' '}
              mein Hindi mein sab explain ho jaata hai. Bilkul free.
            </p>

            {/* CTAs */}
            <div className="a4" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 52 }}>
              <Link href="/upload" className="btn-primary">
                📋 Report Analyze Karo — Free
              </Link>
              <Link href="/chat" className="btn-ghost">
                💊 Medicine Chat
              </Link>
            </div>

            {/* Product Hunt Badge - Hero
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginBottom: '32px' 
            }}>
              <a 
                href="https://www.producthunt.com/products/sehat24?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-sehat24" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <img 
                  alt="Sehat24 - Medical reports explained in simple Hindi. Free AI for India | Product Hunt" 
                  width="250" 
                  height="54" 
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1130481&theme=light&t=1777200869551"
                />
              </a>
            </div> */}

            {/* Trust strip */}
            <div className="a5" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 24, flexWrap: 'wrap'
            }}>
              {[
                { icon: null,  text: null, isCounter: true },
                null,
                { icon: '🇮🇳', text: 'Made in India' },
                null,
                { icon: '🔒', text: 'Privacy first' },
                null,
                { icon: '✨',  text: 'No signup needed' },
              ].map((item, i) => {
                if (item === null) return <span key={i} className="divider" />
                if (item.isCounter) return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <LiveCounter dark />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>
                      reports analyzed
                    </span>
                  </div>
                )
                return (
                  <span key={i} style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span>{item.icon}</span>{item.text}
                  </span>
                )
              })}
            </div>
          </div>

          {/* Bottom gradient fade */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, background: 'linear-gradient(transparent, var(--canvas))', pointerEvents: 'none' }} />
        </section>

         


        {/* ══════════ LANGUAGE STRIP ══════════ */}
        <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border-light)', padding: '18px 24px' }}>
          <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span className="t-overline" style={{ flexShrink: 0, marginRight: 6 }}>Supported</span>
            {[
              { l: 'हिंदी',    live: true  },
              { l: 'English',  live: true  },
              { l: 'தமிழ்',   live: false },
              { l: 'తెలుగు', live: false },
              { l: 'मराठी',   live: false },
              { l: 'বাংলা',   live: false },
              { l: 'ગુજરાતી', live: false },
              { l: 'ਪੰਜਾਬੀ', live: false },
            ].map((item, i) => (
              <span key={i} style={{
                fontFamily: 'var(--font-body)',
                fontSize: 12, fontWeight: 600,
                padding: '4px 14px', borderRadius: 100,
                background: item.live ? 'var(--teal-600)' : 'var(--canvas)',
                color: item.live ? 'white' : 'var(--ink-ghost)',
                border: item.live ? 'none' : '1px solid var(--border)',
                transition: 'all 0.2s'
              }}>
                {item.l}
                {!item.live && <span style={{ fontSize: 9, opacity: 0.5, marginLeft: 3 }}>soon</span>}
              </span>
            ))}
          </div>
        </div>

        {/* ══════════ PROBLEM + SOLUTION ══════════ */}
        <section className="r-pad" style={{ padding: '96px 24px', background: 'var(--canvas)' }}>
          <div style={{ maxWidth: 860, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="r-col">

              <div style={{ background: 'linear-gradient(135deg, var(--dark-900), var(--dark-800))', borderRadius: 'var(--radius-xl)', padding: '40px 36px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -50, right: -50, width: 220, height: 220, background: 'radial-gradient(circle, rgba(220,38,38,0.12), transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f87171', marginBottom: 20 }}>The Problem</p>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 400, color: 'white', lineHeight: 1.32, marginBottom: 16 }}>
                  Reports are written for doctors —{' '}
                  <em style={{ color: '#fca5a5', fontStyle: 'italic' }}>not for the people who need them most.</em>
                </h2>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.42)', lineHeight: 1.75 }}>
                  Doctors have 5 minutes per patient. Lab reports, scan findings — all written in medical jargon nobody understands. This is not a convenience problem.{' '}
                  <span style={{ color: '#f87171', fontWeight: 600 }}>It is a life and death problem.</span>
                </p>
              </div>

              <div style={{ background: 'var(--teal-50)', border: '1px solid var(--teal-100)', borderRadius: 'var(--radius-xl)', padding: '40px 36px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -50, right: -50, width: 220, height: 220, background: 'radial-gradient(circle, rgba(13,148,136,0.12), transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--teal-600)', marginBottom: 20 }}>The Solution</p>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 400, color: 'var(--ink)', lineHeight: 1.32, marginBottom: 16 }}>
                  Ab koi bhi report — Hindi mein —{' '}
                  <em style={{ color: 'var(--teal-600)', fontStyle: 'italic' }}>30 seconds mein.</em>
                </h2>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-faint)', lineHeight: 1.75 }}>
                  Sehat24 ka AI har value padhta hai, normal ranges check karta hai, aur{' '}
                  <span style={{ color: 'var(--teal-600)', fontWeight: 600 }}>bilkul seedhi bhasha mein</span>{' '}
                  explain karta hai. Doctor ke paas jaane se pehle sab samjho.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ HOW IT WORKS ══════════ */}
        <section className="r-pad" style={{ padding: '96px 24px', background: 'var(--surface)' }}>
          <div style={{ maxWidth: 860, margin: '0 auto' }}>

            <div style={{ textAlign: 'center', marginBottom: 60 }}>
              <p className="t-overline" style={{ marginBottom: 12 }}>How It Works</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 300, color: 'var(--ink)', lineHeight: 1.15 }}>
                Teen steps.{' '}
                <em style={{ fontStyle: 'italic', color: 'var(--teal-600)' }}>Tees seconds.</em>
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }} className="r-col">
              {[
                {
                  num: '01', icon: '📋', color: 'var(--teal-600)',
                  bg: 'var(--teal-50)', border: 'var(--teal-100)',
                  title: 'Upload karo',
                  body: 'PDF ya photo. Kisi bhi Indian lab ki report — SRL, Lal PathLabs, Apollo, Thyrocare sab chalte hain.'
                },
                {
                  num: '02', icon: '🤖', color: '#1d4ed8',
                  bg: '#eff6ff', border: '#bfdbfe',
                  title: 'AI padh leta hai',
                  body: 'Har value, har finding check hoti hai. Normal ranges compare hoti hain. Indian health patterns samjhe jaate hain.'
                },
                {
                  num: '03', icon: '✅', color: '#15803d',
                  bg: '#f0fdf4', border: '#86efac',
                  title: 'Tum samjho',
                  body: 'Hindi mein, seedha explanation. Kya normal hai, kya dhyan chahiye, aur doctor se kya poochna hai.'
                },
              ].map((s, i) => (
                <div key={i} className="card" style={{ background: s.bg, border: `1px solid ${s.border}`, padding: '32px 28px' }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 48, height: 48, borderRadius: 14,
                    background: 'white', border: `1px solid ${s.border}`,
                    fontSize: 22, marginBottom: 20,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                  }}>
                    {s.icon}
                  </div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 800, color: s.color, letterSpacing: '0.12em', marginBottom: 8, opacity: 0.6 }}>
                    STEP {s.num}
                  </p>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 400, color: 'var(--ink)', marginBottom: 10, lineHeight: 1.3 }}>
                    {s.title}
                  </h3>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-faint)', lineHeight: 1.7 }}>
                    {s.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ REPORT TYPES ══════════ */}
        <section className="r-pad" style={{ padding: '96px 24px', background: 'var(--canvas)' }}>
          <div style={{ maxWidth: 860, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <p className="t-overline" style={{ marginBottom: 12 }}>Supported Reports</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 300, color: 'var(--ink)' }}>
                Har report.{' '}
                <em style={{ fontStyle: 'italic', color: 'var(--teal-600)' }}>Har test.</em>
              </h2>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {[
                ['🩸','CBC / Blood Test'],['🫀','Cardiac / ECG'],['🧠','MRI / CT Scan'],
                ['🦴','X-Ray'],['🫁','Ultrasound'],['🔬','Pathology'],
                ['💊','Thyroid'],['🩺','LFT / KFT'],['📊','HbA1c / Diabetes'],
                ['🧪','Lipid Profile'],['☀️','Vitamin D / B12'],['📄','Doctor Reports'],
              ].map(([icon, name], i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: '10px 16px', cursor: 'default',
                  transition: 'all 0.2s'
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='var(--teal-600)'; e.currentTarget.style.background='var(--teal-50)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--surface)' }}
                >
                  <span style={{ fontSize: 18 }}>{icon}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: 'var(--ink-muted)' }}>{name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ MEDICINE CHAT ══════════ */}
        <section className="r-pad" style={{ padding: '96px 24px', background: 'var(--surface)' }}>
          <div style={{ maxWidth: 860, margin: '0 auto' }}>
            <div style={{
              background: 'linear-gradient(150deg, var(--dark-900) 0%, var(--dark-800) 100%)',
              borderRadius: 'var(--radius-xl)', padding: '52px 48px',
              position: 'relative', overflow: 'hidden',
              boxShadow: '0 24px 64px rgba(0,0,0,0.2)'
            }}>
              <div style={{ position: 'absolute', top: -80, right: -80, width: 360, height: 360, background: 'radial-gradient(circle, rgba(13,148,136,0.18), transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />

              <div style={{ display: 'flex', gap: 52, alignItems: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>

                <div style={{ flex: 1, minWidth: 260 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(13,148,136,0.18)', border: '1px solid rgba(13,148,136,0.35)', color: 'var(--teal-400)', fontSize: 11, fontWeight: 700, padding: '5px 14px', borderRadius: 100, marginBottom: 24, letterSpacing: '0.07em' }}>
                    ✨ NEW FEATURE
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 300, color: 'white', marginBottom: 16, lineHeight: 1.2 }}>
                    Medicine AI Chat
                  </h2>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.48)', lineHeight: 1.8, marginBottom: 28 }}>
                    Koi bhi medicine ka naam poochho — dose, side effects, interactions — sab Hindi mein. ChatGPT generic hai, yeh specifically medical hai.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                    {[
                      'Medicine photo upload karo — identify karo',
                      'Side effects Hindi mein samjho',
                      '2 medicines saath mein safe hain? — poochho',
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(45,212,191,0.15)', border: '1px solid rgba(45,212,191,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                          <span style={{ fontSize: 9, color: 'var(--teal-400)' }}>✓</span>
                        </div>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/chat" className="btn-primary">
                    💊 Free mein poochho →
                  </Link>
                </div>

                {/* Chat preview */}
                <div className="r-hide" style={{ width: 252, flexShrink: 0 }}>
                  <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '16px', backdropFilter: 'blur(12px)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, var(--teal-600), #0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>💊</div>
                      <div>
                        <p style={{ fontFamily: 'var(--font-body)', color: 'white', fontWeight: 700, fontSize: 12, margin: 0 }}>Medicine AI</p>
                        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--teal-400)', fontSize: 10, margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span className="dot-live" style={{ width: 5, height: 5 }} /> Online
                        </p>
                      </div>
                    </div>
                    {[
                      { r: 'user', t: 'Metformin kab leni hai?' },
                      { r: 'ai',   t: 'Khane ke saath lo — subah aur raat. Khali pet nausea hota hai. 500mg se shuru karo.' },
                      { r: 'user', t: 'Side effects?' },
                      { r: 'ai',   t: 'Thoda nausea initially — chal jaata hai. B12 regularly check karao.' },
                    ].map((msg, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: msg.r === 'user' ? 'flex-end' : 'flex-start', marginBottom: 7 }}>
                        <div style={{
                          maxWidth: '82%', padding: '8px 11px',
                          borderRadius: msg.r === 'user' ? '11px 11px 3px 11px' : '11px 11px 11px 3px',
                          background: msg.r === 'user' ? 'var(--teal-600)' : 'rgba(255,255,255,0.07)',
                          fontFamily: 'var(--font-body)',
                          fontSize: 11, lineHeight: 1.55,
                          color: msg.r === 'user' ? 'white' : 'rgba(255,255,255,0.65)'
                        }}>
                          {msg.t}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ STATS ══════════ */}
        <section className="r-pad" style={{ padding: '80px 24px', background: 'var(--canvas)' }}>
          <div style={{ maxWidth: 860, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }} className="r-col-2">
              {[
                { n: '500M+',  l: 'Indians get medical reports yearly', i: '🇮🇳' },
                { n: '30 sec', l: 'Average analysis time',              i: '⚡' },
                { n: '100%',   l: 'Free — always',                      i: '💯' },
                { n: '22+',    l: 'Indian languages — coming soon',      i: '🗣️' },
              ].map((s, i) => (
                <div key={i} className="card" style={{ padding: '28px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: 26, marginBottom: 14 }}>{s.i}</div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 400, color: 'var(--teal-600)', marginBottom: 6, lineHeight: 1 }}>{s.n}</p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-ghost)', lineHeight: 1.5 }}>{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ VISION ══════════ */}
        <section id="vision" className="r-pad" style={{ padding: '96px 24px', background: 'var(--surface)' }}>
          <div style={{ maxWidth: 860, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <div style={{ display: 'inline-block', background: '#fffbeb', border: '1px solid #fde68a', color: '#b45309', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, padding: '6px 16px', borderRadius: 100, marginBottom: 18 }}>
                Yeh sirf 10% hai jo hum bana rahe hain
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 300, color: 'var(--ink)', marginBottom: 12 }}>
                India's Health{' '}
                <em style={{ fontStyle: 'italic', color: 'var(--teal-600)' }}>Intelligence OS</em>
              </h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--ink-faint)', maxWidth: 420, margin: '0 auto' }}>
                Sirf ek report reader nahi — har Indian ke liye ek lifelong AI health companion.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="r-col">
              {[
                { p: 'V1 + V2 — Live Now', icon: '✅', live: true, items: ['Blood tests, MRI, X-Ray — sab explain', 'Hindi + English multilingual output', 'Ayurvedic herb suggestions', 'Medicine AI Chat', 'PDF download — Full + Doctor Summary', 'Report history + trend comparison', 'Mobile OTP login'] },
                { p: 'V3 — Next Quarter',  icon: '📋', live: false, items: ['Voice output in 8 regional languages', 'WhatsApp — report forward karo, result pao', 'Medication interaction checker', 'ABHA digital health ID integration', 'Pre-appointment doctor brief generator'] },
                { p: 'V4 — Scale',         icon: '🚀', live: false, items: ['Corporate wellness — ₹200/employee/month', 'Insurance company partnerships', 'Diagnostic lab API integrations', 'Southeast Asia and Middle East', 'Native Android + iOS app'] },
                { p: 'Vision',             icon: '🌟', live: false, vision: true, items: ['Family health management — 4 members', 'AI doctor question preparation', 'Personalized health timeline', 'Chronic disease tracking', 'Hospital visit companion'] },
              ].map((c, i) => (
                <div key={i} className="card" style={{
                  padding: '28px 26px',
                  background: c.live ? 'var(--teal-50)' : c.vision ? '#fffbeb' : 'var(--surface)',
                  borderColor: c.live ? 'var(--teal-100)' : c.vision ? '#fde68a' : 'var(--border-light)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                    <span style={{ fontSize: 18 }}>{c.icon}</span>
                    <span style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 100, letterSpacing: '0.04em',
                      background: c.live ? 'var(--teal-600)' : c.vision ? '#d97706' : '#94a3b8',
                      color: 'white'
                    }}>
                      {c.p}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {c.items.map((item, j) => (
                      <div key={j} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                        <span style={{ color: 'var(--teal-600)', flexShrink: 0, fontSize: 11, marginTop: 3, fontWeight: 700 }}>→</span>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-muted)', lineHeight: 1.55 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ COMPETITOR ══════════ */}
        <section className="r-pad" style={{ padding: '96px 24px', background: 'linear-gradient(150deg, var(--dark-900), var(--dark-800))', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(13,148,136,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(13,148,136,0.04) 1px, transparent 1px)', backgroundSize: '44px 44px', pointerEvents: 'none' }} />
          <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <p className="t-overline" style={{ color: 'rgba(255,255,255,0.25)', marginBottom: 20 }}>The Gap We Fill</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 300, color: 'white', marginBottom: 52, lineHeight: 1.3 }}>
              ChatGPT Health launched Jan 2026.<br />
              <em style={{ fontStyle: 'italic', color: 'var(--teal-400)' }}>India is not on their roadmap. We are.</em>
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }} className="r-col">
              {[
                { n: 'ChatGPT Health', t: 'US only. No India. No Hindi. No Indian lab formats. No report history.', hl: false },
                { n: 'Practo / 1mg',  t: 'Doctor booking and pharmacy. Zero AI interpretation.', hl: false },
                { n: 'Sehat24',       t: 'Built for India. Indian labs. Indian languages. Report history + trends. Completely free.', hl: true },
              ].map((c, i) => (
                <div key={i} style={{
                  background: c.hl ? 'linear-gradient(135deg, var(--teal-600), #0891b2)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${c.hl ? 'transparent' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: 'var(--radius-lg)', padding: '28px 24px', textAlign: 'left',
                  transition: 'all 0.25s'
                }}>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, color: c.hl ? 'white' : 'rgba(255,255,255,0.35)', marginBottom: 10 }}>{c.n}</p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: c.hl ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.3)', lineHeight: 1.7 }}>{c.t}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
          <section style={{
            padding: '60px 24px',
            maxWidth: 860,
            margin: '0 auto'
          }}>
            <p style={{
              textAlign: 'center',
              fontSize: 11,
              fontWeight: 700,
              color: '#2dd4bf',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 32
            }}>
              Real Logon Ki Baat 🗣️
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 16
            }}>

              {/* Card 1 */}
              <div style={{
                background: '#1e293b',
                border: '1px solid #2dd4bf',
                borderRadius: 16,
                padding: 24
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 16
                }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: '#0f4f4f',
                    border: '2px solid #2dd4bf',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    flexShrink: 0
                  }}>🔬</div>
                  <div>
                    <p style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: '#ffffff',
                      margin: 0
                    }}>Lab Technician</p>
                    <p style={{
                      fontSize: 12,
                      color: '#2dd4bf',
                      margin: 0
                    }}>Delhi, India · Verified User ✅</p>
                  </div>
                </div>
                <p style={{
                  fontSize: 14,
                  color: '#cbd5e1',
                  lineHeight: 1.8,
                  margin: '0 0 16px',
                  fontStyle: 'italic'
                }}>
                  "Roz patients reports lekar aate hain aur
                  koi samajh nahi paata. Maine khud apni
                  full body report upload ki — 2 minute mein
                  Hindi mein sab clear ho gaya. Ab main apne
                  har patient ko Sehat24 recommend karta hoon."
                </p>
                <p style={{ color: '#f59e0b', fontSize: 16, margin: 0 }}>
                  ★★★★★
                </p>
              </div>

              {/* Card 2 */}
              <div style={{
                background: '#1e293b',
                border: '1px solid #2dd4bf',
                borderRadius: 16,
                padding: 24
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 16
                }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: '#0f4f4f',
                    border: '2px solid #2dd4bf',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    flexShrink: 0
                  }}>👨‍👩‍👧</div>
                  <div>
                    <p style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: '#ffffff',
                      margin: 0
                    }}>Milan Kumar</p>
                    <p style={{
                      fontSize: 12,
                      color: '#2dd4bf',
                      margin: 0
                    }}>Noida, India · Verified User ✅</p>
                  </div>
                </div>
                <p style={{
                  fontSize: 14,
                  color: '#cbd5e1',
                  lineHeight: 1.8,
                  margin: '0 0 16px',
                  fontStyle: 'italic'
                }}>
                  "Pichle 6 mahine ki reports 
                    compare karke pata chala 
                    sugar slowly badh rahi thi.
                    Sehat24 ne pakad liya"
                </p>
                <p style={{ color: '#f59e0b', fontSize: 16, margin: 0 }}>
                  ★★★★★
                </p>
              </div>

            </div>
          </section>

        {/* ══════════ FAQ ══════════ */}
      <section className="r-pad" style={{ padding: '80px 24px', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p className="t-overline" style={{ marginBottom: 12 }}>FAQ</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 300, color: 'var(--ink)' }}>
              Aksar pooche jaane wale{' '}
              <em style={{ fontStyle: 'italic', color: 'var(--teal-600)' }}>sawaal</em>
            </h2>
          </div>

          <FAQSection />
        </div>
      </section>

        {/* ══════════ FINAL CTA ══════════ */}
        <section className="r-pad" style={{ padding: '112px 24px', background: 'var(--canvas)', textAlign: 'center' }}>
          <div style={{ maxWidth: 540, margin: '0 auto' }}>
            <div style={{ fontSize: 52, marginBottom: 24 }}>🏥</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 300, color: 'var(--ink)', marginBottom: 16, lineHeight: 1.12 }}>
              Abhi try karo.<br />
              <em style={{ fontStyle: 'italic', color: 'var(--teal-600)' }}>Bilkul free hai.</em>
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--ink-ghost)', marginBottom: 44, lineHeight: 1.75 }}>
              Koi signup nahi. Koi credit card nahi.<br />Bas report upload karo — aur samjho.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
              <Link href="/upload" className="btn-primary" style={{ padding: '16px 36px', fontSize: 15 }}>
                📋 Report Upload Karo — Free →
              </Link>
              <Link href="/chat" className="btn-outline" style={{ padding: '16px 28px', fontSize: 15 }}>
                💊 Medicine Chat
              </Link>
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-ghost)' }}>
              Works on mobile &nbsp;•&nbsp; No app download &nbsp;•&nbsp; Every Indian lab
            </p>
          </div>
        </section>

      </main>
    </>
  )
}