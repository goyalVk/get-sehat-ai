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
  { icon: '🆓', label: 'Pehli Report Free' },
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
  const [userPlan, setUserPlan]             = useState('free')
  const [showRetryNudge, setShowRetryNudge] = useState(false)
  const [isPro, setIsPro]                   = useState(false)

  useEffect(() => {
    try {
      const count      = parseInt(localStorage.getItem('s24_upload_count')) || 0
      const dismissed  = localStorage.getItem('s24_login_nudge_dismissed')
      const storedUser = (() => {
        try { return JSON.parse(localStorage.getItem('s24_user') || 'null') } catch { return null }
      })()
      const hasUserId  = !!storedUser?.id
      setIsGuest(!hasUserId)
      setUserPlan(storedUser?.plan || 'free')
      const _plan   = storedUser?.plan || 'free'
      const _endsAt = storedUser?.subscriptionEndsAt
      const _hasId  = !!storedUser?.id
      setIsPro(
        _hasId &&
        (_plan === 'paid' || _plan === 'pro') &&
        (!_endsAt || new Date(_endsAt) > new Date())
      )
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

    const storedUser = (() => { try { return JSON.parse(localStorage.getItem('s24_user')) } catch { return null } })()
    const _userId  = storedUser?.id || null
    const _plan    = storedUser?.plan || null
    const _isPro   = _plan === 'paid' || _plan === 'pro'
    const _isGuest = !_userId

    setError('')
    setErrorType('')
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

  const SAMPLE_NAMES = ['sample-cbc-report.pdf', 'sample_report.pdf', 'sample-report.pdf']

  const analyze = async () => {
    if (!file) return

    const isSampleFile = SAMPLE_NAMES.includes(file.name?.toLowerCase())

    // ── Guest gate — NO API call, instant block ──
    if (!isSampleFile && isGuest) {
      setError('Login karo — pehli report bilkul FREE! 🔓')
      setErrorType('anon_gate')
      return
    }

    // ── Free user limit — check client side, NO API call ──
    const storedUserCheck = (() => {
      try { return JSON.parse(localStorage.getItem('s24_user') || 'null') } catch { return null }
    })()
    const hasAnalyzed = storedUserCheck?.hasAnalyzed || false
    const reportsUsed = storedUserCheck?.reportsUsed || 0
    const isProCheck  =
      !!storedUserCheck?.id &&
      (storedUserCheck?.plan === 'paid' || storedUserCheck?.plan === 'pro') &&
      (!storedUserCheck?.subscriptionEndsAt ||
        new Date(storedUserCheck.subscriptionEndsAt) > new Date())

    if (!isSampleFile && !isProCheck && (hasAnalyzed || reportsUsed >= 1)) {
      setError('free_limit')
      setErrorType('limit')
      return
    }

    setLoading(true); setError('')
    events.reportUpload(file.type)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('anonId', getAnonId() || '')
      const storedUser = (() => {
        try {
          return JSON.parse(localStorage.getItem('s24_user') || 'null')
        } catch { return null }
      })()
      if (storedUser?.id) formData.append('userId', storedUser.id)
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
          setError('free_limit')
          setErrorType('limit')
          setLoading(false)
          return
        }
        if (data.requiresLogin) {
          setError('Login karo — pehli report bilkul FREE! 🔓')
          setErrorType('anon_gate')
          setLoading(false)
          return
        }
        if (data.loginRequired) {
          setError('Login karo — pehli report bilkul FREE! 🔓')
          setErrorType('anon_gate')
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
      // Update localStorage — free limit used
      try {
        const _u = JSON.parse(localStorage.getItem('s24_user') || 'null')
        if (_u?.id) {
          _u.hasAnalyzed = true
          _u.reportsUsed = (_u.reportsUsed || 0) + 1
          localStorage.setItem('s24_user', JSON.stringify(_u))
        }
      } catch {}
      router.push(`/results/${data.reportId}`)
    } catch (err) {
      if (err.message?.includes('timeout') || err.message?.includes('ETIMEDOUT')) {
        setError('Report analyze hone mein time lag raha hai ⏳ — dobara try karo')
        setErrorType('timeout')
      } else if (err.message?.includes('fetch') || err.message?.includes('network')) {
        setError('Internet slow lag raha hai 📶 — connection check karo aur dobara try karo')
        setErrorType('network')
      } else {
        setError('Report analyze nahi ho payi 😕 — dobara try karo. Baar baar ho raha hai toh WhatsApp karo 👇')
        setErrorType('generic')
      }
      setLoading(false)
    }
  }

  function mapError(apiError, data) {
    if (!apiError) return {
      msg: 'Report analyze nahi ho payi 😕 — dobara try karo. Baar baar ho raha hai toh WhatsApp karo 👇',
      type: 'generic'
    }

    if (data?.isTruncated) return {
      msg: 'Yeh report thodi badi hai! 📋 Pro mein unlimited pages milte hain',
      type: 'report_too_large'
    }

    const e = apiError.toLowerCase()

    if (e.includes('timeout') || e.includes('server busy') || e.includes('thodi der baad') || e.includes('time lag raha'))
      return {
        msg: 'Report analyze hone mein time lag raha hai ⏳ — dobara try karo. Bada PDF hai toh iLovePDF.com se compress karo',
        type: 'timeout'
      }

    if (e.includes('internet') || e.includes('connection') || e.includes('econnreset') || e.includes('fetch') || e.includes('slow lag'))
      return {
        msg: 'Internet slow lag raha hai 📶 — connection check karo aur dobara try karo',
        type: 'network'
      }

    if (e.includes('bahut zyada') || e.includes('ek minute') || e.includes('1 minute') || e.includes('bahut requests'))
      return {
        msg: 'Abhi bahut requests aa rahi hain — 1-2 minute baad try karo ⏳',
        type: 'rate_limit'
      }

    if (data?.isNonMedical || e.includes('medical report nahi lagti'))
      return {
        msg: 'Yeh medical report nahi lagti 🩺 — CBC, blood test, thyroid ya sugar report upload karo',
        type: 'non_medical'
      }

    if (e.includes('lock laga hai') || e.includes('password'))
      return {
        msg: 'PDF pe lock laga hai 🔒 — iLovePDF.com pe jao → Security → Remove Password → phir upload karo',
        type: 'password'
      }

    if (e.includes('bahut chhoti') || e.includes('original lab report'))
      return {
        msg: 'File bahut chhoti hai 😕 — original report ka clear photo lo, screenshot mat bhejo',
        type: 'too_small'
      }

    if (e.includes('padh nahi paaye') || e.includes('could not process') || e.includes('clearly nahi dikhi') || e.includes('samajh nahi'))
      return {
        msg: 'Report clearly nahi dikhi 😕 — PDF format mein try karo ya achhi roshni mein flat surface pe rakh ke photo lo',
        type: 'parse_error'
      }

    if (e.includes('sahi nahi hai') || e.includes('corrupt') || e.includes('repair'))
      return {
        msg: 'PDF file sahi nahi hai 😕 — iLovePDF.com se repair karo ya doosri file try karo',
        type: 'corrupted'
      }

    if (e.includes('badi hai') || e.includes('compress karke') || e.includes('bada hai'))
      return { msg: apiError, type: 'too_large' }

    if (e.includes('"type":"error"') || e.includes('invalid_request_error') || e.includes('technical'))
      return {
        msg: 'Kuch technical issue hua 😕 — dobara try karo. Baar baar ho raha hai toh WhatsApp karo 👇',
        type: 'api_error'
      }

    return {
      msg: 'Report analyze nahi ho payi 😕 — dobara try karo. Baar baar ho raha hai toh WhatsApp karo 👇',
      type: 'generic'
    }
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
          <span style={{ fontSize: 11, fontWeight: 700, color: '#0d9488' }}>✅ 12,000+ Reports Analyzed</span>
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
              try { localStorage.setItem('s24_login_nudge_dismissed', 'true') } catch {}
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
            <span
              suppressHydrationWarning
              style={{
                display: 'inline-block',
                background: '#f8fafc', border: '1px solid #f1f5f9',
                borderRadius: 100, padding: '6px 16px',
                fontSize: 11, color: '#94a3b8',
              }}>
              PDF, JPG, PNG — koi bhi size
            </span>
          </div>
        )}
      </div>

      {/* ── Error cards — immediately below drop zone ── */}

      {/* Anon gate — login required for 2nd upload */}
      {error && errorType === 'anon_gate' && (
        <div style={{
          marginTop: 16,
          background: 'linear-gradient(135deg, #f0fdfa, #ecfdf5)',
          border: '1.5px solid #99f6e4',
          borderRadius: 16,
          overflow: 'hidden',
        }}>
          <div style={{ padding: '20px 16px 16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 10
            }}>
              <span style={{ fontSize: 28 }}>🔓</span>
              <p style={{
                fontSize: 15,
                fontWeight: 700,
                color: '#134e4a',
                margin: 0
              }}>
                Pehli report bilkul FREE!
              </p>
            </div>
            <p style={{
              fontSize: 13,
              color: '#0d9488',
              lineHeight: 1.65,
              marginBottom: 16
            }}>
              Login karo aur apni medical report Hindi mein samjho 🇮🇳
              <br/>
              <span style={{ fontSize: 12, color: '#64748b' }}>
                Koi credit card nahi • Koi hidden charges nahi
              </span>
            </p>
            <a
              href="/auth/login"
              style={{
                display: 'block',
                width: '100%',
                padding: '13px',
                background: 'linear-gradient(135deg, #0d9488, #0891b2)',
                color: 'white',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 700,
                textDecoration: 'none',
                textAlign: 'center',
                boxSizing: 'border-box',
                marginBottom: 10
              }}
            >
              🔓 Login Karo — Free Mein
            </a>
            <p style={{
              fontSize: 11,
              color: '#94a3b8',
              textAlign: 'center',
              margin: 0
            }}>
              Already account hai?{' '}
              <a href="/auth/login" style={{
                color: '#0d9488',
                fontWeight: 600,
                textDecoration: 'none'
              }}>
                Sign in karo →
              </a>
            </p>
          </div>
        </div>
      )}

      {error && errorType === 'report_too_large' && (
        <div style={{
          marginTop: 16,
          background: 'linear-gradient(135deg,#fffbeb,#fef3c7)',
          border: '1.5px solid #fcd34d',
          borderRadius: 16, overflow: 'hidden',
        }}>
          <div style={{ padding: '18px 16px 14px' }}>
            <p style={{ fontSize: 16, fontWeight: 800, color: '#92400e', margin: '0 0 8px' }}>
              Badi report hai 😕 Pro mein analyze karo!
            </p>
            <p style={{ fontSize: 13, color: '#78350f', lineHeight: 1.6, margin: '0 0 16px' }}>
              ✅ Unlimited pages &nbsp; ✅ Deep analysis<br/>
              ✅ PDF download &nbsp; ✅ ₹199 mein poora mahina — jitni bhi reports karo, sab free! ☕<br/>
              <span style={{ fontSize: 12 }}>1,200+ log already use kar rahe hain 🇮🇳</span>
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
              ⚡ ⚡ ₹199 mein poora mahina — unlimited reports!
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

      {error && errorType === 'limit' && (
        <div style={{
          marginTop: 16,
          background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
          border: '1.5px solid #fcd34d',
          borderRadius: 16,
          overflow: 'hidden',
        }}>
          <div style={{ padding: '20px 16px 16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 12
            }}>
              <span style={{ fontSize: 28 }}>⚡</span>
              <div>
                <p style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#92400e',
                  margin: 0
                }}>
                  Free report use ho gayi! 😊
                </p>
                <p style={{
                  fontSize: 12,
                  color: '#b45309',
                  margin: 0,
                  marginTop: 2
                }}>
                  Aur reports ke liye Pro lo
                </p>
              </div>
            </div>
            <div style={{
              background: 'white',
              borderRadius: 10,
              padding: '12px 14px',
              marginBottom: 14,
              border: '1px solid #fde68a'
            }}>
              <p style={{
                fontSize: 12,
                color: '#78350f',
                margin: 0,
                lineHeight: 1.8
              }}>
                ✅ Unlimited reports — koi limit nahi<br/>
                ✅ PDF download — doctor ko share karo<br/>
                ✅ Voice — Hindi mein sunein<br/>
                ✅ Unlimited chat — medicine poochho<br/>
                ✅ Complete history — sab reports ek jagah
              </p>
            </div>
            <div style={{
              textAlign: 'center',
              marginBottom: 14
            }}>
              <span style={{
                fontSize: 13,
                color: '#94a3b8',
                textDecoration: 'line-through',
                marginRight: 8
              }}>
                ₹599/month
              </span>
              <span style={{
                fontSize: 13,
                fontWeight: 700,
                color: '#92400e'
              }}>
                ₹199/month
              </span>
              <span style={{
                display: 'inline-block',
                background: '#dc2626',
                color: 'white',
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 100,
                marginLeft: 8
              }}>
                Save 67%
              </span>
              <p style={{
                fontSize: 11,
                color: '#b45309',
                margin: '4px 0 0'
              }}>
                = Sirf ₹6.6/din ☕
              </p>
            </div>
            <a
              href="/upgrade"
              style={{
                display: 'block',
                width: '100%',
                padding: '13px',
                background: 'linear-gradient(135deg, #0d9488, #0891b2)',
                color: 'white',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 700,
                textDecoration: 'none',
                textAlign: 'center',
                boxSizing: 'border-box',
                marginBottom: 10
              }}
            >
              🔓 Pro lo — ₹199/month
            </a>
            <p style={{
              fontSize: 11,
              color: '#92400e',
              textAlign: 'center',
              margin: 0,
              fontWeight: 600
            }}>
              1,200+ Indians already use kar rahe hain 🇮🇳
            </p>
          </div>
        </div>
      )}

      {error && errorType !== 'report_too_large' && errorType !== 'anon_gate' && errorType !== 'limit' && (
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
              💡 Achhi roshni mein flat surface pe rakhke dobara photo lo — ya PDF format mein upload karo 📄 PDF se best results aate hain
            </p>
          )}
          {errorType === 'too_small' && (
            <p style={{ fontSize: 12, color: '#7f1d1d', lineHeight: 1.6, margin: '0 16px 10px' }}>
              💡 Screenshot ya thumbnail mat bhejo — original report ka pura photo lo.
            </p>
          )}
          {errorType === 'corrupted' && (
            <p style={{ fontSize: 12, color: '#7f1d1d', lineHeight: 1.6, margin: '0 16px 10px' }}>
              💡 PDF file corrupt ho sakti hai — iLovePDF.com se repair karo ya doosra PDF try karo
            </p>
          )}
          {errorType === 'too_large' && !isPro && (
            <div style={{ padding: '0 16px 8px' }}>
              <a href="/upgrade" style={{
                display: 'block',
                background: '#0d9488',
                color: 'white',
                padding: '10px 16px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
                textAlign: 'center',
              }}>
                ⚡ Pro mein unlimited reports + PDF + Voice
              </a>
            </div>
          )}

          {/* Retry + WhatsApp — shown for all errors except limit/login redirects */}
          {errorType !== 'limit' && errorType !== 'login' && (
            <div style={{ padding: '0 16px 14px', display: 'flex', gap: 8, flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={resetUpload}
                  style={{
                    flex: 1, padding: '11px',
                    background: '#dc2626', color: 'white',
                    border: 'none', borderRadius: 10,
                    fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  🔄 Dobara Try Karo
                </button>
                <a
                  href={isPro
                    ? `https://wa.me/918076170877?text=${encodeURIComponent(`Namaste Sehat24 Team 🙏\n\nMain Sehat24 Pro user hoon aur meri report upload nahi ho rahi.\n\nFile: ${file?.name || 'N/A'}\nError: ${error || 'Unknown'}\n\nPlease help karein.`)}`
                    : `https://wa.me/918076170877?text=${encodeURIComponent('Meri report upload nahi ho rahi 🙏')}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1, padding: '11px',
                    background: '#22c55e', color: 'white',
                    borderRadius: 10, fontSize: 13, fontWeight: 700,
                    textDecoration: 'none',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 5,
                  }}
                >
                  💬 {isPro ? 'Pro Support' : 'WhatsApp Help'}
                </a>
              </div>

              {isPro && (
                <div style={{
                  background: 'linear-gradient(135deg, #f0fdfa, #ccfbf1)',
                  border: '1.5px solid #0d9488',
                  borderRadius: 12,
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10
                }}>
                  <span style={{ fontSize: 20 }}>👑</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#0d9488', margin: 0 }}>
                      Pro Member — Priority Support
                    </p>
                    <p style={{ fontSize: 11, color: '#134e4a', margin: 0 }}>
                      Hum personally help karenge — WhatsApp karo!
                    </p>
                  </div>
                  <a
                    href={`https://wa.me/918076170877?text=${encodeURIComponent(`Namaste Sehat24 Team 🙏\n\nMain Sehat24 Pro user hoon.\n\nFile: ${file?.name || 'N/A'}\nError: ${error || 'Unknown'}\n\nPlease help karein.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: '#0d9488',
                      color: 'white',
                      padding: '8px 14px',
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 700,
                      textDecoration: 'none',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    💬 WhatsApp
                  </a>
                </div>
              )}
            </div>
          )}

        </div>
      )}

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
            {file ? '🔍 Report Analyze Karo →' : 'Pehle file select karo'}
          </button>
        </div>
      )}

      {/* ── SECTION 10: Bottom Trust ── */}
      <p style={{ fontSize: 12, color: '#cbd5e1', textAlign: 'center', marginTop: 20, marginBottom: 4 }}>
        🇮🇳 Made in India — Har Indian ke liye
      </p>
      <p style={{ fontSize: 12, color: '#cbd5e1', textAlign: 'center', lineHeight: 1.6, margin: 0 }}>
        Aapki report ka analysis securely store hota hai — kabhi bhi dekh sako.
      </p>

    </main>
  )
}
