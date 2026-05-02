'use client'

import { useState, useEffect } from 'react'

const features = [
  { icon: '📊', text: 'Unlimited report analysis', sub: 'CBC, Thyroid, Liver, Kidney sab' },
  { icon: '🗣️', text: 'Hindi mein detailed explanation', sub: 'Simple bhasha, koi confusion nahi' },
  { icon: '👨‍👩‍👧‍👦', text: 'Poori family ke liye', sub: 'Ek account, 6 family members' },
  { icon: '📋', text: 'Poori medical history track', sub: 'Sab reports ek jagah' },
  { icon: '🌿', text: 'Ayurvedic herb suggestions', sub: 'Natural remedies bhi milenge' },
  { icon: '🔔', text: 'Abnormal values instant alert', sub: 'Important values highlight hogi' },
  { icon: '🎯', text: 'Priority support', sub: 'Seedha team se baat karo' },
]

const testimonials = [
  { name: 'Priya S., Lucknow', text: 'Papa ki report pehli baar samajh aayi — doctor bhi surprised tha!', emoji: '🙏' },
  { name: 'Rahul M., Patna', text: 'Thyroid report ka matlab 2 saal se nahi pata tha. Sehat24 ne 2 min mein explain kar diya.', emoji: '😮' },
  { name: 'Sunita D., Varanasi', text: 'Puri family ki reports ab yahan hi upload karti hoon. Bahut helpful hai.', emoji: '❤️' },
]

