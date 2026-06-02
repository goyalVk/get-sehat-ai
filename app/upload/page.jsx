'use client'
import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { events } from '@/components/Analytics'
import AnalyzingLoader from '@/components/AnalyzingLoader'
import { isReturningUser, incrementUploadCount, getUploadCount, getVisitCount, getAnonId, trackVisit } from '@/utils/anonId'
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
  const [error, setError]                 = useState('')
  const [errorType, setErrorType]         = useState('')
  const [sampleLoading, setSampleLoading] = useState(false)
  const [showLoginNudge, setShowLoginNudge] = useState(false)
  const [isGuest, setIsGuest]               = useState(true)
  const [showRetryNudge, setShowRetryNudge] = useState(false)

  useEffect(() => {
    try {
      const count      = parseInt(localStorage.getItem('s24_upload_count')) || 0
      const dismissed  = localStorage.getItem('s24_login_nudge_dismissed')
      const storedUser = (() => {
        try { return JSON.parse(localStorage.getItem('s24_user') || 'null') } catch { return null }
      })()
      const hasUserId  = !!storedUser?.id
      setIsGuest(!hasUserId)
      if (count >= 1 && !dismissed && !hasUserId) setShowLoginNudge(true)

      // Post-login retry: user just came back after logging in
      if (hasUserId && localStorage.getItem('s24_retry_upload')) {
        localStorage.removeItem('s24_retry_upload')
        setShowRetryNudge(true)
        // Auto-open file picker after a brief pause so the page renders first
        setTimeout(() => document.getElementById('fileInput')?.click(), 700)
      }
    } catch {
      // localStorage blocked in Instagram IAB / iOS WKWebView restricted mode
    }
  }, [])

  /* ── All logic unchanged ── */
  const handleFile = (f) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowed.includes(f.type)) {
      setError('Sirf PDF ya image (JPG, PNG) upload kar sakte hain')
      return
    }
    if (f.type === 'application/pdf' && f.size > 5 * 1024 * 1024) {
      setError('PDF bahut bada hai — 5MB se chhota PDF upload karo 📄')
      return
    }
    if (f.type !== 'application/pdf' && f.size > 10 * 1024 * 1024) {
      setError('Photo bahut badi hai — 10MB se chhoti image try karo')
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
      const formData = new FormData()
      formData.append('file', file)
      formData.append('anonId', getAnonId() || '')
      try {
        const storedUser = JSON.parse(localStorage.getItem('s24_user') || 'null')
        if (storedUser?.id) formData.append('userId', storedUser.id)
      } catch {}  // localStorage blocked in some WebViews
      trackVisit()
      formData.append('visitCount', getVisitCount())
      const urlParams = new URLSearchParams(window.location.search)
      const ref = urlParams.get('ref') || document.referrer || 'direct'
      formData.append('ref', ref)
      formData.append('_hp', document.getElementById('_hp_field')?.value || '')
      const res  = await fetch('/api/analyze', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) {
        if (data.limitReached) {
          setError('✨ Aapki free report use ho gayi! Pro plan pe redirect ho rahe hain...')
          setErrorType('limit')
          setTimeout(() => router.push('/upgrade'), 2000)
          setLoading(false)
          return
        }
        if (data.requiresUpgrade) {
          setError('Yeh file bahut badi hai 📁 — 10MB se chhoti file upload karo ya Pro plan lo')
          setErrorType('too_large')
          setTimeout(() => router.push('/upgrade'), 2000)
          setLoading(false)
          return
        }
        if (data.loginRequired) {
          setError('Report analyze karne ke liye login karo 🙏')
          setErrorType('login')
          setTimeout(() => router.push('/auth/login'), 2000)
          setLoading(false)
          return
        }
        const mapped = mapError(data.error, data)
        setError(mapped.msg)
        setErrorType(mapped.type)
        if (mapped.type === 'report_too_large') events.reportTooLargeUpsell()
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
      requestPushPermission().catch(console.error)
      router.push(`/results/${data.reportId}`)
    } catch (err) {
      if (err.message?.includes('timeout') || err.message?.includes('ETIMEDOUT')) {
        setError('Server busy hai — thodi der baad try karo 🙏')
        setErrorType('rate_limit')
      } else if (err.message?.includes('fetch') || err.message?.includes('network')) {
        setError('Internet connection check karo aur dobara try karo 🙏')
        setErrorType('network')
      } else {
        setError('Kuch problem aayi — report dobara upload karo 🙏')
        setErrorType('generic')
      }
      setLoading(false)
    }
  }

  // Map raw API error strings → user-friendly Hinglish messages
  function mapError(apiError, data) {
    if (!apiError) return { msg: 'Kuch problem aayi 😕 — dobara try karo', type: 'generic' }
    if (data?.isTruncated) return { msg: 'Yeh report thodi badi hai! 📋', type: 'report_too_large' }
    const e = apiError.toLowerCase()
    // timeout / network first — prevents "dobara try karo" matching parse_error
    if (e.includes('timeout') || e.includes('server busy') || e.includes('thodi der baad'))
      return { msg: 'Server busy hai — dobara try karo 🙏', type: 'timeout' }
    if (e.includes('internet') || e.includes('connection') || e.includes('econnreset') || e.includes('fetch'))
      return { msg: 'Internet check karo 📶 — connection theek karo aur dobara try karo', type: 'network' }
    if (e.includes('bahut zyada') || e.includes('ek minute') || e.includes('1 minute'))
      return { msg: '1 minute baad dobara try karo — server busy hai ⏳', type: 'rate_limit' }
    if (data?.isNonMedical || e.includes('medical report nahi lagti') || e.includes('medical lab report'))
      return { msg: 'Yeh medical report nahi lagti 🩺 — CBC, blood test ya thyroid report upload karo', type: 'non_medical' }
    if (e.includes('lock laga hai') || e.includes('password') || e.includes('lock hatao'))
      return { msg: 'PDF pe lock laga hai 🔒 — iLovePDF.com se password hataao, phir upload karo', type: 'password' }
    if (e.includes('unclear hai') || e.includes('seedha camera') || e.includes('dobara photo lo'))
      return { msg: 'Photo thodi unclear hai 📸 — achhi roshni mein seedha camera se photo lo', type: 'low_quality' }
    if (e.includes('bahut chhoti') || e.includes('original lab report'))
      return { msg: 'File bahut chhoti hai 😕 — original lab report ka clear photo lo', type: 'too_small' }
    if (e.includes('clearly nahi dikhi') || e.includes('padh nahi paaye') || e.includes('samajh nahi'))
      return { msg: 'Report samajh nahi aayi 😕 — PDF format mein try karo ya achhi roshni mein photo lo', type: 'parse_error' }
    if (e.includes('bahut badi') || e.includes('bahut bada') || e.includes('too large') || e.includes('5mb'))
      return { msg: 'File bahut badi hai 📁 — 5MB se chhoti file bhejo', type: 'too_large' }
    if (e.includes('"type":"error"') || e.includes('invalid_request_error'))
      return { msg: 'Kuch technical problem aayi 🙏 — dobara try karo ya WhatsApp pe contact karo', type: 'api_error' }
    return { msg: 'Kuch problem aayi 😕 — dobara try karo', type: 'generic' }
  }

  const resetUpload = () => { setError(''); setErrorType('') }

  const handleLoginForRetry = () => {
    try {
      localStorage.setItem('s24_retry_upload', '1')
      if (file?.name) localStorage.setItem('s24_retry_upload_name', file.name)
    } catch {}
    router.push('/auth/login?redirect=/upload')
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
          <span style={{ fontSize: 11, fontWeight: 700, color: '#0d9488' }}>✅ 2,700+ Reports Analyzed</span>
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

      {/* ── Login nudge banner ── */}
      {showLoginNudge && (
        <div style={{
          background: 'linear-gradient(135deg,#f0fdfa,#ecfdf5)',
          border: '1.5px solid #0d9488',
          borderRadius: 14,
          padding: '14px 16px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <span style={{ fontSize: 24 }}>📊</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#0d9488', marginBottom: 2 }}>
              Pehli report yaad hai?
            </p>
            <p style={{ fontSize: 12, color: '#134e4a' }}>
              Login karo — sab save rehta hai 🇮🇳
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <a href="/auth/login" style={{
              background: '#0d9488', color: 'white',
              padding: '8px 14px', borderRadius: 10,
              fontSize: 12, fontWeight: 700, textDecoration: 'none'
            }}>Login Karo</a>
            <button onClick={() => {
              localStorage.setItem('s24_login_nudge_dismissed', 'true')
              setShowLoginNudge(false)
            }} style={{
              background: 'transparent', border: 'none',
              color: '#94a3b8', cursor: 'pointer', fontSize: 16
            }}>✕</button>
          </div>
        </div>
      )}

      {/* ── Post-login retry nudge ── */}
      {showRetryNudge && (
        <div style={{
          background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)',
          border: '1.5px solid #22c55e', borderRadius: 14,
          padding: '14px 16px', marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 24 }}>✅</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#15803d', marginBottom: 2 }}>
              Login ho gaya! Ab report upload karo
            </p>
            <p style={{ fontSize: 12, color: '#166534' }}>
              Apni report select karo — is baar save bhi hogi 📊
            </p>
          </div>
          <button onClick={() => setShowRetryNudge(false)} style={{
            background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 16,
          }}>✕</button>
        </div>
      )}

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
        {/* Honeypot — leave blank */}
        <input
          id="_hp_field"
          type="text"
          name="_hp"
          autoComplete="off"
          tabIndex={-1}
          aria-hidden="true"
          style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}
        />
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
      {error && errorType === 'report_too_large' && (
        <div style={{
          marginTop: 16,
          background: 'linear-gradient(135deg,#fffbeb,#fef3c7)',
          border: '1.5px solid #fcd34d',
          borderRadius: 16, overflow: 'hidden',
        }}>
          <div style={{ padding: '18px 16px 14px' }}>
            <p style={{ fontSize: 16, fontWeight: 800, color: '#92400e', margin: '0 0 8px' }}>
              Yeh report thodi badi hai! 📋
            </p>
            <p style={{ fontSize: 13, color: '#78350f', lineHeight: 1.6, margin: '0 0 16px' }}>
              Aapki report mein bahut saari details hain — Pro plan mein unlimited badi reports analyze hoti hain. Abhi upgrade karo sirf ₹199/month mein! 🚀
            </p>
            <button
              onClick={() => router.push('/upgrade')}
              style={{
                display: 'block', width: '100%', padding: '12px',
                background: '#d97706', color: 'white',
                border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 800,
                cursor: 'pointer', fontFamily: 'inherit', marginBottom: 8,
              }}
            >
              🚀 Pro Upgrade Karo ₹199/month
            </button>
            <button
              onClick={() => { resetUpload(); router.push('/upload') }}
              style={{
                display: 'block', width: '100%', padding: '11px',
                background: 'white', color: '#92400e',
                border: '1.5px solid #fcd34d', borderRadius: 10, fontSize: 13, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              📄 Chhoti report try karo
            </button>
          </div>
        </div>
      )}

      {error && errorType !== 'report_too_large' && (
        <div style={{
          marginTop: 16,
          background: '#fef2f2', border: '1.5px solid #fecaca',
          borderRadius: 16, overflow: 'hidden',
        }}>
          {/* Message row */}
          <div style={{ padding: '14px 16px 10px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>⚠️</span>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#dc2626', lineHeight: 1.55, margin: 0 }}>
              {error}
            </p>
          </div>

          {/* Contextual tip */}
          {errorType === 'low_quality' && (
            <p style={{ fontSize: 12, color: '#7f1d1d', lineHeight: 1.6, margin: '0 16px 10px' }}>
              💡 Seedha camera se photo lo, achhi roshni mein. WhatsApp se forward karne se quality bahut kam ho jaati hai.
            </p>
          )}
          {errorType === 'non_medical' && (
            <p style={{ fontSize: 12, color: '#7f1d1d', lineHeight: 1.6, margin: '0 16px 10px' }}>
              💡 Blood test, CBC, sugar report, thyroid report — inhe upload karo.
            </p>
          )}
          {errorType === 'password' && (
            <p style={{ fontSize: 12, color: '#7f1d1d', lineHeight: 1.6, margin: '0 16px 10px' }}>
              💡 iLovePDF.com pe PDF upload karo → Security → Remove Password
            </p>
          )}
          {errorType === 'parse_error' && (
            <p style={{ fontSize: 12, color: '#7f1d1d', lineHeight: 1.6, margin: '0 16px 10px' }}>
              💡 PDF format best kaam karta hai. Image blur ho toh achhe se dobara photo lo.
            </p>
          )}
          {errorType === 'too_small' && (
            <p style={{ fontSize: 12, color: '#7f1d1d', lineHeight: 1.6, margin: '0 16px 10px' }}>
              💡 Screenshot ya thumbnail mat bhejo — original report ka pura photo lo.
            </p>
          )}

          {/* Upgrade button */}
          {errorType === 'limit' && (
            <div style={{ padding: '0 16px 14px' }}>
              <button
                onClick={() => router.push('/upgrade')}
                style={{
                  display: 'block', width: '100%', padding: '12px',
                  background: '#0d9488', color: 'white',
                  border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                🚀 Pro Upgrade Karo — ₹199/month
              </button>
            </div>
          )}

          {/* Retry + WhatsApp — shown for all errors except limit/login redirects */}
          {errorType !== 'limit' && errorType !== 'login' && (
            <div style={{ padding: '0 16px 14px', display: 'flex', gap: 8 }}>
              <button
                onClick={resetUpload}
                style={{
                  flex: 1, padding: '11px',
                  background: '#dc2626', color: 'white',
                  border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                🔄 Dobara Try Karo
              </button>
              <a
                href="https://wa.me/918076170877?text=Meri+report+upload+nahi+ho+rahi+%F0%9F%99%8F"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1, padding: '11px',
                  background: '#22c55e', color: 'white',
                  borderRadius: 10, fontSize: 13, fontWeight: 700,
                  textDecoration: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                }}
              >
                💬 WhatsApp Help
              </a>
            </div>
          )}

          {/* Guest login prompt — shown when not logged in */}
          {isGuest && errorType !== 'limit' && errorType !== 'login' && (
            <div style={{
              margin: '0 16px 14px',
              background: 'linear-gradient(135deg,#f0fdfa,#ecfdf5)',
              border: '1.5px solid #0d9488', borderRadius: 12, padding: '14px',
            }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#0d9488', marginBottom: 4 }}>
                📱 Login karo aur report save karo — dobara analyze karte hain free mein!
              </p>
              <p style={{ fontSize: 11, color: '#134e4a', lineHeight: 1.55, marginBottom: 10 }}>
                Login ke baad report history, abnormal alerts aur AI chat bhi milega.
              </p>
              <button
                onClick={handleLoginForRetry}
                style={{
                  width: '100%', padding: '11px',
                  background: '#0d9488', color: 'white',
                  border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                📱 OTP se Login Karo
              </button>
            </div>
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
