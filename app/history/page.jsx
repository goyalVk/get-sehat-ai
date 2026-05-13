'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// ── Status-based trend logic — FIXED ──
function getTrendInfo(trend) {
  if (trend.length < 2) return null

  const latest         = trend[trend.length - 1]
  const previous       = trend[trend.length - 2]
  const latestNormal   = latest.status?.toLowerCase() === 'normal'
  const previousNormal = previous.status?.toLowerCase() === 'normal'

  if (latestNormal && previousNormal)
    return { type: 'stable', label: '→ Stable', color: '#d97706', bg: '#fffbeb', border: '#fde68a' }

  if (latestNormal && !previousNormal)
    return { type: 'improving', label: '↓ Improving', color: '#16a34a', bg: '#f0fdf4', border: '#86efac' }

  if (!latestNormal && previousNormal)
    return { type: 'worsening', label: '↑ Worsening', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' }

  const diff = latest.value - previous.value
  const pct  = Math.abs((diff / previous.value) * 100).toFixed(1)
  if (diff === 0) return { type: 'stable',    label: '→ Stable',     color: '#d97706', bg: '#fffbeb', border: '#fde68a', pct }
  if (diff < 0)   return { type: 'improving', label: '↓ Improving',  color: '#16a34a', bg: '#f0fdf4', border: '#86efac', pct }
  return              { type: 'worsening', label: '↑ Worsening',  color: '#dc2626', bg: '#fef2f2', border: '#fecaca', pct }
}

// ── Advice — only for abnormal ──
function getTrendAdvice(paramName, trend) {
  if (trend.length < 2) return null

  const latest         = trend[trend.length - 1]
  const previous       = trend[trend.length - 2]
  const latestNormal   = latest.status?.toLowerCase() === 'normal'
  const previousNormal = previous.status?.toLowerCase() === 'normal'

  if (latestNormal && previousNormal) return null

  const diff = latest.value - previous.value
  const pct  = Math.abs((diff / previous.value) * 100).toFixed(1)

  if (latestNormal && !previousNormal)
    return { text: `${paramName} ab normal range mein aa gaya — bahut achha! 🎉`, type: 'good' }

  if (!latestNormal && previousNormal)
    return { text: `${paramName} normal range se bahar aa gaya — doctor se milein.`, type: 'warning' }

  const adviceMap = {
    'hba1c':       { up: `HbA1c ${pct}% badha — sugar control pe dhyan do. Meetha, chawal kam karo.`, down: `HbA1c ${pct}% kam hua — diet continue karo!` },
    'glucose':     { up: `Blood sugar badha. Processed food avoid karo.`, down: `Blood sugar ${pct}% improve hua!` },
    'cholesterol': { up: `Cholesterol ${pct}% badha. Fried food, ghee kam karo.`, down: `Cholesterol ${pct}% kam hua — heart ke liye achha!` },
    'hdl':         { up: `Good cholesterol badha — excellent!`, down: `Good cholesterol kam hua. Exercise badhao.` },
    'ldl':         { up: `Bad cholesterol ${pct}% badha. Fatty food avoid karo.`, down: `Bad cholesterol ${pct}% kam hua — great!` },
    'hemoglobin':  { up: `Hemoglobin ${pct}% badha — improving!`, down: `Hemoglobin ${pct}% kam. Palak, chana, khajoor badhao.` },
    'creatinine':  { up: `Kidney marker badha. Paani 3L+ piyo. Doctor se milein.`, down: `Kidney function improve ho rahi hai!` },
    'tsh':         { up: `Thyroid change hua. Doctor se dose check karwao.`, down: `Thyroid normal ki taraf aa raha hai.` },
    'vitamin d':   { up: `Vitamin D improve hua!`, down: `Vitamin D kam hua. Dhoop + supplement lo.` },
    'uric acid':   { up: `Uric acid ${pct}% badha. Red meat, seafood avoid karo.`, down: `Uric acid ${pct}% kam hua — achha!` },
  }

  const key = Object.keys(adviceMap).find(k => paramName.toLowerCase().includes(k))
  if (!key) return diff > 0
    ? { text: `${paramName} ${pct}% badha — doctor se discuss karo.`, type: 'warning' }
    : { text: `${paramName} ${pct}% improve hua — achha trend!`, type: 'good' }

  return diff > 0
    ? { text: adviceMap[key].up,   type: 'warning' }
    : { text: adviceMap[key].down, type: 'good' }
}

// ── Mini Sparkline ──
function Sparkline({ trend, color }) {
  if (trend.length < 2) return null
  const values = trend.map(t => t.value)
  const min = Math.min(...values), max = Math.max(...values)
  const range = max - min || 1
  const W = 100, H = 36, PAD = 4
  const points = values.map((v, i) => {
    const x = PAD + (i / (values.length - 1)) * (W - PAD * 2)
    const y = H - PAD - ((v - min) / range) * (H - PAD * 2)
    return `${x},${y}`
  })
  return (
    <svg width={W} height={H}>
      <polyline points={points.join(' ')} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
      {trend.map((_, i) => {
        const [x, y] = points[i].split(',').map(Number)
        const isLast = i === trend.length - 1
        return <circle key={i} cx={x} cy={y} r={isLast ? 4 : 2.5} fill={isLast ? color : 'white'} stroke={color} strokeWidth={isLast ? 0 : 1.5} />
      })}
    </svg>
  )
}

const statusStyle = (s) => {
  switch(s?.toLowerCase()) {
    case 'high':     return { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' }
    case 'low':      return { bg: '#fffbeb', color: '#d97706', border: '#fde68a' }
    case 'critical': return { bg: '#dc2626', color: '#ffffff', border: '#dc2626' }
    default:         return { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' }
  }
}

export default function HistoryPage() {
  const router = useRouter()
  const [grouped, setGrouped]   = useState({})
  const [loading, setLoading]   = useState(true)
  const [expanded, setExpanded] = useState({})
  const [total, setTotal]       = useState(0)
  const [historyFeedback, setHistoryFeedback] = useState('')
  const [historyRating, setHistoryRating]     = useState(0)
  const [historyHover, setHistoryHover]       = useState(0)
  const [historySent, setHistorySent]         = useState(false)
  const [historySending, setHistorySending]   = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const authRes = await fetch('/api/auth/me')
      if (!authRes.ok) { router.push('/auth/login'); return }

      const res  = await fetch('/api/reports')
      const data = await res.json()
      const all  = (data.reports || []).filter(r => r.status === 'completed')
      setTotal(all.length)

      const groups = {}
      all.forEach(r => {
        const type = r.reportType || 'Other'
        if (!groups[type]) groups[type] = []
        groups[type].push(r)
      })

      Object.keys(groups).forEach(k => {
        groups[k].sort((a, b) => {
          const da = a.lab?.collectedAt ? new Date(a.lab.collectedAt) : new Date(a.createdAt)
          const db = b.lab?.collectedAt ? new Date(b.lab.collectedAt) : new Date(b.createdAt)
          return da - db
        })
      })

      setGrouped(groups)
      const firstMulti = Object.keys(groups).find(k => groups[k].length > 1)
      if (firstMulti) setExpanded({ [firstMulti]: true })
    } catch {
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const sendHistoryFeedback = async () => {
    if (!historyRating) return
    setHistorySending(true)
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: 'history',
          rating: historyRating,
          feedback: historyFeedback,
          totalReports: total,
          reportTypes: Object.keys(grouped),
        }),
      })
      setHistorySent(true)
    } catch (err) {
      console.error(err)
    } finally {
      setHistorySending(false)
    }
  }

  const getDate = (r) => r.lab?.collectedAt ? new Date(r.lab.collectedAt) : new Date(r.createdAt)

  const getTrend = (reports, paramName) =>
    reports.map(r => {
      const p = r.parameters?.find(p => p.name?.toLowerCase() === paramName?.toLowerCase())
      if (!p) return null
      return {
        value:           parseFloat(p.value),
        unit:            p.unit,
        status:          p.status,
        date:            getDate(r),
        reference_range: p.reference_range || null
      }
    }).filter(Boolean)

  if (loading) return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #0d9488', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  )

  const typeCount  = Object.keys(grouped).length
  const trendCount = Object.values(grouped).filter(g => g.length > 1).length

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Plus Jakarta Sans',sans-serif}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp 0.4s ease forwards;opacity:0}
        .report-pill:hover{border-color:#0d9488!important;transform:translateY(-1px)}
        .expand-btn:hover{background:#f0fdfa!important}
        .param-row:hover{background:#f0f0f0!important}
        .dl-btn:hover{border-color:#0d9488!important;color:#0d9488!important}

        @media (max-width: 720px) {
          .history-header { flex-direction: column !important; gap: 12px !important; }
          .history-header a { width: 100% !important; text-align: center !important; }

          .stat-card { padding: 12px 14px !important; min-width: 90px !important; }
          .stat-card p:first-child { font-size: 20px !important; }

          .timeline-pills { overflow-x: auto !important; flex-wrap: nowrap !important; padding-bottom: 8px !important; -webkit-overflow-scrolling: touch !important; scrollbar-width: none !important; }
          .timeline-pills::-webkit-scrollbar { display: none !important; }

          .expand-btn { padding: 8px 12px !important; font-size: 11px !important; }

          .trend-card { padding: 12px 14px !important; }

          .value-timeline { overflow-x: auto !important; flex-wrap: nowrap !important; padding-bottom: 8px !important; -webkit-overflow-scrolling: touch !important; }

          .sparkline-container { display: none !important; }

          .health-trend-pills > div { padding: 10px 8px !important; min-width: 80px !important; }

          .overall-summary { padding: 20px 16px !important; }

          .history-feedback { padding: 20px 16px !important; }
          .history-feedback .star-btn { width: 40px !important; height: 40px !important; }

          .dl-btn { font-size: 12px !important; padding: 10px 8px !important; }

          .bottom-cta { padding: 20px 16px !important; }
          .bottom-cta a { display: block !important; width: 100% !important; text-align: center !important; }
        }
      `}</style>

      <main style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px 60px' }}>

          {/* Header */}
          <div className="fade-up" style={{ marginBottom: 28 }}>
            <div className="history-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}>Health Intelligence</p>
                <h1 style={{ fontSize: 28, fontWeight: 400, color: '#0f172a', fontFamily: "'DM Serif Display', serif" }}>Report History & Trends</h1>
              </div>
              <Link href="/upload" style={{ background: '#0d9488', color: 'white', padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                + New Report
              </Link>
            </div>

            {/* Summary Stats */}
            <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
              {[
                { label: 'Total Reports',    value: total,      icon: '📋', bg: '#f0fdfa', color: '#0d9488',  border: '#99f6e4' },
                { label: 'Report Types',     value: typeCount,  icon: '🔬', bg: '#eff6ff', color: '#1d4ed8',  border: '#bfdbfe' },
                { label: 'Trends Available', value: trendCount, icon: '📈', bg: trendCount > 0 ? '#f0fdf4' : '#f8fafc', color: trendCount > 0 ? '#16a34a' : '#94a3b8', border: trendCount > 0 ? '#86efac' : '#e2e8f0' },
              ].map((s, i) => (
                <div key={i} className="stat-card" style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 14, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 140 }}>
                  <span style={{ fontSize: 22 }}>{s.icon}</span>
                  <div>
                    <p style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
                    <p style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Empty State */}
          {total === 0 && (
            <div style={{ background: 'white', borderRadius: 20, border: '1px solid #f1f5f9', padding: '60px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Koi report nahi abhi</h3>
              <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 24 }}>Pehli report upload karo — Hindi mein sab explain hoga</p>
              <Link href="/upload" style={{ background: '#0d9488', color: 'white', padding: '12px 28px', borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                Report Upload Karo →
              </Link>
            </div>
          )}

          {/* Report Groups */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {Object.entries(grouped).map(([type, reports], gi) => {
              const latest     = reports[reports.length - 1]
              const isExpanded = expanded[type]
              const hasTrend   = reports.length > 1
              const abnormal   = latest?.parameters?.filter(p => p.status !== 'normal') || []
              const allParams  = [...new Set(reports.flatMap(r => r.parameters?.map(p => p.name) || []))]
              const trendParams = allParams.filter(name => getTrend(reports, name).length > 1)

              return (
                <div key={type} className="fade-up" style={{ background: 'white', borderRadius: 20, border: '1px solid #f1f5f9', overflow: 'hidden', animationDelay: `${gi * 0.08}s` }}>

                  {/* Group Header */}
                  <div style={{ padding: '20px 24px', borderBottom: isExpanded ? '1px solid #f1f5f9' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{type}</h2>
                          {hasTrend && (
                            <span style={{ background: '#f0fdf4', border: '1px solid #86efac', color: '#16a34a', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
                              📈 TREND AVAILABLE
                            </span>
                          )}
                          {abnormal.length > 0 && (
                            <span style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
                              ⚠ {abnormal.length} Abnormal
                            </span>
                          )}
                        </div>

                        {/* Timeline Pills */}
                        <div className="timeline-pills" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                          {reports.map((r, i) => {
                            const d = getDate(r)
                            const isLatest = i === reports.length - 1
                            return (
                              <Link key={r._id} href={`/results/${r._id}`} className="report-pill" style={{
                                background: isLatest ? '#f0fdfa' : '#f8fafc',
                                border: `1px solid ${isLatest ? '#99f6e4' : '#e2e8f0'}`,
                                borderRadius: 10, padding: '6px 12px',
                                textDecoration: 'none', transition: 'all 0.2s',
                                display: 'flex', alignItems: 'center', gap: 6
                              }}>
                                {isLatest && <span style={{ width: 6, height: 6, background: '#0d9488', borderRadius: '50%', flexShrink: 0 }} />}
                                <div>
                                  <p style={{ fontSize: 11, fontWeight: 600, color: isLatest ? '#0d9488' : '#475569' }}>
                                    {d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                                  </p>
                                  {isLatest && <p style={{ fontSize: 9, color: '#0d9488' }}>Latest</p>}
                                </div>
                              </Link>
                            )
                          })}
                          {reports.length > 1 && (
                            <span style={{ fontSize: 11, color: '#94a3b8' }}>
                              {reports.length} reports • {Math.round((getDate(reports[reports.length-1]) - getDate(reports[0])) / (1000*60*60*24*30))} months tracked
                            </span>
                          )}
                        </div>
                      </div>

                      <button className="expand-btn" onClick={() => setExpanded(prev => ({ ...prev, [type]: !prev[type] }))} style={{
                        background: isExpanded ? '#f0fdfa' : 'white',
                        border: `1px solid ${isExpanded ? '#99f6e4' : '#e2e8f0'}`,
                        borderRadius: 12, padding: '8px 16px',
                        fontSize: 12, fontWeight: 700,
                        color: isExpanded ? '#0d9488' : '#64748b',
                        cursor: 'pointer', transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0
                      }}>
                        {hasTrend ? '📈' : '📋'} {isExpanded ? 'Close ↑' : hasTrend ? 'Trend Dekho ↓' : 'Details ↓'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Section */}
                  {isExpanded && (
                    <div style={{ padding: '24px' }}>

                      {/* ── Urgent Flags — top of both views ── */}
                      {latest?.result?.urgent_flags?.length > 0 && (
                        <div style={{
                          background: 'linear-gradient(135deg,#fef2f2,#fff1f2)',
                          border: '2px solid #fecaca', borderRadius: 14,
                          padding: '14px 18px', marginBottom: 16,
                          display: 'flex', alignItems: 'flex-start', gap: 10
                        }}>
                          <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: '#991b1b', marginBottom: 6 }}>Dhyan Dein — Urgent</p>
                            {latest.result.urgent_flags.map((flag, i) => (
                              <p key={i} style={{ fontSize: 12, color: '#7f1d1d', lineHeight: 1.6 }}>• {flag}</p>
                            ))}
                          </div>
                        </div>
                      )}

                      {!hasTrend ? (
                        /* Single report */
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>Latest Report Summary</p>

                          {/* AI Summary */}
                          {latest?.result?.summary && (
                            <div style={{ background: 'linear-gradient(135deg, #f0fdfa, #ecfdf5)', border: '1px solid #99f6e4', borderRadius: 12, padding: '14px 18px', marginBottom: 16 }}>
                              <p style={{ fontSize: 10, fontWeight: 700, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>AI Summary</p>
                              <p style={{ fontSize: 13, color: '#134e4a', lineHeight: 1.7 }}>{latest.result.summary}</p>
                            </div>
                          )}

                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {latest?.parameters?.map((p, i) => {
                              const st = statusStyle(p.status)
                              return (
                                <div key={i} className="param-row" style={{
                                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                  padding: '10px 14px', borderRadius: 10,
                                  background: p.status !== 'normal' ? st.bg : '#f8fafc',
                                  border: `1px solid ${p.status !== 'normal' ? st.border : '#f1f5f9'}`,
                                  transition: 'all 0.15s'
                                }}>
                                  <div>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{p.name}</span>
                                    {p.reference_range && p.reference_range !== 'Not specified' && (
                                      <span style={{ fontSize: 10, color: '#94a3b8', marginLeft: 8 }}>
                                        Normal: {p.reference_range} {p.unit}
                                      </span>
                                    )}
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{ fontSize: 14, fontWeight: 800, color: st.color }}>{p.value} <span style={{ fontSize: 11, fontWeight: 500, color: '#94a3b8' }}>{p.unit}</span></span>
                                    <span style={{ background: st.color, color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>
                                      {(p.status || 'normal').toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                          <div style={{ marginTop: 16, background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: 12, padding: '12px 16px' }}>
                            <p style={{ fontSize: 12, color: '#0d9488', fontWeight: 600 }}>
                              💡 Ek aur {type} report upload karo — trend comparison shuru hoga!
                            </p>
                          </div>

                          {/* Lifestyle Tips */}
                          {latest?.result?.lifestyle && (
                            <div style={{ background: 'linear-gradient(135deg,#fffbeb,#fef9ee)', border: '1px solid #fde68a', borderRadius: 16, padding: '16px 20px', marginTop: 16 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 10, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🌿</div>
                                <div>
                                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#92400e' }}>Lifestyle Tips</h3>
                                  <p style={{ fontSize: 11, color: '#b45309' }}>Latest report ke hisaab se</p>
                                </div>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {[
                                  { icon: '🥗', label: 'Diet',          value: latest.result.lifestyle.diet },
                                  { icon: '🚶', label: 'Activity',      value: latest.result.lifestyle.activity },
                                  { icon: '😴', label: 'Sleep & Stress', value: latest.result.lifestyle.sleep_stress },
                                  { icon: '🚫', label: 'Avoid',         value: latest.result.lifestyle.avoid },
                                ].filter(item => item.value).map((item, i) => (
                                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'white', borderRadius: 10, padding: '10px 12px', border: '1px solid #fde68a' }}>
                                    <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                                    <div>
                                      <p style={{ fontSize: 10, fontWeight: 700, color: '#92400e', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</p>
                                      <p style={{ fontSize: 12, color: '#78350f', lineHeight: 1.6 }}>{item.value}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Ayurvedic Herbs */}
                          {latest?.result?.ayurvedic_herbs?.length > 0 && (
                            <div style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: '1px solid #86efac', borderRadius: 16, padding: '16px 20px', marginTop: 12 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 10, background: '#bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🌱</div>
                                <div>
                                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#14532d' }}>Ayurvedic Herbs</h3>
                                  <p style={{ fontSize: 11, color: '#16a34a' }}>Doctor se pooch ke lo</p>
                                </div>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {latest.result.ayurvedic_herbs.map((herb, i) => (
                                  <div key={i} style={{ background: 'white', borderRadius: 12, padding: '12px 14px', border: '1px solid #86efac' }}>
                                    <p style={{ fontSize: 13, fontWeight: 700, color: '#14532d', marginBottom: 4 }}>🌿 {herb.name}</p>
                                    <p style={{ fontSize: 12, color: '#166534', lineHeight: 1.6, marginBottom: 4 }}><strong>Faida:</strong> {herb.benefit}</p>
                                    <p style={{ fontSize: 12, color: '#166534', lineHeight: 1.6, marginBottom: 6 }}><strong>Kaise lein:</strong> {herb.how_to_use}</p>
                                    <div style={{ background: '#fefce8', borderRadius: 8, padding: '6px 10px', border: '1px solid #fde68a', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                                      <span style={{ fontSize: 11, flexShrink: 0 }}>⚠️</span>
                                      <p style={{ fontSize: 11, color: '#92400e', lineHeight: 1.5 }}>{herb.caution}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <a href="https://satvikhavan.com" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12, padding: '10px', background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 10, textDecoration: 'none', fontSize: 12, fontWeight: 700, color: '#15803d' }}>
                                🛒 Satvik Havan se order karo
                              </a>
                            </div>
                          )}

                          {/* Doctor Questions */}
                          {latest?.result?.doctor_questions?.length > 0 && (
                            <div style={{ background: 'white', border: '1px solid #f1f5f9', borderRadius: 16, padding: '16px 20px', marginTop: 12 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>💬</div>
                                <div>
                                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Doctor Se Yeh Poochho</h3>
                                  <p style={{ fontSize: 11, color: '#94a3b8' }}>Next visit ke liye ready questions</p>
                                </div>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {latest.result.doctor_questions.map((q, i) => (
                                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #f1f5f9' }}>
                                    <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#dbeafe', color: '#1d4ed8', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                                    <p style={{ fontSize: 12, color: '#334155', lineHeight: 1.6 }}>{q}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                      ) : (
                        /* Multiple reports — TREND UI */
                        <div>

                          {/* AI Summary — Latest */}
                          {latest?.result?.summary && (
                            <div style={{ background: 'linear-gradient(135deg, #f0fdfa, #ecfdf5)', border: '1px solid #99f6e4', borderRadius: 14, padding: '16px 20px', marginBottom: 20 }}>
                              <p style={{ fontSize: 10, fontWeight: 700, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                                AI Summary — Latest Report
                              </p>
                              <p style={{ fontSize: 13, color: '#134e4a', lineHeight: 1.7 }}>{latest.result.summary}</p>
                            </div>
                          )}

                          <p style={{ fontSize: 12, fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 16 }}>
                            Parameter Trends — {trendParams.length} tracked
                          </p>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {trendParams.map((paramName) => {
                              const trend     = getTrend(reports, paramName)
                              const trendInfo = getTrendInfo(trend)
                              if (!trendInfo) return null

                              const { type: tType, label, color: trendColor, bg: trendBg, border: trendBorder, pct } = trendInfo
                              const advice   = getTrendAdvice(paramName, trend)
                              const latest   = trend[trend.length - 1]
                              const refRange = latest.reference_range

                              return (
                                <div key={paramName} className="trend-card" style={{
                                  background: trendBg, border: `1px solid ${trendBorder}`,
                                  borderRadius: 16, padding: '16px 20px',
                                  borderLeft: `4px solid ${trendColor}`
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                                    <div style={{ flex: 1 }}>

                                      {/* Param name + trend badge */}
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{paramName}</span>
                                        <span style={{ background: trendColor, color: 'white', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                                          {label}
                                        </span>
                                        {pct && (
                                          <span style={{ fontSize: 12, color: trendColor, fontWeight: 600 }}>
                                            {tType === 'improving' ? '▼' : tType === 'worsening' ? '▲' : ''} {pct}%
                                          </span>
                                        )}
                                      </div>

                                      {/* Normal Range */}
                                      {refRange && refRange !== 'Not specified' && (
                                        <div style={{
                                          display: 'inline-flex', alignItems: 'center', gap: 6,
                                          background: 'white', borderRadius: 8, padding: '4px 10px',
                                          border: `1px solid ${trendBorder}`, marginBottom: 10
                                        }}>
                                          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Normal Range:</span>
                                          <span style={{ fontSize: 11, color: trendColor, fontWeight: 700 }}>
                                            {refRange} {latest.unit}
                                          </span>
                                        </div>
                                      )}

                                      {/* Value Timeline */}
                                      <div className="value-timeline" style={{ display: 'flex', alignItems: 'flex-end', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                                        {trend.map((item, ti) => {
                                          const ist    = statusStyle(item.status)
                                          const isLast = ti === trend.length - 1
                                          return (
                                            <div key={ti} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                              <div style={{ textAlign: 'center' }}>
                                                <div style={{
                                                  background: isLast ? ist.color : 'white',
                                                  border: `2px solid ${ist.color}`,
                                                  color: isLast ? 'white' : ist.color,
                                                  borderRadius: 8, padding: '4px 10px',
                                                  fontSize: 13, fontWeight: 800
                                                }}>
                                                  {item.value}
                                                  <span style={{ fontSize: 10, fontWeight: 500, marginLeft: 2 }}>{item.unit}</span>
                                                </div>
                                                {item.reference_range && item.reference_range !== 'Not specified' && (
                                                  <p style={{ fontSize: 9, color: '#94a3b8', marginTop: 2 }}>
                                                    ({item.reference_range})
                                                  </p>
                                                )}
                                                <p style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
                                                  {item.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                                                </p>
                                                {isLast && <p style={{ fontSize: 9, color: trendColor, fontWeight: 700 }}>Latest</p>}
                                              </div>
                                              {ti < trend.length - 1 && (
                                                <span style={{ color: trendColor, fontSize: 16, marginBottom: 24, fontWeight: 700 }}>→</span>
                                              )}
                                            </div>
                                          )
                                        })}
                                      </div>

                                      {/* Advice */}
                                      {advice && (
                                        <div style={{ background: 'white', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#334155', lineHeight: 1.6, border: `1px solid ${trendBorder}` }}>
                                          💡 {advice.text}
                                        </div>
                                      )}
                                    </div>

                                    {/* Sparkline */}
                                    <div className="sparkline-container" style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                      <Sparkline trend={trend} color={trendColor} />
                                      <p style={{ fontSize: 10, color: '#94a3b8' }}>{trend.length} tests</p>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>

                          {/* Lifestyle Tips */}
                          {latest?.result?.lifestyle && (
                            <div style={{ background: 'linear-gradient(135deg,#fffbeb,#fef9ee)', border: '1px solid #fde68a', borderRadius: 16, padding: '16px 20px', marginTop: 16 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 10, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🌿</div>
                                <div>
                                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#92400e' }}>Lifestyle Tips</h3>
                                  <p style={{ fontSize: 11, color: '#b45309' }}>Latest report ke hisaab se</p>
                                </div>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {[
                                  { icon: '🥗', label: 'Diet',           value: latest.result.lifestyle.diet },
                                  { icon: '🚶', label: 'Activity',       value: latest.result.lifestyle.activity },
                                  { icon: '😴', label: 'Sleep & Stress', value: latest.result.lifestyle.sleep_stress },
                                  { icon: '🚫', label: 'Avoid',          value: latest.result.lifestyle.avoid },
                                ].filter(item => item.value).map((item, i) => (
                                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'white', borderRadius: 10, padding: '10px 12px', border: '1px solid #fde68a' }}>
                                    <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                                    <div>
                                      <p style={{ fontSize: 10, fontWeight: 700, color: '#92400e', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</p>
                                      <p style={{ fontSize: 12, color: '#78350f', lineHeight: 1.6 }}>{item.value}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Ayurvedic Herbs */}
                          {latest?.result?.ayurvedic_herbs?.length > 0 && (
                            <div style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: '1px solid #86efac', borderRadius: 16, padding: '16px 20px', marginTop: 12 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 10, background: '#bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🌱</div>
                                <div>
                                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#14532d' }}>Ayurvedic Herbs</h3>
                                  <p style={{ fontSize: 11, color: '#16a34a' }}>Doctor se pooch ke lo</p>
                                </div>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {latest.result.ayurvedic_herbs.map((herb, i) => (
                                  <div key={i} style={{ background: 'white', borderRadius: 12, padding: '12px 14px', border: '1px solid #86efac' }}>
                                    <p style={{ fontSize: 13, fontWeight: 700, color: '#14532d', marginBottom: 4 }}>🌿 {herb.name}</p>
                                    <p style={{ fontSize: 12, color: '#166534', lineHeight: 1.6, marginBottom: 4 }}><strong>Faida:</strong> {herb.benefit}</p>
                                    <p style={{ fontSize: 12, color: '#166534', lineHeight: 1.6, marginBottom: 6 }}><strong>Kaise lein:</strong> {herb.how_to_use}</p>
                                    <div style={{ background: '#fefce8', borderRadius: 8, padding: '6px 10px', border: '1px solid #fde68a', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                                      <span style={{ fontSize: 11, flexShrink: 0 }}>⚠️</span>
                                      <p style={{ fontSize: 11, color: '#92400e', lineHeight: 1.5 }}>{herb.caution}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <a href="https://satvikhavan.com" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12, padding: '10px', background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 10, textDecoration: 'none', fontSize: 12, fontWeight: 700, color: '#15803d' }}>
                                🛒 Satvik Havan se order karo
                              </a>
                            </div>
                          )}

                          {/* Doctor Questions */}
                          {latest?.result?.doctor_questions?.length > 0 && (
                            <div style={{ background: 'white', border: '1px solid #f1f5f9', borderRadius: 16, padding: '16px 20px', marginTop: 12 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>💬</div>
                                <div>
                                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Doctor Se Yeh Poochho</h3>
                                  <p style={{ fontSize: 11, color: '#94a3b8' }}>Next visit ke liye ready questions</p>
                                </div>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {latest.result.doctor_questions.map((q, i) => (
                                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #f1f5f9' }}>
                                    <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#dbeafe', color: '#1d4ed8', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                                    <p style={{ fontSize: 12, color: '#334155', lineHeight: 1.6 }}>{q}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Overall Health Summary */}
                          {(() => {
                            const allTrends = trendParams.map(name => {
                              const t = getTrend(reports, name)
                              const info = getTrendInfo(t)
                              if (!info) return null
                              return { name, type: info.type }
                            }).filter(Boolean)

                            const improvingCount = allTrends.filter(t => t.type === 'improving').length
                            const worseningCount = allTrends.filter(t => t.type === 'worsening').length
                            const stableCount    = allTrends.filter(t => t.type === 'stable').length

                            return (
                              <div style={{ marginTop: 20, background: 'white', borderRadius: 16, padding: '20px', border: '1px solid #f1f5f9' }}>
                                <p style={{ fontSize: 12, fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>
                                  Overall Health Trend
                                </p>
                                <div className="health-trend-pills" style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                                  {[
                                    { label: 'Improving', value: improvingCount, color: '#16a34a', bg: '#f0fdf4', border: '#86efac' },
                                    { label: 'Worsening', value: worseningCount, color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
                                    { label: 'Stable',    value: stableCount,    color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
                                  ].map((s, i) => (
                                    <div key={i} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, padding: '12px 20px', textAlign: 'center', flex: 1, minWidth: 80 }}>
                                      <p style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
                                      <p style={{ fontSize: 11, color: s.color, marginTop: 4 }}>{s.label}</p>
                                    </div>
                                  ))}
                                </div>
                                {worseningCount > 0 && (
                                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', marginBottom: 8 }}>
                                    <p style={{ fontSize: 13, color: '#991b1b', fontWeight: 600 }}>
                                      ⚠️ {worseningCount} parameter{worseningCount > 1 ? 's' : ''} worsen ho {worseningCount > 1 ? 'rahe hain' : 'raha hai'} — doctor se milein
                                    </p>
                                  </div>
                                )}
                                {improvingCount > 0 && (
                                  <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '10px 14px' }}>
                                    <p style={{ fontSize: 13, color: '#166534', fontWeight: 600 }}>
                                      ✅ {improvingCount} parameter{improvingCount > 1 ? 's' : ''} improve ho {improvingCount > 1 ? 'rahe hain' : 'raha hai'} — keep going!
                                    </p>
                                  </div>
                                )}
                              </div>
                            )
                          })()}

                          {/* Next Test Reminder */}
                          <div style={{ marginTop: 14, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 20 }}>📅</span>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 2 }}>Next Test Reminder</p>
                              <p style={{ fontSize: 12, color: '#78350f' }}>
                                Regular {type} track karte raho — trends sirf tabhi dikhenge jab multiple reports hongi.
                              </p>
                            </div>
                            <Link href="/upload" style={{ flexShrink: 0, background: '#d97706', color: 'white', padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
                              Add Report
                            </Link>
                          </div>

                          {/* Download Trend Report */}
                          <button className="dl-btn"
                            onClick={async () => {
                              try {
                                const { jsPDF } = await import('jspdf')
                                const html2canvas = (await import('html2canvas')).default

                                // Hidden template banao
                                const container = document.createElement('div')
                                container.style.cssText = 'position:fixed;top:-9999px;left:0;width:794px;background:white;font-family:Arial,sans-serif;padding:0;'

                                container.innerHTML = `
                                  <div style="background:linear-gradient(135deg,#0d9488,#0891b2);padding:28px 40px;color:white">
                                    <div style="font-size:24px;font-weight:900;margin-bottom:4px">Sehat24</div>
                                    <div style="font-size:12px;opacity:0.8;margin-bottom:12px">sehat24.com — India ka AI Health Companion</div>
                                    <div style="font-size:18px;font-weight:700">${type} — Trend Report</div>
                                    <div style="font-size:11px;opacity:0.7;margin-top:4px">
                                      ${reports.length} reports • ${getDate(reports[0]).toLocaleDateString('en-IN')} to ${getDate(reports[reports.length-1]).toLocaleDateString('en-IN')}
                                    </div>
                                  </div>

                                  <div style="padding:24px 40px">

                                    ${latest?.result?.summary ? `
                                    <div style="background:linear-gradient(135deg,#f0fdfa,#ecfdf5);border:1px solid #99f6e4;border-radius:12px;padding:16px;margin-bottom:20px">
                                      <div style="font-size:10px;font-weight:700;color:#0d9488;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px">AI Summary — Latest Report</div>
                                      <div style="font-size:13px;color:#134e4a;line-height:1.7">${latest.result.summary}</div>
                                    </div>` : ''}

                                    <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid #f1f5f9">
                                      Parameter Trends
                                    </div>

                                    ${trendParams.map(pName => {
                                      const t    = getTrend(reports, pName)
                                      const info = getTrendInfo(t)
                                      if (!info) return ''
                                      const ref  = t[t.length-1]?.reference_range
                                      const unit = t[t.length-1]?.unit
                                      return `
                                      <div style="background:${info.bg};border:1px solid ${info.border};border-radius:12px;padding:14px 16px;margin-bottom:10px;border-left:4px solid ${info.color}">
                                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                                          <span style="font-size:13px;font-weight:700;color:#0f172a">${pName}</span>
                                          <span style="background:${info.color};color:white;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px">${info.label}</span>
                                        </div>
                                        ${ref && ref !== 'Not specified' ? `
                                        <div style="font-size:11px;color:#64748b;margin-bottom:8px">
                                          Normal Range: <span style="color:${info.color};font-weight:700">${ref} ${unit}</span>
                                        </div>` : ''}
                                        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                                          ${t.map((item, ti) => `
                                            <div style="display:flex;align-items:center;gap:8px">
                                              <div style="text-align:center">
                                                <div style="background:${ti === t.length-1 ? (item.status !== 'normal' ? '#dc2626' : '#16a34a') : 'white'};border:2px solid ${item.status !== 'normal' ? '#dc2626' : '#16a34a'};color:${ti === t.length-1 ? 'white' : (item.status !== 'normal' ? '#dc2626' : '#16a34a')};border-radius:8px;padding:4px 10px;font-size:13px;font-weight:800">
                                                  ${item.value} <span style="font-size:10px;font-weight:500">${item.unit}</span>
                                                </div>
                                                <div style="font-size:9px;color:#94a3b8;margin-top:2px">(${item.reference_range || ''})</div>
                                                <div style="font-size:10px;color:#64748b;margin-top:2px">${item.date.toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'2-digit'})}</div>
                                                ${ti === t.length-1 ? `<div style="font-size:9px;color:${info.color};font-weight:700">Latest</div>` : ''}
                                              </div>
                                              ${ti < t.length-1 ? `<span style="color:${info.color};font-size:16px;font-weight:700;margin-bottom:18px">→</span>` : ''}
                                            </div>
                                          `).join('')}
                                        </div>
                                      </div>`
                                    }).join('')}

                                    <div style="margin-top:20px;background:#fef2f2;border:1.5px solid #fecaca;border-radius:10px;padding:14px 18px">
                                      <div style="font-size:11px;font-weight:700;color:#dc2626;margin-bottom:6px">🛡️ Medical Disclaimer</div>
                                      <div style="font-size:11px;color:#7f1d1d;line-height:1.7">
                                        Yeh report sirf samajhne ke liye hai. Doctor ka replacement nahi hai. Koi bhi decision doctor ki salah ke baad lein.
                                      </div>
                                    </div>

                                    <div style="margin-top:16px;padding-top:12px;border-top:1px solid #f1f5f9;display:flex;justify-content:space-between">
                                      <span style="font-size:11px;color:#0d9488;font-weight:700">Sehat24 🇮🇳</span>
                                      <span style="font-size:10px;color:#94a3b8">sehat24.com</span>
                                      <span style="font-size:10px;color:#94a3b8">${new Date().toLocaleDateString('en-IN')}</span>
                                    </div>
                                  </div>
                                `

                                document.body.appendChild(container)
                                await new Promise(r => setTimeout(r, 200))

                                const canvas = await html2canvas(container, {
                                  scale: 2, useCORS: true, backgroundColor: '#ffffff',
                                  width: 794, windowWidth: 794
                                })

                                document.body.removeChild(container)

                                const pdf  = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' })
                                const pdfW = pdf.internal.pageSize.getWidth()
                                const pdfH = pdf.internal.pageSize.getHeight()
                                const imgH = (canvas.height * pdfW) / canvas.width

                                let pos = 0
                                pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, pos, pdfW, imgH)
                                let remaining = imgH - pdfH
                                while (remaining > 0) {
                                  pos -= pdfH; pdf.addPage()
                                  pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, pos, pdfW, imgH)
                                  remaining -= pdfH
                                }

                                pdf.save(`Sehat24-${type.replace(/\s+/g,'-')}-Trend-${new Date().toISOString().split('T')[0]}.pdf`)

                              } catch(err) {
                                console.error(err)
                                alert('PDF generate karne mein error. Dobara try karo.')
                              }
                                }}
                            style={{
                              width: '100%', marginTop: 12, padding: '12px',
                              background: 'white', border: '1.5px solid #e2e8f0',
                              borderRadius: 12, fontSize: 15, fontWeight: 800,
                              color: '#64748b', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                              fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all 0.2s'
                            }}
                          >
                            📥 Download {type} Trend Report
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Bottom CTA */}
          {total > 0 && (
            <div className="bottom-cta" style={{ marginTop: 24, background: 'linear-gradient(135deg, #f0fdfa, #ecfdf5)', border: '1px solid #99f6e4', borderRadius: 20, padding: '24px', textAlign: 'center' }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Aur reports upload karo — better trends milenge</p>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Jitni zyada reports, utna accurate health picture</p>
              <Link href="/upload" style={{ display: 'inline-block', background: '#0d9488', color: 'white', padding: '12px 32px', borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                + New Report Upload Karo
              </Link>
            </div>
          )}

          {/* ── History Feedback ── */}
          <div className="history-feedback" style={{
            background: 'linear-gradient(150deg, #0f172a, #1e293b)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 24, padding: 24, marginTop: 16,
          }}>
            {historySent ? (
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{ fontSize: 56, marginBottom: 12, lineHeight: 1 }}>🙏</div>
                <p style={{ fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 6 }}>Shukriya!</p>
                <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>
                  Aapka feedback<br />Sehat24 ko better banata hai 💙
                </p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 13, background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, boxShadow: '0 3px 12px rgba(245,158,11,0.4)' }}>⭐</div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: 'white', marginBottom: 2 }}>History page kaisi lagi?</p>
                    <p style={{ fontSize: 12, color: '#94a3b8' }}>Aapka feedback feature improve karne mein help karta hai 🙏</p>
                  </div>
                </div>

                {/* Stars */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
                  {[1,2,3,4,5].map(i => {
                    const active = historyHover || historyRating
                    return (
                      <button
                        key={i}
                        className="star-btn"
                        onMouseEnter={() => setHistoryHover(i)}
                        onMouseLeave={() => setHistoryHover(0)}
                        onClick={() => setHistoryRating(i)}
                        aria-label={`${i} star`}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, lineHeight: 1 }}
                      >
                        <svg width="40" height="40" viewBox="0 0 24 24"
                          fill={i <= active ? '#f59e0b' : 'rgba(255,255,255,0.1)'}
                          stroke={i <= active ? '#f59e0b' : 'rgba(255,255,255,0.2)'}
                          strokeWidth="1.5"
                          style={{ transition: 'fill 0.15s, stroke 0.15s', display: 'block' }}
                        >
                          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                        </svg>
                      </button>
                    )
                  })}
                </div>

                {/* Star label */}
                {historyRating > 0 && (
                  <p style={{
                    fontSize: 13, fontWeight: 700, marginBottom: 14,
                    color: historyRating <= 1 ? '#f87171' : historyRating === 2 ? '#fb923c' : historyRating === 3 ? '#fbbf24' : historyRating === 4 ? '#86efac' : '#4ade80',
                  }}>
                    {['', 'Bilkul helpful nahi', 'Thoda helpful', 'Theek tha', 'Helpful lagi', 'Bahut helpful!'][historyRating]}
                  </p>
                )}

                {/* Quick option chips */}
                {historyRating > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                    {[
                      '✅ Trends clearly dikh rahe hain',
                      '📊 Graphs helpful hain',
                      '😕 Samajhna mushkil tha',
                      '➕ Aur features chahiye',
                    ].map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => setHistoryFeedback(prev => prev === opt ? '' : opt)}
                        style={{
                          padding: '8px 14px', borderRadius: 100, cursor: 'pointer',
                          fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
                          background: historyFeedback === opt ? 'rgba(13,148,136,0.2)' : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${historyFeedback === opt ? '#0d9488' : 'rgba(255,255,255,0.1)'}`,
                          color: historyFeedback === opt ? '#2dd4bf' : 'rgba(255,255,255,0.8)',
                          transition: 'all 0.15s',
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {/* Textarea */}
                <textarea
                  value={historyFeedback && !['✅ Trends clearly dikh rahe hain','📊 Graphs helpful hain','😕 Samajhna mushkil tha','➕ Aur features chahiye'].includes(historyFeedback) ? historyFeedback : ''}
                  onChange={e => setHistoryFeedback(e.target.value.slice(0, 300))}
                  placeholder="Koi specific suggestion? Hindi ya English dono chalte hain 😊"
                  rows={2}
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12,
                    color: 'white', padding: '12px 14px', fontSize: 13,
                    lineHeight: 1.6, resize: 'none', outline: 'none',
                    fontFamily: 'inherit', marginTop: 10, boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                />

                {/* Send button */}
                <button
                  onClick={sendHistoryFeedback}
                  disabled={!historyRating || historySending}
                  style={{
                    width: '100%', marginTop: 12, padding: 13,
                    borderRadius: 14, border: 'none', fontFamily: 'inherit',
                    background: historyRating > 0 ? 'linear-gradient(135deg, #0d9488, #0891b2)' : 'rgba(255,255,255,0.06)',
                    color: historyRating > 0 ? 'white' : 'rgba(255,255,255,0.3)',
                    fontSize: 14, fontWeight: 700,
                    cursor: historyRating > 0 ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s',
                    boxShadow: historyRating > 0 ? '0 4px 16px rgba(13,148,136,0.3)' : 'none',
                  }}
                >
                  {historySending ? '⏳ Bhej raha hoon...' : '✉️ Feedback Bhejo →'}
                </button>
              </>
            )}
          </div>

        </div>
      </main>
    </>
  )
}