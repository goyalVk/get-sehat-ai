'use client'
import { useState, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { events } from '@/components/Analytics'
import { requestPushPermission } from '@/lib/pushNotification'

function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const redirectTo   = searchParams.get('redirect') || '/dashboard'

  const [phone, setPhone]           = useState('')
  const [name, setName]             = useState('')
  const [otp, setOtp]               = useState('')
  const [step, setStep]             = useState('phone')
  const [loading, setLoading]       = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [error, setError]           = useState('')
  const [isNewUser, setIsNewUser]   = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const timerRef = useRef(null)

  const startTimer = () => {
    setResendTimer(60)
    timerRef.current = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const sendOTP = async () => {
    setError('')
    if (!phone || phone.length !== 10) {
      setError('Valid 10 digit mobile number enter karo')
      return
    }
    events.signupStarted()
    setLoading(true)
    setLoadingMsg('OTP bhej rahe hain...')
    try {
      // Check user first — before sending OTP
      const checkRes  = await fetch('/api/auth/check-user', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ phone: `+91${phone}` }),
      })
      const checkData = await checkRes.json()
      setIsNewUser(!checkData.exists || !checkData.hasName)

      // Send OTP via 2Factor
      const res  = await fetch('/api/auth/send-otp', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ phone }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'OTP bhejne mein error. Dobara try karo.')
        return
      }

      setStep('otp')
      clearInterval(timerRef.current)
      startTimer()

    } catch {
      setError('OTP bhejne mein error. Dobara try karo.')
    } finally {
      setLoading(false)
      setLoadingMsg('')
    }
  }

  const verifyOTP = async () => {
    setError('')
    if (!otp || otp.length !== 6) { setError('6 digit OTP enter karo'); return }
    if (isNewUser && !name.trim()) { setError('Apna naam enter karo'); return }
    setLoading(true)
    setLoadingMsg('Verify ho raha hai...')
    try {
      const res  = await fetch('/api/auth/verify-otp', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ phone, otp, name: name.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'OTP galat hai ya expire ho gaya. Dobara try karo.')
        return
      }

      try {
        localStorage.setItem('s24_user', JSON.stringify({
          id:   data.user?.id,
          plan: data.user?.plan || 'free'
        }))
      } catch {}

      if (isNewUser) {
        events.signupCompleted()
      } else {
        events.loginCompleted()
      }

      // Map anon reports
      try {
        const anonId = localStorage.getItem('s24_uid')
        if (anonId && data.user?.id) {
          fetch('/api/auth/map-anon', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ anonId, userId: data.user.id }),
          }).catch(() => {})
        }
      } catch {}

      // Link push token
      try {
        const pushToken = localStorage.getItem('s24_push_token')
        const anonId    = localStorage.getItem('s24_uid')
        if (pushToken || anonId) {
          fetch('/api/push/link-user', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ token: pushToken || null, anonId: anonId || null }),
          }).catch(console.error)
        }
      } catch {}

      await requestPushPermission()
      router.push(redirectTo)

    } catch {
      setError('OTP galat hai ya expire ho gaya. Dobara try karo.')
    } finally {
      setLoading(false)
      setLoadingMsg('')
    }
  }

  return (
    <main style={{
      minHeight: '80vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '40px 24px', background: '#f8fafc',
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <p style={{ fontSize: 22, color: '#0f172a', fontFamily: "'DM Serif Display', serif", marginBottom: 6 }}>
            {step === 'phone' ? 'Welcome back' : isNewUser ? 'Create account' : 'Enter OTP'}
          </p>
          <p style={{ fontSize: 14, color: '#94a3b8' }}>
            {step === 'phone' ? 'Enter your mobile number to continue' : `OTP sent to +91${phone}`}
          </p>
        </div>

        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #f1f5f9', padding: 28, boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>

          {step === 'phone' ? (
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>
                Mobile Number
              </label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                <span style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 14px', fontSize: 14, color: '#64748b' }}>
                  +91
                </span>
                <input
                  type="tel" maxLength={10} value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={e => e.key === 'Enter' && sendOTP()}
                  placeholder="10 digit number"
                  autoFocus
                  style={{
                    flex: 1, border: '1px solid #e2e8f0', borderRadius: 12,
                    padding: '12px 16px', fontSize: 14, outline: 'none',
                    fontFamily: "'Plus Jakarta Sans', sans-serif"
                  }}
                />
              </div>

              {error && <p style={{ fontSize: 12, color: '#dc2626', marginBottom: 12 }}>{error}</p>}

              <button onClick={sendOTP} disabled={loading} style={{
                width: '100%', background: '#0d9488', color: 'white',
                border: 'none', borderRadius: 12, padding: '14px',
                fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                opacity: loading ? 0.8 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}>
                {loading ? (
                  <>
                    <div style={{ width: 16, height: 16, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    {loadingMsg || 'OTP bhej rahe hain...'}
                  </>
                ) : 'Send OTP →'}
              </button>
            </div>
          ) : (
            <div>
              {isNewUser && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>
                    Your Name
                  </label>
                  <input
                    type="text" value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Rahul Sharma"
                    style={{
                      width: '100%', border: '1px solid #e2e8f0', borderRadius: 12,
                      padding: '12px 16px', fontSize: 14, outline: 'none',
                      fontFamily: "'Plus Jakarta Sans', sans-serif", boxSizing: 'border-box'
                    }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Enter OTP</label>
                <button
                  onClick={() => { setStep('phone'); setOtp(''); setError('') }}
                  style={{ fontSize: 12, color: '#0d9488', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Change number
                </button>
              </div>

              <input
                type="tel" maxLength={6} value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                onKeyDown={e => e.key === 'Enter' && verifyOTP()}
                placeholder="6 digit OTP"
                autoFocus
                style={{
                  width: '100%', border: '1px solid #e2e8f0', borderRadius: 12,
                  padding: '14px 16px', fontSize: 20, outline: 'none', marginBottom: 16,
                  letterSpacing: 8, textAlign: 'center', fontFamily: 'monospace',
                  boxSizing: 'border-box'
                }}
              />

              {error && <p style={{ fontSize: 12, color: '#dc2626', marginBottom: 12 }}>{error}</p>}

              <button onClick={verifyOTP} disabled={loading} style={{
                width: '100%', background: '#0d9488', color: 'white',
                border: 'none', borderRadius: 12, padding: '14px',
                fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                opacity: loading ? 0.8 : 1, marginBottom: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}>
                {loading ? (
                  <>
                    <div style={{ width: 16, height: 16, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    {loadingMsg || 'Verify ho raha hai...'}
                  </>
                ) : 'Verify & Continue →'}
              </button>

              {resendTimer > 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '10px',
                  fontSize: 13,
                  color: '#94a3b8',
                  fontFamily: "'Plus Jakarta Sans', sans-serif"
                }}>
                  ⏱️ SMS aa raha hai... {resendTimer} seconds
                </div>
              ) : (
                <button
                  onClick={() => {
                    clearInterval(timerRef.current)
                    startTimer()
                    sendOTP()
                  }}
                  disabled={loading}
                  style={{
                    width: '100%', background: 'transparent', color: '#0d9488',
                    border: 'none', padding: '10px', fontSize: 13,
                    cursor: 'pointer', fontWeight: 600,
                    fontFamily: "'Plus Jakarta Sans', sans-serif"
                  }}
                >
                  🔄 Resend OTP
                </button>
              )}
            </div>
          )}
        </div>

        <p style={{ fontSize: 11, color: '#cbd5e1', textAlign: 'center', marginTop: 20, lineHeight: 1.6 }}>
          By continuing you agree to our{' '}
          <Link href="/terms" style={{ color: '#94a3b8' }}>Terms</Link> and{' '}
          <Link href="/privacy" style={{ color: '#94a3b8' }}>Privacy Policy</Link>
        </p>

        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '2px solid #0d9488', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </main>
    }>
      <LoginForm />
    </Suspense>
  )
}
