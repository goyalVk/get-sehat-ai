'use client'
import { useState } from 'react'

const features = [
  { icon: '📊', text: 'Unlimited report analysis', sub: 'CBC, Thyroid, Liver, Kidney sab' },
  { icon: '📄', text: 'PDF download — doctor ko share karo', sub: 'Clean PDF — WhatsApp pe share karo' },
  { icon: '🔊', text: 'Hindi mein report sunein', sub: 'Voice feature — poori report Hindi mein' },
  { icon: '💬', text: 'Unlimited medicine chat', sub: 'Koi bhi medicine ya symptom poochho' },
  { icon: '📋', text: 'Poori medical history track', sub: 'Sab reports ek jagah' },
  { icon: '🌿', text: 'Ayurvedic herb suggestions', sub: 'Natural remedies bhi milenge' },
  { icon: '🔔', text: 'Abnormal values instant alert', sub: 'Important values highlight hongi' },
  { icon: '🤖', text: 'Sonnet AI — deep analysis', sub: 'Best AI model — zyada accurate' },
]

const testimonials = [
  {
    name: 'Chhakaudi Ram',
    location: 'Bihar',
    text: 'CBC report pehli baar samajh aayi — doctor bhi surprised tha!',
    emoji: '🙏',
    rating: 5
  },
  {
    name: 'Ms. Saloni',
    location: 'India',
    text: 'Bahut helpful thi — CBC, Kidney aur Liver sab ek saath analyze ho gaya!',
    emoji: '😮',
    rating: 5
  },
  {
    name: 'Aniket Gupta',
    location: 'India',
    text: 'Ultrasound report ka matlab 2 saal se nahi pata tha. Sehat24 ne 2 min mein explain kar diya.',
    emoji: '❤️',
    rating: 5
  },
]

