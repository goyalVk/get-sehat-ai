'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { events } from '@/components/Analytics'
import AnalyzingLoader from '@/components/AnalyzingLoader'

export default function UploadPage() {
  const router = useRouter()
  const [file, setFile]             = useState(null)
  const [dragging, setDragging]     = useState(false)
  const [loading, setLoading]       = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [error, setError]           = useState('')
  const [sampleLoading, setSampleLoading] = useState(false)

  const handleFile = (f) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowed.includes(f.type)) {
      setError('Sirf PDF ya image (JPG, PNG) upload kar sakte hain')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File bahut badi hai — 10MB se kam rakho')
      return
    }
    setError('')
    setFile(f)
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [])

  const takePhoto = () => {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = 'image/*'; input.capture = 'environment'
    input.onchange = (e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }
    input.click()
  }

  const loadSample = async () => {
    setSampleLoading(true)
    try {
      const res  = await fetch('/sample-report.pdf')
      const blob = await res.blob()
      const f    = new File([blob], 'sample-cbc-report.pdf', { type: 'application/pdf' })
      handleFile(f)
    } catch {
      setError('Sample report load nahi hua. Apni report upload karo.')
    }
    setSampleLoading(false)
  }

  const analyze = async () => {
    if (!file) return
    setLoading(true); setError('')
    events.reportUpload(file.type)
    try {
      setLoadingMsg('Report upload ho rahi hai...')
      const formData = new FormData()
      formData.append('file', file)
      setLoadingMsg('AI aapki report padh raha hai... (20-30 seconds)')
      const res  = await fetch('/api/analyze', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) {
        if (data.limitReached) {
          setError('✨ Aapki free report use ho gayi! Pro plan pe redirect ho rahe hain...')
          setTimeout(() => router.push('/upgrade'), 2000)
          setLoading(false)
          return
        }
        if (data.loginRequired) {
          setError('Report analyze karne ke liye login karo 🙏')
          setTimeout(() => router.push('/auth/login'), 2000)
          setLoading(false)
          return
        }
        setError(data.error || 'Kuch gadbad ho gayi. Dobara try karo.')
        setLoading(false)
        return
      }
      events.reportAnalyzed(data.reportType || 'unknown')
      setLoadingMsg('Ho gaya! Results load ho rahe hain...')
      router.push(`/results/${data.reportId}`)
    } catch (err) {
      setError('Kuch gadbad ho gayi. Dobara try karo. 🙏')
      setLoading(false)
    }
  }

  return (
    <main style={{
      minHeight: '80vh',
      maxWidth: 520,
      margin: '0 auto',
      padding: '40px 24px',
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .upload-trust-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          background: #f0fdfa;
          border: 1px solid #99f6e4;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 600;
          color: #0f766e;
          white-space: nowrap;
        }
        .preview-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 12px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 500;
          color: #475569;
        }
        .drop-zone-inner { animation: fadeUp 0.3s ease both; }
      `}</style>

      {/* Header */}
      <h1 style={{
        fontSize: 26,
        fontWeight: 400,
        color: '#0f172a',
        marginBottom: 6,
        fontFamily: "'DM Serif Display', serif"
      }}>
        Report upload karo
      </h1>
      <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 16 }}>
        PDF ya photo — kisi bhi Indian lab ki report chalegi
      </p>

      {/* [A] Trust strip */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 20,
      }}>
        {[
          '✅ Bilkul free',
          '⚡ 30 seconds',
          '🔒 Private',
          '📊 1400+ reports analyzed',
        ].map((item, i) => (
          <span key={i} className="upload-trust-chip">{item}</span>
        ))}
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !loading && document.getElementById('fileInput')?.click()}
        style={{
          border: `2px dashed ${dragging ? '#0d9488' : file ? '#0d9488' : '#e2e8f0'}`,
          borderRadius: 20,
          padding: 40,
          textAlign: 'center',
          cursor: loading ? 'not-allowed' : 'pointer',
          background: dragging || file ? '#f0fdfa' : 'white',
          transition: 'all 0.2s',
          opacity: loading ? 0.6 : 1
        }}
      >
        <input
          id="fileInput"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          style={{ display: 'none' }}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {file ? (
          <div className="drop-zone-inner">
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#0d9488' }}>{file.name}</p>
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
            {!loading && (
              <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>
                Change karne ke liye click karo
              </p>
            )}
          </div>
        ) : (
          <div className="drop-zone-inner">
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
              Report yahan drop karo
            </p>
            <p style={{ fontSize: 13, color: '#94a3b8' }}>ya click karke select karo</p>
            <p style={{ fontSize: 11, color: '#cbd5e1', marginTop: 8 }}>PDF, JPG, PNG — max 10MB</p>
          </div>
        )}
      </div>

      {/* Buttons Row */}
      {!file && !loading && (
        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          <button onClick={takePhoto} style={{
            flex: 1, padding: '14px',
            border: '1px solid #e2e8f0', borderRadius: 16,
            fontSize: 13, color: '#64748b', background: 'white',
            cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif"
          }}>
            📸 Photo lo
          </button>
          <button onClick={loadSample} disabled={sampleLoading} style={{
            flex: 1, padding: '14px',
            border: '1px solid #99f6e4', borderRadius: 16,
            fontSize: 13, color: '#0d9488', background: '#f0fdfa',
            cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 600
          }}>
            {sampleLoading ? 'Loading...' : '📋 Sample try karo'}
          </button>
        </div>
      )}

      {/* [B] Preview chips — what user will get */}
      {!file && !loading && (
        <div style={{
          marginTop: 20,
          padding: '14px 16px',
          background: '#f8fafc',
          border: '1px solid #f1f5f9',
          borderRadius: 14,
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Upload karne ke baad milega
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {[
              '📊 Har value Hindi mein',
              '🌿 Ayurvedic herbs',
              '❓ Doctor questions',
              '🍽️ Diet tips',
              '⚠️ Abnormal alerts',
              '📄 PDF download',
            ].map((item, i) => (
              <span key={i} className="preview-chip">{item}</span>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          marginTop: 14,
          padding: 14,
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 14,
          fontSize: 13,
          color: '#dc2626'
        }}>
          {error}
          {/* [D] Upgrade button on limit reached */}
          {error.includes('free report use ho gayi') && (
            <button
              onClick={() => router.push('/upgrade')}
              style={{
                display: 'block',
                width: '100%',
                marginTop: 10,
                padding: '12px',
                background: '#0d9488',
                color: 'white',
                border: 'none',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: "'Plus Jakarta Sans', sans-serif"
              }}
            >
              🚀 Pro Upgrade Karo — ₹299/month
            </button>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && <AnalyzingLoader fileName={file?.name} />}

      {/* [C] Analyze Button */}
      {!loading && (
        <button
          onClick={analyze}
          disabled={!file}
          style={{
            width: '100%',
            marginTop: 20,
            padding: '16px',
            borderRadius: 16,
            fontSize: 15,
            fontWeight: 700,
            border: 'none',
            cursor: file ? 'pointer' : 'not-allowed',
            background: file ? '#0d9488' : '#f1f5f9',
            color: file ? 'white' : '#94a3b8',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            transition: 'all 0.2s',
            boxShadow: file ? '0 4px 16px rgba(13,148,136,0.3)' : 'none',
          }}
        >
          {file ? '🔍 Report Analyze Karo — Free →' : 'Pehle file select karo'}
        </button>
      )}

      <p style={{
        fontSize: 12,
        color: '#cbd5e1',
        textAlign: 'center',
        marginTop: 20,
        lineHeight: 1.6
      }}>
        Aapki report securely process hoti hai. Bina permission ke data store nahi hota.
      </p>

    </main>
  )
}
