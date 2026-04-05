'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import {
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth'

export default function LoginPage() {
  const router = useRouter()
  const [phone, setPhone]       = useState('')
  const [otp, setOtp]           = useState('')
  const [step, setStep]         = useState('phone') // phone → otp
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [confirm, setConfirm]   = useState(null)

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        'recaptcha-container',
        { size: 'invisible' }
      )
    }
  }

  const sendOTP = async () => {
    setError('')
    if (!phone || phone.length !== 10) {
      setError('Valid 10 digit mobile number daalo')
      return
    }

    setLoading(true)
    try {
      setupRecaptcha()
      const phoneNumber = `+91${phone}`
      const confirmation = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        window.recaptchaVerifier
      )
      setConfirm(confirmation)
      setStep('otp')
    } catch (err) {
      console.error(err)
      setError('OTP bhejne mein error. Dobara try karo.')
    }
    setLoading(false)
  }

  const verifyOTP = async () => {
    setError('')
    if (!otp || otp.length !== 6) {
      setError('6 digit OTP daalo')
      return
    }

    setLoading(true)
    try {
      const result = await confirm.confirm(otp)
      const user = result.user

      // Backend mein user save karo
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: user.phoneNumber,
          firebaseUid: user.uid,
          token: await user.getIdToken()
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      router.push('/dashboard')

    } catch (err) {
      console.error(err)
      setError('OTP galat hai. Dobara try karo.')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-stone-800 serif">
            GetSehat AI
          </h1>
          <p className="text-stone-500 text-sm mt-2">
            Apna mobile number se login karo
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-100 p-6">

          {step === 'phone' ? (
            <div>
              <label className="text-sm font-medium text-stone-700 block mb-2">
                Mobile Number
              </label>
              <div className="flex gap-2 mb-4">
                <span className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-3 text-stone-500 text-sm flex items-center">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="10 digit number"
                  className="flex-1 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal-400"
                />
              </div>

              {error && (
                <p className="text-red-500 text-xs mb-3">{error}</p>
              )}

              <button
                onClick={sendOTP}
                disabled={loading}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3.5 rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
              >
                {loading ? 'Bhej rahe hain...' : 'OTP Bhejo →'}
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-stone-500 mb-4">
                OTP bheja +91{phone} pe
                <button
                  onClick={() => setStep('phone')}
                  className="text-teal-600 ml-2 underline"
                >
                  Change
                </button>
              </p>

              <label className="text-sm font-medium text-stone-700 block mb-2">
                OTP Enter karo
              </label>
              <input
                type="tel"
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="6 digit OTP"
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal-400 mb-4"
              />

              {error && (
                <p className="text-red-500 text-xs mb-3">{error}</p>
              )}

              <button
                onClick={verifyOTP}
                disabled={loading}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3.5 rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
              >
                {loading ? 'Verify ho raha hai...' : 'Verify karo →'}
              </button>
            </div>
          )}

        </div>

        {/* Recaptcha container — invisible */}
        <div id="recaptcha-container" />

        <p className="text-xs text-stone-400 text-center mt-6 leading-relaxed">
          Login karke aap hamare Terms of Use aur
          Privacy Policy se agree karte hain
        </p>

      </div>
    </main>
  )
}