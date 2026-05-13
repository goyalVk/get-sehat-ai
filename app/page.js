import Link from 'next/link'
import LiveCounter from '@/components/LiveCounter'
import FAQSection from '@/components/FAQSection'

export const metadata = {
  title: 'Sehat24 — Free Medical Report Analyzer in Hindi | Lab Report Samjho',
  description: 'Koi bhi lab report Hindi mein samjho — CBC, Thyroid, HbA1c, Vitamin D. 2300+ reports analyzed. SRL, Lal PathLabs, Apollo, Thyrocare sab supported. Bilkul Free.',
  keywords: [
    'medical report hindi mein','lab report analyzer hindi',
    'blood test report hindi','CBC report hindi mein samjho',
    'thyroid report hindi','HbA1c kya hota hai',
    'vitamin d deficiency hindi','hemoglobin kam hona',
    'free health report analyzer india','sehat24',
    'lab report kaise samjhe','medical report translate hindi',
  ],
  openGraph: {
    title: 'Sehat24 — Apni Report Hindi Mein Samjho',
    description: '2300+ reports analyzed. Free. 30 seconds. Hindi mein.',
    url: 'https://sehat24.com',
    siteName: 'Sehat24',
    locale: 'hi_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sehat24 — Free Medical Report Analyzer in Hindi',
    description: '2300+ reports analyzed. Free. 30 seconds.',
  },
  alternates: { canonical: 'https://sehat24.com' },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type':'Question', name:'Kya Sehat24 bilkul free hai?',             acceptedAnswer:{ '@type':'Answer', text:'Haan — report analysis, Medicine AI Chat, PDF download sab bilkul free hai. Koi hidden charge nahi, koi credit card nahi.' } },
    { '@type':'Question', name:'Mera data safe hai?',                       acceptedAnswer:{ '@type':'Answer', text:'Aapki report sirf analysis ke liye process hoti hai. Hum aapka data bina permission ke store nahi karte. Privacy hamari priority hai.' } },
    { '@type':'Question', name:'Kaunse reports supported hain?',            acceptedAnswer:{ '@type':'Answer', text:'Blood test CBC, LFT, KFT, HbA1c, Lipid Profile, Thyroid, MRI, CT Scan, X-Ray, Ultrasound, Pathology — kisi bhi Indian lab ki report. SRL, Lal PathLabs, Apollo, Metropolis, Thyrocare sab chalte hain.' } },
    { '@type':'Question', name:'Kya yeh doctor ka replacement hai?',        acceptedAnswer:{ '@type':'Answer', text:'Bilkul nahi. Sehat24 educational information deta hai — doctor ka substitute nahi. Koi bhi health decision doctor ki salah ke baad lein.' } },
    { '@type':'Question', name:'Hindi ke alawa aur languages mein milega?', acceptedAnswer:{ '@type':'Answer', text:'Abhi Hindi aur English available hain. Tamil, Telugu, Marathi, Bengali jald aa rahe hain.' } },
  ],
}

const medicalSchema = {
  '@context': 'https://schema.org',
  '@type': 'MedicalWebPage',
  name: 'Sehat24 — Free Medical Report Analyzer',
  description: 'AI-powered medical report analyzer in Hindi',
  url: 'https://sehat24.com',
  inLanguage: ['hi', 'en'],
  audience: { '@type': 'Patient' },
  about: { '@type': 'MedicalCondition', name: 'Medical Report Analysis' },
}

