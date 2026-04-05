'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser()
    fetchReports()
  }, [])

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (!res.ok) {
        router.push('/auth/login')
        return
      }
      const data = await res.json()
      setUser(data)
    } catch {
      router.push('/auth/login')
    }
  }

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/reports')
      const data = await res.json()
      setReports(data.reports || [])
    } catch {
      setReports([])
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/auth/login')
  }

  const statusColor = (status) => {
    const map = {
      normal:   'bg-green-100 text-green-700',
      low:      'bg-amber-100 text-amber-700',
      high:     'bg-red-100 text-red-700',
      critical: 'bg-red-600 text-white',
    }
    return map[status] || 'bg-stone-100 text-stone-600'
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-stone-50">

      {/* Navbar */}
      <nav className="bg-white border-b border-stone-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold text-teal-700">
            GetSehat AI
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/history"
                className="text-sm text-stone-500 hover:text-stone-700">
                History
            </Link>
            <Link href="/profile"
                className="text-sm text-stone-500 hover:text-stone-700">
                Profile
            </Link>
            <span className="text-sm text-stone-500">
                {user?.phone}
            </span>
            <button
                onClick={logout}
                className="text-sm text-stone-400 hover:text-stone-600">
                Logout
            </button>
</div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-stone-100">
            <p className="text-xs text-stone-400 mb-1">Total Reports</p>
            <p className="text-2xl font-semibold text-stone-800">
              {reports.length}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-stone-100">
            <p className="text-xs text-stone-400 mb-1">Plan</p>
            <p className="text-2xl font-semibold text-teal-600 capitalize">
              {user?.plan || 'free'}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-stone-100">
            <p className="text-xs text-stone-400 mb-1">Reports Left</p>
            <p className="text-2xl font-semibold text-stone-800">
              {user?.plan === 'paid'
                ? '∞'
                : `${(user?.reportsLimit || 3) - (user?.reportsUsed || 0)}`
              }
            </p>
          </div>
        </div>

        {/* Upload button */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-stone-800">
            Meri Reports
          </h2>
          <Link
            href="/upload"
            className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            + New Report
          </Link>
        </div>

        {/* Reports list */}
        {reports.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-100 p-12 text-center">
            <div className="text-4xl mb-4">📋</div>
            <p className="text-stone-500 mb-4">
              Abhi tak koi report upload nahi ki
            </p>
            <Link
              href="/upload"
              className="bg-teal-600 text-white px-6 py-3 rounded-xl text-sm font-medium"
            >
              Pehli report upload karo
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map(report => (
              <div
                key={report._id}
                className="bg-white rounded-2xl border border-stone-100 p-5 hover:border-stone-200 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Report type + filename */}
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-stone-800 text-sm">
                        {report.reportType || 'Lab Report'}
                      </h3>
                      {report.urgentFlags?.length > 0 && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                          ⚠ {report.urgentFlags.length} urgent
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-stone-400 mb-2">
                      {report.fileName} •{' '}
                      {new Date(report.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>

                    {/* Patient info */}
                    {report.patient?.name && (
                      <p className="text-xs text-stone-500 mb-2">
                        Patient: {report.patient.name}
                        {report.patient.age && ` • ${report.patient.age} years`}
                      </p>
                    )}

                    {/* Parameter badges */}
                    {report.parameters?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {report.parameters.slice(0, 4).map((param, i) => (
                          <span
                            key={i}
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(param.status)}`}
                          >
                            {param.name}: {param.value} {param.unit}
                          </span>
                        ))}
                        {report.parameters.length > 4 && (
                          <span className="text-xs text-stone-400 px-2 py-0.5">
                            +{report.parameters.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* View button */}
                  <Link
                    href={`/results/${report._id}`}
                    className="text-sm text-teal-600 hover:text-teal-700 font-medium flex-shrink-0"
                  >
                    View →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}