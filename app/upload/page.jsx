'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { events } from '@/components/Analytics'
import AnalyzingLoader from '@/components/AnalyzingLoader'
import { isReturningUser, incrementUploadCount, getUploadCount, getVisitCount } from '@/utils/anonId'
import { requestPushPermission } from '@/lib/pushNotification'


const STATS_CHIPS = [
  { icon: '⚡', label: '30 seconds' },
  { icon: '🔒', label: 'Private'    },
  { icon: '🆓', label: 'Bilkul Free' },
  { icon: '🏥', label: 'Har Indian Lab' },
]

const FEATURES = [
  '📊 Har value Hindi mein',
  '⚠️ Abnormal alerts',
  '🌿 Ayurvedic suggestions',
  '❓ Doctor questions',
  '🍽️ Diet tips',
  '📄 PDF download',
  '💊 Medicine chat',
  '📅 History track',
]

const LABS = [
  'SRL Diagnostics', 'Lal PathLabs', 'Apollo Diagnostics',
  'Thyrocare', 'Metropolis', 'Dr Lal PathLabs',
  'AIIMS', 'Medanta', 'Fortis', 'Max Hospital', 'All Indian Labs'
]

export default function UploadPage() {
  const router = useRouter()
  const [file, setFile]                   = useState(null)
  const [dragging, setDragging]           = useState(false)
  const [loading, setLoading]             = useState(false)
  const [loadingMsg, setLoadingMsg]       = useState('')
  const [error, setError]                 = useState('')
  const [sampleLoading, setSampleLoading] = useState(false)

  /* ── All logic unchanged ── */
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
      formData.append('visitCount', getVisitCount())
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
        setError(data.error || 'Kuch problem aayi — report dobara upload karo 🙏')
        setLoading(false)
        return
      }
      events.reportAnalyzed(data.reportType || 'unknown')
      const returning     = isReturningUser()
      const uploadNumber  = getUploadCount() + 1
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'analysis_complete', { is_returning: returning, upload_number: uploadNumber })
        if (returning) window.gtag('event', 'returning_user_upload')
      }
      incrementUploadCount()
      setTimeout(async () => { await requestPushPermission() }, 3000)
      setLoadingMsg('Ho gaya! Results load ho rahe hain...')
      router.push(`/results/${data.reportId}`)
    } catch (err) {
      if (err.message?.includes('timeout') || err.message?.includes('ETIMEDOUT')) {
        setError('Server busy hai — thodi der baad try karo 🙏')
      } else if (err.message?.includes('fetch') || err.message?.includes('network')) {
        setError('Internet connection check karo aur dobara try karo 🙏')
      } else {
        setError('Kuch problem aayi — report dobara upload karo 🙏')
      }
      setLoading(false)
    }
  }

  const noFile = !file && !loading

  return (
    <main
      role="main"
      aria-label="Upload medical report for Hindi analysis"
      style={{
        minHeight: '80vh',
        maxWidth: 520,
        margin: '0 auto',
        padding: '40px 24px 60px',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        @keyframes spin    { to { transform: rotate(360deg) } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
        .drop-zone-inner   { animation: fadeUp 0.3s ease both; }
        .upload-section    { animation: fadeIn 0.4s ease both; }

        .stat-chip {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 6px 12px; background: white;
          border: 1px solid #e2e8f0; border-radius: 100px;
          font-size: 12px; font-weight: 600; color: #475569;
          white-space: nowrap;
        }

        .feature-item {
          display: flex; align-items: center; gap: 6px;
          font-size: 13px; color: #475569;
          padding: 7px 10px;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 10px;
        }

        .lab-pill {
          display: inline-flex; align-items: center;
          padding: 5px 12px;
          background: white; border: 1px solid #e2e8f0;
          border-radius: 100px;
          font-size: 12px; font-weight: 500; color: #64748b;
          white-space: nowrap;
        }

        .upload-stat-card {
          flex: 1; min-width: 80px;
          border-radius: 12px; padding: 10px 14px;
          text-align: center;
        }

        .drop-zone {
          border-radius: 24px; padding: 40px;
          text-align: center; transition: all 0.2s;
        }

        .analyze-btn {
          width: 100%; padding: 16px; border-radius: 16px;
          font-size: 15px; font-weight: 700; border: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.2s; cursor: pointer;
        }
        .analyze-btn:hover:not(:disabled) { transform: translateY(-2px); }
        .analyze-btn:active:not(:disabled) { transform: translateY(0); }

        @media (max-width: 720px) {
          .upload-stat-card  { flex: 1; min-width: 80px; }
          .upload-feature-grid { grid-template-columns: 1fr 1fr !important; }
          .upload-lab-pills  { gap: 6px !important; }
          .drop-zone         { padding: 28px 20px !important; min-height: 180px; }
        }
      `}</style>

      {/* ── SECTION 1: Header ── */}
      <div className="upload-section" style={{ marginBottom: 20 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '5px 12px',
          background: '#f0fdfa', border: '1px solid #99f6e4',
          borderRadius: 100, marginBottom: 14,
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#0d9488' }}>✅ 2,800+ Reports Analyzed</span>
        </div>

        <h1 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: 28, fontWeight: 400, color: '#0f172a',
          marginBottom: 8, lineHeight: 1.2,
        }}>
          Apni Report Upload Karo
        </h1>
        <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 0 }}>
          Koi bhi Indian lab ki report —<br />30 seconds mein Hindi mein result
        </p>
      </div>

      {/* ── SECTION 2: Stats Strip ── */}
      <div
        aria-label="Sehat24 health statistics"
        style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}
      >
        {STATS_CHIPS.map((c, i) => (
          <span key={i} className="stat-chip">{c.icon} {c.label}</span>
        ))}
      </div>

      {/* ── SECTION 3: Drop Zone ── */}
      <div
        className="drop-zone"
        role="button"
        aria-label="Upload lab report — drag and drop or click"
        tabIndex={0}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !loading && document.getElementById('fileInput')?.click()}
        onKeyDown={(e) => e.key === 'Enter' && !loading && document.getElementById('fileInput')?.click()}
        style={{
          border: `2px dashed ${dragging ? '#0d9488' : file ? '#0d9488' : '#e2e8f0'}`,
          background: dragging || file ? '#f0fdfa' : 'white',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
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
            <div style={{ fontSize: 44, marginBottom: 12 }}>✅</div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#0d9488', marginBottom: 4 }}>{file.name}</p>
            <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 0 }}>
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
            {!loading && (
              <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>Change karne ke liye click karo</p>
            )}
          </div>
        ) : (
          <div className="drop-zone-inner">
            <div style={{ fontSize: 48, marginBottom: 14, lineHeight: 1 }}>📋</div>
            <p style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 22, fontWeight: 400, color: '#0f172a', marginBottom: 6,
            }}>
              Report yahan drop karo
            </p>
            <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 12 }}>ya click karke select karo</p>
            <span style={{
              display: 'inline-block',
              background: '#f8fafc', border: '1px solid #f1f5f9',
              borderRadius: 100, padding: '6px 16px',
              fontSize: 11, color: '#94a3b8',
            }}>
              PDF • JPG • PNG • WebP — max 10MB
            </span>
          </div>
        )}
      </div>

      {/* ── SECTION 4: Camera + Sample Buttons ── */}
      {noFile && (
        <div className="upload-section">
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button
              onClick={takePhoto}
              style={{
                flex: 1, padding: '13px',
                border: '1px solid #e2e8f0', borderRadius: 14,
                fontSize: 13, color: '#64748b', background: 'white',
                cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
                transition: 'all 0.2s',
              }}
            >
              📸 Photo lo
            </button>
            <button
              onClick={loadSample}
              disabled={sampleLoading}
              style={{
                flex: 1, padding: '13px',
                border: '1px solid #99f6e4', borderRadius: 14,
                fontSize: 13, color: '#0d9488', background: '#f0fdfa',
                cursor: sampleLoading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', fontWeight: 600,
                transition: 'all 0.2s',
              }}
            >
              {sampleLoading ? 'Loading...' : '📋 Sample try karo'}
            </button>
          </div>
          {/* Camera quality tip */}
          <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 8, lineHeight: 1.6 }}>
            💡 Best tip: Camera se seedha photo lo — WhatsApp se forward mat karo, quality kam ho jaati hai
          </p>
        </div>
      )}

      {/* ── SECTION 5: What You Get Grid ── */}
      {noFile && (
        <div className="upload-section" style={{
          marginTop: 20, padding: '16px',
          background: '#f8fafc', border: '1px solid #f1f5f9',
          borderRadius: 16,
        }}>
          <p style={{
            fontSize: 11, fontWeight: 700, color: '#94a3b8',
            textTransform: 'uppercase', letterSpacing: '0.06em',
            marginBottom: 10,
          }}>
            Upload karne ke baad milega:
          </p>
          <div
            className="upload-feature-grid"
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}
          >
            {FEATURES.map((item, i) => (
              <div key={i} className="feature-item">{item}</div>
            ))}
          </div>
        </div>
      )}

      {/* ── SECTION 6: Real Data Trust ── */}
      {noFile && (
        <div className="upload-section" style={{ marginTop: 16 }}>
          <p style={{
            fontSize: 11, fontWeight: 700, color: '#94a3b8',
            textTransform: 'uppercase', letterSpacing: '0.06em',
            marginBottom: 10,
          }}>
            Sehat24 users ne kya discover kiya:
          </p>
          <div
            aria-label="Sehat24 health statistics"
            style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}
          >
            {[
              { num: '49%', label: 'Hemoglobin Low',        color: '#e11d48', bg: '#fff1f2', border: '#fecdd3' },
              { num: '69%', label: 'Vitamin D Deficiency',  color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
              { num: '48%', label: 'Blood Sugar High',      color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
            ].map((s, i) => (
              <div
                key={i}
                className="upload-stat-card"
                style={{ background: s.bg, border: `1px solid ${s.border}` }}
              >
                <p style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: 22, color: s.color, margin: '0 0 3px', lineHeight: 1,
                }}>{s.num}</p>
                <p style={{ fontSize: 11, fontWeight: 600, color: s.color, margin: 0, opacity: 0.8 }}>{s.label}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 8 }}>
            Kya aapki report mein bhi kuch aisa hai? 🤔
          </p>
        </div>
      )}

      {/* ── SECTION 7: Supported Labs ── */}
      {noFile && (
        <div
          className="upload-section"
          aria-label="Supported Indian laboratories"
          style={{ marginTop: 16 }}
        >
          <p style={{
            fontSize: 11, fontWeight: 700, color: '#94a3b8',
            textTransform: 'uppercase', letterSpacing: '0.06em',
            marginBottom: 8,
          }}>
            Kaunse labs supported hain?
          </p>
          <div className="upload-lab-pills" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {LABS.map((lab, i) => (
              <span key={i} className="lab-pill">{lab}</span>
            ))}
          </div>
                  <p style={{ 
          fontSize: 11, 
          color: '#94a3b8', 
          textAlign: 'center',
          marginTop: 8 
        }}>
          ...aur baaki sabhi Indian labs ✅
        </p>
        </div>
      )}

      {/* ── SECTION 8: Error ── */}
      {error && (
        <div style={{
          marginTop: 16,
          padding: '14px 16px',
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: 16, fontSize: 13, color: '#dc2626',
        }}>
          {error}
          {error.includes('free report use ho gayi') && (
            <button
              onClick={() => router.push('/upgrade')}
              style={{
                display: 'block', width: '100%', marginTop: 10,
                padding: '12px', background: '#0d9488', color: 'white',
                border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              🚀 Pro Upgrade Karo — ₹199/month
            </button>
          )}
        </div>
      )}

      {/* ── Loading ── */}
      {loading && <AnalyzingLoader fileName={file?.name} />}

      {/* ── SECTION 9: File name preview + Analyze Button ── */}
      {!loading && (
        <div style={{ marginTop: 20 }}>
          {file && (
            <p style={{
              fontSize: 12, color: '#0d9488', textAlign: 'center',
              marginBottom: 8, fontWeight: 600,
            }}>
              ✅ {file.name} ready hai
            </p>
          )}
          <button
            className="analyze-btn"
            onClick={analyze}
            disabled={!file}
            style={{
              background: file ? '#0d9488' : '#f1f5f9',
              color: file ? 'white' : '#94a3b8',
              cursor: file ? 'pointer' : 'not-allowed',
              boxShadow: file ? '0 4px 20px rgba(13,148,136,0.3)' : 'none',
            }}
          >
            {file ? '🔍 Report Analyze Karo — Free →' : 'Pehle file select karo'}
          </button>
        </div>
      )}

      {/* ── SECTION 10: Bottom Trust ── */}
      <p style={{ fontSize: 12, color: '#cbd5e1', textAlign: 'center', marginTop: 20, marginBottom: 4 }}>
        🇮🇳 Made in India — Har Indian ke liye
      </p>
      <p style={{ fontSize: 12, color: '#cbd5e1', textAlign: 'center', lineHeight: 1.6, margin: 0 }}>
        Aapki report securely process hoti hai. Bina permission ke data store nahi hota.
      </p>

    </main>
  )
}