const row1Testimonials = [
  { text: 'Doctor ne bola tha isliye dekha — bahut helpful lagi', city: 'Delhi' },
  { text: '2 minute mein sab clear ho gaya', city: 'Lucknow' },
  { text: 'Pehli baar samajh aaya report', city: 'Patna' },
  { text: 'Amazing — bilkul free', city: 'Kanpur' },
  { text: 'Lab technician ne recommend kiya', city: 'Delhi' },
]
const row2Testimonials = [
  { text: 'Mere papa ki thyroid report samajh aayi', city: 'Agra' },
  { text: 'Doctor ke sawaal ready ho gaye', city: 'Bhopal' },
  { text: 'Vitamin D result clear tha', city: 'Mumbai' },
  { text: 'CBC report ka matlab finally pata chala', city: 'Varanasi' },
]

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalSchema) }} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;1,9..144,300;1,9..144,400&family=Figtree:wght@400;500;600;700;800&display=swap');

        :root {
          --font-display:'Fraunces',Georgia,serif; --font-body:'Figtree',system-ui,sans-serif;
          --teal-900:#042f2e; --teal-700:#0f766e; --teal-600:#0d9488;
          --teal-500:#14b8a6; --teal-400:#2dd4bf; --teal-100:#ccfbf1; --teal-50:#f0fdfa;
          --ink:#0c1a1a; --ink-muted:#374151; --ink-faint:#6b7280; --ink-ghost:#9ca3af;
          --surface:#ffffff; --canvas:#f9fafb; --border:#e5e7eb; --border-light:#f3f4f6;
          --dark-900:#060d0d; --dark-800:#0d1a1a; --dark-700:#122222;
          --radius-sm:10px; --radius-md:16px; --radius-lg:24px; --radius-xl:32px;
          --shadow-sm:0 1px 3px rgba(0,0,0,0.08),0 1px 2px rgba(0,0,0,0.04);
          --shadow-md:0 4px 16px rgba(0,0,0,0.08),0 2px 6px rgba(0,0,0,0.04);
          --shadow-lg:0 12px 40px rgba(0,0,0,0.1),0 4px 12px rgba(0,0,0,0.06);
          --shadow-teal:0 8px 32px rgba(13,148,136,0.25);
        }
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{font-family:var(--font-body);color:var(--ink);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}

        .t-overline{font-family:var(--font-body);font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-ghost)}
        .t-h1{font-family:var(--font-display);font-size:60px;font-weight:300;color:white;line-height:1.08;letter-spacing:-1.5px}

        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
        @keyframes floatB{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-10px) rotate(6deg)}}
        @keyframes shimmer{0%{background-position:-300% center}100%{background-position:300% center}}
        @keyframes pulse-dot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)}}
        @keyframes scan-line{0%{top:0%;opacity:0}10%{opacity:1}90%{opacity:1}100%{top:100%;opacity:0}}
        @keyframes reveal-text{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
        @keyframes bar-grow{from{width:0%}to{width:var(--bar-w)}}
        @keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes ping{75%,100%{transform:scale(1.8);opacity:0}}
        @keyframes glow-pulse{0%,100%{box-shadow:0 0 20px rgba(13,148,136,.3)}50%{box-shadow:0 0 40px rgba(13,148,136,.6)}}
        @keyframes trend-draw{from{stroke-dashoffset:200}to{stroke-dashoffset:0}}
        @keyframes statReveal{0%{opacity:0;transform:translateY(16px) scale(0.88);filter:blur(4px)}100%{opacity:1;transform:translateY(0) scale(1);filter:blur(0)}}
        @keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}

        .a1{animation:fadeUp .7s cubic-bezier(.22,1,.36,1) .05s both}
        .a2{animation:fadeUp .7s cubic-bezier(.22,1,.36,1) .18s both}
        .a3{animation:fadeUp .7s cubic-bezier(.22,1,.36,1) .30s both}
        .a4{animation:fadeUp .7s cubic-bezier(.22,1,.36,1) .42s both}
        .a5{animation:fadeUp .7s cubic-bezier(.22,1,.36,1) .54s both}
        .f1{animation:float 7s ease-in-out infinite}
        .f2{animation:floatB 9s ease-in-out infinite 1s}
        .f3{animation:float 6s ease-in-out infinite 2s}
        .f4{animation:floatB 8s ease-in-out infinite .5s}

        .shimmer{
          background:linear-gradient(90deg,rgba(255,255,255,.5) 0%,rgba(255,255,255,1) 30%,rgba(45,212,191,1) 50%,rgba(255,255,255,1) 70%,rgba(255,255,255,.5) 100%);
          background-size:300% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;
          background-clip:text;animation:shimmer 5s linear infinite
        }

        .btn-primary{display:inline-flex;align-items:center;gap:8px;padding:14px 28px;border-radius:var(--radius-md);background:var(--teal-600);color:white;font-family:var(--font-body);font-size:14px;font-weight:700;text-decoration:none;border:none;cursor:pointer;transition:all .2s cubic-bezier(.22,1,.36,1);box-shadow:var(--shadow-teal);letter-spacing:-.1px}
        .btn-primary:hover{background:var(--teal-700);transform:translateY(-2px);box-shadow:0 12px 40px rgba(13,148,136,.35)}
        .btn-primary:active{transform:translateY(0)}

        .btn-ghost{display:inline-flex;align-items:center;gap:8px;padding:14px 28px;border-radius:var(--radius-md);background:rgba(255,255,255,.06);color:rgba(255,255,255,.85);font-family:var(--font-body);font-size:14px;font-weight:600;text-decoration:none;border:1px solid rgba(255,255,255,.12);cursor:pointer;transition:all .2s;backdrop-filter:blur(8px)}
        .btn-ghost:hover{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.2);transform:translateY(-1px)}

        .btn-outline{display:inline-flex;align-items:center;gap:8px;padding:14px 28px;border-radius:var(--radius-md);background:var(--surface);color:var(--teal-600);font-family:var(--font-body);font-size:14px;font-weight:700;text-decoration:none;border:1.5px solid var(--teal-100);cursor:pointer;transition:all .2s}
        .btn-outline:hover{border-color:var(--teal-600);background:var(--teal-50);transform:translateY(-1px)}

        .btn-pro{display:inline-flex;align-items:center;gap:8px;padding:14px 28px;border-radius:var(--radius-md);background:linear-gradient(135deg,#d97706,#f59e0b);color:white;font-family:var(--font-body);font-size:14px;font-weight:700;text-decoration:none;border:none;cursor:pointer;transition:all .2s;box-shadow:0 8px 24px rgba(217,119,6,.3)}
        .btn-pro:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(217,119,6,.4)}

        .card{background:var(--surface);border:1px solid var(--border-light);border-radius:var(--radius-lg);transition:all .25s cubic-bezier(.22,1,.36,1)}
        .card:hover{border-color:var(--border);box-shadow:var(--shadow-md);transform:translateY(-3px)}

        .feature-card{position:relative;overflow:hidden;transition:all .3s cubic-bezier(.22,1,.36,1);cursor:default}
        .feature-card::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 50% 0%,rgba(13,148,136,.08),transparent 60%);opacity:0;transition:opacity .3s}
        .feature-card:hover::before{opacity:1}
        .feature-card:hover{transform:translateY(-6px);box-shadow:0 20px 48px rgba(13,148,136,.12);border-color:var(--teal-100)!important}

        .illness-card{border-radius:var(--radius-lg);padding:28px 24px;transition:all .3s cubic-bezier(.22,1,.36,1);text-decoration:none;display:block}
        .illness-card:hover{transform:translateY(-6px);box-shadow:0 20px 48px rgba(0,0,0,0.12)}

        .women-card{border-radius:var(--radius-lg);padding:24px 20px;transition:all .25s cubic-bezier(.22,1,.36,1);text-decoration:none;display:block}
        .women-card:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,0.1)}

        .report-pill{display:flex;align-items:center;gap:7px;background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:9px 14px;transition:all .2s}
        .report-pill:hover{border-color:var(--teal-600);background:var(--teal-50)}

        .dot-live{width:7px;height:7px;border-radius:50%;background:#22c55e;animation:pulse-dot 2s ease-in-out infinite;display:inline-block}
        .divider{width:1px;height:20px;background:rgba(255,255,255,.12);display:inline-block}
        .scan-beam{position:absolute;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--teal-400),transparent);animation:scan-line 3s ease-in-out infinite;pointer-events:none;z-index:10}
        .trend-line{stroke-dasharray:200;stroke-dashoffset:200;animation:trend-draw 2s ease-out forwards}
        .pro-badge{display:inline-flex;align-items:center;gap:5px;background:linear-gradient(135deg,#d97706,#f59e0b);color:white;font-size:10px;font-weight:800;padding:3px 10px;border-radius:100px;letter-spacing:.06em}

        /* stat cards */
        .stat-card{animation:statReveal .6s cubic-bezier(.22,1,.36,1) both}
        .stat-card:nth-child(1){animation-delay:.3s}
        .stat-card:nth-child(2){animation-delay:.42s}
        .stat-card:nth-child(3){animation-delay:.54s}
        .stat-card:nth-child(4){animation-delay:.66s}

        /* marquee */
        .marquee-track{display:flex;width:max-content;gap:12px}
        .marquee-row1 .marquee-track{animation:marquee 32s linear infinite}
        .marquee-row2 .marquee-track{animation:marquee 38s linear infinite reverse}
        .marquee-outer{overflow:hidden;width:100%}
        .marquee-row1,.marquee-row2{overflow:hidden;padding:6px 0}
        .marquee-pill{flex-shrink:0;display:flex;align-items:center;gap:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:100px;padding:10px 18px;white-space:nowrap}

        /* sticky mobile CTA */
        .sticky-cta{display:none}

        @media(max-width:720px){
          .sticky-cta{display:flex;position:fixed;bottom:0;left:0;right:0;z-index:999;background:linear-gradient(to top,rgba(6,13,13,.98),rgba(6,13,13,.92));backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);padding:12px 16px calc(20px + env(safe-area-inset-bottom,0px));gap:10px;border-top:1px solid rgba(13,148,136,.25);animation:slideUp .4s cubic-bezier(.22,1,.36,1) 1.2s both}
          .sticky-cta a{flex:1;text-align:center;padding:14px 10px;border-radius:14px;font-family:var(--font-body);font-size:14px;font-weight:700;text-decoration:none;transition:all .2s}
          .sticky-cta .sticky-primary{background:var(--teal-600);color:white;box-shadow:0 4px 20px rgba(13,148,136,.4)}
          .sticky-cta .sticky-ghost{background:rgba(255,255,255,.07);color:rgba(255,255,255,.75);border:1px solid rgba(255,255,255,.12)}
          main{padding-bottom:calc(80px + env(safe-area-inset-bottom,0px))}
          .t-h1{font-size:40px!important;letter-spacing:-.5px!important}
          .r-hide{display:none!important}
          .r-col{grid-template-columns:1fr!important}
          .r-col-2{grid-template-columns:1fr 1fr!important}
          .r-col-3{grid-template-columns:1fr!important}
          .r-pad{padding:48px 20px!important}
          .r-hero-pad{padding:90px 20px 64px!important}
          .hero-subtext{font-size:14px!important}
          .demo-split{flex-direction:column!important;gap:16px!important}
          .demo-split > div{min-width:unset!important;width:100%!important}
          .demo-arrow{display:none!important}
          .sec-h2{font-size:26px!important;line-height:1.25!important}
          .cta-h2{font-size:32px!important;line-height:1.15!important}
          .chat-h2{font-size:28px!important}
          .chat-card{padding:32px 20px!important}
          .demo-right-body{padding:14px!important}
          .report-row{padding-left:14px!important;padding-right:14px!important}
          .demo-section{padding-left:16px!important;padding-right:16px!important}
          .hero-section{min-height:100svh!important}
          .hero-cta-btns{flex-direction:column!important;align-items:stretch!important;gap:8px!important}
          .hero-cta-btns a{justify-content:center!important}
          .stat-strip{gap:8px!important}
          .marquee-pill{font-size:12px!important;padding:8px 14px!important}
        }
      `}</style>

      <div className="sticky-cta" role="navigation" aria-label="Quick actions">
        <Link href="/upload" className="sticky-primary">📋 Report Upload Karo — Free</Link>
        <Link href="/chat" className="sticky-ghost">💊 Medicine Chat</Link>
      </div>

      <main style={{ background:'var(--canvas)' }}>

        {/* ══ HERO ══ */}
        <section className="hero-section" aria-label="Hero — Sehat24 Medical Report Analyzer" style={{ background:'linear-gradient(160deg,#060d0d 0%,#0d1a1a 55%,#061a14 100%)', minHeight:'100vh', position:'relative', overflow:'hidden', display:'flex', alignItems:'center' }}>
          <div style={{ position:'absolute', inset:0, pointerEvents:'none', backgroundImage:`linear-gradient(rgba(13,148,136,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(13,148,136,0.07) 1px,transparent 1px)`, backgroundSize:'56px 56px', maskImage:'radial-gradient(ellipse 80% 80% at 50% 50%,black 30%,transparent 100%)' }} />
          <div style={{ position:'absolute', top:'15%', left:'5%', width:480, height:480, background:'radial-gradient(circle,rgba(13,148,136,0.14) 0%,transparent 65%)', borderRadius:'50%', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:'5%', right:'8%', width:320, height:320, background:'radial-gradient(circle,rgba(45,212,191,0.08) 0%,transparent 65%)', borderRadius:'50%', pointerEvents:'none' }} />

          <div className="r-hide" style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
            {[
              {icon:'🩸',top:'18%',left:'7%',  size:48,cls:'f1',op:.55},
              {icon:'🧬',top:'62%',left:'6%',  size:38,cls:'f2',op:.35},
              {icon:'💊',top:'22%',right:'7%', size:52,cls:'f3',op:.5 },
              {icon:'🔬',top:'68%',right:'8%', size:42,cls:'f4',op:.38},
              {icon:'🧪',top:'8%', right:'22%',size:32,cls:'f1',op:.28},
              {icon:'🫀',top:'82%',left:'18%', size:36,cls:'f2',op:.28},
            ].map((f,i) => (
              <div key={i} className={f.cls} aria-label={f.icon} style={{ position:'absolute', top:f.top, left:f.left, right:f.right, fontSize:f.size, opacity:f.op, filter:'drop-shadow(0 0 16px rgba(13,148,136,0.4))', userSelect:'none' }}>{f.icon}</div>
            ))}
          </div>

          <div className="r-hero-pad" style={{ maxWidth:860, margin:'0 auto', padding:'100px 24px 80px', position:'relative', zIndex:2, textAlign:'center', width:'100%' }}>
            <div className="a1" style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(13,148,136,0.12)', border:'1px solid rgba(13,148,136,0.3)', borderRadius:100, padding:'7px 16px', marginBottom:40 }}>
              <span className="dot-live" />
              <span style={{ fontFamily:'var(--font-body)', fontSize:11, fontWeight:700, color:'var(--teal-400)', letterSpacing:'.08em' }}>LIVE — INDIA&apos;S AI HEALTH COMPANION</span>
            </div>
            <h1 className="a2 t-h1" style={{ marginBottom:20 }}>
              Woh report jo<br />
              <em className="shimmer" style={{ fontStyle:'italic' }}>samajh nahi aayi</em>{' '}—<br />ab samjho.
            </h1>
            <p className="a3 hero-subtext" style={{ fontFamily:'var(--font-body)', fontSize:17, color:'rgba(255,255,255,0.5)', lineHeight:1.75, maxWidth:480, margin:'0 auto 36px', fontWeight:400 }}>
              Koi bhi report upload karo.{' '}
              <span style={{ color:'var(--teal-400)', fontWeight:600 }}>30 seconds</span>{' '}
              mein Hindi mein sab explain. Bilkul free.
            </p>

            {/* Stat strip */}
            <div className="a3 stat-strip" style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap', marginBottom:36 }}>
              {[
                { num:'2,300+', label:'Reports Analyzed' },
                { num:'49%',    label:'Hemoglobin Low mila' },
                { num:'69%',    label:'Vitamin D ki kami' },
                { num:'46%',    label:'Urgent Health Flags' },
              ].map((s, i) => (
                <div key={i} className="stat-card" style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:16, padding:'14px 20px', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)', textAlign:'center', minWidth:110 }}>
                  <p style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:400, color:'var(--teal-400)', margin:'0 0 2px', lineHeight:1 }}>{s.num}</p>
                  <p style={{ fontFamily:'var(--font-body)', fontSize:11, color:'rgba(255,255,255,0.5)', margin:0, fontWeight:500 }}>{s.label}</p>
                </div>
              ))}
            </div>

            <div className="a4 hero-cta-btns" style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap', marginBottom:16 }}>
              <Link href="/upload" className="btn-primary">📋 Report Analyze Karo — Free</Link>
              <Link href="/chat" className="btn-ghost">💊 Medicine Chat</Link>
            </div>

            {/* Women health pill */}
            <div className="a4" style={{ marginBottom:20 }}>
              <span style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(251,113,133,0.12)', border:'1px solid rgba(251,113,133,0.25)', borderRadius:100, padding:'8px 18px', fontFamily:'var(--font-body)', fontSize:13, fontWeight:600, color:'#fda4af' }}>
                💕 Thyroid • PCOD • Anemia • Pregnancy — sab supported
              </span>
            </div>

            <div className="a4" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, flexWrap:'wrap', marginBottom:44 }}>
              {['✅ No signup needed','·','🆓 Free forever','·','⚡ 30 seconds','·','🔒 Privacy first'].map((item,i) => (
                <span key={i} style={{ fontFamily:'var(--font-body)', fontSize:12, fontWeight:item==='·'?400:600, color:item==='·'?'rgba(255,255,255,0.15)':'rgba(255,255,255,0.5)' }}>{item}</span>
              ))}
            </div>
            <div className="a5" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:24, flexWrap:'wrap' }}>
              <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                <LiveCounter dark />
                <span style={{ fontFamily:'var(--font-body)', fontSize:12, color:'rgba(255,255,255,0.35)', fontWeight:500 }}>reports analyzed</span>
              </div>
              <span className="divider" />
              <span style={{ fontFamily:'var(--font-body)', fontSize:12, color:'rgba(255,255,255,0.4)', fontWeight:500, display:'flex', alignItems:'center', gap:5 }}>🇮🇳 Made in India</span>
              <span className="divider" />
              <span style={{ fontFamily:'var(--font-body)', fontSize:12, color:'rgba(255,255,255,0.4)', fontWeight:500, display:'flex', alignItems:'center', gap:5 }}>✨ Every Indian lab</span>
            </div>
          </div>
          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:100, background:'linear-gradient(transparent,var(--canvas))', pointerEvents:'none' }} />
        </section>

        {/* ══ LANGUAGE STRIP ══ */}
        <div style={{ background:'var(--surface)', borderBottom:'1px solid var(--border-light)', padding:'18px 24px' }}>
          <div style={{ maxWidth:860, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'center', gap:10, flexWrap:'wrap' }}>
            <span className="t-overline" style={{ flexShrink:0, marginRight:6 }}>Supported</span>
            {[{l:'हिंदी',live:true},{l:'English',live:true},{l:'தமிழ்',live:false},{l:'తెలుగు',live:false},{l:'मराठी',live:false},{l:'বাংলা',live:false},{l:'ગુજરાતી',live:false},{l:'ਪੰਜਾਬੀ',live:false}].map((item,i) => (
              <span key={i} style={{ fontFamily:'var(--font-body)', fontSize:12, fontWeight:600, padding:'4px 14px', borderRadius:100, background:item.live?'var(--teal-600)':'var(--canvas)', color:item.live?'white':'var(--ink-ghost)', border:item.live?'none':'1px solid var(--border)' }}>
                {item.l}{!item.live && <span style={{ fontSize:9, opacity:.5, marginLeft:3 }}>soon</span>}
              </span>
            ))}
          </div>
        </div>

        {/* ══ REAL DATA SECTION ══ */}
        <section id="health-data" aria-label="Health Statistics from Sehat24" className="r-pad" style={{ padding:'96px 24px', background:'var(--canvas)' }}>
          <div style={{ maxWidth:960, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:52 }}>
              <p className="t-overline" style={{ marginBottom:12 }}>Real Patient Data</p>
              <h2 className="sec-h2" style={{ fontFamily:'var(--font-display)', fontSize:40, fontWeight:300, color:'var(--ink)', lineHeight:1.2, marginBottom:12 }}>
                Sehat24 ke 2,300+ Reports ka{' '}<em style={{ fontStyle:'italic', color:'var(--teal-600)' }}>Sach</em>
              </h2>
              <p style={{ fontFamily:'var(--font-body)', fontSize:15, color:'var(--ink-ghost)', maxWidth:520, margin:'0 auto' }}>
                Yeh fake numbers nahi hain — yeh real Indian patients ka data hai
              </p>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }} className="r-col">
              {/* Card 1 — Anemia */}
              <Link href="/blog/hemoglobin-kam-hona" className="illness-card" style={{ background:'linear-gradient(135deg,#fff1f2,#ffe4e6)', border:'1px solid #fecdd3' }}>
                <p style={{ fontFamily:'var(--font-display)', fontSize:48, fontWeight:400, color:'#e11d48', lineHeight:1, marginBottom:8 }}>49%</p>
                <h3 style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:400, color:'#881337', marginBottom:6 }}>Anemia — Khoon Ki Kami</h3>
                <p style={{ fontFamily:'var(--font-body)', fontSize:12, color:'#9f1239', marginBottom:10, fontWeight:500 }}>Thakaan • Chakkar • Saas phoolna</p>
                <p style={{ fontFamily:'var(--font-body)', fontSize:12, color:'#be123c', lineHeight:1.6, marginBottom:16 }}>977 reports mein 483 mein Hemoglobin LOW</p>
                <span style={{ fontFamily:'var(--font-body)', fontSize:12, fontWeight:700, color:'#e11d48' }}>Hemoglobin samjho →</span>
              </Link>

              {/* Card 2 — Vitamin D */}
              <Link href="/blog/vitamin-d-ki-kami" className="illness-card" style={{ background:'linear-gradient(135deg,#fffbeb,#fef3c7)', border:'1px solid #fde68a' }}>
                <p style={{ fontFamily:'var(--font-display)', fontSize:48, fontWeight:400, color:'#d97706', lineHeight:1, marginBottom:8 }}>69%</p>
                <h3 style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:400, color:'#78350f', marginBottom:6 }}>Vitamin D Deficiency</h3>
                <p style={{ fontFamily:'var(--font-body)', fontSize:12, color:'#92400e', marginBottom:10, fontWeight:500 }}>Haddi dard • Thakaan • Mood swing</p>
                <p style={{ fontFamily:'var(--font-body)', fontSize:12, color:'#b45309', lineHeight:1.6, marginBottom:16 }}>29 mein se 20 reports mein Vitamin D LOW</p>
                <span style={{ fontFamily:'var(--font-body)', fontSize:12, fontWeight:700, color:'#d97706' }}>Vitamin D samjho →</span>
              </Link>

              {/* Card 3 — Thyroid */}
              <Link href="/blog/thyroid-tsh-report-hindi" className="illness-card" style={{ background:'linear-gradient(135deg,#faf5ff,#f3e8ff)', border:'1px solid #e9d5ff' }}>
                <p style={{ fontFamily:'var(--font-display)', fontSize:48, fontWeight:400, color:'#7c3aed', lineHeight:1, marginBottom:8 }}>29%</p>
                <h3 style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:400, color:'#4c1d95', marginBottom:6 }}>Thyroid — TSH Abnormal</h3>
                <p style={{ fontFamily:'var(--font-body)', fontSize:12, color:'#5b21b6', marginBottom:6, fontWeight:500 }}>Weight gain • Baal girna • Thakaan</p>
                <div style={{ display:'inline-block', background:'rgba(244,114,182,0.15)', border:'1px solid rgba(244,114,182,0.3)', borderRadius:100, padding:'2px 10px', marginBottom:8 }}>
                  <span style={{ fontFamily:'var(--font-body)', fontSize:11, color:'#ec4899', fontWeight:600 }}>💕 Mahilaon mein zyada</span>
                </div>
                <p style={{ fontFamily:'var(--font-body)', fontSize:12, color:'#6d28d9', lineHeight:1.6, marginBottom:16 }}>119 thyroid reports mein 38 abnormal</p>
                <span style={{ fontFamily:'var(--font-body)', fontSize:12, fontWeight:700, color:'#7c3aed' }}>Thyroid samjho →</span>
              </Link>

              {/* Card 4 — Diabetes */}
              <Link href="/blog/hba1c-kya-hota-hai" className="illness-card" style={{ background:'linear-gradient(135deg,#eff6ff,#dbeafe)', border:'1px solid #bfdbfe' }}>
                <p style={{ fontFamily:'var(--font-display)', fontSize:48, fontWeight:400, color:'#1d4ed8', lineHeight:1, marginBottom:8 }}>48%</p>
                <h3 style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:400, color:'#1e3a8a', marginBottom:6 }}>Diabetes — Blood Sugar High</h3>
                <p style={{ fontFamily:'var(--font-body)', fontSize:12, color:'#1e40af', marginBottom:10, fontWeight:500 }}>Silent disease • Pata nahi chalta</p>
                <p style={{ fontFamily:'var(--font-body)', fontSize:12, color:'#2563eb', lineHeight:1.6, marginBottom:16 }}>46 HbA1c reports mein 22 HIGH</p>
                <span style={{ fontFamily:'var(--font-body)', fontSize:12, fontWeight:700, color:'#1d4ed8' }}>HbA1c samjho →</span>
              </Link>

              {/* Card 5 — Liver */}
              <Link href="/upload" className="illness-card" style={{ background:'linear-gradient(135deg,#fff7ed,#ffedd5)', border:'1px solid #fed7aa' }}>
                <p style={{ fontFamily:'var(--font-display)', fontSize:48, fontWeight:400, color:'#ea580c', lineHeight:1, marginBottom:8 }}>27%</p>
                <h3 style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:400, color:'#7c2d12', marginBottom:6 }}>Liver — SGPT High</h3>
                <p style={{ fontFamily:'var(--font-body)', fontSize:12, color:'#9a3412', marginBottom:10, fontWeight:500 }}>Fatty liver • Kaafi common India mein</p>
                <p style={{ fontFamily:'var(--font-body)', fontSize:12, color:'#c2410c', lineHeight:1.6, marginBottom:16 }}>280 liver reports mein 76 mein SGPT HIGH</p>
                <span style={{ fontFamily:'var(--font-body)', fontSize:12, fontWeight:700, color:'#ea580c' }}>Liver report samjho →</span>
              </Link>

              {/* Card 6 — B12 */}
              <Link href="/upload" className="illness-card" style={{ background:'linear-gradient(135deg,#f0fdf4,#dcfce7)', border:'1px solid #bbf7d0' }}>
                <p style={{ fontFamily:'var(--font-display)', fontSize:48, fontWeight:400, color:'#16a34a', lineHeight:1, marginBottom:8 }}>34%</p>
                <h3 style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:400, color:'#14532d', marginBottom:6 }}>Vitamin B12 Deficiency</h3>
                <p style={{ fontFamily:'var(--font-body)', fontSize:12, color:'#166534', marginBottom:10, fontWeight:500 }}>Numbness • Memory weak • Energy kam</p>
                <p style={{ fontFamily:'var(--font-body)', fontSize:12, color:'#15803d', lineHeight:1.6, marginBottom:16 }}>32 reports mein 11 mein B12 LOW</p>
                <span style={{ fontFamily:'var(--font-body)', fontSize:12, fontWeight:700, color:'#16a34a' }}>B12 report samjho →</span>
              </Link>
            </div>

            <div style={{ textAlign:'center', marginTop:40 }}>
              <Link href="/upload" className="btn-primary" style={{ fontSize:15, padding:'15px 36px' }}>📋 Apni report check karo →</Link>
            </div>
          </div>
        </section>

        {/* ══ WOMEN HEALTH ══ */}
        <section id="women-health" aria-label="Women Health Reports in Hindi" className="r-pad" style={{ padding:'80px 24px', background:'linear-gradient(135deg,#fff0f3,#fdf2ff)' }}>
          <div style={{ maxWidth:860, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:44 }}>
              <h2 className="sec-h2" style={{ fontFamily:'var(--font-display)', fontSize:38, fontWeight:300, color:'#831843', lineHeight:1.2, marginBottom:12 }}>
                Mahilaon ke liye —{' '}<em style={{ fontStyle:'italic', color:'#ec4899' }}>Specially Helpful 💕</em>
              </h2>
              <p style={{ fontFamily:'var(--font-body)', fontSize:15, color:'#9d174d', maxWidth:480, margin:'0 auto', lineHeight:1.7 }}>
                Thyroid, PCOD, Anemia, Pregnancy — in reports ko samajhna ab aasaan hai
              </p>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:16 }} className="r-col-2">
              <Link href="/blog/thyroid-tsh-report-hindi" className="women-card" style={{ background:'linear-gradient(135deg,#faf5ff,#f3e8ff)', border:'1px solid #e9d5ff' }}>
                <div style={{ fontSize:32, marginBottom:12 }} aria-label="Thyroid butterfly">🦋</div>
                <h3 style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:400, color:'#4c1d95', marginBottom:8 }}>Thyroid Report</h3>
                <p style={{ fontFamily:'var(--font-body)', fontSize:13, color:'#6d28d9', lineHeight:1.65 }}>TSH high ya low — kya matlab hai? Hindi mein samjho.</p>
              </Link>

              <Link href="/blog/hemoglobin-kam-hona" className="women-card" style={{ background:'linear-gradient(135deg,#fff1f2,#ffe4e6)', border:'1px solid #fecdd3' }}>
                <div style={{ fontSize:32, marginBottom:12 }} aria-label="Blood drop">🩸</div>
                <h3 style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:400, color:'#881337', marginBottom:8 }}>Anemia / Khoon Ki Kami</h3>
                <p style={{ fontFamily:'var(--font-body)', fontSize:13, color:'#9f1239', lineHeight:1.65 }}>Hemoglobin low — pregnant ya normal? Farak samjho.</p>
              </Link>

              <Link href="/upload" className="women-card" style={{ background:'linear-gradient(135deg,#fff7ed,#ffedd5)', border:'1px solid #fed7aa' }}>
                <div style={{ fontSize:32, marginBottom:12 }} aria-label="PCOD flower">🌸</div>
                <h3 style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:400, color:'#7c2d12', marginBottom:8 }}>PCOD / Hormones</h3>
                <p style={{ fontFamily:'var(--font-body)', fontSize:13, color:'#9a3412', lineHeight:1.65 }}>Hormone report kaise padhein? Complete guide Hindi mein.</p>
              </Link>

              <Link href="/upload" className="women-card" style={{ background:'linear-gradient(135deg,#f0fdf4,#dcfce7)', border:'1px solid #bbf7d0' }}>
                <div style={{ fontSize:32, marginBottom:12 }} aria-label="Pregnancy">🤱</div>
                <h3 style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:400, color:'#14532d', marginBottom:8 }}>Pregnancy Reports</h3>
                <p style={{ fontFamily:'var(--font-body)', fontSize:13, color:'#166534', lineHeight:1.65 }}>Prenatal reports Hindi mein — har value ka matlab.</p>
              </Link>
            </div>

            <div style={{ textAlign:'center', marginTop:36 }}>
              <Link href="/upload" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'15px 36px', borderRadius:'var(--radius-md)', background:'linear-gradient(135deg,#ec4899,#db2777)', color:'white', fontFamily:'var(--font-body)', fontSize:15, fontWeight:700, textDecoration:'none', boxShadow:'0 8px 24px rgba(219,39,119,0.3)', transition:'all .2s' }}>
                Apni report abhi upload karo — Free 🇮🇳
              </Link>
            </div>
            <p style={{ textAlign:'center', fontFamily:'var(--font-body)', fontSize:11, color:'#9d174d', marginTop:16, opacity:.7 }}>
              * Sirf educational purpose ke liye. Koi bhi health decision apne doctor se salah lekar lein.
            </p>
          </div>
        </section>

        {/* ══ VISUAL DEMO ══ */}
        <section className="r-pad demo-section" style={{ padding:'96px 24px', background:'var(--canvas)' }}>
          <div style={{ maxWidth:920, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:52 }}>
              <p className="t-overline" style={{ marginBottom:12 }}>Live Demo</p>
              <h2 className="sec-h2" style={{ fontFamily:'var(--font-display)', fontSize:40, fontWeight:300, color:'var(--ink)', lineHeight:1.2, marginBottom:12 }}>
                Dekho kya hota hai{' '}<em style={{ fontStyle:'italic', color:'var(--teal-600)' }}>30 seconds mein</em>
              </h2>
              <p style={{ fontFamily:'var(--font-body)', fontSize:15, color:'var(--ink-ghost)' }}>Real report → Real Hindi explanation. Yeh sirf ek sample hai.</p>
            </div>

            <div className="demo-split" style={{ display:'flex', gap:16, alignItems:'stretch' }}>
              {/* LEFT */}
              <div style={{ flex:1, minWidth:280, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', overflow:'hidden', boxShadow:'var(--shadow-lg)', position:'relative' }}>
                <div className="scan-beam" />
                <div style={{ background:'linear-gradient(135deg,#1e3a5f,#1e3a8a)', padding:'20px 24px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                    <div>
                      <p style={{ fontFamily:'var(--font-body)', fontSize:13, fontWeight:700, color:'white', margin:0 }}>SRL Diagnostics</p>
                      <p style={{ fontFamily:'var(--font-body)', fontSize:10, color:'rgba(255,255,255,0.5)', margin:0 }}>Complete Blood Count (CBC)</p>
                    </div>
                    <div style={{ background:'rgba(255,255,255,0.1)', padding:'4px 10px', borderRadius:6 }}>
                      <p style={{ fontFamily:'var(--font-body)', fontSize:10, color:'rgba(255,255,255,0.6)', margin:0 }}>Patient: Ramesh K.</p>
                      <p style={{ fontFamily:'var(--font-body)', fontSize:10, color:'rgba(255,255,255,0.6)', margin:0 }}>Age: 42 | Male</p>
                    </div>
                  </div>
                </div>
                <div style={{ padding:'16px 0' }}>
                  {[
                    {name:'Hemoglobin', val:'9.2',      unit:'g/dL',   ref:'13.0–17.0',        status:'low'   },
                    {name:'WBC Count',  val:'11,200',   unit:'/µL',    ref:'4,000–11,000',      status:'high'  },
                    {name:'Platelets',  val:'1,85,000', unit:'/µL',    ref:'1,50,000–4,00,000', status:'normal'},
                    {name:'RBC Count',  val:'3.4',      unit:'mil/µL', ref:'4.5–5.5',           status:'low'   },
                    {name:'MCV',        val:'72',       unit:'fL',     ref:'80–100',             status:'low'   },
                    {name:'MCH',        val:'22.1',     unit:'pg',     ref:'27–33',              status:'low'   },
                    {name:'Neutrophils',val:'74',       unit:'%',      ref:'40–70',              status:'high'  },
                    {name:'Lymphocytes',val:'18',       unit:'%',      ref:'20–40',              status:'low'   },
                  ].map((row,i) => (
                    <div key={i} className="report-row" style={{ display:'grid', gridTemplateColumns:'1fr auto auto', alignItems:'center', padding:'9px 24px', gap:8, borderBottom:'1px solid var(--border-light)', background:row.status!=='normal'?(row.status==='low'?'rgba(59,130,246,0.03)':'rgba(239,68,68,0.03)'):'transparent' }}>
                      <div>
                        <p style={{ fontFamily:'var(--font-body)', fontSize:12, fontWeight:600, color:'var(--ink)', margin:0 }}>{row.name}</p>
                        <p style={{ fontFamily:'var(--font-body)', fontSize:10, color:'var(--ink-ghost)', margin:0 }}>Ref: {row.ref} {row.unit}</p>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <p style={{ fontFamily:'var(--font-body)', fontSize:13, fontWeight:700, margin:0, color:row.status==='normal'?'var(--teal-600)':row.status==='low'?'#3b82f6':'#ef4444' }}>{row.val}</p>
                        <p style={{ fontFamily:'var(--font-body)', fontSize:10, color:'var(--ink-ghost)', margin:0 }}>{row.unit}</p>
                      </div>
                      <div style={{ width:28, height:20, borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center', background:row.status==='normal'?'#dcfce7':row.status==='low'?'#dbeafe':'#fee2e2', fontSize:10, fontWeight:700, color:row.status==='normal'?'#16a34a':row.status==='low'?'#2563eb':'#dc2626' }}>
                        {row.status==='normal'?'✓':row.status==='low'?'↓':'↑'}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ padding:'12px 24px', background:'var(--teal-50)', borderTop:'1px solid var(--teal-100)', display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--teal-600)', animation:'pulse-dot 1s ease-in-out infinite' }} />
                  <span style={{ fontFamily:'var(--font-body)', fontSize:11, fontWeight:700, color:'var(--teal-600)' }}>AI Scan Ho Raha Hai...</span>
                </div>
              </div>

              <div className="demo-arrow" style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'0 8px', flexShrink:0 }}>
                <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--teal-600)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, boxShadow:'var(--shadow-teal)', animation:'glow-pulse 2s ease-in-out infinite' }}>→</div>
              </div>

              {/* RIGHT */}
              <div style={{ flex:1, minWidth:280, background:'linear-gradient(160deg,var(--dark-900),var(--dark-800))', border:'1px solid rgba(13,148,136,0.2)', borderRadius:'var(--radius-xl)', overflow:'hidden', boxShadow:'0 20px 60px rgba(13,148,136,0.12)' }}>
                <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:32, height:32, borderRadius:10, background:'linear-gradient(135deg,var(--teal-600),#0891b2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🤖</div>
                  <div>
                    <p style={{ fontFamily:'var(--font-body)', fontSize:12, fontWeight:700, color:'white', margin:0 }}>Sehat24 AI</p>
                    <p style={{ fontFamily:'var(--font-body)', fontSize:10, color:'var(--teal-400)', margin:0, display:'flex', alignItems:'center', gap:4 }}><span className="dot-live" style={{ width:5, height:5 }} /> Analysis complete</p>
                  </div>
                </div>
                <div className="demo-right-body" style={{ padding:'20px' }}>
                  <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:12, padding:'12px 14px', marginBottom:12, animation:'reveal-text 0.5s ease 0.2s both' }}>
                    <p style={{ fontFamily:'var(--font-body)', fontSize:11, fontWeight:700, color:'#f87171', margin:'0 0 4px', textTransform:'uppercase', letterSpacing:'.06em' }}>⚠️ Dhyan Do</p>
                    <p style={{ fontFamily:'var(--font-body)', fontSize:13, color:'rgba(255,255,255,0.8)', margin:0, lineHeight:1.6 }}>
                      Tumhari report mein <strong style={{ color:'#f87171' }}>khoon ki kami (Anemia)</strong> ke signs dikh rahe hain. Ye abhi serious nahi hai, par doctor se milna chahiye.
                    </p>
                  </div>
                  {[
                    {icon:'🩸',label:'Hemoglobin — Bahut Kam',color:'#60a5fa',bg:'rgba(59,130,246,0.08)', border:'rgba(59,130,246,0.2)', text:'Tumhara hemoglobin 9.2 hai — normal 13 se upar hona chahiye. Iska matlab thakaan, chakkar, saas lene mein takleef ho sakti hai.',delay:'0.4s'},
                    {icon:'🔴',label:'WBC — Thoda Zyada',    color:'#f87171',bg:'rgba(239,68,68,0.08)',  border:'rgba(239,68,68,0.2)',  text:'White blood cells thodi badhi hain — 11,200. Ye body mein kisi infection ya inflammation ki nishani ho sakti hai.',          delay:'0.6s'},
                  ].map((item,i) => (
                    <div key={i} style={{ background:item.bg, border:`1px solid ${item.border}`, borderRadius:10, padding:'10px 12px', marginBottom:8, animation:`reveal-text 0.5s ease ${item.delay} both` }}>
                      <p style={{ fontFamily:'var(--font-body)', fontSize:11, fontWeight:700, color:item.color, margin:'0 0 3px' }}>{item.icon} {item.label}</p>
                      <p style={{ fontFamily:'var(--font-body)', fontSize:12, color:'rgba(255,255,255,0.65)', margin:0, lineHeight:1.55 }}>{item.text}</p>
                    </div>
                  ))}
                  <div style={{ borderRadius:10, padding:'10px 12px', background:'rgba(13,148,136,0.1)', border:'1px solid rgba(13,148,136,0.25)', animation:'reveal-text 0.5s ease 1s both' }}>
                    <p style={{ fontFamily:'var(--font-body)', fontSize:11, fontWeight:700, color:'var(--teal-400)', margin:'0 0 3px' }}>💡 Doctor Se Yeh Poochho</p>
                    <p style={{ fontFamily:'var(--font-body)', fontSize:12, color:'rgba(255,255,255,0.6)', margin:0, lineHeight:1.55 }}>&quot;Anemia ki wajah iron deficiency hai ya koi aur? Iron + B12 supplement chalega?&quot;</p>
                  </div>
                  <div style={{ animation:'reveal-text 0.5s ease 0.15s both' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:8, marginTop:12 }}>
                      <span style={{ fontSize:14 }}>🏃</span>
                      <p style={{ fontFamily:'var(--font-body)', fontSize:11, fontWeight:800, color:'#fb923c', margin:0, letterSpacing:'.07em', textTransform:'uppercase' }}>Lifestyle Tips</p>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                      {[
                        {icon:'🍳',tip:'Iron-rich khana roz khao',sub:'Palak, rajma, til, chane — roz plate mein raho'},
                        {icon:'🍋',tip:'Vitamin C saath lo',      sub:'Nimbu ya amla khane ke saath — iron 3x better absorb hoga'},
                      ].map((item,i) => (
                        <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:9, background:'rgba(251,146,60,0.06)', border:'1px solid rgba(251,146,60,0.14)', borderRadius:9, padding:'8px 10px', animation:`reveal-text 0.4s ease ${0.2+i*.1}s both` }}>
                          <span style={{ fontSize:16, flexShrink:0, marginTop:1 }}>{item.icon}</span>
                          <div>
                            <p style={{ fontFamily:'var(--font-body)', fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.85)', margin:'0 0 2px' }}>{item.tip}</p>
                            <p style={{ fontFamily:'var(--font-body)', fontSize:11, color:'rgba(255,255,255,0.42)', margin:0, lineHeight:1.4 }}>{item.sub}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ height:1, background:'rgba(255,255,255,0.05)', margin:'10px 0 8px', animation:'reveal-text 0.3s ease 0.6s both' }} />
                  <div style={{ animation:'reveal-text 0.5s ease 0.65s both' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:8 }}>
                      <span style={{ fontSize:14 }}>🌱</span>
                      <p style={{ fontFamily:'var(--font-body)', fontSize:11, fontWeight:800, color:'#4ade80', margin:0, letterSpacing:'.07em', textTransform:'uppercase' }}>Ayurvedic Suggestions</p>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                      {[
                        {herb:'Shatavari',hindi:'शतावरी',icon:'🌾',benefit:'Khoon badhata hai, anemia mein kaafi',how:'Subah khali pet — ghee ke saath',color:'#86efac',bg:'rgba(134,239,172,0.06)',border:'rgba(134,239,172,0.15)'},
                        {herb:'Punarnava',hindi:'पुनर्नवा',icon:'🍃',benefit:'WBC balance karta hai, inflammation kam',how:'Kadha banao — subah ek cup',color:'#6ee7b7',bg:'rgba(110,231,183,0.06)',border:'rgba(110,231,183,0.15)'},
                      ].map((item,i) => (
                        <div key={i} style={{ background:item.bg, border:`1px solid ${item.border}`, borderRadius:10, padding:'9px 11px', animation:`reveal-text 0.4s ease ${.7+i*.12}s both` }}>
                          <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:4 }}>
                            <span style={{ fontSize:15 }}>{item.icon}</span>
                            <div style={{ flex:1 }}>
                              <span style={{ fontFamily:'var(--font-body)', fontSize:12, fontWeight:800, color:item.color }}>{item.herb}</span>
                              <span style={{ fontFamily:'var(--font-body)', fontSize:11, color:'rgba(255,255,255,0.3)', marginLeft:6 }}>{item.hindi}</span>
                            </div>
                          </div>
                          <p style={{ fontFamily:'var(--font-body)', fontSize:11, color:'rgba(255,255,255,0.6)', margin:'0 0 3px', lineHeight:1.4 }}>✦ {item.benefit}</p>
                          <p style={{ fontFamily:'var(--font-body)', fontSize:10, color:'rgba(255,255,255,0.32)', margin:0 }}>📌 {item.how}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ textAlign:'center', marginTop:28 }}>
              <Link href="/upload" className="btn-primary" style={{ fontSize:15, padding:'15px 36px' }}>📋 Apni Report Upload Karo — Free</Link>
            </div>
          </div>
        </section>

        {/* ══ WHAT YOU GET (replaces Teen Steps) ══ */}
        <section className="r-pad" style={{ padding:'80px 24px', background:'var(--surface)' }}>
          <div style={{ maxWidth:920, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:48 }}>
              <p className="t-overline" style={{ marginBottom:12 }}>What You Get</p>
              <h2 className="sec-h2" style={{ fontFamily:'var(--font-display)', fontSize:40, fontWeight:300, color:'var(--ink)', lineHeight:1.15 }}>
                Kya milega{' '}<em style={{ fontStyle:'italic', color:'var(--teal-600)' }}>aapko?</em>
              </h2>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:40, alignItems:'center' }} className="r-col">
              {/* Left — feature list */}
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {[
                  'Har value Hindi mein explain',
                  'Normal/Abnormal clearly marked',
                  'Doctor se kya poochhe — ready',
                  'Lifestyle tips — Indian foods',
                  'Ayurvedic suggestions',
                  'Urgent alerts — jo dhyan dena chahiye',
                  'PDF download — doctor ke liye',
                  'Report history — track karo',
                ].map((item,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:24, height:24, borderRadius:'50%', background:'var(--teal-50)', border:'1.5px solid var(--teal-100)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <span style={{ fontSize:12, color:'var(--teal-600)', fontWeight:700 }}>✅</span>
                    </div>
                    <span style={{ fontFamily:'var(--font-body)', fontSize:14, color:'var(--ink-muted)', fontWeight:500 }}>{item}</span>
                  </div>
                ))}
                <div style={{ marginTop:8 }}>
                  <Link href="/upload" className="btn-primary">📋 Free mein try karo →</Link>
                </div>
              </div>

              {/* Right — mini CBC demo */}
              <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', overflow:'hidden', boxShadow:'var(--shadow-lg)', position:'relative' }}>
                <div className="scan-beam" />
                <div style={{ background:'linear-gradient(135deg,#1e3a5f,#1e3a8a)', padding:'14px 20px' }}>
                  <p style={{ fontFamily:'var(--font-body)', fontSize:12, fontWeight:700, color:'white', margin:0 }}>CBC Report — Hindi Analysis</p>
                  <p style={{ fontFamily:'var(--font-body)', fontSize:10, color:'rgba(255,255,255,0.5)', margin:0 }}>Sehat24 AI Processing...</p>
                </div>
                <div style={{ padding:'12px 0' }}>
                  {[
                    {name:'Hemoglobin',    val:'9.2 g/dL',  status:'low',    hindi:'Bahut kam — Anemia ke signs'},
                    {name:'WBC Count',     val:'11,200 /µL', status:'high',   hindi:'Thoda zyada — infection check'},
                    {name:'Platelets',     val:'1,85,000',   status:'normal', hindi:'Bilkul theek hai ✓'},
                    {name:'Vitamin B12',   val:'142 pg/mL',  status:'low',    hindi:'Deficiency — supplement lo'},
                  ].map((row,i) => (
                    <div key={i} style={{ padding:'8px 18px', borderBottom:'1px solid var(--border-light)' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:2 }}>
                        <span style={{ fontFamily:'var(--font-body)', fontSize:12, fontWeight:600, color:'var(--ink)' }}>{row.name}</span>
                        <span style={{ fontFamily:'var(--font-body)', fontSize:12, fontWeight:700, color:row.status==='normal'?'var(--teal-600)':row.status==='low'?'#3b82f6':'#ef4444' }}>{row.val}</span>
                      </div>
                      <p style={{ fontFamily:'var(--font-body)', fontSize:11, color:row.status==='normal'?'var(--teal-600)':row.status==='low'?'#2563eb':'#dc2626', margin:0 }}>{row.hindi}</p>
                    </div>
                  ))}
                </div>
                <div style={{ padding:'10px 18px', background:'var(--teal-50)', borderTop:'1px solid var(--teal-100)', display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:7, height:7, borderRadius:'50%', background:'var(--teal-600)', animation:'pulse-dot 1s ease-in-out infinite' }} />
                  <span style={{ fontFamily:'var(--font-body)', fontSize:11, fontWeight:700, color:'var(--teal-600)' }}>Analysis Complete — PDF Ready</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ CORE FEATURES ══ */}
        <section className="r-pad" style={{ padding:'96px 24px', background:'var(--canvas)' }}>
          <div style={{ maxWidth:920, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:52 }}>
              <p className="t-overline" style={{ marginBottom:12 }}>Core Features</p>
              <h2 className="sec-h2" style={{ fontFamily:'var(--font-display)', fontSize:40, fontWeight:300, color:'var(--ink)', lineHeight:1.2 }}>
                Sirf samajhna nahi —{' '}<em style={{ fontStyle:'italic', color:'var(--teal-600)' }}>track karo, compare karo, save karo</em>
              </h2>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }} className="r-col">
              <div className="card feature-card" style={{ padding:'32px 28px', border:'1px solid var(--teal-100)', background:'white' }}>
                <div style={{ fontSize:40, marginBottom:20, display:'block' }} aria-label="Calendar">📅</div>
                <h3 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:400, color:'var(--ink)', marginBottom:10 }}>Report History</h3>
                <p style={{ fontFamily:'var(--font-body)', fontSize:13, color:'var(--ink-faint)', lineHeight:1.7, marginBottom:20 }}>6 mahine pehle ki CBC aur aaj ki — ek saath dekho. Koi bhi badlaav miss mat hone do.</p>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {['Saari purani reports ek jagah','Timeline view mein dekho','Download kabhi bhi, kahi bhi'].map((item,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:9 }}><span style={{ color:'var(--teal-600)', fontWeight:700, fontSize:12 }}>→</span><span style={{ fontFamily:'var(--font-body)', fontSize:13, color:'var(--ink-muted)' }}>{item}</span></div>
                  ))}
                </div>
                <div style={{ marginTop:24, padding:'12px', background:'var(--teal-50)', borderRadius:12, display:'flex', gap:6, alignItems:'center' }}>
                  {['Jan','Mar','Apr','Now'].map((m,i,arr) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:6, flex:1 }}>
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flex:1 }}>
                        <div style={{ width:i===arr.length-1?12:8, height:i===arr.length-1?12:8, borderRadius:'50%', background:i===arr.length-1?'var(--teal-600)':'var(--teal-100)', border:`2px solid ${i===arr.length-1?'var(--teal-600)':'var(--teal-400)'}`, marginBottom:4 }} />
                        <span style={{ fontFamily:'var(--font-body)', fontSize:9, color:'var(--ink-ghost)', fontWeight:600 }}>{m}</span>
                      </div>
                      {i<arr.length-1 && <div style={{ height:1, flex:1, background:'var(--teal-100)', marginBottom:14 }} />}
                    </div>
                  ))}
                </div>
              </div>
              <div className="card feature-card" style={{ padding:'32px 28px', border:'1px solid #bfdbfe', background:'white' }}>
                <div style={{ fontSize:40, marginBottom:20, display:'block' }} aria-label="Trend chart">📈</div>
                <h3 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:400, color:'var(--ink)', marginBottom:10 }}>Trend Comparison</h3>
                <p style={{ fontFamily:'var(--font-body)', fontSize:13, color:'var(--ink-faint)', lineHeight:1.7, marginBottom:20 }}>Hemoglobin badh raha hai ya gir raha hai? Sparkline graphs se ek second mein pata chalo.</p>
                <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:20 }}>
                  {['Har parameter ka trend','Color coded — green/red','AI summary of changes'].map((item,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:9 }}><span style={{ color:'#1d4ed8', fontWeight:700, fontSize:12 }}>→</span><span style={{ fontFamily:'var(--font-body)', fontSize:13, color:'var(--ink-muted)' }}>{item}</span></div>
                  ))}
                </div>
                <div style={{ background:'#eff6ff', borderRadius:12, padding:'12px 14px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <span style={{ fontFamily:'var(--font-body)', fontSize:10, fontWeight:700, color:'#1d4ed8' }}>Hemoglobin</span>
                    <span style={{ fontFamily:'var(--font-body)', fontSize:10, fontWeight:700, color:'#16a34a' }}>↑ Improving</span>
                  </div>
                  <svg viewBox="0 0 160 40" width="100%" height="40" style={{ overflow:'visible' }}>
                    <polyline points="0,35 40,32 80,28 120,18 160,10" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="trend-line" />
                    {[{x:0,y:35},{x:40,y:32},{x:80,y:28},{x:120,y:18},{x:160,y:10}].map((pt,i) => (
                      <circle key={i} cx={pt.x} cy={pt.y} r={i===4?4:2.5} fill={i===4?'#2563eb':'#93c5fd'} />
                    ))}
                  </svg>
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    {['Jan','Feb','Mar','Apr','Now'].map((m,i) => <span key={i} style={{ fontFamily:'var(--font-body)', fontSize:9, color:'#93c5fd', fontWeight:600 }}>{m}</span>)}
                  </div>
                </div>
              </div>
              <div className="card feature-card" style={{ padding:'32px 28px', border:'1px solid #fde68a', background:'white' }}>
                <div style={{ fontSize:40, marginBottom:20, display:'block' }} aria-label="Folder storage">🗂️</div>
                <h3 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:400, color:'var(--ink)', marginBottom:10 }}>Secure Storage</h3>
                <p style={{ fontFamily:'var(--font-body)', fontSize:13, color:'var(--ink-faint)', lineHeight:1.7, marginBottom:20 }}>Saari zindagi ki reports — ek jagah. Doctor ke paas jaate waqt poora history ready.</p>
                <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:20 }}>
                  {['PDF, photo — sab store hota','Doctor summary PDF banao','Family member add karo'].map((item,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:9 }}><span style={{ color:'#d97706', fontWeight:700, fontSize:12 }}>→</span><span style={{ fontFamily:'var(--font-body)', fontSize:13, color:'var(--ink-muted)' }}>{item}</span></div>
                  ))}
                </div>
                <div style={{ background:'#fffbeb', borderRadius:12, padding:'12px 14px', display:'flex', flexDirection:'column', gap:6 }}>
                  {[{name:'CBC_April_2025.pdf',date:'Apr 12',type:'🩸'},{name:'Thyroid_Jan_2025.pdf',date:'Jan 8',type:'💊'},{name:'Lipid_Oct_2024.pdf',date:'Oct 3',type:'🧪'}].map((file,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:14 }}>{file.type}</span>
                      <span style={{ fontFamily:'var(--font-body)', fontSize:11, color:'var(--ink-muted)', flex:1, fontWeight:500 }}>{file.name}</span>
                      <span style={{ fontFamily:'var(--font-body)', fontSize:10, color:'var(--ink-ghost)' }}>{file.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ HEALTH JOURNEY ══ */}
        <section className="r-pad" style={{ padding:'96px 24px', background:'linear-gradient(160deg,var(--dark-900),var(--dark-800))', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(13,148,136,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(13,148,136,0.04) 1px,transparent 1px)', backgroundSize:'44px 44px', pointerEvents:'none' }} />
          <div style={{ position:'absolute', top:-100, right:-100, width:500, height:500, background:'radial-gradient(circle,rgba(13,148,136,0.1),transparent 60%)', borderRadius:'50%', pointerEvents:'none' }} />
          <div style={{ maxWidth:920, margin:'0 auto', position:'relative', zIndex:1 }}>
            <div style={{ textAlign:'center', marginBottom:56 }}>
              <p className="t-overline" style={{ color:'rgba(255,255,255,0.3)', marginBottom:12 }}>Your Health Journey</p>
              <h2 className="sec-h2" style={{ fontFamily:'var(--font-display)', fontSize:40, fontWeight:300, color:'white', lineHeight:1.2, marginBottom:12 }}>
                Ek baar nahi —{' '}<em style={{ fontStyle:'italic', color:'var(--teal-400)' }}>hamesha track karo</em>
              </h2>
              <p style={{ fontFamily:'var(--font-body)', fontSize:15, color:'rgba(255,255,255,0.4)', maxWidth:460, margin:'0 auto' }}>Sehat sirf ek report nahi hai. Yeh ek journey hai. Sehat24 tumhara lifelong health companion hai.</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:2 }} className="r-col-2">
              {[
                {step:'1',icon:'📋',title:'Pehli Report', sub:'Baseline samjho',   color:'var(--teal-600)'},
                {step:'2',icon:'📅',title:'Regular Upload',sub:'Track changes',    color:'#3b82f6'},
                {step:'3',icon:'📈',title:'Trends Dekho',  sub:'Patterns pakdo',   color:'#8b5cf6'},
                {step:'4',icon:'🏥',title:'Doctor Ready',  sub:'History leke jao', color:'#f59e0b'},
              ].map((s,i) => (
                <div key={i} style={{ textAlign:'center', padding:'24px 16px', position:'relative' }}>
                  {i<3 && <div className="r-hide" style={{ position:'absolute', top:'38px', left:'60%', right:'-40%', height:1, background:'linear-gradient(90deg,rgba(255,255,255,0.15),transparent)', zIndex:0 }} />}
                  <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(255,255,255,0.04)', border:'1.5px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, margin:'0 auto 16px', position:'relative', zIndex:1 }}>
                    {s.icon}
                    <div style={{ position:'absolute', bottom:-2, right:-2, width:20, height:20, borderRadius:'50%', background:s.color, border:'2px solid var(--dark-900)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:800, color:'white' }}>{s.step}</div>
                  </div>
                  <p style={{ fontFamily:'var(--font-body)', fontSize:14, fontWeight:700, color:'rgba(255,255,255,0.85)', margin:'0 0 4px' }}>{s.title}</p>
                  <p style={{ fontFamily:'var(--font-body)', fontSize:12, color:'rgba(255,255,255,0.35)' }}>{s.sub}</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop:48, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'var(--radius-xl)', padding:'28px 32px', display:'flex', gap:20, alignItems:'flex-start', flexWrap:'wrap' }}>
              <div style={{ width:48, height:48, borderRadius:'50%', background:'rgba(13,148,136,0.2)', border:'2px solid rgba(13,148,136,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>👨‍👩‍👧</div>
              <div style={{ flex:1, minWidth:220 }}>
                <p style={{ fontFamily:'var(--font-body)', fontSize:14, color:'rgba(255,255,255,0.7)', lineHeight:1.8, margin:'0 0 12px', fontStyle:'italic' }}>
                  &quot;Pichle 6 mahine ki reports compare karke pata chala sugar slowly badh rahi thi. Doctor ko dikhaya — unhone kaha <span style={{ color:'var(--teal-400)', fontStyle:'normal', fontWeight:600 }}>pehle hi aa gaye, ab easily control hoga</span>. Sehat24 ne pakad liya.&quot;
                </p>
                <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                  <p style={{ fontFamily:'var(--font-body)', fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.5)', margin:0 }}>Milan Kumar, Noida</p>
                  <p style={{ color:'#f59e0b', fontSize:14, margin:0 }}>★★★★★</p>
                </div>
              </div>
            </div>
            <div style={{ textAlign:'center', marginTop:40 }}>
              <Link href="/upload" className="btn-primary" style={{ padding:'15px 36px', fontSize:15 }}>📋 Apni Journey Shuru Karo — Free</Link>
            </div>
          </div>
        </section>

        {/* ══ REPORT TYPES ══ */}
        <section id="report-types" aria-label="Supported Medical Report Types" className="r-pad" style={{ padding:'80px 24px', background:'var(--surface)' }}>
          <div style={{ maxWidth:860, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:40 }}>
              <p className="t-overline" style={{ marginBottom:12 }}>Supported Reports</p>
              <h2 className="sec-h2" style={{ fontFamily:'var(--font-display)', fontSize:36, fontWeight:300, color:'var(--ink)' }}>
                Har report.{' '}<em style={{ fontStyle:'italic', color:'var(--teal-600)' }}>Har test.</em>
              </h2>
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center' }}>
              {[
                ['🩸','CBC / Blood Test','/blog/cbc-report-hindi-mein'],
                ['🫀','Cardiac / ECG','/upload'],
                ['🧠','MRI / CT Scan','/upload'],
                ['🦴','X-Ray','/upload'],
                ['🫁','Ultrasound','/upload'],
                ['🔬','Pathology','/upload'],
                ['💊','Thyroid','/blog/thyroid-tsh-report-hindi'],
                ['🩺','LFT / KFT','/upload'],
                ['📊','HbA1c / Diabetes','/blog/hba1c-kya-hota-hai'],
                ['🧪','Lipid Profile','/upload'],
                ['☀️','Vitamin D / B12','/blog/vitamin-d-ki-kami'],
                ['📄','Doctor Reports','/upload'],
              ].map(([icon,name,href],i) => (
                <Link key={i} href={href} className="report-pill">
                  <span style={{ fontSize:16 }}>{icon}</span>
                  <span style={{ fontFamily:'var(--font-body)', fontSize:13, fontWeight:600, color:'var(--ink-muted)' }}>{name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ══ MEDICINE CHAT ══ */}
        <section className="r-pad" style={{ padding:'96px 24px', background:'var(--canvas)' }}>
          <div style={{ maxWidth:860, margin:'0 auto' }}>
            <div className="chat-card" style={{ background:'linear-gradient(150deg,var(--dark-900) 0%,var(--dark-800) 100%)', borderRadius:'var(--radius-xl)', padding:'52px 48px', position:'relative', overflow:'hidden', boxShadow:'0 24px 64px rgba(0,0,0,0.2)' }}>
              <div style={{ position:'absolute', top:-80, right:-80, width:360, height:360, background:'radial-gradient(circle,rgba(13,148,136,0.18),transparent 65%)', borderRadius:'50%', pointerEvents:'none' }} />
              <div style={{ display:'flex', gap:52, alignItems:'center', flexWrap:'wrap', position:'relative', zIndex:1 }}>
                <div style={{ flex:1, minWidth:260 }}>
                  <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(13,148,136,0.18)', border:'1px solid rgba(13,148,136,0.35)', color:'var(--teal-400)', fontSize:11, fontWeight:700, padding:'5px 14px', borderRadius:100, marginBottom:24, letterSpacing:'.07em' }}>✨ NEW FEATURE</div>
                  <h2 className="chat-h2" style={{ fontFamily:'var(--font-display)', fontSize:36, fontWeight:300, color:'white', marginBottom:16, lineHeight:1.2 }}>Medicine AI Chat</h2>
                  <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:32 }}>
                    {[{icon:'💊',text:'Medicine photo upload karo — identify karo'},{icon:'⚠️',text:'Side effects Hindi mein samjho'},{icon:'🔄',text:'2 medicines saath mein safe? — poochho'}].map((item,i) => (
                      <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                        <span style={{ fontSize:18, flexShrink:0 }}>{item.icon}</span>
                        <span style={{ fontFamily:'var(--font-body)', fontSize:14, color:'rgba(255,255,255,0.65)', lineHeight:1.5 }}>{item.text}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/chat" className="btn-primary">💊 Free mein poochho →</Link>
                </div>
                <div className="r-hide" style={{ width:252, flexShrink:0 }}>
                  <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:'16px', backdropFilter:'blur(12px)' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14, paddingBottom:12, borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ width:32, height:32, borderRadius:10, background:'linear-gradient(135deg,var(--teal-600),#0891b2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>💊</div>
                      <div>
                        <p style={{ fontFamily:'var(--font-body)', color:'white', fontWeight:700, fontSize:12, margin:0 }}>Medicine AI</p>
                        <p style={{ fontFamily:'var(--font-body)', color:'var(--teal-400)', fontSize:10, margin:0, display:'flex', alignItems:'center', gap:4 }}><span className="dot-live" style={{ width:5, height:5 }} /> Online</p>
                      </div>
                    </div>
                    {[{r:'user',t:'Metformin kab leni hai?'},{r:'ai',t:'Khane ke saath lo — subah aur raat. Khali pet nausea hota hai.'},{r:'user',t:'Side effects?'},{r:'ai',t:'Thoda nausea initially — chal jaata hai. B12 regularly check karao.'}].map((msg,i) => (
                      <div key={i} style={{ display:'flex', justifyContent:msg.r==='user'?'flex-end':'flex-start', marginBottom:7 }}>
                        <div style={{ maxWidth:'82%', padding:'8px 11px', borderRadius:msg.r==='user'?'11px 11px 3px 11px':'11px 11px 11px 3px', background:msg.r==='user'?'var(--teal-600)':'rgba(255,255,255,0.07)', fontFamily:'var(--font-body)', fontSize:11, lineHeight:1.55, color:msg.r==='user'?'white':'rgba(255,255,255,0.65)' }}>{msg.t}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ STATS ══ */}
        <section className="r-pad" style={{ padding:'72px 24px', background:'var(--surface)' }}>
          <div style={{ maxWidth:860, margin:'0 auto' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }} className="r-col-2">
              {[{n:'500M+',l:'Indians get medical reports yearly',i:'🇮🇳'},{n:'30 sec',l:'Average analysis time',i:'⚡'},{n:'100%',l:'Free — always',i:'💯'},{n:'22+',l:'Indian languages — coming soon',i:'🗣️'}].map((s,i) => (
                <div key={i} className="card" style={{ padding:'24px 16px', textAlign:'center' }}>
                  <div style={{ fontSize:24, marginBottom:10 }}>{s.i}</div>
                  <p style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:400, color:'var(--teal-600)', marginBottom:4, lineHeight:1 }}>{s.n}</p>
                  <p style={{ fontFamily:'var(--font-body)', fontSize:11, color:'var(--ink-ghost)', lineHeight:1.5 }}>{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ COMPETITOR ══ */}
        <section className="r-pad" style={{ padding:'80px 24px', background:'linear-gradient(150deg,var(--dark-900),var(--dark-800))', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(13,148,136,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(13,148,136,0.04) 1px,transparent 1px)', backgroundSize:'44px 44px', pointerEvents:'none' }} />
          <div style={{ maxWidth:860, margin:'0 auto', textAlign:'center', position:'relative', zIndex:1 }}>
            <p className="t-overline" style={{ color:'rgba(255,255,255,0.25)', marginBottom:20 }}>The Gap We Fill</p>
            <h2 className="sec-h2" style={{ fontFamily:'var(--font-display)', fontSize:36, fontWeight:300, color:'white', marginBottom:48, lineHeight:1.3 }}>
              ChatGPT Health launched Jan 2026.<br />
              <em style={{ fontStyle:'italic', color:'var(--teal-400)' }}>India is not on their roadmap. We are.</em>
            </h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }} className="r-col">
              {[
                {n:'ChatGPT Health',items:['US only','No Hindi','No Indian labs','No history'],hl:false},
                {n:'Practo / 1mg', items:['Doctor booking','Pharmacy only','Zero AI','No reports'],hl:false},
                {n:'Sehat24 ✅',   items:['Built for India','Indian labs + Hindi','History + trends','Completely free'],hl:true},
              ].map((c,i) => (
                <div key={i} style={{ background:c.hl?'linear-gradient(135deg,var(--teal-600),#0891b2)':'rgba(255,255,255,0.04)', border:`1px solid ${c.hl?'transparent':'rgba(255,255,255,0.07)'}`, borderRadius:'var(--radius-lg)', padding:'24px 20px', textAlign:'left' }}>
                  <p style={{ fontFamily:'var(--font-body)', fontSize:14, fontWeight:700, color:c.hl?'white':'rgba(255,255,255,0.35)', marginBottom:14 }}>{c.n}</p>
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {c.items.map((item,j) => (
                      <div key={j} style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:12, color:c.hl?'rgba(255,255,255,0.7)':'rgba(255,255,255,0.2)', flexShrink:0 }}>{c.hl?'✓':'✗'}</span>
                        <span style={{ fontFamily:'var(--font-body)', fontSize:13, color:c.hl?'rgba(255,255,255,0.85)':'rgba(255,255,255,0.28)', fontWeight:c.hl?500:400 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ SCROLLING TESTIMONIALS ══ */}
        <section id="testimonials" aria-label="User Testimonials" style={{ padding:'72px 0', background:'linear-gradient(160deg,var(--dark-900),var(--dark-800))', overflow:'hidden' }}>
          <div style={{ textAlign:'center', marginBottom:36, padding:'0 24px' }}>
            <p style={{ fontFamily:'var(--font-body)', fontSize:11, fontWeight:700, color:'var(--teal-400)', letterSpacing:'.1em', textTransform:'uppercase', marginBottom:10 }}>Real Logon Ki Baat</p>
            <h2 className="sec-h2" style={{ fontFamily:'var(--font-display)', fontSize:32, fontWeight:300, color:'white' }}>
              Lakho Indians ka <em style={{ fontStyle:'italic', color:'var(--teal-400)' }}>bharosa</em>
            </h2>
          </div>

          {/* Row 1 — scrolls left */}
          <div className="marquee-row1 marquee-outer" style={{ marginBottom:12 }}>
            <div className="marquee-track">
              {[...row1Testimonials, ...row1Testimonials].map((t, i) => (
                <div key={i} className="marquee-pill">
                  <span style={{ fontFamily:'var(--font-body)', fontSize:13, color:'rgba(255,255,255,0.8)' }}>{t.text}</span>
                  <span style={{ color:'#f59e0b', fontSize:13, flexShrink:0 }}>★★★★★</span>
                  <span style={{ fontFamily:'var(--font-body)', fontSize:11, color:'var(--teal-400)', flexShrink:0 }}>— {t.city}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2 — scrolls right */}
          <div className="marquee-row2 marquee-outer">
            <div className="marquee-track">
              {[...row2Testimonials, ...row2Testimonials].map((t, i) => (
                <div key={i} className="marquee-pill">
                  <span style={{ fontFamily:'var(--font-body)', fontSize:13, color:'rgba(255,255,255,0.8)' }}>{t.text}</span>
                  <span style={{ color:'#f59e0b', fontSize:13, flexShrink:0 }}>★★★★★</span>
                  <span style={{ fontFamily:'var(--font-body)', fontSize:11, color:'var(--teal-400)', flexShrink:0 }}>— {t.city}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ EXISTING TESTIMONIALS ══ */}
        <section className="r-pad" style={{ padding:'60px 24px', maxWidth:860, margin:'0 auto' }}>
          <p style={{ textAlign:'center', fontSize:11, fontWeight:700, color:'var(--teal-600)', letterSpacing:'.1em', textTransform:'uppercase', marginBottom:32 }}>Real Logon Ki Baat 🗣️</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:16 }}>
            {[
              {icon:'🔬',name:'Lab Technician',loc:'Delhi, India',text:'"Roz patients reports lekar aate hain aur koi samajh nahi paata. Maine khud apni full body report upload ki — 2 minute mein Hindi mein sab clear ho gaya. Ab main apne har patient ko Sehat24 recommend karta hoon."'},
              {icon:'👨‍👩‍👧',name:'Milan Kumar',   loc:'Noida, India',text:'"Pichle 6 mahine ki reports compare karke pata chala sugar slowly badh rahi thi. Sehat24 ne pakad liya — doctor ne bola pehle hi aa gaye."'},
            ].map((t,i) => (
              <div key={i} style={{ background:'var(--dark-800)', border:'1px solid rgba(13,148,136,0.25)', borderRadius:16, padding:24 }}>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
                  <div style={{ width:44, height:44, borderRadius:'50%', background:'rgba(13,148,136,0.15)', border:'2px solid rgba(13,148,136,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{t.icon}</div>
                  <div>
                    <p style={{ fontSize:14, fontWeight:700, color:'white', margin:0 }}>{t.name}</p>
                    <p style={{ fontSize:11, color:'var(--teal-400)', margin:0 }}>{t.loc} · Verified ✅</p>
                  </div>
                </div>
                <p style={{ fontSize:13, color:'rgba(255,255,255,0.65)', lineHeight:1.8, margin:'0 0 14px', fontStyle:'italic', fontFamily:'var(--font-body)' }}>{t.text}</p>
                <p style={{ color:'#f59e0b', fontSize:16, margin:0 }}>★★★★★</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══ FAQ ══ */}
        <section className="r-pad" style={{ padding:'80px 24px', background:'var(--canvas)' }}>
          <div style={{ maxWidth:680, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:48 }}>
              <p className="t-overline" style={{ marginBottom:12 }}>FAQ</p>
              <h2 className="sec-h2" style={{ fontFamily:'var(--font-display)', fontSize:36, fontWeight:300, color:'var(--ink)' }}>
                Aksar pooche jaane wale{' '}<em style={{ fontStyle:'italic', color:'var(--teal-600)' }}>sawaal</em>
              </h2>
            </div>
            <FAQSection />
          </div>
        </section>

        {/* ══ FINAL CTA ══ */}
        <section className="r-pad" style={{ padding:'112px 24px', background:'var(--canvas)', textAlign:'center' }}>
          <div style={{ maxWidth:540, margin:'0 auto' }}>
            <div style={{ fontSize:52, marginBottom:24 }} aria-label="Hospital">🏥</div>
            <h2 className="cta-h2" style={{ fontFamily:'var(--font-display)', fontSize:48, fontWeight:300, color:'var(--ink)', marginBottom:16, lineHeight:1.12 }}>
              Abhi try karo.<br /><em style={{ fontStyle:'italic', color:'var(--teal-600)' }}>Bilkul free hai.</em>
            </h2>
            <p style={{ fontFamily:'var(--font-body)', fontSize:15, color:'var(--ink-ghost)', marginBottom:44, lineHeight:1.75 }}>
              Koi signup nahi. Koi credit card nahi.<br />Bas report upload karo — aur samjho.
            </p>
            <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap', marginBottom:24 }}>
              <Link href="/upload" className="btn-primary" style={{ padding:'16px 36px', fontSize:15 }}>📋 Report Upload Karo — Free →</Link>
              <Link href="/chat" className="btn-outline" style={{ padding:'16px 28px', fontSize:15 }}>💊 Medicine Chat</Link>
            </div>
            <p style={{ fontFamily:'var(--font-body)', fontSize:12, color:'var(--ink-ghost)' }}>Works on mobile &nbsp;•&nbsp; No app download &nbsp;•&nbsp; Every Indian lab</p>
          </div>
        </section>

      </main>
    </>
  )
}
