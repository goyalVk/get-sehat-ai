'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function UploadPage() {
  const router = useRouter()
  const [file, setFile]             = useState(null)
  const [dragging, setDragging]     = useState(false)
  const [loading, setLoading]       = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [error, setError]           = useState('')
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => { checkAuth() }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (!res.ok) { router.push('/auth/login?redirect=/upload'); return }
      setAuthChecked(true)
    } catch {
      router.push('/auth/login?redirect=/upload')
    }
  }

  const handleFile = (f) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowed.includes(f.type)) { setError('Please upload a PDF or image (JPG, PNG)'); return }
    if (f.size > 10 * 1024 * 1024) { setError('File must be under 10MB'); return }
    setError('')
    setFile(f)
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [])

  if (!authChecked) {
    return (
      <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '2px solid #0d9488', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </main>
    )
  }

  const takePhoto = () => {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = 'image/*'; input.capture = 'environment'
    input.onchange = (e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }
    input.click()
  }

  const analyze = async () => {
    if (!file) return
    setLoading(true); setError('')
    try {
      setLoadingMsg('Uploading your report...')
      const formData = new FormData()
      formData.append('file', file)
      setLoadingMsg('AI is reading your report... (20-30 seconds)')
      const res = await fetch('/api/analyze', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      setLoadingMsg('Done! Loading results...')
      router.push(`/results/${data.reportId}`)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: '80vh', maxWidth: 520, margin: '0 auto', padding: '40px 24px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      <h1 style={{ fontSize: 26, fontWeight: 400, color: '#0f172a', marginBottom: 6, fontFamily: "'DM Serif Display', serif" }}>
        Upload your report
      </h1>
      <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 32 }}>
        PDF or image — any Indian lab report works
      </p>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !loading && document.getElementById('fileInput')?.click()}
        style={{
          border: `2px dashed ${dragging ? '#0d9488' : file ? '#0d9488' : '#e2e8f0'}`,
          borderRadius: 20, padding: 40, textAlign: 'center',
          cursor: loading ? 'not-allowed' : 'pointer',
          background: dragging || file ? '#f0fdfa' : 'white',
          transition: 'all 0.2s', opacity: loading ? 0.6 : 1
        }}
      >
        <input id="fileInput" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp"
          style={{ display: 'none' }}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

        {file ? (
          <div>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#0d9488' }}>{file.name}</p>
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            {!loading && <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>Click to change file</p>}
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#334155', marginBottom: 4 }}>Drop report here</p>
            <p style={{ fontSize: 13, color: '#94a3b8' }}>or click to select file</p>
            <p style={{ fontSize: 11, color: '#cbd5e1', marginTop: 8 }}>PDF, JPG, PNG — max 10MB</p>
          </div>
        )}
      </div>

      {/* Camera */}
      {!file && !loading && (
        <button onClick={takePhoto} style={{
          width: '100%', marginTop: 10, padding: '14px',
          border: '1px solid #e2e8f0', borderRadius: 16,
          fontSize: 13, color: '#64748b', background: 'white',
          cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
          transition: 'all 0.2s'
        }}>
          📸 Take photo of paper report
        </button>
      )}

      {error && (
        <div style={{ marginTop: 14, padding: 14, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 14, fontSize: 13, color: '#dc2626' }}>
          {error}
        </div>
      )}

      {loading && (
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <div style={{ width: 32, height: 32, border: '2px solid #0d9488', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 14, color: '#334155', fontWeight: 500 }}>{loadingMsg}</p>
          <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Please wait...</p>
        </div>
      )}

      {!loading && (
        <button onClick={analyze} disabled={!file} style={{
          width: '100%', marginTop: 20, padding: '16px',
          borderRadius: 16, fontSize: 15, fontWeight: 600,
          border: 'none', cursor: file ? 'pointer' : 'not-allowed',
          background: file ? '#0d9488' : '#f1f5f9',
          color: file ? 'white' : '#94a3b8',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          transition: 'all 0.2s'
        }}>
          {file ? 'Analyze Report →' : 'Select a file first'}
        </button>
      )}

      <p style={{ fontSize: 12, color: '#cbd5e1', textAlign: 'center', marginTop: 20, lineHeight: 1.6 }}>
        Your report is processed securely. We do not store your data without permission.
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </main>
  )
}