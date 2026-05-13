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


export default function FeedbackSection({ reportId }) {
  const [hover, setHover]         = useState(0)
  const [rating, setRating]       = useState(0)
  const [ratingDone, setRatingDone] = useState(false)
  const [question, setQuestion]   = useState('')
  const [sending, setSending]     = useState(false)
  const [sent, setSent]           = useState(false)

  const doRate = useCallback(async (stars) => {
    setRating(stars)
    setRatingDone(true)
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, rating: stars }),
      })
    } catch {}
  }, [reportId])

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
  background: 'linear-gradient(150deg,#0f172a 0%,#1e293b 100%)',
  borderRadius: 24,
  border: '1px solid rgba(255,255,255,0.08)',
  padding: '24px 28px',
  marginBottom: 16,
  position: 'relative', overflow: 'hidden',
  boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
}}>

  <style>{`
    .fb-star { background:none; border:none; cursor:pointer; padding:2px; transition:transform 0.15s; }
    .fb-star:hover { transform: scale(1.2); }
    .fb-star.locked { cursor:default; }
    .glowing { filter: drop-shadow(0 0 6px rgba(245,158,11,0.7)); }
    @keyframes fb-pop { from { transform:scale(0.7); opacity:0; } to { transform:scale(1); opacity:1; } }
    @keyframes fb-slide { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
  `}</style>

  {/* Decorative blob */}
  <div style={{ position:'absolute', top:-40, right:-40, width:160, height:160, borderRadius:'50%', background:'radial-gradient(circle,rgba(245,158,11,0.12),transparent)', pointerEvents:'none' }} />

  {!ratingDone ? (
    <div style={{ position:'relative', zIndex:1 }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
        <div style={{ width:42, height:42, borderRadius:13, background:'linear-gradient(135deg,#f59e0b,#fbbf24)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0, boxShadow:'0 3px 12px rgba(245,158,11,0.4)' }}>⭐</div>
        <div>
          <h3 style={{ fontSize:15, fontWeight:700, color:'white', marginBottom:2 }}>
            Yeh analysis kaisi lagi?
          </h3>
          <p style={{ fontSize:12, color:'#94a3b8' }}>
            1 click — humari bahut help hoti hai 🙏
          </p>
        </div>
      </div>

      {/* Stars row */}
      <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:12 }}>
        {[1,2,3,4,5].map(i => (
          <button
            key={i}
            className="fb-star"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            onClick={() => doRate(i)}
            aria-label={`${i} star`}
          >
            <svg width="42" height="42" viewBox="0 0 24 24"
              fill={i <= active ? fillColor : 'rgba(255,255,255,0.1)'}
              stroke={i <= active ? fillColor : 'rgba(255,255,255,0.2)'}
              strokeWidth="1.5"
              style={{ transition:'fill 0.15s, stroke 0.15s' }}
            >
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
            </svg>
          </button>
        ))}

        {active > 0 && (
          <span style={{ marginLeft:8, fontSize:32, display:'inline-block', animation:'fb-pop 0.3s ease both' }}>
            {EMOJIS[active]}
          </span>
        )}
      </div>

      {/* Label */}
      <div style={{ minHeight:22 }}>
        {active > 0 && (
          <p style={{
            fontSize:14, fontWeight:700,
            animation:'fb-slide 0.2s ease',
            color: active <= 2 ? '#f87171' : active === 3 ? '#fbbf24' : '#4ade80',
          }}>
            {LABELS[active]}
          </p>
        )}
      </div>

    </div>

  ) : (
    /* ── Thank You State ── */
    <div style={{ textAlign:'center', padding:'8px 0', animation:'fb-pop 0.45s cubic-bezier(.22,1,.36,1)', position:'relative', zIndex:1 }}>
      <div style={{ fontSize:56, marginBottom:12, lineHeight:1 }}>{EMOJIS[rating]}</div>
      <div style={{ display:'flex', justifyContent:'center', gap:4, marginBottom:14 }}>
        {[1,2,3,4,5].map(i => (
          <svg key={i} width="28" height="28" viewBox="0 0 24 24"
            className={`fb-star locked ${i <= rating ? 'glowing' : ''}`}
            fill={i <= rating ? STAR_COLORS[rating] : 'rgba(255,255,255,0.1)'}
            stroke={i <= rating ? STAR_COLORS[rating] : 'rgba(255,255,255,0.15)'}
            strokeWidth="1.5"
          >
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
          </svg>
        ))}
      </div>
      <p style={{ fontSize:16, fontWeight:800, color:'white', marginBottom:6 }}>
        Shukriya! 🙏
      </p>
      <p style={{ fontSize:13, color:'#94a3b8', lineHeight:1.6, marginBottom:14 }}>
        {THANKYOU[rating]}
      </p>
      <button
        onClick={() => setRatingDone(false)}
        style={{ background:'none', border:'none', fontSize:13, color:'white', cursor:'pointer', textDecoration:'underline', padding:0 }}
      >
        Rating badalni hai?
      </button>
    </div>
  )}

</div>

     
                  {/* ══ Feedback Card ══ */}
        <div style={{
          background: 'linear-gradient(150deg,#0f172a 0%,#1e293b 100%)',
          borderRadius: 24, padding: '24px',
          marginBottom: 16,
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        }}>

          <style>{`
            .fb-textarea::placeholder { color: rgba(255,255,255,0.45); }
            .fb-textarea:focus { border-color: rgba(13,148,136,0.5) !important; }
            .fb-opt:hover { border-color: #0d9488 !important; color: #2dd4bf !important; }
          `}</style>

          {/* Header */}
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
            <div style={{ width:42, height:42, borderRadius:13, background:'linear-gradient(135deg,#0d9488,#0891b2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0, boxShadow:'0 3px 12px rgba(13,148,136,0.3)' }}>⭐</div>
            <div>
              <h3 style={{ fontSize:15, fontWeight:700, color:'white', marginBottom:2 }}>
                Aapka feedback chahiye
              </h3>
              <p style={{ fontSize:12, color:'#94a3b8' }}>
                2 second — bas ek tap 😊
              </p>
            </div>
          </div>

          {/* Quick Options */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:14 }}>
            {[
              '✅ Bahut helpful thi',
              '🤔 Thoda confusing tha',
              '❓ Aur detail chahiye',
              '🌿 Ayurvedic tips achhe lage',
              '📄 PDF chahiye tha',
              '💊 Medicine chat try karunga',
            ].map((opt, i) => (
              <button
                key={i}
                className="fb-opt"
                onClick={() => setQuestion(opt)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 100,
                  border: `1px solid ${question === opt
                    ? '#0d9488'
                    : 'rgba(255,255,255,0.15)'}`,
                  background: question === opt
                    ? 'rgba(13,148,136,0.2)'
                    : 'rgba(255,255,255,0.06)',
                  color: question === opt
                    ? '#2dd4bf'
                    : 'rgba(255,255,255,0.95)',
                  fontSize: 13, fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* Textarea */}
          <textarea
            className="fb-textarea"
            value={question}
            onChange={e => setQuestion(e.target.value.slice(0, 300))}
            placeholder="Ya apni baat likhein... Hindi ya English dono chalte hain 😊"
            rows={3}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 14,
              padding: '12px 14px',
              color: 'white',
              fontSize: 13,
              lineHeight: 1.6,
              resize: 'none',
              outline: 'none',
              fontFamily: 'inherit',
              marginBottom: 12,
              transition: 'border-color 0.2s',
            }}
          />

          {/* Send Button */}
          <button
            onClick={doSend}
            disabled={!canSend}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 14,
              border: 'none',
              background: canSend
                ? 'linear-gradient(135deg,#0d9488,#0891b2)'
                : 'rgba(255,255,255,0.06)',
              color: canSend
                ? 'white'
                : 'rgba(255,255,255,0.3)',
              fontSize: 14, fontWeight: 700,
              cursor: canSend ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              boxShadow: canSend
                ? '0 4px 16px rgba(13,148,136,0.3)'
                : 'none',
            }}
          >
            {sending ? '⏳ Bhej raha hoon...' : '✉️ Feedback Bhejo →'}
          </button>

          {/* Success Toast */}
          {sent && (
            <div style={{
              marginTop: 12, padding: '12px 14px',
              background: 'rgba(13,148,136,0.15)',
              border: '1px solid rgba(13,148,136,0.35)',
              borderRadius: 12,
              display: 'flex', alignItems: 'center', gap: 9
            }}>
              <span style={{ fontSize: 18 }}>✅</span>
              <div>
                <p style={{ fontSize:13, fontWeight:700, color:'#2dd4bf', marginBottom:1 }}>
                  Shukriya! Feedback mil gaya 🙏
                </p>
                <p style={{ fontSize:11, color:'#94a3b8' }}>
                  Sehat24 team review karegi.
                </p>
              </div>
            </div>
          )}

        </div>
    </>
  )
}