export default function UpgradePage() {
  const [count, setCount] = useState(1453)
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => prev + Math.floor(Math.random() * 3))
      setPulse(true)
      setTimeout(() => setPulse(false), 600)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0f172a 0%, #0d2b2b 50%, #0f172a 100%)',
      padding: '32px 16px 60px',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(13, 148, 136, 0.3); }
          50% { box-shadow: 0 0 40px rgba(13, 148, 136, 0.6); }
        }
        .upgrade-btn:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 20px 40px rgba(13, 148, 136, 0.5) !important;
        }
        .upgrade-btn:active {
          transform: scale(0.98);
        }
        .feature-row:hover {
          background: rgba(13, 148, 136, 0.1) !important;
          border-color: rgba(13, 148, 136, 0.4) !important;
        }
        .testimonial-card:hover {
          transform: translateY(-3px);
          border-color: rgba(13, 148, 136, 0.5) !important;
        }
      `}</style>

      <div style={{ maxWidth: 460, margin: '0 auto' }}>

        {/* Live counter badge */}
        <div style={{
          animation: 'fadeUp 0.5s ease',
          textAlign: 'center',
          marginBottom: 24,
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(13, 148, 136, 0.15)',
            border: '1px solid rgba(13, 148, 136, 0.4)',
            borderRadius: 100,
            padding: '8px 18px',
          }}>
            <span style={{
              width: 8, height: 8,
              borderRadius: '50%',
              background: '#4ade80',
              display: 'inline-block',
              boxShadow: '0 0 8px #4ade80',
              animation: 'pulse 2s infinite',
            }} />
            <span style={{
              fontSize: 13,
              color: '#94d4cf',
              fontWeight: 600,
            }}>
              <span style={{
                color: '#5eead4',
                fontWeight: 800,
                animation: pulse ? 'pulse 0.6s ease' : 'none',
                display: 'inline-block',
              }}>{count.toLocaleString('en-IN')}+</span>
              {' '}reports already analyzed
            </span>
          </div>
        </div>

        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: 28,
          animation: 'fadeUp 0.6s ease 0.1s both',
        }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>🩺</div>
          <h1 style={{
            fontSize: 30, fontWeight: 800,
            color: '#ffffff',
            margin: '0 0 8px',
            lineHeight: 1.2,
          }}>
            Upgrade to{' '}
            <span style={{
              background: 'linear-gradient(90deg, #0d9488, #5eead4, #0d9488)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'shimmer 3s linear infinite',
            }}>
              Sehat24 Pro
            </span>
          </h1>
          <p style={{ fontSize: 15, color: '#94a3b8', margin: 0 }}>
            Unlimited reports. Poori family ke liye. 🙏
          </p>
        </div>

        {/* Free vs Pro comparison */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          marginBottom: 20,
          animation: 'fadeUp 0.6s ease 0.2s both',
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 14,
            padding: '14px 16px',
          }}>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>FREE</div>
            <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.8 }}>
              <div>⚪ Sirf 2 report</div>
              <div>⚪ Basic analysis</div>
              <div>⚪ Limited history</div>
            </div>
          </div>
          <div style={{
            background: 'rgba(13, 148, 136, 0.12)',
            border: '1px solid rgba(13, 148, 136, 0.5)',
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
              <div>✅ Full history</div>
            </div>
          </div>
        </div>

        {/* Main Price Card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(10px)',
          borderRadius: 24,
          padding: '28px 24px',
          border: '1.5px solid rgba(13, 148, 136, 0.5)',
          marginBottom: 16,
          animation: 'fadeUp 0.6s ease 0.3s both, glow 3s ease infinite',
        }}>

          {/* Price */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>Sirf itne mein poori family</div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 4 }}>
              <span style={{ fontSize: 24, color: '#5eead4', fontWeight: 700, marginTop: 8 }}>₹</span>
              <span style={{ fontSize: 64, fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>199</span>
            </div>
            <div style={{ fontSize: 13, color: '#64748b' }}>per month • Cancel anytime</div>
            <div style={{
              display: 'inline-block',
              marginTop: 8,
              background: 'rgba(74, 222, 128, 0.15)',
              border: '1px solid rgba(74, 222, 128, 0.3)',
              borderRadius: 100,
              padding: '4px 14px',
              fontSize: 12,
              color: '#4ade80',
              fontWeight: 600,
            }}>
              = ₹10/day. Ek chai se bhi sasta ☕
            </div>
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
                  cursor: 'default',
                }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{f.icon}</span>
                <div>
                  <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600 }}>{f.text}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{f.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <a
            href="https://rzp.io/rzp/f5GzI7Qj"
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
              boxShadow: '0 8px 24px rgba(13, 148, 136, 0.35)',
              letterSpacing: 0.3,
            }}
          >
            🚀 Abhi Upgrade Karo — ₹199/month
          </a>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 16,
            marginTop: 12,
          }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>🔒 Razorpay secure payment</span>
            <span style={{ fontSize: 12, color: '#64748b' }}>✅ Instant activation</span>
          </div>
        </div>

        {/* Instant activation note — replacing "2-3 minute manual" */}
        <div style={{
          background: 'rgba(74, 222, 128, 0.08)',
          border: '1px solid rgba(74, 222, 128, 0.25)',
          borderRadius: 14,
          padding: '14px 18px',
          marginBottom: 12,
          animation: 'fadeUp 0.6s ease 0.4s both',
        }}>
          <p style={{ fontSize: 13, color: '#86efac', margin: 0, textAlign: 'center' }}>
            ⚡ Payment ke turant baad account <strong>automatically upgrade</strong> ho jaata hai — koi wait nahi!
          </p>
        </div>

        {/* Testimonials */}
        <div style={{
          marginBottom: 16,
          animation: 'fadeUp 0.6s ease 0.5s both',
        }}>
          <div style={{ fontSize: 12, color: '#475569', textAlign: 'center', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>
            Real users, real results
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
                <p style={{ fontSize: 13, color: '#cbd5e1', margin: '0 0 8px', lineHeight: 1.5, fontStyle: 'italic' }}>
                  {t.emoji} "{t.text}"
                </p>
                <div style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>— {t.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Money back / trust */}
        <div style={{
          textAlign: 'center',
          animation: 'fadeUp 0.6s ease 0.6s both',
        }}>
          <p style={{ fontSize: 12, color: '#475569', margin: 0 }}>
            Koi problem? <strong style={{ color: '#0d9488' }}>teamsehat24@gmail.com</strong> pe likhein — hum hain 🙏
          </p>
        </div>

      </div>
    </main>
  )
}
