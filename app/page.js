import Link from 'next/link'
import NavButtons from '@/components/NavButtons'

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', background: 'white', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Hero */}
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '80px 24px 64px', textAlign: 'center' }}>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: '#fffbeb', border: '1px solid #fde68a',
          color: '#d97706', fontSize: 12, fontWeight: 600,
          padding: '6px 14px', borderRadius: 20, marginBottom: 28
        }}>
          <span style={{ width: 6, height: 6, background: '#f59e0b', borderRadius: '50%', animation: 'pulse 2s infinite', display: 'inline-block' }} />
          Building India's Health Intelligence OS — This is 10% of what's coming
        </div>

        <h1 style={{
  fontSize: 52, fontWeight: 400, lineHeight: 1.15,
  color: '#0f172a', marginBottom: 20,
  fontFamily: "'DM Serif Display', serif"
}}>
  Woh medical report<br />
  jo samajh nahi aayi —<br />
  <span style={{ color: '#0d9488' }}>ab samjho.</span>
        </h1>

        <p style={{
          fontSize: 22, color: '#475569', marginBottom: 12,
          fontFamily: "'DM Serif Display', serif", lineHeight: 1.5
        }}>
          Sehat24 —<br />
          <span style={{ color: '#0d9488' }}>Apni sehat, apni bhasha mein.</span>
        </p>

        <p style={{ fontSize: 15, color: '#94a3b8', marginBottom: 8, lineHeight: 1.7, maxWidth: 560, margin: '0 auto 8px' }}>
          Blood test, MRI, X-Ray — koi bhi report upload karo.
          30 seconds mein Hindi mein sab explain ho jaata hai.
          Bilkul free.
        </p>

        <p style={{ fontSize: 13, color: '#0d9488', fontWeight: 600, marginBottom: 32 }}>
          Multilingual AI — Hindi • English • Tamil • Telugu • Marathi • Bengali
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/upload" style={{
              background: '#0d9488', color: 'white', fontWeight: 600,
              padding: '14px 32px', borderRadius: 14, fontSize: 15,
              textDecoration: 'none', transition: 'all 0.2s'
            }}>
              Analyze My Report — Free →
            </Link>
            <a href="#vision" style={{
              color: '#94a3b8', fontSize: 14,
              textDecoration: 'underline', textUnderlineOffset: 4,
              padding: '14px 8px'
            }}>
              See our full vision ↓
            </a>
          </div>
        </div>

        <p style={{ fontSize: 12, color: '#cbd5e1' }}>
          Works with SRL • Lal PathLabs • Apollo • Metropolis • Thyrocare • Any Indian lab
        </p>
      </section>

      {/* Stats strip */}
      <section style={{ background: '#f8fafc', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', padding: '32px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, textAlign: 'center' }}>
          {[
            { number: '500M+', label: 'Indians get medical reports yearly' },
            { number: '22+',   label: 'Indian languages we are targeting' },
            { number: 'Every', label: 'Blood test, scan, MRI, X-Ray report' },
            { number: '10%',   label: 'Of our final product — just the start' },
          ].map((stat, i) => (
            <div key={i}>
              <p style={{ fontSize: 32, fontWeight: 700, color: '#0d9488', marginBottom: 4, fontFamily: "'DM Serif Display', serif" }}>
                {stat.number}
              </p>
              <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Problem */}
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '64px 24px' }}>
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: 24, padding: '48px', textAlign: 'center'
        }}>
          <p style={{ fontSize: 11, color: '#f87171', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
            The Problem
          </p>
          <h2 style={{ fontSize: 28, color: '#0f172a', marginBottom: 16, fontFamily: "'DM Serif Display', serif", lineHeight: 1.3 }}>
            Reports are written for doctors.<br />
            <span style={{ color: '#dc2626' }}>Not for the people who need them most.</span>
          </h2>
          <p style={{ fontSize: 15, color: '#64748b', maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
            Doctors have 5 minutes per patient. Lab reports, scan findings,
            MRI results — all written in medical jargon nobody understands.
            This is not a convenience problem. It is a life and death problem.
          </p>
        </div>
      </section>

      {/* Report types */}
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px 64px' }}>
        <p style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 32 }}>
          Every report. Every test. Every finding.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { icon: '🩸', title: 'Blood Tests',   desc: 'CBC, LFT, KFT, HbA1c, Lipid Profile' },
            { icon: '🫀', title: 'Cardiac',        desc: 'ECG, Echo, Troponin reports' },
            { icon: '🧠', title: 'MRI / CT Scan',  desc: 'Radiology findings explained' },
            { icon: '🦴', title: 'X-Ray',          desc: 'Chest, bone, spine findings' },
            { icon: '🫁', title: 'Ultrasound',     desc: 'Abdomen, thyroid, pelvis' },
            { icon: '🔬', title: 'Pathology',      desc: 'Biopsy, histology reports' },
            { icon: '💊', title: 'Thyroid',        desc: 'TSH, T3, T4 hormonal reports' },
            { icon: '📄', title: 'Doctor Reports', desc: 'If doctor wrote it, we explain it' },
          ].map((item, i) => (
            <div key={i} style={{
              background: 'white', borderRadius: 16, padding: 16,
              border: '1px solid #f1f5f9', textAlign: 'center',
              transition: 'all 0.2s'
            }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{item.title}</h3>
              <p style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.5 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: '#f8fafc', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', padding: '64px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 40 }}>
            How it works
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { step: '01', icon: '📋', title: 'Upload your report', desc: 'PDF or photo. Blood test, MRI, X-Ray, scan report — from any Indian lab or hospital.' },
              { step: '02', icon: '🤖', title: 'AI reads everything', desc: 'Our AI reads every value and finding, checks against normal ranges, understands Indian health patterns.' },
              { step: '03', icon: '✅', title: 'You understand', desc: 'Every finding in plain language — in Hindi or English. What is normal. What needs attention.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'white', borderRadius: 20, padding: 24, border: '1px solid #f1f5f9', textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{item.icon}</div>
                <p style={{ fontSize: 10, color: '#cbd5e1', fontWeight: 700, marginBottom: 8 }}>{item.step}</p>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Multilingual */}
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: '#0d9488', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
          Multilingual AI
        </p>
        <h2 style={{ fontSize: 32, color: '#0f172a', marginBottom: 12, fontFamily: "'DM Serif Display', serif" }}>
          India speaks 22 languages.<br />
          <span style={{ color: '#0d9488' }}>So does Sehat24.</span>
        </h2>
        <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 32, maxWidth: 440, margin: '0 auto 32px', lineHeight: 1.7 }}>
          Your report is in English. But you think in Hindi, Tamil, or Marathi.
          Sehat24 explains your health in the language your heart understands.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
          {[
            { lang: 'Hindi',    live: true  },
            { lang: 'English',  live: true  },
            { lang: 'Tamil',    live: false },
            { lang: 'Telugu',   live: false },
            { lang: 'Marathi',  live: false },
            { lang: 'Bengali',  live: false },
            { lang: 'Gujarati', live: false },
            { lang: 'Kannada',  live: false },
            { lang: 'Punjabi',  live: false },
            { lang: 'Odia',     live: false },
          ].map((item, i) => (
            <span key={i} style={{
              fontSize: 13, padding: '8px 16px', borderRadius: 20, fontWeight: 600,
              background: item.live ? '#0d9488' : 'white',
              color: item.live ? 'white' : '#94a3b8',
              border: item.live ? 'none' : '1px solid #e2e8f0'
            }}>
              {item.lang}{!item.live && <span style={{ fontSize: 10, opacity: 0.6, marginLeft: 4 }}>soon</span>}
            </span>
          ))}
        </div>
      </section>

      {/* Vision */}
      <section id="vision" style={{ background: '#f8fafc', borderTop: '1px solid #f1f5f9', padding: '64px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{
              display: 'inline-block', background: '#fffbeb', border: '1px solid #fde68a',
              color: '#d97706', fontSize: 12, fontWeight: 600,
              padding: '6px 14px', borderRadius: 20, marginBottom: 16
            }}>
              This is 10% of what we are building
            </div>
            <h2 style={{ fontSize: 32, color: '#0f172a', fontFamily: "'DM Serif Display', serif", marginBottom: 12 }}>
              India's Health Intelligence OS
            </h2>
            <p style={{ fontSize: 14, color: '#94a3b8', maxWidth: 440, margin: '0 auto', lineHeight: 1.7 }}>
              Not just a report reader. A lifelong AI health companion
              for every Indian.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              {
                phase: 'V1 — Live Now', status: 'live', icon: '✅',
                items: ['Blood tests, MRI, X-Ray, scan reports — all explained', 'AI explains every finding in plain language', 'Hindi + English multilingual output', 'Urgent flags and doctor questions', 'India-specific diet and lifestyle advice']
              },
              {
                phase: 'V2 — In Development', status: 'building', icon: '🔄',
                items: ['Mobile OTP login — personal health OS', 'Report history and trend comparison', 'Track HbA1c, cholesterol over months', 'Personalized accumulated health advice', 'Family health management — 4 members']
              },
              {
                phase: 'V3 — Next Quarter', status: 'roadmap', icon: '📋',
                items: ['Voice output in 8 regional languages', 'WhatsApp — forward report, get explanation', 'Medication interaction checker', 'ABHA digital health ID integration', 'Pre-appointment doctor brief generator']
              },
              {
                phase: 'V4 — Scale', status: 'roadmap', icon: '🚀',
                items: ['Corporate wellness — ₹200/employee/month', 'Insurance company partnerships', 'Diagnostic lab API integrations', 'Southeast Asia and Middle East', 'Native Android + iOS app']
              },
            ].map((card, i) => (
              <div key={i} style={{
                background: card.status === 'live' ? '#f0fdfa' : card.status === 'building' ? '#fffbeb' : 'white',
                border: `1px solid ${card.status === 'live' ? '#99f6e4' : card.status === 'building' ? '#fde68a' : '#f1f5f9'}`,
                borderRadius: 20, padding: 24
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <span style={{ fontSize: 18 }}>{card.icon}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6,
                    background: card.status === 'live' ? '#0d9488' : card.status === 'building' ? '#f59e0b' : '#94a3b8',
                    color: 'white'
                  }}>
                    {card.phase}
                  </span>
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {card.items.map((item, j) => (
                    <li key={j} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#475569', lineHeight: 1.4 }}>
                      <span style={{ color: '#0d9488', flexShrink: 0 }}>→</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Competitor */}
      <section style={{ background: '#0f172a', padding: '64px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: '#475569', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 24 }}>
            The Gap We Fill
          </p>
          <h2 style={{ fontSize: 28, color: 'white', marginBottom: 40, fontFamily: "'DM Serif Display', serif", lineHeight: 1.4 }}>
            ChatGPT Health launched January 2026.<br />
            <span style={{ color: '#2dd4bf' }}>India is not on their roadmap. We are.</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {[
              { name: 'ChatGPT Health', gap: 'US only. No India. No Hindi. No Indian lab formats.', highlight: false },
              { name: 'Practo / 1mg',  gap: 'Doctor booking and pharmacy. Zero AI interpretation.', highlight: false },
              { name: 'Sehat24',       gap: 'Built for India. Indian labs. Indian languages. Indian families.', highlight: true },
            ].map((item, i) => (
              <div key={i} style={{
                background: item.highlight ? '#0d9488' : '#1e293b',
                border: `1px solid ${item.highlight ? '#2dd4bf' : '#334155'}`,
                borderRadius: 16, padding: 20, textAlign: 'left'
              }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: item.highlight ? 'white' : '#94a3b8', marginBottom: 8 }}>
                  {item.name}
                </p>
                <p style={{ fontSize: 12, color: item.highlight ? '#ccfbf1' : '#64748b', lineHeight: 1.6 }}>
                  {item.gap}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ maxWidth: 600, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 36, color: '#0f172a', marginBottom: 16, fontFamily: "'DM Serif Display', serif" }}>
          Try it right now.
        </h2>
        <p style={{ fontSize: 15, color: '#94a3b8', marginBottom: 32, lineHeight: 1.7 }}>
          Upload your blood test, scan report, or MRI finding.
          No signup. No credit card. Completely free to try.
        </p>
        <Link href="/upload" style={{
          display: 'inline-block', background: '#0d9488', color: 'white',
          fontWeight: 700, padding: '16px 40px', borderRadius: 16,
          fontSize: 15, textDecoration: 'none'
        }}>
          Upload My Report — Free →
        </Link>
        <p style={{ fontSize: 12, color: '#cbd5e1', marginTop: 16 }}>
          Works on mobile • No app download • Every Indian lab
        </p>
      </section>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </main>
  )
}