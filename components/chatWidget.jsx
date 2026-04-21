'use client'
import { useState, useRef, useEffect } from 'react'

export default function ChatWidget() {
  const [open, setOpen]           = useState(false)
  const [messages, setMessages]   = useState([])
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(false)
  const bottomRef                 = useRef(null)

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        text: 'Namaste! 🙏\n\nKoi bhi medicine ke baare mein poochho — dose, side effects, interactions.\n\nHindi ya English — dono chalega!'
      }])
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

 const send = async () => {
  if (!input.trim() || loading) return
  const userText = input.trim()
  setMessages(prev => [...prev, { role: 'user', text: userText }])
  setInput('')
  setLoading(true)

  try {
    const history = messages.slice(-4).map(m => ({ role: m.role, content: m.text }))
    const formData = new FormData()
    formData.append('message', userText)
    formData.append('history', JSON.stringify(history))

    const res = await fetch('/api/chat', { method: 'POST', body: formData })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: errData.reply || 'Dobara try karo. 🙏'
      }])
      return
    }

    // Streaming
    const reader  = res.body.getReader()
    const decoder = new TextDecoder()
    let   fullText = ''

    setMessages(prev => [...prev, { role: 'assistant', text: '' }])

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      fullText += decoder.decode(value, { stream: true })
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'assistant', text: fullText }
        return updated
      })
    }

  } catch (err) {
    console.error('Widget chat error:', err)
    setMessages(prev => [...prev, { role: 'assistant', text: 'Dobara try karo. 🙏' }])
  } finally {
    setLoading(false)
  }
}

  return (
    <>
      <style>{`
        @keyframes widgetPulse {
          0%,100% { box-shadow: 0 4px 20px rgba(13,148,136,0.4); }
          50%      { box-shadow: 0 4px 30px rgba(13,148,136,0.7); }
        }
        @keyframes widgetFadeIn {
          from { opacity:0; transform:translateY(16px) scale(0.95); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes spin { to { transform:rotate(360deg) } }
        @keyframes dot  {
          0%,100% { opacity:0.3; transform:scale(0.8); }
          50%     { opacity:1;   transform:scale(1.2); }
        }
        .widget-input:focus { border-color:#0d9488!important; outline:none; }
        .widget-send:hover  { background:#0f766e!important; }
        .widget-close:hover { opacity:0.8; }
      `}</style>

      {/* WhatsApp Support — bottom left */}
      
        <a 
        href="https://wa.me/918076170877?text=Namaste%20Sehat24!%20Mujhe%20help%20chahiye."
        target="_blank"
        rel="noopener noreferrer"
        title="WhatsApp Support"
        style={{
          position: 'fixed', bottom: 24, left: 24, zIndex: 9998,
          width: 52, height: 52, borderRadius: '50%',
          background: '#25d366',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, textDecoration: 'none',
          boxShadow: '0 4px 20px rgba(37,211,102,0.4)',
          transition: 'all 0.2s'
        }}
      >
        💬
      </a>

      {/* 💊 Medicine Chat Button — bottom right */}
      <button
        onClick={() => setOpen(!open)}
        title="Medicine AI Chat"
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          width: 60, height: 60, borderRadius: '50%',
          background: 'linear-gradient(135deg, #0d9488, #0891b2)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26,
          animation: !open ? 'widgetPulse 2.5s ease-in-out infinite' : 'none',
          boxShadow: '0 4px 20px rgba(13,148,136,0.4)',
          transition: 'all 0.2s'
        }}
      >
        {open ? (
          <span style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>✕</span>
        ) : '💊'}
      </button>

      {/* Chat Window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 96, right: 24, zIndex: 9998,
          width: 340, height: 490,
          background: 'white', borderRadius: 20,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          border: '1px solid #f1f5f9',
          display: 'flex', flexDirection: 'column',
          animation: 'widgetFadeIn 0.25s ease forwards',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          overflow: 'hidden'
        }}>

          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #0d9488, #0891b2)',
            padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 10,
            flexShrink: 0
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, flexShrink: 0
            }}>💊</div>
            <div style={{ flex: 1 }}>
              <p style={{ color: 'white', fontWeight: 700, fontSize: 14, margin: 0 }}>Medicine AI</p>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, margin: 0 }}>● Online — Free</p>
            </div>
            <a href="/chat" style={{
              color: 'rgba(255,255,255,0.85)', fontSize: 11,
              textDecoration: 'none',
              background: 'rgba(255,255,255,0.15)',
              padding: '4px 10px', borderRadius: 8,
              fontWeight: 600, flexShrink: 0
            }}>
              Full Chat →
            </a>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto',
            padding: '14px', display: 'flex',
            flexDirection: 'column', gap: 10
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  maxWidth: '83%',
                  background: msg.role === 'user' ? '#0d9488' : '#f8fafc',
                  color: msg.role === 'user' ? 'white' : '#0f172a',
                  border: msg.role === 'user' ? 'none' : '1px solid #f1f5f9',
                  borderRadius: msg.role === 'user'
                    ? '14px 14px 3px 14px'
                    : '14px 14px 14px 3px',
                  padding: '10px 13px',
                  fontSize: 13, lineHeight: 1.6,
                  whiteSpace: 'pre-wrap'
                }}>
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Loading dots */}
            {loading && (
              <div style={{ display: 'flex' }}>
                <div style={{
                  background: '#f8fafc', border: '1px solid #f1f5f9',
                  borderRadius: '14px 14px 14px 3px',
                  padding: '10px 14px', display: 'flex', gap: 5, alignItems: 'center'
                }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: '#0d9488',
                      animation: `dot 1.2s ease-in-out ${i * 0.2}s infinite`
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions — only on first message */}
          {messages.length === 1 && (
            <div style={{ padding: '0 14px 10px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[
                'Paracetamol dose?',
                'Metformin side effects?',
                'Azithromycin kya hai?',
              ].map((s, i) => (
                <button key={i} onClick={() => { setInput(s); }} style={{
                  background: '#f0fdfa', border: '1px solid #99f6e4',
                  borderRadius: 20, padding: '5px 12px',
                  fontSize: 11, color: '#0d9488', cursor: 'pointer',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 600, whiteSpace: 'nowrap'
                }}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{
            padding: '10px 12px',
            borderTop: '1px solid #f1f5f9',
            display: 'flex', gap: 8, alignItems: 'center',
            flexShrink: 0
          }}>
            <input
              className="widget-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder="Medicine ka naam poochho..."
              style={{
                flex: 1, border: '1px solid #e2e8f0', borderRadius: 10,
                padding: '10px 12px', fontSize: 13,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                background: '#f8fafc', color: '#0f172a',
                transition: 'border-color 0.2s'
              }}
            />
            <button
              className="widget-send"
              onClick={send}
              disabled={loading || !input.trim()}
              style={{
                width: 38, height: 38, borderRadius: 10,
                background: input.trim() && !loading ? '#0d9488' : '#f1f5f9',
                border: 'none',
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all 0.2s'
              }}
            >
              {loading
                ? <div style={{ width: 14, height: 14, border: '2px solid #0d9488', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                : <span style={{ color: input.trim() ? 'white' : '#94a3b8', fontSize: 16, lineHeight: 1 }}>↑</span>
              }
            </button>
          </div>

          {/* Disclaimer */}
          <div style={{ padding: '6px 12px 10px', textAlign: 'center', flexShrink: 0 }}>
            <p style={{ fontSize: 10, color: '#cbd5e1', margin: 0 }}>
              Educational only. Doctor se zaroor milein.
            </p>
          </div>
        </div>
      )}
    </>
  )
}