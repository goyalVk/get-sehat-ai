'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState('')

  const [form, setForm] = useState({
    firstName: '',
    lastName:  '',
    email:     '',
  })

  useEffect(() => { fetchUser() }, [])

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (!res.ok) { router.push('/auth/login'); return }
      const data = await res.json()
      setUser(data)
      setForm({
        firstName: data.firstName || '',
        lastName:  data.lastName  || '',
        email:     data.email     || '',
      })
    } catch {
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    setSaving(true)
    setError('')
    setSaved(false)

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setSaved(true)
      setUser({ ...user, ...form })
      setTimeout(() => setSaved(false), 3000)

    } catch (err) {
      setError(err.message || 'Save nahi ho saka')
    } finally {
      setSaving(false)
    }
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  const initials = form.firstName && form.lastName
    ? `${form.firstName[0]}${form.lastName[0]}`.toUpperCase()
    : user?.phone?.slice(-2) || 'U'

  return (
    <main className="min-h-screen bg-stone-50">

      {/* Navbar */}
      <nav className="bg-white border-b border-stone-100 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="text-lg font-semibold text-teal-700">
            Sehat24
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-stone-500 hover:text-stone-700">
              Dashboard
            </Link>
            <Link href="/history" className="text-sm text-stone-500 hover:text-stone-700">
              History
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">

        <h1 className="text-2xl font-semibold text-stone-800 serif mb-8">
          My Profile
        </h1>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center">
            <span className="text-xl font-semibold text-teal-700">
              {initials}
            </span>
          </div>
          <div>
            <p className="font-medium text-stone-800">
              {form.firstName
                ? `${form.firstName} ${form.lastName}`
                : 'Update your name'
              }
            </p>
            <p className="text-sm text-stone-400">{user?.phone}</p>
          </div>
        </div>

        {/* Plan card */}
        <div className={`rounded-2xl p-5 mb-6 border ${
          user?.plan === 'paid'
            ? 'bg-teal-50 border-teal-100'
            : 'bg-stone-50 border-stone-100'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-400 mb-1">Current Plan</p>
              <p className={`text-lg font-semibold capitalize ${
                user?.plan === 'paid' ? 'text-teal-700' : 'text-stone-700'
              }`}>
                {user?.plan === 'paid' ? '✓ Paid Plan' : 'Free Plan'}
              </p>
              <p className="text-xs text-stone-500 mt-1">
                {user?.plan === 'paid'
                  ? 'Unlimited reports'
                  : `${user?.reportsUsed || 0} / ${user?.reportsLimit || 3} reports used`
                }
              </p>
            </div>
            {user?.plan !== 'paid' && (
              <Link
                href="/upgrade"
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                Upgrade →
              </Link>
            )}
          </div>

          {/* Free plan progress bar */}
          {user?.plan !== 'paid' && (
            <div className="mt-3">
              <div className="w-full bg-stone-200 rounded-full h-1.5">
                <div
                  className="bg-teal-500 h-1.5 rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      ((user?.reportsUsed || 0) / (user?.reportsLimit || 3)) * 100,
                      100
                    )}%`
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Profile form */}
        <div className="bg-white rounded-2xl border border-stone-100 p-6 mb-6">
          <h2 className="font-semibold text-stone-700 mb-5 text-sm uppercase tracking-wide">
            Personal Information
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-medium text-stone-500 block mb-1.5">
                First Name
              </label>
              <input
                type="text"
                value={form.firstName}
                onChange={e => setForm({ ...form, firstName: e.target.value })}
                placeholder="Rahul"
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal-400 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-stone-500 block mb-1.5">
                Last Name
              </label>
              <input
                type="text"
                value={form.lastName}
                onChange={e => setForm({ ...form, lastName: e.target.value })}
                placeholder="Sharma"
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal-400 transition-colors"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="text-xs font-medium text-stone-500 block mb-1.5">
              Mobile Number
            </label>
            <input
              type="text"
              value={user?.phone || ''}
              disabled
              className="w-full border border-stone-100 rounded-xl px-4 py-3 text-sm bg-stone-50 text-stone-400 cursor-not-allowed"
            />
            <p className="text-xs text-stone-400 mt-1">
              Mobile number change nahi ho sakta
            </p>
          </div>

          <div className="mb-6">
            <label className="text-xs font-medium text-stone-500 block mb-1.5">
              Email (Optional)
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="rahul@gmail.com"
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal-400 transition-colors"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {saved && (
            <div className="bg-green-50 border border-green-100 rounded-xl p-3 mb-4">
              <p className="text-sm text-green-600">✓ Profile saved successfully!</p>
            </div>
          )}

          <button
            onClick={saveProfile}
            disabled={saving}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3.5 rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

        {/* Account section */}
        <div className="bg-white rounded-2xl border border-stone-100 p-6">
          <h2 className="font-semibold text-stone-700 mb-4 text-sm uppercase tracking-wide">
            Account
          </h2>

          <div className="flex items-center justify-between py-3 border-b border-stone-50">
            <div>
              <p className="text-sm font-medium text-stone-700">Member since</p>
              <p className="text-xs text-stone-400 mt-0.5">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })
                  : 'N/A'
                }
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-stone-50">
            <div>
              <p className="text-sm font-medium text-stone-700">Total Reports</p>
              <p className="text-xs text-stone-400 mt-0.5">
                Lifetime reports analyzed
              </p>
            </div>
            <span className="text-lg font-semibold text-teal-600">
              {user?.reportsUsed || 0}
            </span>
          </div>

          <button
            onClick={logout}
            className="w-full mt-4 py-3 border border-red-100 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
          >
            Logout
          </button>
        </div>

      </div>
    </main>
  )
}