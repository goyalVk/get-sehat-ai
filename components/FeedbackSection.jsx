'use client'
import { useState, useCallback } from 'react'

const EMOJIS  = ['', '😞', '😕', '🙂', '😊', '🤩']
const LABELS  = ['', 'Bilkul nahi', 'Khas nahi tha', 'Theek tha', 'Helpful tha!', 'Bahut helpful!']
const THANKYOU = [
  '',
  'Bura laga sunke 🙏 Isko aur better banayenge.',
  'Feedback ke liye shukriya! Improve karenge 💪',
  'Accha laga! Aur better karne ki koshish karenge 😊',
  'Bahut khushi hui! Aapki sehat acchi rahe ❤️',
  'Aap ne din bana diya! 🎉 Shukriya!',
]
const STAR_COLORS = ['', '#ef4444', '#f97316', '#f59e0b', '#22c55e', '#0d9488']

const CHIPS = [
  { q: 'Yeh value normal kab hogi?',      icon: '📈' },
  { q: 'Kya yeh serious condition hai?',   icon: '⚠️' },
  { q: 'Doctor se kya poochhu?',           icon: '🏥' },
  { q: 'Diet mein kya change karoon?',     icon: '🥗' },
  { q: 'Koi medicine zaruri hai?',         icon: '💊' },
  { q: 'Aur tests karwane chahiye?',       icon: '🔬' },
  { q: 'Agar koi aur sujhav ya feedback ho, to zarur batayein', icon: '💬' }

]

