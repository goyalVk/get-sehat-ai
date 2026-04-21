'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'

export default function ChatPage() {
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)
  const fileRef   = useRef(null)

  const [messages, setMessages]         = useState([])
  const [input, setInput]               = useState('')
  const [image, setImage]               = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading]           = useState(false)

  useEffect(() => {
    setMessages([{
      role: 'assistant',
      text: `Namaste! 🙏 Main Sehat24 Medicine Assistant hoon.\n\nMujhse poochho:\n→ Kisi bhi medicine ke baare mein\n→ Side effects, dose timing, interactions\n→ 2 medicines saath le sakte hain?\n→ Koi bimari ya symptom ke liye herbs\n\n📸 Sabse accurate answer ke liye — medicine strip ya box ki PHOTO UPLOAD karo. Main directly composition padh ke sahi jawab dunga.\n\n⚕️ Main sirf medicine aur health related questions answer karta hoon.`
    }])
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleImage = (f) => {
    if (!f) return
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowed.includes(f.type)) {
      alert('Sirf JPG, PNG ya WebP image upload karo.')
      return
    }
    if (f.size > 5 * 1024 * 1024) {
      alert('Image 5MB se chhoti honi chahiye.')
      return
    }
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

    try {
      const history = messages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .slice(-8)
        .map(m => ({ role: m.role, content: m.text }))

      const formData = new FormData()
      formData.append('message', userText)
      formData.append('history', JSON.stringify(history))
      if (image) formData.append('image', image)

      const res = await fetch('/api/chat', { method: 'POST', body: formData })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        setMessages(prev => [...prev, {
          role: 'assistant',
          text: errData.reply || errData.error || 'Kuch gadbad ho gayi. Dobara try karo. 🙏'
        }])
        return
      }

      // ── Streaming ──
      const reader   = res.body.getReader()
      const decoder  = new TextDecoder()
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
      console.error('Chat error:', err)
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: 'Network error. Internet check karo aur dobara try karo. 🙏',
        isError: true
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) handleImage(f)
  }, [])

  const suggestions = [
    { label: '📸 Medicine photo upload', action: () => fileRef.current?.click() },
    { label: 'Paracetamol vs Dolo?', action: () => setInput('Paracetamol aur Dolo 650 mein kya fark hai?') },
    { label: 'Metformin side effects?', action: () => setInput('Metformin ke side effects kya hain?') },
    { label: 'Diabetes ke liye herbs?', action: () => setInput('Diabetes ke liye kaunse Ayurvedic herbs helpful hain?') },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes dot { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.2)} }
        .msg-bubble { animation: fadeUp 0.25s ease forwards; }
        .send-btn:hover:not(:disabled) { background: #0f766e !important; transform: translateY(-1px); }
        .attach-btn:hover { background: #f0fdfa !important; border-color: #0d9488 !important; }
        .input-box:focus { border-color: #0d9488 !important; outline: none; }
        .suggest-chip:hover { background: #e0faf7 !important; border-color: #0d9488 !important; }
        pre { white-space: pre-wrap; font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>

      <main style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', background: '#f8fafc', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

        {/* ── Header ── */}
        <div style={{ background: 'white', borderBottom: '1px solid #f1f5f9', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #0d9488, #0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
            💊
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Medicine Assistant</p>
            <p style={{ fontSize: 12, color: '#0d9488', margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 6, height: 6, background: '#22c55e', borderRadius: '50%', display: 'inline-block' }} />
              Online — Medicine queries only
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/upload" style={{ fontSize: 12, color: '#0d9488', textDecoration: 'none', background: '#f0fdfa', border: '1px solid #99f6e4', padding: '6px 12px', borderRadius: 10, fontWeight: 600 }}>
              📋 Report Upload
            </Link>
          </div>
        </div>

        {/* ── Photo Upload Banner ── */}
        <div style={{ background: 'linear-gradient(135deg, #f0fdfa, #ecfdf5)', borderBottom: '1px solid #99f6e4', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span style={{ fontSize: 16 }}>📸</span>
          <p style={{ fontSize: 12, color: '#0d9488', fontWeight: 600, flex: 1 }}>
            Accurate answer ke liye — medicine strip ya box ki photo upload karo
          </p>
          <button
            onClick={() => fileRef.current?.click()}
            style={{ background: '#0d9488', color: 'white', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", flexShrink: 0 }}
          >
            Upload Photo
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImage(e.target.files[0])} />
        </div>

        {/* ── Messages ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {messages.map((msg, i) => (
            <div key={i} className="msg-bubble" style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 4 }}>
              {msg.imagePreview && (
                <img src={msg.imagePreview} alt="medicine" style={{ width: 160, height: 120, objectFit: 'cover', borderRadius: 12, border: '2px solid #0d9488' }} />
              )}
              <div style={{
                maxWidth: '78%',
                background: msg.role === 'user' ? 'linear-gradient(135deg, #0d9488, #0891b2)' : 'white',
                color: msg.role === 'user' ? 'white' : '#0f172a',
                border: msg.role === 'user' ? 'none' : '1px solid #f1f5f9',
                borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                padding: '12px 16px', fontSize: 14, lineHeight: 1.7,
                boxShadow: msg.role === 'user' ? '0 4px 12px rgba(13,148,136,0.25)' : '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                <pre style={{ margin: 0, color: msg.role === 'user' ? 'white' : '#0f172a' }}>{msg.text}</pre>
              </div>
            </div>
          ))}

          {/* Suggestion chips — only after first message */}
          {messages.length === 1 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
              {suggestions.map((s, i) => (
                <button key={i} className="suggest-chip" onClick={s.action} style={{
                  background: '#f0fdfa', border: '1px solid #99f6e4',
                  borderRadius: 20, padding: '7px 14px',
                  fontSize: 12, color: '#0d9488', cursor: 'pointer',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 600, transition: 'all 0.2s'
                }}>
                  {s.label}
                </button>
              ))}
            </div>
          )}

          {/* Loading dots */}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              <div style={{ background: 'white', border: '1px solid #f1f5f9', borderRadius: '18px 18px 18px 4px', padding: '12px 16px', display: 'flex', gap: 5, alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#0d9488', animation: `dot 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* ── Image Preview ── */}
        {imagePreview && (
          <div style={{ background: 'white', borderTop: '1px solid #f1f5f9', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <img src={imagePreview} alt="preview" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 10, border: '2px solid #0d9488' }} />
            <p style={{ fontSize: 13, color: '#0d9488', fontWeight: 600, flex: 1 }}>📸 Medicine image ready — AI composition padh ke answer dega</p>
            <button onClick={() => { setImage(null); setImagePreview(null) }}
              style={{ background: '#fef2f2', border: 'none', color: '#dc2626', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
              Remove ×
            </button>
          </div>
        )}

        {/* ── Input ── */}
        <div style={{ background: 'white', borderTop: '1px solid #f1f5f9', padding: '14px 24px', display: 'flex', gap: 10, alignItems: 'flex-end', flexShrink: 0 }}
          onDragOver={e => e.preventDefault()} onDrop={handleDrop}>

          {/* Camera / attach */}
          <label style={{ cursor: 'pointer', flexShrink: 0 }}>
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImage(e.target.files[0])} />
            <div className="attach-btn" style={{ width: 44, height: 44, borderRadius: 12, border: '1px solid #e2e8f0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, cursor: 'pointer', transition: 'all 0.2s' }}>
              📷
            </div>
          </label>

          {/* Text input */}
          <textarea
            ref={inputRef}
            className="input-box"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            placeholder="Medicine ka naam poochho, ya strip ki photo upload karo..."
            rows={1}
            style={{
              flex: 1, border: '1px solid #e2e8f0', borderRadius: 14,
              padding: '12px 16px', fontSize: 14, resize: 'none',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              lineHeight: 1.5, maxHeight: 120, overflowY: 'auto',
              background: '#f8fafc', color: '#0f172a', transition: 'border-color 0.2s'
            }}
          />

          {/* Send */}
          <button className="send-btn" onClick={sendMessage} disabled={loading || (!input.trim() && !image)}
            style={{
              width: 44, height: 44, borderRadius: 12,
              background: (input.trim() || image) && !loading ? '#0d9488' : '#f1f5f9',
              border: 'none', cursor: (input.trim() || image) && !loading ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, transition: 'all 0.2s', flexShrink: 0
            }}>
            {loading
              ? <div style={{ width: 18, height: 18, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              : <span style={{ color: (input.trim() || image) ? 'white' : '#94a3b8' }}>↑</span>
            }
          </button>
        </div>

        {/* ── Disclaimer ── */}
        <div style={{ background: '#fffbeb', borderTop: '1px solid #fde68a', padding: '8px 24px', textAlign: 'center', flexShrink: 0 }}>
          <p style={{ fontSize: 11, color: '#92400e', margin: 0 }}>
            ⚕️ Educational purposes only. Accurate answer ke liye photo upload karein. Doctor se zaroor milein.
          </p>
        </div>

      </main>
    </>
  )
}