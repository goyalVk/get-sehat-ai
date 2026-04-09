'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
import Link from 'next/link'

// SearchParams alag component mein nikalo
function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'

  const [phone, setPhone]       = useState('')
  const [name, setName]         = useState('')
  const [otp, setOtp]           = useState('')
  const [step, setStep]         = useState('phone')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [confirm, setConfirm]   = useState(null)
  const [isNewUser, setIsNewUser] = useState(false)

  const setupRecaptcha = () => {
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear()
      window.recaptchaVerifier = null
    }
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {},
      'expired-callback': () => { window.recaptchaVerifier = null }
    })
    return window.recaptchaVerifier.render()
  }

  const sendOTP = async () => {
    setError('')
    if (!phone || phone.length !== 10) { setError('Valid 10 digit mobile number enter karo'); return }
    setLoading(true)
    try {
      await setupRecaptcha()
      const confirmation = await signInWithPhoneNumber(auth, `+91${phone}`, window.recaptchaVerifier)
      setConfirm(confirmation)
      const checkRes = await fetch('/api/auth/check-user', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+91${phone}` })
      })
      const checkData = await checkRes.json()
      setIsNewUser(!checkData.exists)
      setStep('otp')
    } catch (err) {
      console.error('OTP Error:', err.code, err.message)
      window.recaptchaVerifier = null
      setError('OTP bhejne mein error. Dobara try karo.')
    }
    setLoading(false)
  }

  const verifyOTP = async () => {
    setError('')
    if (!otp || otp.length !== 6) { setError('6 digit OTP enter karo'); return }
    if (isNewUser && !name.trim()) { setError('Apna naam enter karo'); return }
    setLoading(true)
    try {
      const result = await confirm.confirm(otp)
      const user = result.user
      const res = await fetch('/api/auth/verify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: user.phoneNumber,
          firebaseUid: user.uid,
          token: await user.getIdToken(),
          name: name.trim()
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push(redirectTo)
    } catch (err) {
      console.error(err)
      setError('OTP galat hai. Dobara try karo.')
    }
    setLoading(false)
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
                <input type="tel" maxLength={10} value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={e => e.key === 'Enter' && sendOTP()}
                  placeholder="10 digit number"
                  style={{
                    flex: 1, border: '1px solid #e2e8f0', borderRadius: 12,
                    padding: '12px 16px', fontSize: 14, outline: 'none',
                    fontFamily: "'Plus Jakarta Sans', sans-serif"
                  }} />
              </div>
              {error && <p style={{ fontSize: 12, color: '#dc2626', marginBottom: 12 }}>{error}</p>}
              <button onClick={sendOTP} disabled={loading} style={{
                width: '100%', background: '#0d9488', color: 'white',
                border: 'none', borderRadius: 12, padding: '14px',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                opacity: loading ? 0.6 : 1
              }}>
                {loading ? 'Sending OTP...' : 'Send OTP →'}
              </button>
            </div>
          ) : (
            <div>
              {isNewUser && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>
                    Your Name
                  </label>
                  <input type="text" value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Rahul Sharma"
                    style={{
                      width: '100%', border: '1px solid #e2e8f0', borderRadius: 12,
                      padding: '12px 16px', fontSize: 14, outline: 'none',
                      fontFamily: "'Plus Jakarta Sans', sans-serif", boxSizing: 'border-box'
                    }} />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Enter OTP</label>
                <button onClick={() => { setStep('phone'); setOtp(''); setError('') }}
                  style={{ fontSize: 12, color: '#0d9488', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Change number
                </button>
              </div>

              <input type="tel" maxLength={6} value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                onKeyDown={e => e.key === 'Enter' && verifyOTP()}
                placeholder="6 digit OTP"
                style={{
                  width: '100%', border: '1px solid #e2e8f0', borderRadius: 12,
                  padding: '14px 16px', fontSize: 20, outline: 'none', marginBottom: 16,
                  letterSpacing: 8, textAlign: 'center', fontFamily: 'monospace',
                  boxSizing: 'border-box'
                }} />

              {error && <p style={{ fontSize: 12, color: '#dc2626', marginBottom: 12 }}>{error}</p>}

              <button onClick={verifyOTP} disabled={loading} style={{
                width: '100%', background: '#0d9488', color: 'white',
                border: 'none', borderRadius: 12, padding: '14px',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                opacity: loading ? 0.6 : 1, marginBottom: 10
              }}>
                {loading ? 'Verifying...' : 'Verify & Continue →'}
              </button>

              <button onClick={sendOTP} disabled={loading} style={{
                width: '100%', background: 'transparent', color: '#94a3b8',
                border: 'none', padding: '10px', fontSize: 13, cursor: 'pointer',
                fontFamily: "'Plus Jakarta Sans', sans-serif"
              }}>
                Resend OTP
              </button>
            </div>
          )}
        </div>

        <p style={{ fontSize: 11, color: '#cbd5e1', textAlign: 'center', marginTop: 20, lineHeight: 1.6 }}>
          By continuing you agree to our{' '}
          <Link href="/terms" style={{ color: '#94a3b8' }}>Terms</Link> and{' '}
          <Link href="/privacy" style={{ color: '#94a3b8' }}>Privacy Policy</Link>
        </p>
        <div id="recaptcha-container" />
      </div>
    </main>
  )
}

// Main page — Suspense wrap karo
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