export default function FeedbackSection({ reportId }) {
  const [hover, setHover]         = useState(0)
  const [rating, setRating]       = useState(0)
  const [ratingDone, setRatingDone] = useState(false)
  const [question, setQuestion]   = useState('')
  const [sending, setSending]     = useState(false)
  const [sent, setSent]           = useState(false)
  const [sentQs, setSentQs]       = useState([])

  const doRate = useCallback(async (stars) => {
    if (ratingDone) return
    setRating(stars)
    setRatingDone(true)
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, rating: stars }),
      })
    } catch {}
  }, [reportId, ratingDone])

  const doSend = useCallback(async () => {
    const q = question.trim()
    if (!q || sending) return
    setSending(true)
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, question: q }),
      })
      setSentQs(prev => [...prev, q])
      setQuestion('')
      setSent(true)
      setTimeout(() => setSent(false), 4000)
    } catch {}
    setSending(false)
  }, [question, reportId, sending])

  const active     = hover || rating
  const fillColor  = STAR_COLORS[active] || '#e2e8f0'
  const canSend    = question.trim().length > 0 && !sending

  return (
    <>
      <style>{`
        @keyframes fb-pop {
          0%   { transform: scale(0.4); opacity: 0; }
          65%  { transform: scale(1.25); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fb-slide {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fb-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fb-glow {
          0%,100% { filter: drop-shadow(0 0 0px transparent); }
          50%     { filter: drop-shadow(0 0 6px rgba(245,158,11,0.7)); }
        }
        @keyframes fb-confetti {
          0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-40px) rotate(360deg); opacity: 0; }
        }

        .fb-star {
          background: none; border: none; padding: 2px 3px; cursor: pointer;
          transition: transform 0.15s cubic-bezier(.22,1,.36,1);
          line-height: 1; display: inline-flex;
        }
        .fb-star:hover   { transform: scale(1.3) rotate(-5deg); }
        .fb-star:active  { transform: scale(0.95); }
        .fb-star.locked  { cursor: default; }
        .fb-star.glowing { animation: fb-glow 1.8s ease infinite; }

        .fb-chip {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 7px 12px; border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          font-size: 12px; font-weight: 600;
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          transition: all 0.15s;
          font-family: 'Plus Jakarta Sans', sans-serif;
          white-space: nowrap;
        }
        .fb-chip:hover {
          background: rgba(13,148,136,0.2);
          border-color: rgba(13,148,136,0.5);
          color: #2dd4bf;
          transform: translateY(-1px);
        }

        .fb-send {
          width: 100%; padding: 14px; border-radius: 14px; border: none;
          font-weight: 700; font-size: 14px; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.2s;
        }
        .fb-send.on {
          background: linear-gradient(135deg, #0d9488, #0891b2);
          color: white;
          box-shadow: 0 4px 20px rgba(13,148,136,0.35);
        }
        .fb-send.on:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(13,148,136,0.45); }
        .fb-send.on:active { transform: translateY(0); }
        .fb-send.off {
          background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.2);
          cursor: not-allowed;
        }

        .fb-textarea {
          width: 100%; border-radius: 14px;
          border: 1.5px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: white; padding: 13px 46px 13px 16px;
          font-size: 14px; line-height: 1.65; resize: vertical;
          font-family: 'Plus Jakarta Sans', sans-serif;
          outline: none; box-sizing: border-box;
          transition: border-color 0.2s, background 0.2s;
          min-height: 88px;
        }
        .fb-textarea::placeholder { color: rgba(255,255,255,0.25); }
        .fb-textarea:focus {
          border-color: #0d9488;
          background: rgba(255,255,255,0.08);
        }

        .fb-sent-item { animation: fb-slide 0.3s ease both; }
      `}</style>

      {/* ══ Rating Card ══ */}
      <div style={{
        background: 'white', borderRadius: 24,
        border: '1px solid #f1f5f9', padding: '24px 28px',
        marginBottom: 16, position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <div style={{ position:'absolute', top:-40, right:-40, width:130, height:130, borderRadius:'50%', background:'radial-gradient(circle,rgba(245,158,11,0.07),transparent)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-30, left:-20, width:90, height:90, borderRadius:'50%', background:'radial-gradient(circle,rgba(13,148,136,0.06),transparent)', pointerEvents:'none' }} />

        {!ratingDone ? (
          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
              <div style={{ width:42, height:42, borderRadius:13, background:'linear-gradient(135deg,#fef3c7,#fde68a)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0, boxShadow:'0 2px 10px rgba(245,158,11,0.2)' }}>⭐</div>
              <div>
                <h3 style={{ fontSize:15, fontWeight:700, color:'#0f172a', marginBottom:2 }}>Yeh analysis kaisi lagi?</h3>
                <p style={{ fontSize:12, color:'#94a3b8' }}>1 click — humari bahut help hoti hai 🙏</p>
              </div>
            </div>

            {/* Stars row */}
            <div style={{ display:'flex', alignItems:'center', gap:2, marginBottom:10 }}>
              {[1,2,3,4,5].map(i => (
                <button
                  key={i}
                  className="fb-star"
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => doRate(i)}
                  aria-label={`${i} star`}
                >
                  <svg width="38" height="38" viewBox="0 0 24 24"
                    fill={i <= active ? fillColor : '#f1f5f9'}
                    stroke={i <= active ? fillColor : '#e2e8f0'}
                    strokeWidth="1.5" style={{ transition:'fill 0.15s, stroke 0.15s' }}
                  >
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                  </svg>
                </button>
              ))}

              {active > 0 && (
                <span style={{ marginLeft:8, fontSize:30, display:'inline-block', animation:'fb-pop 0.3s ease both' }}>
                  {EMOJIS[active]}
                </span>
              )}
            </div>

            {/* Label */}
            <div style={{ minHeight:20 }}>
              {active > 0 && (
                <p style={{
                  fontSize:13, fontWeight:700, animation:'fb-slide 0.2s ease',
                  color: active <= 2 ? '#ef4444' : active === 3 ? '#f59e0b' : '#16a34a',
                }}>
                  {LABELS[active]}
                </p>
              )}
            </div>
          </div>

        ) : (
          /* ── Thank You State ── */
          <div style={{ textAlign:'center', padding:'8px 0', animation:'fb-pop 0.45s cubic-bezier(.22,1,.36,1)' }}>
            <div style={{ fontSize:56, marginBottom:12, lineHeight:1 }}>{EMOJIS[rating]}</div>
            <div style={{ display:'flex', justifyContent:'center', gap:4, marginBottom:14 }}>
              {[1,2,3,4,5].map(i => (
                <svg key={i} width="26" height="26" viewBox="0 0 24 24"
                  className={`fb-star locked ${i <= rating ? 'glowing' : ''}`}
                  fill={i <= rating ? STAR_COLORS[rating] : '#f1f5f9'}
                  stroke={i <= rating ? STAR_COLORS[rating] : '#e2e8f0'}
                  strokeWidth="1.5"
                >
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                </svg>
              ))}
            </div>
            <p style={{ fontSize:16, fontWeight:800, color:'#0f172a', marginBottom:5 }}>Shukriya! 🙏</p>
            <p style={{ fontSize:13, color:'#64748b', lineHeight:1.6 }}>{THANKYOU[rating]}</p>
          </div>
        )}
      </div>

      {/* ══ Follow-up Questions Card ══ */}
      <div style={{
        background:'linear-gradient(150deg,#0f172a 0%,#1e293b 100%)',
        borderRadius:24, padding:'24px 24px 20px',
        marginBottom:16, position:'relative', overflow:'hidden',
        border:'1px solid rgba(255,255,255,0.06)',
        boxShadow:'0 8px 32px rgba(0,0,0,0.18)',
      }}>
        {/* Decorative blobs */}
        <div style={{ position:'absolute', top:-50, right:-50, width:160, height:160, borderRadius:'50%', background:'radial-gradient(circle,rgba(13,148,136,0.14),transparent)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-40, left:-40, width:120, height:120, borderRadius:'50%', background:'radial-gradient(circle,rgba(8,145,178,0.08),transparent)', pointerEvents:'none' }} />

        <div style={{ position:'relative', zIndex:1 }}>

          {/* Header */}
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
            <div style={{ width:42, height:42, borderRadius:13, background:'linear-gradient(135deg,#0d9488,#0891b2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0, boxShadow:'0 3px 12px rgba(13,148,136,0.3)' }}>💬</div>
            <div>
              <h3 style={{ fontSize:15, fontWeight:700, color:'white', marginBottom:2 }}>Kuch Aur Poochna Hai?</h3>
              <p style={{ fontSize:12, color:'#475569' }}>Apna sawaal bhejo — Sehat24 team review karegi</p>
            </div>
          </div>

          {/* Quick suggestion chips */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:14 }}>
            {CHIPS.map((c, i) => (
              <button
                key={i}
                className="fb-chip"
                onClick={() => {
                  setQuestion(c.q)
                  document.getElementById('fb-textarea')?.focus()
                }}
              >
                <span>{c.icon}</span> {c.q}
              </button>
            ))}
          </div>

          {/* Textarea */}
          <div style={{ position:'relative', marginBottom:12 }}>
            <textarea
              id="fb-textarea"
              className="fb-textarea"
              value={question}
              onChange={e => setQuestion(e.target.value.slice(0, 500))}
              placeholder="Apna sawaal likhein... Hindi ya English dono chalte hain"
              rows={3}
            />
            <span style={{ position:'absolute', bottom:10, right:12, fontSize:11, color: question.length > 450 ? '#f97316' : '#475569', fontWeight:500, pointerEvents:'none' }}>
              {question.length}/500
            </span>
          </div>

          {/* Send button */}
          <button
            className={`fb-send ${canSend ? 'on' : 'off'}`}
            onClick={doSend}
            disabled={!canSend}
          >
            {sending ? (
              <>
                <div style={{ width:16, height:16, border:'2.5px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', animation:'fb-spin 0.7s linear infinite' }} />
                Bhej raha hoon...
              </>
            ) : (
              <>✉️ Sawaal Bhejo →</>
            )}
          </button>

          {/* Sent toast */}
          {sent && (
            <div style={{ marginTop:12, padding:'11px 14px', background:'rgba(13,148,136,0.15)', border:'1px solid rgba(13,148,136,0.35)', borderRadius:12, display:'flex', alignItems:'center', gap:9, animation:'fb-slide 0.3s ease' }}>
              <span style={{ fontSize:18, flexShrink:0 }}>✅</span>
              <div>
                <p style={{ fontSize:13, fontWeight:700, color:'#2dd4bf', marginBottom:1 }}>Sawaal mil gaya!</p>
                <p style={{ fontSize:11, color:'#64748b' }}>Sehat24 team 24 ghante mein review karegi.</p>
              </div>
            </div>
          )}

          {/* Submitted questions list */}
          {sentQs.length > 0 && (
            <div style={{ marginTop:16 }}>
              <p style={{ fontSize:10, fontWeight:700, color:'#334155', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>
                ✓ Aapke Sawaal ({sentQs.length})
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                {sentQs.map((q, i) => (
                  <div key={i} className="fb-sent-item" style={{ display:'flex', alignItems:'flex-start', gap:10, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:11, padding:'10px 13px' }}>
                    <span style={{ width:20, height:20, borderRadius:'50%', background:'rgba(13,148,136,0.2)', color:'#2dd4bf', fontSize:10, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>Q</span>
                    <p style={{ fontSize:13, color:'rgba(255,255,255,0.65)', lineHeight:1.55 }}>{q}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}
