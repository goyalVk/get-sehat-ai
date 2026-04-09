'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const statusConfig = {
  normal:   { color: '#16a34a', bg: '#f0fdf4', label: 'Normal' },
  low:      { color: '#d97706', bg: '#fffbeb', label: 'Low' },
  high:     { color: '#dc2626', bg: '#fef2f2', label: 'High' },
  critical: { color: '#ffffff', bg: '#dc2626', label: 'Urgent' },
}

const categoryIcons = {
  blood:    '🩸',
  thyroid:  '🦋',
  lipid:    '🫀',
  diabetes: '📊',
  liver:    '🫁',
  kidney:   '🔬',
  vitamin:  '💊',
  full_body:'📋',
  other:    '📄',
}

function HealthScore({ reports }) {
  if (!reports.length) return 72
  const latest = reports[0]
  const abnormal = latest.parameters?.filter(p => p.status?.toLowerCase() !== 'normal').length || 0
  const total = latest.parameters?.length || 1
  const score = Math.round(((total - abnormal) / total) * 100)
  return Math.max(score, 30)
}

function ScoreRing({ score }) {
  const r = 54
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  const color = score >= 80 ? '#0d9488' : score >= 60 ? '#d97706' : '#dc2626'

  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
      <circle
        cx="70" cy="70" r={r} fill="none"
        stroke={color} strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        strokeDashoffset={circ * 0.25}
        style={{ transition: 'stroke-dasharray 1s ease' }}
      />
      <text x="70" y="65" textAnchor="middle" fontSize="28" fontWeight="700" fill={color} fontFamily="serif">{score}</text>
      <text x="70" y="82" textAnchor="middle" fontSize="11" fill="#94a3b8" fontFamily="sans-serif">Health Score</text>
    </svg>
  )
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [greeting, setGreeting] = useState('Good morning')

  useEffect(() => {
    const h = new Date().getHours()
    if (h < 12) setGreeting('Good morning')
    else if (h < 17) setGreeting('Good afternoon')
    else setGreeting('Good evening')
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [userRes, reportsRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/reports')
      ])
      if (!userRes.ok) { router.push('/auth/login'); return }
      const userData = await userRes.json()
      const reportsData = await reportsRes.json()
      setUser(userData)
      setReports((reportsData.reports || []).filter(r => r.status === 'completed'))
    } catch {
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const deleteReport = async (reportId, e) => {
  e.preventDefault()
  e.stopPropagation()

  if (!confirm('Delete this report?')) return

  try {
    const res = await fetch(`/api/reports?id=${reportId}`, {
      method: 'DELETE'
    })
    if (res.ok) {
      setReports(prev => prev.filter(r => r._id !== reportId))
    }
  } catch (err) {
    console.error('Delete failed:', err)
  }
}
  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40, height: 40, border: '3px solid #0d9488',
            borderTopColor: 'transparent', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 12px'
          }} />
          <p style={{ color: '#94a3b8', fontSize: 14 }}>Loading your health dashboard...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </main>
    )
  }

  const score = HealthScore({ reports })
  const totalAbnormal = reports.reduce((acc, r) =>
    acc + (r.parameters?.filter(p => p.status?.toLowerCase() !== 'normal').length || 0), 0)
  const urgentReports = reports.filter(r => r.urgentFlags?.length > 0).length
  const firstName = user?.firstName || user?.phone?.slice(-4) || 'there'
  const reportsLeft = user?.plan === 'paid' ? '∞' : `${(user?.reportsLimit || 3) - (user?.reportsUsed || 0)}`

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .serif { font-family: 'DM Serif Display', serif; }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.4s ease forwards; opacity: 0; }
        .card { background: white; border-radius: 20px; border: 1px solid #f1f5f9; transition: border-color 0.2s, box-shadow 0.2s; }
        .card:hover { border-color: #e2e8f0; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
        .report-card { background: white; border-radius: 16px; border: 1px solid #f1f5f9; padding: 16px 20px; text-decoration: none; display: block; transition: all 0.2s; cursor: pointer; }
        .report-card:hover { border-color: #0d9488; transform: translateY(-1px); box-shadow: 0 4px 20px rgba(13,148,136,0.1); }
        .stat-card { background: white; border-radius: 16px; padding: 20px; border: 1px solid #f1f5f9; }
        .btn-primary { background: #0d9488; color: white; border: none; border-radius: 12px; padding: 10px 20px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.2s; }
        .btn-primary:hover { background: #0f766e; transform: translateY(-1px); }
        .btn-ghost { background: transparent; color: #64748b; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 20px; font-size: 14px; font-weight: 500; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.2s; }
        .btn-ghost:hover { border-color: #cbd5e1; background: #f8fafc; }
        .avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #0d9488, #0891b2); display: flex; align-items: center; justify-content: center; color: white; font-size: 13px; font-weight: 700; flex-shrink: 0; }
        .badge { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 6px; }
        .trend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .progress-bar { height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden; }
        .progress-fill { height: 100%; border-radius: 3px; transition: width 1s ease; }
        .quick-action { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px 12px; background: #f8fafc; border-radius: 14px; border: 1px solid #f1f5f9; cursor: pointer; transition: all 0.2s; text-decoration: none; }
        .quick-action:hover { background: #f0fdfa; border-color: #99f6e4; }
        .empty-state { text-align: center; padding: 48px 24px; }
        .dot-pulse { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>

      <main style={{ minHeight: '100vh', background: '#f8fafc' }}>

        {/* Navbar */}
        {/* <nav style={{
          background: 'white', borderBottom: '1px solid #f1f5f9',
          padding: '0 24px', height: 64,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 50
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <span className="serif" style={{ fontSize: 20, color: '#0d9488', fontWeight: 400 }}>
                Sehat24
              </span>
            </Link>
            <span style={{
              fontSize: 10, fontWeight: 700, color: '#0d9488',
              background: '#f0fdfa', border: '1px solid #99f6e4',
              padding: '2px 7px', borderRadius: 20, letterSpacing: '0.05em'
            }}>BETA</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/history" style={{ color: '#64748b', fontSize: 13, fontWeight: 500, textDecoration: 'none', padding: '6px 12px', borderRadius: 8 }}>
              History
            </Link>
            <Link href="/profile" style={{ color: '#64748b', fontSize: 13, fontWeight: 500, textDecoration: 'none', padding: '6px 12px', borderRadius: 8 }}>
              Profile
            </Link>
            <div className="avatar">
              {firstName.charAt(0).toUpperCase()}
            </div>
          </div>
        </nav> */}

        <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>

          {/* Greeting */}
          <div className="fade-up" style={{ marginBottom: 28, animationDelay: '0s' }}>
            <p style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500, marginBottom: 4 }}>
              {greeting} 👋
            </p>
            <h1 className="serif" style={{ fontSize: 28, color: '#0f172a', fontWeight: 400 }}>
              {firstName}'s Health Dashboard - Sehat24
            </h1>
          </div>

          {/* Top grid — score + stats */}
          <div className="fade-up" style={{
            display: 'grid',
            gridTemplateColumns: '280px 1fr',
            gap: 16, marginBottom: 16,
            animationDelay: '0.1s'
          }}>

            {/* Health Score Card */}
            <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <ScoreRing score={score} />
              <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginTop: 8 }}>
                {score >= 80 ? 'Excellent health' : score >= 60 ? 'Good — some attention needed' : 'Needs attention'}
              </p>
              <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 4, lineHeight: 1.5 }}>
                Based on your latest {reports.length > 0 ? reports[0].reportType || 'report' : 'report'}
              </p>

              {/* Plan indicator */}
              <div style={{
                marginTop: 16, width: '100%',
                background: '#f8fafc', borderRadius: 12, padding: '10px 14px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>
                    {user?.plan === 'paid' ? 'Paid Plan' : 'Free Plan'}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#0d9488' }}>
                    {reportsLeft} left
                  </span>
                </div>
                {user?.plan !== 'paid' && (
                  <div className="progress-bar">
                    <div className="progress-fill" style={{
                      width: `${Math.min(((user?.reportsUsed || 0) / (user?.reportsLimit || 3)) * 100, 100)}%`,
                      background: 'linear-gradient(90deg, #0d9488, #0891b2)'
                    }} />
                  </div>
                )}
              </div>
            </div>

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 12 }}>

              <div className="stat-card">
                <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8 }}>
                  Total Reports
                </p>
                <p className="serif" style={{ fontSize: 36, color: '#0f172a', lineHeight: 1 }}>
                  {reports.length}
                </p>
                <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>
                  {reports.length === 0 ? 'Upload your first report' : `Last: ${new Date(reports[0]?.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                </p>
              </div>

              <div className="stat-card" style={{ background: urgentReports > 0 ? '#fef2f2' : 'white', borderColor: urgentReports > 0 ? '#fecaca' : '#f1f5f9' }}>
                <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8 }}>
                  Urgent Flags
                </p>
                <p className="serif" style={{ fontSize: 36, color: urgentReports > 0 ? '#dc2626' : '#0f172a', lineHeight: 1 }}>
                  {urgentReports}
                </p>
                <p style={{ fontSize: 12, color: urgentReports > 0 ? '#dc2626' : '#94a3b8', marginTop: 6 }}>
                  {urgentReports > 0 ? 'See doctor soon' : 'All clear'}
                </p>
              </div>

              {/* <div className="stat-card">
                <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8 }}>
                  Abnormal Values
                </p>
                <p className="serif" style={{ fontSize: 36, color: totalAbnormal > 0 ? '#d97706' : '#0f172a', lineHeight: 1 }}>
                  {totalAbnormal}
                </p>
                <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>
                  Across all reports
                </p>
              </div> */}

              <div className="stat-card" style={{ background: '#f0fdfa', borderColor: '#99f6e4' }}>
                <p style={{ fontSize: 11, color: '#0d9488', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8 }}>
                  AI Status
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div className="dot-pulse" />
                  <p className="serif" style={{ fontSize: 20, color: '#0d9488' }}>Active</p>
                </div>
                <p style={{ fontSize: 12, color: '#0d9488', marginTop: 6 }}>
                  Ready to analyze
                </p>
              </div>

            </div>
          </div>

          {/* Quick actions */}
          <div className="fade-up" style={{ marginBottom: 24, animationDelay: '0.2s' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {[
                { href: '/upload', icon: '📤', label: 'Upload Report' },
                { href: '/history', icon: '📈', label: 'View Trends' },
                { href: '/profile', icon: '👤', label: 'My Profile' },
                // { href: '#', icon: '💬', label: 'Share Report', onClick: true },
              ].map((action, i) => (
                action.onClick ? (
                  <button key={i} className="quick-action"
                    style={{ border: '1px solid #f1f5f9' }}
                    onClick={() => navigator.share?.({ title: 'Sehat24', url: window.location.href })}>
                    <span style={{ fontSize: 22 }}>{action.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>{action.label}</span>
                  </button>
                ) : (
                  <Link key={i} href={action.href} className="quick-action">
                    <span style={{ fontSize: 22 }}>{action.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>{action.label}</span>
                  </Link>
                )
              ))}
            </div>
          </div>

          {/* Reports section */}
          <div className="fade-up" style={{ animationDelay: '0.3s' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                  Recent Reports
                </h2>
                <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                  {reports.length} total • sorted by test date
                </p>
              </div>
              <Link href="/upload">
                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 16 }}>+</span>
                  New Report
                </button>
              </Link>
            </div>

            {reports.length === 0 ? (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="empty-state">
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🏥</div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                    No reports yet
                  </h3>
                  <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 24, maxWidth: 280, margin: '0 auto 24px' }}>
                    Upload your first report — blood test, MRI, X-Ray, or any health report.
                  </p>
                  <Link href="/upload">
                    <button className="btn-primary">Upload My First Report →</button>
                  </Link>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {reports.map((report, i) => {
                  const abnormal = report.parameters?.filter(p => p.status?.toLowerCase() !== 'normal') || []
                  const normal = report.parameters?.filter(p => p.status === 'normal') || []
                  const icon = categoryIcons[report.reportCategory] || '📄'
                  const hasUrgent = report.urgentFlags?.length > 0
                  const testDate = report.lab?.collectedAt
                    ? new Date(report.lab.collectedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : new Date(report.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                  const isTestDate = !!report.lab?.collectedAt

                  return (
                    <Link key={report._id} href={`/results/${report._id}`} className="report-card"
                      style={{ animationDelay: `${0.1 * i}s` }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>

                        {/* Icon */}
                        <div style={{
                          width: 44, height: 44, borderRadius: 12,
                          background: hasUrgent ? '#fef2f2' : '#f0fdfa',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 20, flexShrink: 0
                        }}>
                          {icon}
                        </div>

                        {/* Main content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                              {report.reportType || 'Lab Report'}
                            </span>
                            {hasUrgent && (
                              <span className="badge" style={{ background: '#fef2f2', color: '#dc2626' }}>
                                ⚠ Urgent
                              </span>
                            )}
                            {report.reportCategory && (
                              <span className="badge" style={{ background: '#f0fdfa', color: '#0d9488' }}>
                                {report.reportCategory}
                              </span>
                            )}
                          </div>

                          {/* Date + Lab */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                            <span style={{ fontSize: 12, color: isTestDate ? '#0d9488' : '#94a3b8', fontWeight: isTestDate ? 600 : 400 }}>
                              {isTestDate ? '🗓' : '📁'} {testDate}
                            </span>
                            {report.lab?.labName && (
                              <>
                                <span style={{ color: '#cbd5e1', fontSize: 10 }}>•</span>
                                <span style={{ fontSize: 12, color: '#94a3b8' }}>{report.lab.labName}</span>
                              </>
                            )}
                            {report.patient?.name && (
                              <>
                                <span style={{ color: '#cbd5e1', fontSize: 10 }}>•</span>
                                <span style={{ fontSize: 12, color: '#94a3b8' }}>{report.patient.name}</span>
                              </>
                            )}
                          </div>

                          {/* Parameter badges */}
                          {report.parameters?.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                              {abnormal.slice(0, 3).map((param, j) => (
                                <span key={j} className="badge" style={{
                                  background: statusConfig[param.status?.toLowerCase()]?.bg || '#f1f5f9',
                                  color: statusConfig[param.status?.toLowerCase()]?.color || '#64748b'
                                }}>
                                  {param.name}: {param.value} {param.unit}
                                </span>
                              ))}
                              {normal.slice(0, 2).map((param, j) => (
                                <span key={j} className="badge" style={{ background: '#f1f5f9', color: '#64748b' }}>
                                  {param.name}: {param.value} {param.unit}
                                </span>
                              ))}
                              {report.parameters.length > 5 && (
                                <span className="badge" style={{ background: '#f1f5f9', color: '#94a3b8' }}>
                                  +{report.parameters.length - 5}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Arrow */}
                        <div style={{
                          width: 28, height: 28, borderRadius: 8,
                          background: '#f8fafc', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          color: '#94a3b8', fontSize: 14, flexShrink: 0
                        }}>
                          →
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32, gap: 12 }}>
            <Link href="/history">
              <button className="btn-ghost">View all trends →</button>
            </Link>
            <button className="btn-ghost" onClick={logout} style={{ color: '#ef4444', borderColor: '#fecaca' }}>
              Logout
            </button>
          </div>

        </div>
      </main>
    </>
  )
}