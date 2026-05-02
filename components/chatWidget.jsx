'use client'
import { useState, useRef, useEffect, useCallback } from 'react'

function AIText({ text }) {
  const lines = text.split('\n')
  return (
    <div style={{ fontSize: 13, lineHeight: 1.75, color: '#1e293b', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} style={{ height: 5 }} />

        if (/^[🌿🥗🚨💊🔴🟡🟢⚕️🛒⚠️📸🏥❤️💡✅🌱]/.test(line)) {
          return <div key={i} style={{ fontWeight: 700, fontSize: 12.5, color: '#0f766e', marginTop: 8, marginBottom: 2 }}>{line}</div>
        }

        if (/^[-•→*]/.test(line.trim())) {
          return (
            <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 3, alignItems: 'flex-start' }}>
              <span style={{ color: '#0d9488', fontWeight: 800, flexShrink: 0, fontSize: 14, lineHeight: 1.4 }}>·</span>
              <span style={{ color: '#334155' }}>{line.replace(/^[-•→*]\s*/, '')}</span>
            </div>
          )
        }

        return <div key={i} style={{ color: '#475569', marginBottom: 1 }}>{line}</div>
      })}
    </div>
  )
}

const SUGGESTIONS = [
  '🤒 Bukhaar ka gharelu ilaj?',
  '💊 Dolo 650 kya hai?',
  '🌿 BP ke liye herbs?',
]

