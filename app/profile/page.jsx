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
    firstName: '', lastName: '', email: '',
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
    } catch { router.push('/auth/login') }
    finally { setLoading(false) }
  }

  const saveProfile = async () => {
    setSaving(true); setError(''); setSaved(false)
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
    } finally { setSaving(false) }
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ width: 32, height: 32, border: '2px solid #0d9488', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </main>
    )
  }

  const initials = form.firstName && form.lastName
    ? `${form.firstName[0]}${form.lastName[0]}`.toUpperCase()
    : user?.phone?.slice(-2) || 'U'

  const reportsPercent = Math.min(
    ((user?.reportsUsed || 0) / (user?.reportsLimit || 2)) * 100, 100
  )

  return (
    <main style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Navbar */}
      <nav style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 24px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/dashboard" style={{ fontSize: 18, fontWeight: 700, color: '#0d9488', textDecoration: 'none' }}>
            Sehat24
          </Link>
          <div style={{ display: 'flex', gap: 20 }}>
            <Link href="/dashboard" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none' }}>Dashboard</Link>
            <Link href="/history"   style={{ fontSize: 13, color: '#64748b', textDecoration: 'none' }}>History</Link>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 24px' }}>

        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 32 }}>
          My Profile
        </h1>

        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: '#e6faf8',
            border: '2px solid #0d9488',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#0d9488' }}>{initials}</span>
          </div>
          <div>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', margin: 0 }}>
              {form.firstName ? `${form.firstName} ${form.lastName}` : 'Update your name'}
            </p>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0' }}>{user?.phone}</p>
          </div>
        </div>

        {/* Plan Card */}
        <div style={{
          background: user?.plan === 'paid' ? '#e6faf8' : '#ffffff',
          border: `1px solid ${user?.plan === 'paid' ? '#0d9488' : '#e2e8f0'}`,
          borderRadius: 16, padding: 20, marginBottom: 20
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 4px' }}>Current Plan</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: user?.plan === 'paid' ? '#0d9488' : '#1e293b', margin: 0 }}>
                {user?.plan === 'paid' ? '✓ Paid Plan' : 'Free Plan'}
              </p>
              <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0' }}>
                {user?.plan === 'paid'
                  ? 'Unlimited reports'
                  : `${user?.reportsUsed || 0} / ${user?.reportsLimit || 2} reports used`
                }
              </p>
            </div>
            {user?.plan !== 'paid' && (
              <Link href="/upgrade" style={{
                background: '#0d9488', color: '#ffffff',
                padding: '8px 16px', borderRadius: 12,
                fontSize: 13, fontWeight: 600,
                textDecoration: 'none'
              }}>
                Upgrade →
              </Link>
            )}
          </div>

          {user?.plan !== 'paid' && (
            <div style={{ marginTop: 12 }}>
              <div style={{ width: '100%', background: '#e2e8f0', borderRadius: 999, height: 6 }}>
                <div style={{
                  width: `${reportsPercent}%`,
                  background: '#0d9488',
                  height: 6, borderRadius: 999,
                  transition: 'width 0.3s'
                }} />
              </div>
            </div>
          )}
        </div>

        {/* Profile Form */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24, marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20 }}>
            Personal Information
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            {[
              { label: 'First Name', key: 'firstName', placeholder: 'Rahul' },
              { label: 'Last Name',  key: 'lastName',  placeholder: 'Sharma' },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>{label}</label>
                <input
                  type="text"
                  value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  style={{
                    width: '100%', background: '#f8fafc',
                    border: '1px solid #e2e8f0', borderRadius: 12,
                    padding: '12px 16px', fontSize: 14,
                    color: '#1e293b', outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Mobile Number</label>
            <input
              type="text"
              value={user?.phone || ''}
              disabled
              style={{
                width: '100%', background: '#f1f5f9',
                border: '1px solid #e2e8f0', borderRadius: 12,
                padding: '12px 16px', fontSize: 14,
                color: '#94a3b8', cursor: 'not-allowed',
                boxSizing: 'border-box'
              }}
            />
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Mobile number change nahi ho sakta</p>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Email (Optional)</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="rahul@gmail.com"
              style={{
                width: '100%', background: '#f8fafc',
                border: '1px solid #e2e8f0', borderRadius: 12,
                padding: '12px 16px', fontSize: 14,
                color: '#1e293b', outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: 12, marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: '#ef4444', margin: 0 }}>{error}</p>
            </div>
          )}

          {saved && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: 12, marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: '#16a34a', margin: 0 }}>✓ Profile saved successfully!</p>
            </div>
          )}

          <button
            onClick={saveProfile}
            disabled={saving}
            style={{
              width: '100%', background: saving ? '#0f766e' : '#0d9488',
              color: '#ffffff', padding: '14px', borderRadius: 12,
              fontSize: 14, fontWeight: 600, border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s'
            }}
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

        {/* Account Section */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
            Account
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', margin: 0 }}>Member since</p>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                  : 'N/A'
                }
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', margin: 0 }}>Total Reports</p>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>Lifetime reports analyzed</p>
            </div>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#0d9488' }}>
              {user?.reportsUsed || 0}
            </span>
          </div>

          <button
            onClick={logout}
            style={{
              width: '100%', marginTop: 16,
              padding: '12px', borderRadius: 12,
              border: '1px solid #fecaca',
              background: 'transparent',
              fontSize: 14, color: '#ef4444',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>

      </div>
    </main>
  )
}