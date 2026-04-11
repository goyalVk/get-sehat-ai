'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ChatPage() {
  const router  = useRouter()
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  const [messages, setMessages]   = useState([])
  const [input, setInput]         = useState('')
  const [image, setImage]         = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading]     = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => { checkAuth() }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (!res.ok) { router.push('/auth/login?redirect=/chat'); return }
      setAuthChecked(true)
      setMessages([{
        role: 'assistant',
        text: `Namaste! 🙏 Main Sehat24 Medicine Assistant hoon.\n\nMujhse poochho:\n→ Kisi bhi medicine ke baare mein\n→ Side effects kya hain\n→ Fake vs original kaise pehchanein\n→ Medicine ki photo upload karke identify karein\n\n⚕️ Main sirf medicine related questions answer karta hoon.`
      }])
    } catch {
      router.push('/auth/login?redirect=/chat')
    }
  }

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

    try {
      const history = messages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .slice(-6)
        .map(m => ({
          role:    m.role,
          content: m.text
        }))

      const formData = new FormData()
      formData.append('message', userText)
      formData.append('history', JSON.stringify(history))
      if (image) formData.append('image', image)

      const res  = await fetch('/api/chat', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      setMessages(prev => [...prev, { role: 'assistant', text: data.reply }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: 'Kuch problem aa gayi. Dobara try karo. 🙏',
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

  if (!authChecked) {
    return (
      <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '2px solid #0d9488', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </main>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .msg-bubble { animation: fadeUp 0.3s ease forwards; }
        .send-btn:hover { background: #0f766e !important; transform: translateY(-1px); }
        .attach-btn:hover { background: #f0fdfa !important; border-color: #0d9488 !important; }
        .input-box:focus { border-color: #0d9488 !important; outline: none; }
        pre { white-space: pre-wrap; font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>

      <main style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', background: '#f8fafc', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

        {/* Chat header */}
        <div style={{ background: 'white', borderBottom: '1px solid #f1f5f9', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
            💊
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Medicine Assistant</p>
            <p style={{ fontSize: 12, color: '#0d9488', margin: 0, fontWeight: 600 }}>● Online — Medicine queries only</p>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <Link href="/dashboard" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '6px 14px', borderRadius: 10 }}>
              Dashboard →
            </Link>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {messages.map((msg, i) => (
            <div key={i} className="msg-bubble" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
              gap: 4
            }}>
              {/* Image preview */}
              {msg.imagePreview && (
                <img src={msg.imagePreview} alt="medicine"
                  style={{ width: 160, height: 120, objectFit: 'cover', borderRadius: 12, border: '2px solid #0d9488' }} />
              )}

              <div style={{
                maxWidth: '75%',
                background: msg.role === 'user' ? '#0d9488' : 'white',
                color: msg.role === 'user' ? 'white' : '#0f172a',
                border: msg.role === 'user' ? 'none' : '1px solid #f1f5f9',
                borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                padding: '12px 16px',
                fontSize: 14,
                lineHeight: 1.7
              }}>
                <pre style={{ margin: 0, color: msg.role === 'user' ? 'white' : '#0f172a' }}>
                  {msg.text}
                </pre>
              </div>
            </div>
          ))}

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <div style={{ background: 'white', border: '1px solid #f1f5f9', borderRadius: '18px 18px 18px 4px', padding: '12px 16px', display: 'flex', gap: 4, alignItems: 'center' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 8, height: 8, borderRadius: '50%', background: '#0d9488',
                    animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Image preview bar */}
        {imagePreview && (
          <div style={{ background: 'white', borderTop: '1px solid #f1f5f9', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={imagePreview} alt="preview" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 10, border: '2px solid #0d9488' }} />
            <p style={{ fontSize: 13, color: '#0d9488', fontWeight: 600, flex: 1 }}>Medicine image ready to send</p>
            <button onClick={() => { setImage(null); setImagePreview(null) }}
              style={{ background: '#fef2f2', border: 'none', color: '#dc2626', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
              Remove ×
            </button>
          </div>
        )}

        {/* Input area */}
        <div style={{
          background: 'white', borderTop: '1px solid #f1f5f9',
          padding: '14px 24px', display: 'flex', gap: 10, alignItems: 'flex-end'
        }}
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
        >
          {/* Attach image */}
          <label style={{ cursor: 'pointer', flexShrink: 0 }}>
            <input type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => handleImage(e.target.files[0])} />
            <div className="attach-btn" style={{
              width: 44, height: 44, borderRadius: 12,
              border: '1px solid #e2e8f0', background: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, cursor: 'pointer', transition: 'all 0.2s'
            }}>
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
            placeholder="Medicine ka naam poochho, photo upload karo..."
            rows={1}
            style={{
              flex: 1, border: '1px solid #e2e8f0', borderRadius: 14,
              padding: '12px 16px', fontSize: 14, resize: 'none',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              lineHeight: 1.5, maxHeight: 120, overflowY: 'auto',
              background: '#f8fafc', color: '#0f172a'
            }}
          />

          {/* Send */}
          <button className="send-btn" onClick={sendMessage} disabled={loading || (!input.trim() && !image)}
            style={{
              width: 44, height: 44, borderRadius: 12,
              background: (input.trim() || image) && !loading ? '#0d9488' : '#f1f5f9',
              border: 'none', cursor: (input.trim() || image) ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, transition: 'all 0.2s', flexShrink: 0
            }}>
            {loading ? (
              <div style={{ width: 18, height: 18, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            ) : (
              <span style={{ color: (input.trim() || image) ? 'white' : '#94a3b8' }}>↑</span>
            )}
          </button>
        </div>

        {/* Disclaimer */}
        <div style={{ background: '#fffbeb', borderTop: '1px solid #fde68a', padding: '8px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: '#92400e', margin: 0 }}>
            ⚕️ For educational purposes only. Always consult your doctor before making health decisions.
          </p>
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.3; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.2); }
          }
        `}</style>
      </main>
    </>
  )
}