export default function UpgradePage() {
  const [plan, setPlan] = useState('monthly')

  const monthlyPrice    = 499
  const annualPrice     = 1999
  const monthlyOriginal = 999
  const annualOriginal  = 7188
  const monthlySavePct  = Math.round((1 - monthlyPrice / monthlyOriginal) * 100)
  const annualSavePct   = Math.round((1 - annualPrice / annualOriginal) * 100)

  const monthlyRzpLink = 'https://rzp.io/rzp/f5GzI7Qj'
  const annualRzpLink  = 'https://rzp.io/rzp/6RI9DEP' // ← Replace with annual link

  const currentLink  = plan === 'monthly' ? monthlyRzpLink : annualRzpLink
  const currentPrice = plan === 'monthly' ? monthlyPrice : annualPrice
  const currentOrig  = plan === 'monthly' ? monthlyOriginal : annualOriginal
  const currentSave  = plan === 'monthly' ? monthlySavePct : annualSavePct
  const perDay       = plan === 'monthly' ? '₹6.6' : '₹5.5'
  const perDayEmoji  = plan === 'monthly' ? '☕' : '💧'

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0f172a 0%, #0d2b2b 50%, #0f172a 100%)',
      padding: '32px 16px 60px',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(13,148,136,0.3); }
          50%       { box-shadow: 0 0 40px rgba(13,148,136,0.6); }
        }
        .upgrade-btn:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 20px 40px rgba(13,148,136,0.5) !important;
        }
        .upgrade-btn:active { transform: scale(0.98); }
        .feature-row:hover {
          background: rgba(13,148,136,0.1) !important;
          border-color: rgba(13,148,136,0.4) !important;
        }
        .testimonial-card:hover {
          transform: translateY(-3px);
          border-color: rgba(13,148,136,0.5) !important;
        }
        .price-card { animation: glow 3s ease infinite; }
        .shimmer-text {
          background: linear-gradient(90deg,#0d9488,#5eead4,#0d9488);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }
        .plan-toggle-btn {
          transition: all 0.2s ease;
          cursor: pointer;
          border: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
      `}</style>

      <div style={{ maxWidth: 460, margin: '0 auto' }}>

        {/* Trust badge */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(13,148,136,0.15)',
            border: '1px solid rgba(13,148,136,0.4)',
            borderRadius: 100,
            padding: '8px 18px',
            fontSize: 13,
            color: '#94d4cf',
            fontWeight: 600,
          }}>
            ⭐ 4.8/5 rating — 397 verified users
          </div>
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>🩺</div>
          <h1 style={{
            fontSize: 30,
            fontWeight: 800,
            color: '#ffffff',
            margin: '0 0 8px',
            lineHeight: 1.2,
          }}>
            Upgrade to{' '}
            <span className="shimmer-text">Sehat24 Pro</span>
          </h1>
          <p style={{ fontSize: 15, color: '#94a3b8', margin: 0 }}>
            Unlimited reports. Hindi mein. Bilkul clear. 🙏
          </p>
        </div>

        {/* Social proof bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 20,
          marginBottom: 24,
          flexWrap: 'wrap',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#5eead4' }}>8,000+</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>Reports analyzed</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#5eead4' }}>1,200+</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>Users trust us</div>
          </div>
          {/* <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#5eead4' }}>73</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>Countries</div>
          </div> */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#5eead4' }}>4.5⭐</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>Avg rating</div>
          </div>
        </div>

        {/* Free vs Pro comparison */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          marginBottom: 20,
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 14,
            padding: '14px 16px',
          }}>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>BASIC</div>
            <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.8 }}>
              <div>⚪ Koi report nahi</div>
              <div>⚪ No analysis</div>
              <div>⚪ No PDF, No Voice</div>
              <div>⚪ No chat</div>
            </div>
          </div>
          <div style={{
            background: 'rgba(13,148,136,0.12)',
            border: '1px solid rgba(13,148,136,0.5)',
            borderRadius: 14,
            padding: '14px 16px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: 8, right: 8,
              background: '#0d9488', color: 'white',
              fontSize: 10, fontWeight: 700,
              padding: '2px 8px', borderRadius: 100,
            }}>PRO</div>
            <div style={{ fontSize: 12, color: '#0d9488', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>PRO</div>
            <div style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.8 }}>
              <div>✅ Unlimited reports</div>
              <div>✅ Deep AI analysis</div>
              <div>✅ PDF + Voice</div>
              <div>✅ Unlimited chat</div>
            </div>
          </div>
        </div>

        {/* Plan Toggle */}
        <div style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 14,
          padding: 4,
          marginBottom: 16,
          gap: 4,
        }}>
          <button
            className="plan-toggle-btn"
            onClick={() => setPlan('monthly')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 11,
              fontSize: 13,
              fontWeight: 700,
              background: plan === 'monthly'
                ? 'rgba(13,148,136,0.3)'
                : 'transparent',
              color: plan === 'monthly' ? '#5eead4' : '#64748b',
              border: plan === 'monthly'
                ? '1px solid rgba(13,148,136,0.5)'
                : '1px solid transparent',
            }}
          >
            Monthly
          </button>
          <button
            className="plan-toggle-btn"
            onClick={() => setPlan('annual')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 11,
              fontSize: 13,
              fontWeight: 700,
              background: plan === 'annual'
                ? 'rgba(13,148,136,0.3)'
                : 'transparent',
              color: plan === 'annual' ? '#5eead4' : '#64748b',
              border: plan === 'annual'
                ? '1px solid rgba(13,148,136,0.5)'
                : '1px solid transparent',
            }}
          >
            Annual 🔥 Save {annualSavePct}%
          </button>
        </div>

        {/* Main Price Card */}
        <div
          className="price-card"
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(10px)',
            borderRadius: 24,
            padding: '28px 24px',
            border: '1.5px solid rgba(13,148,136,0.5)',
            marginBottom: 16,
          }}>

          {/* Strikethrough Price */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>

            {/* Original price crossed */}
            <div style={{
              fontSize: 16,
              color: '#64748b',
              textDecoration: 'line-through',
              marginBottom: 4,
            }}>
              ₹{currentOrig.toLocaleString('en-IN')}{plan === 'monthly' ? '/month' : '/year'}
            </div>

            {/* Save badge */}
            <div style={{
              display: 'inline-block',
              background: '#dc2626',
              color: 'white',
              fontSize: 12,
              fontWeight: 800,
              padding: '3px 12px',
              borderRadius: 100,
              marginBottom: 8,
            }}>
              🔥 Save {currentSave}%
            </div>

            {/* Actual price */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              gap: 4,
            }}>
              <span style={{ fontSize: 24, color: '#5eead4', fontWeight: 700, marginTop: 8 }}>₹</span>
              <span style={{ fontSize: 72, fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>
                {currentPrice.toLocaleString('en-IN')}
              </span>
              <span style={{ fontSize: 16, color: '#94a3b8', marginTop: 20 }}>
                /{plan === 'monthly' ? 'month' : 'year'}
              </span>
            </div>

            {/* Per day */}
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
              = Sirf {perDay}/din — {perDayEmoji}
            </p>

            {/* Annual monthly breakdown */}
            {plan === 'annual' && (
              <p style={{ fontSize: 12, color: '#0d9488', marginTop: 4, fontWeight: 600 }}>
                = ₹166/month effective — Save {annualSavePct}%! 🎉
              </p>
            )}

            {/* Trust line */}
            <p style={{ fontSize: 12, color: '#0d9488', marginTop: 8, fontWeight: 600 }}>
              1,200+ Indians already use kar rahe hain 🇮🇳
            </p>
          </div>

          {/* Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            {features.map((f, i) => (
              <div key={i}
                className="feature-row"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.05)',
                  background: 'rgba(255,255,255,0.03)',
                  transition: 'all 0.2s ease',
                }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{f.icon}</span>
                <div>
                  <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600 }}>{f.text}</div>
                  {f.sub && <div style={{ fontSize: 11, color: '#64748b' }}>{f.sub}</div>}
                </div>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          
            <a 
            href={currentLink}
            target="_blank"
            rel="noopener noreferrer"
            className="upgrade-btn"
            style={{
              display: 'block',
              width: '100%',
              padding: '18px',
              background: 'linear-gradient(135deg, #0d9488, #0f766e)',
              color: 'white',
              borderRadius: 16,
              fontSize: 17,
              fontWeight: 800,
              textDecoration: 'none',
              textAlign: 'center',
              transition: 'all 0.2s ease',
              boxShadow: '0 8px 24px rgba(13,148,136,0.35)',
              letterSpacing: 0.3,
              boxSizing: 'border-box',
            }}
          >
            {plan === 'monthly'
              ? '🔓 Pro lo — ₹499/month'
              : '🔥 Pro lo — ₹1,999/year (Save 72%)'}
          </a>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 12,
            marginTop: 12,
          }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>🔒 Razorpay secure</span>
            <span style={{ fontSize: 12, color: '#64748b' }}>⚡ Instant activation</span>
            <span style={{ fontSize: 12, color: '#64748b' }}>✅ No auto-deduction</span>
          </div>
        </div>

        {/* Instant activation note */}
        <div style={{
          background: 'rgba(74,222,128,0.08)',
          border: '1px solid rgba(74,222,128,0.25)',
          borderRadius: 14,
          padding: '14px 18px',
          marginBottom: 12,
        }}>
          <p style={{ fontSize: 13, color: '#86efac', margin: 0, textAlign: 'center' }}>
            ⚡ Payment ke turant baad account <strong>automatically upgrade</strong> ho jaata hai!
          </p>
        </div>

        {/* Testimonials */}
        <div style={{ marginBottom: 16 }}>
          <div style={{
            fontSize: 12,
            color: '#475569',
            textAlign: 'center',
            marginBottom: 10,
            textTransform: 'uppercase',
            letterSpacing: 1,
            fontWeight: 700,
          }}>
            Real users — Real results
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {testimonials.map((t, i) => (
              <div key={i}
                className="testimonial-card"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 14,
                  padding: '14px 16px',
                  transition: 'all 0.2s ease',
                }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                  {'⭐'.repeat(t.rating)}
                </div>
                <p style={{
                  fontSize: 13,
                  color: '#cbd5e1',
                  margin: '0 0 8px',
                  lineHeight: 1.5,
                  fontStyle: 'italic',
                }}>
                  {t.emoji} &ldquo;{t.text}&rdquo;
                </p>
                <div style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>
                  — {t.name}, {t.location}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Support */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: '#475569', margin: 0 }}>
            Koi problem? <strong style={{ color: '#0d9488' }}>teamsehat24@gmail.com</strong> pe likhein 🙏
          </p>
        </div>

      </div>
    </main>
  )
}