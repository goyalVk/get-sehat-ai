'use client'
import { useState, useEffect, useRef, useCallback, Suspense } from 'react'

// ── Render AI message text ────────────────────────────
function AIMessage({ text }) {
  const lines = text.split('\n')
  return (
    <div style={{ fontSize: 14.5, lineHeight: 1.85, color: '#1e293b', fontFamily: 'inherit' }}>
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} style={{ height: 6 }} />

        if (/^[🌿🥗🚨💊🔴🟡🟢⚕️🛒⚠️📸🏥❤️💡✅❌🌱💉🩺]/.test(line)) {
          return (
            <div key={i} style={{ fontWeight: 700, fontSize: 14, color: '#0f766e', marginTop: 10, marginBottom: 3 }}>
              {line}
            </div>
          )
        }

        if (line.trim().endsWith(':') && line.length < 60) {
          return <div key={i} style={{ fontWeight: 700, color: '#0f172a', marginTop: 8, marginBottom: 2 }}>{line}</div>
        }

        if (/^[-•→*]/.test(line.trim())) {
          return (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4, paddingLeft: 2, alignItems: 'flex-start' }}>
              <span style={{ color: '#0d9488', flexShrink: 0, fontWeight: 800, fontSize: 16, lineHeight: 1.5 }}>·</span>
              <span style={{ color: '#334155' }}>{line.replace(/^[-•→*]\s*/, '')}</span>
            </div>
          )
        }

        if (/^\d+\./.test(line.trim())) {
          const num = line.match(/^\d+/)[0]
          return (
            <div key={i} style={{ display: 'flex', gap: 9, marginBottom: 5, alignItems: 'flex-start' }}>
              <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#ccfbf1', color: '#0f766e', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>{num}</span>
              <span style={{ color: '#334155' }}>{line.replace(/^\d+\.\s*/, '')}</span>
            </div>
          )
        }

        return <div key={i} style={{ color: '#475569', marginBottom: 2 }}>{line}</div>
      })}
    </div>
  )
}

const QUICK_CARDS = [
  { icon: '📸', title: 'Medicine Scan', desc: 'Photo se composition batao', color: '#0d9488', bg: '#f0fdfa', border: '#5eead4', type: 'photo' },
  { icon: '🤒', title: 'Symptoms', desc: 'Bimari ya takleef batao', color: '#7c3aed', bg: '#faf5ff', border: '#c4b5fd', msg: 'Mujhe yeh takleef ho rahi hai: ' },
  { icon: '💊', title: 'Medicine Info', desc: 'Kisi medicine ke baare mein', color: '#0369a1', bg: '#f0f9ff', border: '#7dd3fc', msg: 'Is medicine ke baare mein batao: ' },
  { icon: '🌿', title: 'Herbs & Tips', desc: 'Natural remedies aur lifestyle', color: '#15803d', bg: '#f0fdf4', border: '#86efac', msg: 'Meri problem ke liye natural remedies batao: ' },
]

const SUGGESTIONS = [
  'Bukhaar aur sardi ke liye kya karoon?',
  'Vitamin D ki kami ke symptoms?',
  'BP high — kya khaana chahiye?',
  'Dolo 650 kab lena chahiye?',
  'Neend nahi aati — herbs batao',
  'Diabetes diet tips kya hain?',
]