export default function ChatWidget() {
  const [open, setOpen]         = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput]       = useState('')
  const [image, setImage]       = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading]   = useState(false)
  const [unread, setUnread]     = useState(0)
  const bottomRef               = useRef(null)
  const inputRef                = useRef(null)
  const fileInputRef            = useRef(null)
  const isFirstMount            = useRef(true)

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        text: 'Namaste! 🙏 Health ya medicine se related koi bhi sawaal poochho.\n\n💊 Medicine info\n🤒 Symptoms aur herbs\n📸 Medicine photo bhi bhej sakte ho\n\nMain help karne ke liye hoon!'
      }])
      setUnread(0)
    }
    if (open) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 200)
    }
  }, [open])

  useEffect(() => {
    if (isFirstMount.current) { isFirstMount.current = false; return }
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80)
  }, [messages.length, loading])

  useEffect(() => {
    const lastMsg = messages[messages.length - 1]
    if (!open && lastMsg?.role === 'assistant' && messages.length > 1) {
      setUnread(u => u + 1)
    }
  }, [messages.length])

  const handleImage = useCallback((f) => {
    if (!f || !f.type.startsWith('image/')) return
    if (f.size > 5 * 1024 * 1024) { alert('5MB se chhoti image upload karo'); return }
    setImage(f)
    setImagePreview(URL.createObjectURL(f))
    inputRef.current?.focus()
  }, [])

  const send = useCallback(async (overrideText) => {
    const text = (overrideText !== undefined ? overrideText : input).trim()
    if ((!text && !image) || loading) return

    const displayText = text || 'Is medicine ke baare mein batao'
    setMessages(prev => [...prev, { role: 'user', text: displayText, imagePreview }])
    setInput('')
    const sentImage = image
    setImage(null)
    setImagePreview(null)
    setLoading(true)

    try {
      const history = messages.slice(-4).map(m => ({ role: m.role, content: m.text }))
      const fd = new FormData()
      fd.append('message', displayText)
      fd.append('history', JSON.stringify(history))
      if (sentImage) fd.append('image', sentImage)

      const res = await fetch('/api/chat', { method: 'POST', body: fd })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setMessages(prev => [...prev, { role: 'assistant', text: err.reply || 'Dobara try karo. 🙏' }])
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
      setMessages(prev => [...prev, { role: 'assistant', text: 'Network error. Dobara try karo. 🙏' }])
    } finally {
      setLoading(false)
    }
  }, [input, image, imagePreview, loading, messages])

  const isActive = (input.trim().length > 0 || !!image) && !loading

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes wPulse { 0%,100%{box-shadow:0 4px 20px rgba(13,148,136,.4)}50%{box-shadow:0 4px 32px rgba(13,148,136,.7)} }
        @keyframes wOpen  { from{opacity:0;transform:translateY(14px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes wDot   { 0%,80%,100%{opacity:.3;transform:scale(.8)}40%{opacity:1;transform:scale(1.1)} }
        @keyframes wSpin  { to{transform:rotate(360deg)} }
        @keyframes wBadge { from{transform:scale(0)}to{transform:scale(1)} }
        .wchip:hover { background:#f0fdfa!important;border-color:#0d9488!important;color:#0d9488!important; }
        .wcam:hover  { border-color:#0d9488!important;background:#f0fdfa!important; }
        .wsend-on:hover { transform:translateY(-1px)!important;box-shadow:0 5px 14px rgba(13,148,136,.4)!important; }
        .wfab-btn:hover  { transform:scale(1.08)!important; }
        .wchat-msgs::-webkit-scrollbar { width:3px }
        .wchat-msgs::-webkit-scrollbar-thumb { background:#b2dfdb;border-radius:2px }
        @media (max-width: 768px) {
          .wfab-btn { display: none !important; }
          .wchat-box { display: none !important; }
        }
      `}</style>

      {/* ── Hidden file input ── */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => { handleImage(e.target.files[0]); e.target.value = '' }}
      />

      {/* ── FAB Button ── */}
      <button
        className="wfab-btn"
        onClick={() => setOpen(o => !o)}
        title="Health Assistant"
        style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 9999,
          width: 58, height: 58, borderRadius: '50%', border: 'none',
          background: 'linear-gradient(135deg, #0d9488, #0891b2)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, transition: 'all .2s',
          boxShadow: '0 4px 20px rgba(13,148,136,.4)',
          animation: !open ? 'wPulse 2.5s ease-in-out infinite' : 'none',
        }}
      >
        {open
          ? <span style={{ color: 'white', fontSize: 18, fontWeight: 800 }}>✕</span>
          : <>
              <span>💊</span>
              {unread > 0 && (
                <div style={{
                  position: 'absolute', top: -4, right: -4,
                  width: 20, height: 20, borderRadius: '50%',
                  background: '#ef4444', color: 'white',
                  fontSize: 10, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid white', animation: 'wBadge .2s ease both'
                }}>{unread}</div>
              )}
            </>
        }
      </button>

      {/* ── Chat Window ── */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 90, right: 20, zIndex: 9998,
          width: 340, height: 510,
          background: 'white', borderRadius: 22,
          boxShadow: '0 24px 64px rgba(0,0,0,.14)',
          border: '1px solid #e8f5f3',
          display: 'flex', flexDirection: 'column',
          animation: 'wOpen .24s cubic-bezier(.34,1.56,.64,1) forwards',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          overflow: 'hidden',
        }}>

          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)', padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>🏥</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: 'white', fontWeight: 800, fontSize: 13.5 }}>Health Assistant</div>
              <div style={{ color: 'rgba(255,255,255,.75)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 5, marginTop: 1 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block', flexShrink: 0 }} />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>Online · Medicine · Herbs</span>
              </div>
            </div>
            <a href="/chat" style={{ color: 'rgba(255,255,255,.9)', fontSize: 11, textDecoration: 'none', background: 'rgba(255,255,255,.15)', padding: '4px 10px', borderRadius: 8, fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap' }}>
              Full Chat →
            </a>
          </div>

          {/* Messages */}
          <div className="wchat-msgs" style={{ flex: 1, overflowY: 'auto', padding: '14px 12px 8px', display: 'flex', flexDirection: 'column', background: '#f8fffe' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
                {msg.imagePreview && (
                  <img src={msg.imagePreview} alt="upload"
                    style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 10, border: '2px solid #0d9488', marginBottom: 6 }}
                  />
                )}
                {msg.role === 'user'
                  ? (
                    <div style={{ maxWidth: '82%', padding: '9px 13px', background: 'linear-gradient(135deg, #0d9488, #0891b2)', color: 'white', borderRadius: '16px 16px 3px 16px', fontSize: 13, lineHeight: 1.55, fontWeight: 500, boxShadow: '0 2px 8px rgba(13,148,136,.25)' }}>
                      {msg.text}
                    </div>
                  )
                  : (
                    <div style={{ maxWidth: '88%', padding: '10px 13px', background: 'white', border: '1px solid #ddf0ee', borderRadius: '3px 16px 16px 16px', boxShadow: '0 1px 6px rgba(0,0,0,.05)' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#0d9488', letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: 4 }}>🏥 Sehat24</div>
                      <AIText text={msg.text} />
                    </div>
                  )
                }
              </div>
            ))}

            {/* Typing */}
            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ padding: '10px 14px', background: 'white', border: '1px solid #ddf0ee', borderRadius: '3px 16px 16px 16px', boxShadow: '0 1px 6px rgba(0,0,0,.05)' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#0d9488', textTransform: 'uppercase', marginBottom: 4 }}>🏥 Sehat24</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {[0,1,2].map(j => (
                      <div key={j} style={{ width: 7, height: 7, borderRadius: '50%', background: '#0d9488', animation: `wDot 1.3s ease ${j*.18}s infinite` }} />
                    ))}
                    <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 6, fontStyle: 'italic' }}>Soch raha hoon...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Suggestions */}
            {messages.length === 1 && !loading && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} className="wchip" onClick={() => send(s)}
                    style={{ background: 'white', border: '1px solid #ddf0ee', borderRadius: 16, padding: '5px 11px', fontSize: 11.5, fontWeight: 600, color: '#334155', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all .14s', whiteSpace: 'nowrap' }}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Image preview */}
          {imagePreview && (
            <div style={{ background: '#f0fdf9', borderTop: '1px solid #a7f3d0', padding: '7px 12px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <img src={imagePreview} alt="preview" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 8, border: '2px solid #0d9488', flexShrink: 0 }} />
              <span style={{ fontSize: 11.5, color: '#0f766e', fontWeight: 600, flex: 1 }}>📸 Photo ready — sawaal likhke bhejo</span>
              <button onClick={() => { setImage(null); setImagePreview(null) }}
                style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 16, padding: '0 4px', fontWeight: 700 }}>×</button>
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '10px 12px', borderTop: '1px solid #e8f5f3', background: 'white', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>

              {/* Camera button — div with onClick */}
              <div
                className="wcam"
                onClick={() => fileInputRef.current?.click()}
                title="Medicine photo upload karo"
                style={{
                  width: 38, height: 38, borderRadius: 10,
                  border: '1.5px solid #e2eeec', background: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, cursor: 'pointer', flexShrink: 0,
                  transition: 'all .18s', userSelect: 'none',
                }}
              >
                📷
              </div>

              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); send() } }}
                placeholder="Medicine ya health sawaal..."
                style={{
                  flex: 1, border: '1.5px solid #dde8e6', borderRadius: 12,
                  padding: '10px 13px', fontSize: 13, fontWeight: 500,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  background: '#fafefe', color: '#1e293b',
                  transition: 'all .18s', outline: 'none',
                }}
                onFocus={e => { e.target.style.borderColor = '#0d9488'; e.target.style.boxShadow = '0 0 0 3px rgba(13,148,136,.08)'; e.target.style.background = 'white' }}
                onBlur={e => { e.target.style.borderColor = '#dde8e6'; e.target.style.boxShadow = 'none'; e.target.style.background = '#fafefe' }}
              />

              <div
                className={isActive ? 'wsend-on' : ''}
                onClick={() => { if (isActive) send() }}
                style={{
                  width: 38, height: 38, borderRadius: 11,
                  background: isActive ? 'linear-gradient(135deg, #0d9488, #0891b2)' : '#f1f5f9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, fontWeight: 800, flexShrink: 0,
                  cursor: isActive ? 'pointer' : 'not-allowed',
                  color: isActive ? 'white' : '#cbd5e1',
                  transition: 'all .18s',
                  boxShadow: isActive ? '0 3px 10px rgba(13,148,136,.3)' : 'none',
                  userSelect: 'none',
                }}
              >
                {loading
                  ? <div style={{ width: 14, height: 14, border: '2.5px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'wSpin .7s linear infinite' }} />
                  : '↑'
                }
              </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: 6 }}>
              <span style={{ fontSize: 10, color: '#b0c4c0', fontWeight: 500 }}>⚕️ Educational only · Doctor se zaroor milein</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
