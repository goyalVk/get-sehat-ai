'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

export default function ChatWidget() {
  const bottomRef = useRef(null)
  const [open, setOpen]           = useState(false)
  const [messages, setMessages]   = useState([])
  const [input, setInput]         = useState('')
  const [image, setImage]         = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading]     = useState(false)
  const [started, setStarted]     = useState(false)

  useEffect(() => {
    if (open && !started) {
      setStarted(true)
      setMessages([{
        role: 'assistant',
        text: `Namaste! 🙏 Main Sehat24 Medicine Assistant hoon.\n\nPoochho:\n→ Kisi medicine ke baare mein\n→ Side effects kya hain\n→ Fake vs original kaise pehchanein\n→ Medicine photo upload karein\n\n⚕️ Sirf general info — doctor replace nahi karta.`
      }])
    }
  }, [open, started])

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const handleImage = (f) => {
    if (!f) return
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowed.includes(f.type)) return
    setImage(f)
    setImagePreview(URL.createObjectURL(f))
  }

  const sendMessage = async () => {
  if ((!input.trim() && !image) || loading) return

  const userText = input.trim() || 'Is medicine ke baare mein batao'
  const userMsg  = { role: 'user', text: userText, imagePreview }

  setMessages(prev => [...prev, userMsg])
  setInput('')
  setImage(null)
  setImagePreview(null)
  setLoading(true)

  // Add empty assistant message
  setMessages(prev => [...prev, { role: 'assistant', text: '' }])

  try {
    const history = messages
      .filter(m => (m.role === 'user' || m.role === 'assistant') && m.text?.trim())
      .slice(-3)
      .map(m => ({ role: m.role, content: m.text }))

    const formData = new FormData()
    formData.append('message', userText)
    formData.append('history', JSON.stringify(history))
    if (image) formData.append('image', image)

    const res = await fetch('/api/chat', { method: 'POST', body: formData })
    if (!res.ok) throw new Error('Failed')

    const reader = res.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)

      // Update last message streaming
      setMessages(prev => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last.role === 'assistant') {
          updated[updated.length - 1] = {
            ...last,
            text: last.text + chunk
          }
        }
        return updated
      })
    }

  } catch {
    setMessages(prev => {
      const updated = [...prev]
      updated[updated.length - 1] = {
        role: 'assistant',
        text: 'Kuch problem aa gayi. Dobara try karo. 🙏'
      }
      return updated
    })
  } finally {
    setLoading(false)
  }
}

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    handleImage(e.dataTransfer.files[0])
  }, [])

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:0.3; transform:scale(0.8); } 50% { opacity:1; transform:scale(1.2); } }
        .chat-bubble-btn:hover { transform: scale(1.05) !important; }
        .chat-send:hover { background: #0f766e !important; }
        .chat-input:focus { border-color: #0d9488 !important; outline: none; }
        .chat-msg { animation: fadeIn 0.2s ease forwards; }
        .chat-close:hover { background: #f1f5f9 !important; }
      `}</style>

      {/* Floating button */}
      <button
        className="chat-bubble-btn"
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
          width: 56, height: 56, borderRadius: '50%',
          background: '#0d9488', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, boxShadow: '0 4px 20px rgba(13,148,136,0.4)',
          transition: 'transform 0.2s'
        }}>
        {open ? '✕' : '💊'}
      </button>

      {/* Chat window */}
      {open && (
        <div
          style={{
            position: 'fixed', bottom: 92, right: 24, zIndex: 999,
            width: 360, height: 520,
            background: 'white', borderRadius: 20,
            border: '1px solid #f1f5f9',
            boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
            display: 'flex', flexDirection: 'column',
            animation: 'fadeIn 0.2s ease forwards',
            fontFamily: "'Plus Jakarta Sans', sans-serif"
          }}
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
        >

          {/* Header */}
          <div style={{
            background: '#0d9488', borderRadius: '20px 20px 0 0',
            padding: '14px 16px', display: 'flex',
            alignItems: 'center', gap: 10
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 18
            }}>💊</div>
            <div style={{ flex: 1 }}>
              <p style={{ color: 'white', fontSize: 14, fontWeight: 700, margin: 0 }}>
                Medicine Assistant
              </p>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, margin: 0 }}>
                Sehat24 — Medicine queries only
              </p>
            </div>
            <button
              className="chat-close"
              onClick={() => setOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.2)', border: 'none',
                color: 'white', width: 28, height: 28, borderRadius: 8,
                cursor: 'pointer', fontSize: 14, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s'
              }}>
              ✕
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '14px 14px',
            display: 'flex', flexDirection: 'column', gap: 10
          }}>
            {messages.map((msg, i) => (
              <div key={i} className="chat-msg" style={{
                display: 'flex', flexDirection: 'column',
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                gap: 4
              }}>
                {msg.imagePreview && (
                  <img src={msg.imagePreview} alt="medicine"
                    style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 10, border: '2px solid #0d9488' }} />
                )}
                <div style={{
                  maxWidth: '85%',
                  background: msg.role === 'user' ? '#0d9488' : '#f8fafc',
                  color: msg.role === 'user' ? 'white' : '#0f172a',
                  border: msg.role === 'user' ? 'none' : '1px solid #f1f5f9',
                  borderRadius: msg.role === 'user'
                    ? '14px 14px 4px 14px'
                    : '14px 14px 14px 4px',
                  padding: '10px 12px', fontSize: 13, lineHeight: 1.6
                }}>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: msg.role === 'user' ? 'white' : '#0f172a' }}>
                    {msg.text}
                  </pre>
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', gap: 4, padding: '10px 12px', background: '#f8fafc', borderRadius: '14px 14px 14px 4px', width: 'fit-content', border: '1px solid #f1f5f9' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 7, height: 7, borderRadius: '50%', background: '#0d9488',
                    animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`
                  }} />
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Image preview */}
          {imagePreview && (
            <div style={{
              padding: '8px 14px', borderTop: '1px solid #f1f5f9',
              display: 'flex', alignItems: 'center', gap: 8, background: '#f0fdfa'
            }}>
              <img src={imagePreview} alt="preview"
                style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 8, border: '1.5px solid #0d9488' }} />
              <p style={{ fontSize: 12, color: '#0d9488', fontWeight: 600, flex: 1, margin: 0 }}>
                Medicine image ready
              </p>
              <button onClick={() => { setImage(null); setImagePreview(null) }}
                style={{ background: '#fef2f2', border: 'none', color: '#dc2626', padding: '4px 8px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                ×
              </button>
            </div>
          )}

          {/* Input */}
          <div style={{
            padding: '10px 12px', borderTop: '1px solid #f1f5f9',
            display: 'flex', gap: 8, alignItems: 'flex-end'
          }}>
            <label style={{ cursor: 'pointer', flexShrink: 0 }}>
              <input type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => handleImage(e.target.files[0])} />
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                border: '1px solid #e2e8f0', background: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, cursor: 'pointer'
              }}>
                📷
              </div>
            </label>

            <textarea
              className="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault(); sendMessage()
                }
              }}
              placeholder="Medicine poochho..."
              rows={1}
              style={{
                flex: 1, border: '1px solid #e2e8f0', borderRadius: 10,
                padding: '9px 12px', fontSize: 13, resize: 'none',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                lineHeight: 1.5, maxHeight: 80, overflowY: 'auto',
                background: '#f8fafc', color: '#0f172a'
              }}
            />

            <button
              className="chat-send"
              onClick={sendMessage}
              disabled={loading || (!input.trim() && !image)}
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: (input.trim() || image) && !loading ? '#0d9488' : '#f1f5f9',
                border: 'none', cursor: (input.trim() || image) ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, transition: 'all 0.2s', flexShrink: 0
              }}>
              {loading
                ? <div style={{ width: 16, height: 16, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                : <span style={{ color: (input.trim() || image) ? 'white' : '#94a3b8' }}>↑</span>
              }
            </button>
          </div>

          {/* Disclaimer */}
          <div style={{ background: '#fffbeb', borderTop: '1px solid #fde68a', padding: '6px 12px', borderRadius: '0 0 20px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: 10, color: '#92400e', margin: 0 }}>
              ⚕️ General info only. Always consult your doctor.
            </p>
          </div>
        </div>
      )}
    </>
  )
}