function ChatContent() {
  const messagesEndRef = useRef(null)
  const inputRef       = useRef(null)
  const fileRef        = useRef(null)
  const isFirstMount   = useRef(true)

  const [messages, setMessages]         = useState([{
    role: 'assistant',
    text: 'Namaste! 🙏 Main Sehat24 Health Assistant hoon.\n\nMain aapki help kar sakta hoon:\n\n📸 Medicine photo upload karo — strip se composition seedha padhke bataunga\n💊 Medicine ka naam batao — side effects, use, generic option\n🤒 Koi bhi bimari ya symptom — herbs, lifestyle, doctor kab milna chahiye\n\nNeeche se choose karo ya apna sawaal type karo 👇'
  }])
  const [input, setInput]               = useState('')
  const [image, setImage]               = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading]           = useState(false)
  const [msgsSent, setMsgsSent]         = useState(0)

  // Scroll only on new messages, NOT on mount
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false
      return
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [messages.length, loading])

  const handleImage = useCallback((f) => {
    if (!f || !f.type.startsWith('image/')) return
    if (f.size > 5 * 1024 * 1024) { alert('5MB se chhoti image upload karo'); return }
    setImage(f)
    setImagePreview(URL.createObjectURL(f))
    inputRef.current?.focus()
  }, [])

  const sendMessage = useCallback(async (overrideText) => {
    const text = (overrideText !== undefined ? overrideText : input).trim()
    if ((!text && !image) || loading) return

    const displayText = text || 'Is medicine ke baare mein batao'
    setMessages(prev => [...prev, { role: 'user', text: displayText, imagePreview }])
    setInput('')
    const sentImage = image
    setImage(null)
    setImagePreview(null)
    setLoading(true)
    setMsgsSent(c => c + 1)

    try {
      const history = messages.slice(-6).map(m => ({ role: m.role, content: m.text }))
      const fd = new FormData()
      fd.append('message', displayText)
      fd.append('history', JSON.stringify(history))
      if (sentImage) fd.append('image', sentImage)

      const res = await fetch('/api/chat', { method: 'POST', body: fd })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setMessages(prev => [...prev, { role: 'assistant', text: err.reply || 'Kuch gadbad ho gayi. Dobara try karo. 🙏' }])
        return
      }

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''
      setMessages(prev => [...prev, { role: 'assistant', text: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value, { stream: true })
        setMessages(prev => {
          const u = [...prev]
          u[u.length - 1] = { role: 'assistant', text: full }
          return u
        })
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Network error. Internet check karo. 🙏' }])
    } finally {
      setLoading(false)
    }
  }, [input, image, imagePreview, loading, messages])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    handleImage(e.dataTransfer.files[0])
  }, [handleImage])

  const isActive = (input.trim().length > 0 || !!image) && !loading
  const showQuickCards = messages.length === 1
  const showSuggestions = messages.length > 1 && messages.length < 5 && !loading

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 0.3; transform: scale(0.85); }
          50%       { opacity: 1;   transform: scale(1.1); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }

        .chat-root {
          --teal:        #0d9488;
          --teal-dark:   #0f766e;
          --teal-light:  #f0fdfa;
          --teal-mid:    #ccfbf1;
          --bg:          #f7fafa;
          --white:       #ffffff;
          --border:      #e2eeec;
          --text:        #1e293b;
          --muted:       #64748b;
          --faint:       #94a3b8;

          height: calc(100vh - 64px);
          display: flex;
          flex-direction: column;
          background: var(--bg);
          font-family: 'Plus Jakarta Sans', sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* ── Header ── */
        .c-header {
          background: var(--white);
          border-bottom: 1px solid var(--border);
          padding: 12px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
          box-shadow: 0 1px 6px rgba(13,148,136,.06);
          z-index: 10;
        }
        .c-avatar {
          width: 42px; height: 42px;
          border-radius: 13px;
          background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%);
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; flex-shrink: 0;
          box-shadow: 0 3px 10px rgba(13,148,136,.25);
        }
        .c-online-dot {
          width: 7px; height: 7px;
          border-radius: 50%; background: #22c55e;
          animation: pulseDot 2s infinite;
          flex-shrink: 0;
        }
        .c-badge {
          background: var(--teal-light);
          border: 1px solid var(--teal-mid);
          border-radius: 8px;
          padding: 4px 10px;
          font-size: 11px; font-weight: 700;
          color: var(--teal-dark);
          white-space: nowrap;
        }

        /* ── Messages scroll area ── */
        .c-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px 16px 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .c-messages::-webkit-scrollbar { width: 4px; }
        .c-messages::-webkit-scrollbar-thumb { background: #b2dfdb; border-radius: 2px; }
        .c-messages::-webkit-scrollbar-track { background: transparent; }

        /* ── Message rows ── */
        .msg-wrap {
          display: flex;
          flex-direction: column;
          margin-bottom: 12px;
          animation: fadeSlideUp .22s ease both;
        }
        .msg-wrap.user { align-items: flex-end; }
        .msg-wrap.bot  { align-items: flex-start; }

        .bubble-user {
          max-width: 78%;
          padding: 11px 16px;
          background: linear-gradient(135deg, #0d9488, #0891b2);
          color: white;
          border-radius: 18px 18px 4px 18px;
          font-size: 14.5px; line-height: 1.6; font-weight: 500;
          box-shadow: 0 3px 12px rgba(13,148,136,.28);
        }
        .bubble-bot {
          max-width: 88%;
          padding: 14px 16px;
          background: var(--white);
          border: 1px solid #ddf0ee;
          border-radius: 4px 18px 18px 18px;
          box-shadow: 0 2px 10px rgba(0,0,0,.04);
        }
        .bot-label {
          font-size: 10px; font-weight: 700;
          color: var(--teal);
          letter-spacing: .06em;
          text-transform: uppercase;
          margin-bottom: 6px;
          display: flex; align-items: center; gap: 5px;
        }

        /* ── Quick cards ── */
        .cards-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 16px;
          animation: fadeSlideUp .3s ease both;
        }
        .qcard {
          border-radius: 16px;
          padding: 14px;
          cursor: pointer;
          border: 1.5px solid;
          transition: transform .18s, box-shadow .18s;
          text-align: left;
          background: white;
        }
        .qcard:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0,0,0,.1);
        }
        .qcard:active { transform: translateY(-1px); }

        /* ── Suggestion chips ── */
        .chips-wrap {
          display: flex; flex-wrap: wrap;
          gap: 7px;
          padding: 4px 0 8px;
          animation: fadeSlideUp .25s ease both;
        }
        .chip {
          padding: 7px 13px;
          border-radius: 20px;
          background: white;
          border: 1px solid #ddf0ee;
          font-size: 12.5px; font-weight: 600;
          color: #334155;
          cursor: pointer;
          transition: all .15s;
          font-family: inherit;
          box-shadow: 0 1px 4px rgba(0,0,0,.04);
        }
        .chip:hover {
          background: var(--teal-light);
          border-color: var(--teal);
          color: var(--teal-dark);
          transform: translateY(-1px);
        }

        /* ── Typing dots ── */
        .typing-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: var(--teal);
          animation: blink 1.3s ease infinite;
        }

        /* ── Image preview strip ── */
        .img-strip {
          background: #f0fdf9;
          border-top: 1px solid #a7f3d0;
          padding: 8px 20px;
          display: flex; align-items: center; gap: 10px;
          flex-shrink: 0;
          animation: fadeSlideUp .2s ease both;
        }

        /* ── Input panel ── */
        .c-input-panel {
          background: var(--white);
          border-top: 1px solid var(--border);
          padding: 12px 16px 12px;
          flex-shrink: 0;
          z-index: 10;
        }
        .c-input-row {
          display: flex;
          align-items: flex-end;
          gap: 10px;
        }
        .c-photo-btn {
          width: 48px; height: 48px;
          border-radius: 14px;
          border: 1.5px solid var(--border);
          background: var(--white);
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
          cursor: pointer;
          flex-shrink: 0;
          transition: all .18s;
        }
        .c-photo-btn:hover {
          border-color: var(--teal);
          background: var(--teal-light);
          transform: scale(1.05);
        }
        .c-textarea-wrap {
          flex: 1;
          position: relative;
        }
        .c-textarea {
          width: 100%;
          border: 1.5px solid var(--border);
          border-radius: 16px;
          padding: 13px 16px;
          font-size: 15px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 500;
          line-height: 1.55;
          resize: none;
          min-height: 52px;
          max-height: 160px;
          overflow-y: auto;
          background: #fafefe;
          color: var(--text);
          transition: border-color .2s, box-shadow .2s;
          display: block;
        }
        .c-textarea:focus {
          outline: none;
          border-color: var(--teal);
          background: white;
          box-shadow: 0 0 0 3px rgba(13,148,136,.09);
        }
        .c-textarea::placeholder { color: #a8bdb9; font-weight: 400; }
        .c-send-btn {
          width: 48px; height: 48px;
          border-radius: 14px;
          border: none;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: all .18s;
          font-size: 18px;
          font-weight: 800;
        }
        .c-send-btn.on {
          background: linear-gradient(135deg, #0d9488, #0891b2);
          box-shadow: 0 4px 14px rgba(13,148,136,.35);
          cursor: pointer;
          color: white;
        }
        .c-send-btn.on:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(13,148,136,.4);
        }
        .c-send-btn.off {
          background: #f1f5f9;
          cursor: not-allowed;
          color: #cbd5e1;
        }
        .c-hint {
          font-size: 11px; color: var(--faint); font-weight: 500;
          text-align: center;
          margin-top: 8px;
        }

        /* ── Disclaimer ── */
        .c-disclaimer {
          background: #fffcf0;
          border-top: 1px solid #fde68a;
          padding: 6px 16px;
          text-align: center;
          flex-shrink: 0;
        }
      `}</style>

      <div className="chat-root" onDragOver={e => e.preventDefault()} onDrop={handleDrop}>

        {/* ── Header ── */}
        <div className="c-header">
          <div className="c-avatar">🏥</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.2px' }}>
              Sehat24 Health Assistant
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <div className="c-online-dot" />
              <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                Medicine · Symptoms · Herbs
              </span>
            </div>
          </div>
          <div className="c-badge">{30 - msgsSent} msgs left</div>
        </div>

        {/* ── Messages ── */}
        <div className="c-messages">

          {/* Quick cards — only on welcome screen */}
          {showQuickCards && (
            <div className="cards-grid">
              {QUICK_CARDS.map((card, i) => (
                <div
                  key={i}
                  className="qcard"
                  style={{ borderColor: card.border }}
                  onClick={() => {
                    if (card.type === 'photo') { fileRef.current?.click(); return }
                    setInput(card.msg)
                    setTimeout(() => inputRef.current?.focus(), 50)
                  }}
                >
                  <div style={{ fontSize: 26, marginBottom: 8 }}>{card.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: card.color, marginBottom: 3 }}>{card.title}</div>
                  <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 500, lineHeight: 1.45 }}>{card.desc}</div>
                </div>
              ))}
            </div>
          )}

          {/* All messages */}
          {messages.map((msg, i) => (
            <div key={i} className={`msg-wrap ${msg.role === 'user' ? 'user' : 'bot'}`}>
              {msg.imagePreview && (
                <img
                  src={msg.imagePreview} alt="upload"
                  style={{ width: 150, height: 115, objectFit: 'cover', borderRadius: 14, border: '2px solid #0d9488', marginBottom: 7, boxShadow: '0 3px 10px rgba(13,148,136,.2)' }}
                />
              )}
              {msg.role === 'user'
                ? <div className="bubble-user">{msg.text}</div>
                : (
                  <div className="bubble-bot">
                    <div className="bot-label">
                      <span>🏥</span> Sehat24
                    </div>
                    <AIMessage text={msg.text} />
                  </div>
                )
              }
            </div>
          ))}

          {/* Suggestion chips */}
          {showSuggestions && (
            <div className="chips-wrap">
              <div style={{ width: '100%', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 4 }}>
                Yeh bhi pooch sakte ho
              </div>
              {SUGGESTIONS.map((q, i) => (
                <button
                  key={i}
                  className="chip"
                  onClick={() => { setInput(q); setTimeout(() => inputRef.current?.focus(), 50) }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Typing indicator */}
          {loading && (
            <div className="msg-wrap bot">
              <div className="bubble-bot" style={{ padding: '12px 16px' }}>
                <div className="bot-label"><span>🏥</span> Sehat24</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  {[0, 1, 2].map(j => (
                    <div key={j} className="typing-dot" style={{ animationDelay: `${j * 0.18}s` }} />
                  ))}
                  <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 6, fontStyle: 'italic' }}>
                    Jawab taiyaar kar raha hoon...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Image preview strip ── */}
        {imagePreview && (
          <div className="img-strip">
            <img
              src={imagePreview} alt="preview"
              style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 10, border: '2px solid #0d9488' }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f766e' }}>📸 Medicine photo ready</div>
              <div style={{ fontSize: 11.5, color: '#64748b' }}>Sawaal likhke bhejo ya seedha send karo</div>
            </div>
            <button
              onClick={() => { setImage(null); setImagePreview(null) }}
              style={{ background: 'white', border: '1.5px solid #fca5a5', color: '#dc2626', borderRadius: 9, padding: '5px 11px', cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'inherit', flexShrink: 0 }}
            >
              Hatao
            </button>
          </div>
        )}

        {/* ── Input ── */}
        <div className="c-input-panel">
          <div className="c-input-row">

            {/* Camera button */}
            <label className="c-photo-btn" title="Medicine photo upload karo">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => handleImage(e.target.files[0])}
              />
              📷
            </label>

            {/* Textarea */}
            <div className="c-textarea-wrap">
              <textarea
                ref={inputRef}
                className="c-textarea"
                value={input}
                onChange={e => {
                  setInput(e.target.value)
                  // Auto grow
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
                placeholder="Bimari, medicine ya health sawaal likhein..."
                rows={2}
              />
            </div>

            {/* Send button */}
            <button
              className={`c-send-btn ${isActive ? 'on' : 'off'}`}
              onClick={() => sendMessage()}
              disabled={!isActive}
            >
              {loading
                ? <div style={{ width: 18, height: 18, border: '2.5px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
                : '↑'
              }
            </button>
          </div>

          <div className="c-hint">
            📷 Medicine photo drag &amp; drop karo · Shift+Enter for new line
          </div>
        </div>

        {/* ── Disclaimer ── */}
        <div className="c-disclaimer">
          <span style={{ fontSize: 11, color: '#92400e', fontWeight: 600 }}>
            ⚕️ Sirf educational purposes — koi bhi decision lene se pehle doctor se zaroor milein
          </span>
        </div>

      </div>
    </>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ textAlign: 'center', color: '#0d9488' }}>
          <div style={{ width: 36, height: 36, border: '3px solid #ccfbf1', borderTopColor: '#0d9488', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 10px' }} />
          <div style={{ fontWeight: 700, fontSize: 14 }}>Loading...</div>
        </div>
      </div>
    }>
      <ChatContent />
    </Suspense>
  )
}
