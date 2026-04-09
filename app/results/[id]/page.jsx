import { connectDB } from '@/lib/mongodb'
import Report from '@/models/report'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import DownloadButton from '@/components/DownloadButton'

const statusConfig = {
  normal:   { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', badge: '#dcfce7', badgeText: '#15803d', label: 'Normal',   icon: '✓' },
  low:      { color: '#d97706', bg: '#fffbeb', border: '#fde68a', badge: '#fef3c7', badgeText: '#92400e', label: 'Low',      icon: '↓' },
  high:     { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', badge: '#fee2e2', badgeText: '#991b1b', label: 'High',     icon: '↑' },
  critical: { color: '#ffffff', bg: '#dc2626', border: '#dc2626', badge: '#dc2626', badgeText: '#ffffff', label: 'Urgent',   icon: '⚠' },
}

function getValuePosition(value, range) {
  if (!range || !value) return 50
  const numValue = parseFloat(value)
  if (isNaN(numValue)) return 50
  const rangeParts = range.match(/[\d.]+/g)
  if (!rangeParts || rangeParts.length < 2) return 50
  const min = parseFloat(rangeParts[0])
  const max = parseFloat(rangeParts[1])
  if (isNaN(min) || isNaN(max) || max === min) return 50
  const pos = ((numValue - min) / (max - min)) * 100
  return Math.max(5, Math.min(95, pos))
}

export default async function ResultsPage({ params }) {
  const { id } = await params
  await connectDB()
  const report = await Report.findById(id).lean()
  if (!report) notFound()

  if (report.status === 'processing') {
    return (
      <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            border: '3px solid #f0fdfa', borderTopColor: '#0d9488',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 20px'
          }} />
          <p style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>
            Analyzing your report...
          </p>
          <p style={{ fontSize: 14, color: '#94a3b8' }}>Usually takes 20-30 seconds</p>
          <meta httpEquiv="refresh" content="3" />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </main>
    )
  }

  if (report.status === 'failed') {
    return (
      <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>❌</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Analysis failed</h2>
          <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 24 }}>{report.errorMessage || 'Please try again.'}</p>
          <Link href="/upload" style={{
            display: 'inline-block', background: '#0d9488', color: 'white',
            padding: '12px 24px', borderRadius: 12, textDecoration: 'none',
            fontSize: 14, fontWeight: 600
          }}>Try again</Link>
        </div>
      </main>
    )
  }

  const result = report.result
const normalCount   = result.parameters?.filter(p => p.status?.toLowerCase() === 'normal').length || 0
const abnormalCount = result.parameters?.filter(p => p.status?.toLowerCase() !== 'normal' && p.status !== undefined).length || 0
const criticalCount = result.parameters?.filter(p => p.status?.toLowerCase() === 'critical').length || 0
const totalCount    = result.parameters?.length || 0

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        * { box-sizing: border-box; }
        .results-page { font-family: 'Plus Jakarta Sans', sans-serif; background: #f8fafc; min-height: 100vh; }
        .serif { font-family: 'DM Serif Display', serif; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
        .fade-up { animation: fadeUp 0.4s ease forwards; opacity: 0; }
        .param-card { background: white; border-radius: 16px; border: 1px solid #f1f5f9; padding: 20px; transition: all 0.2s; }
        .param-card:hover { border-color: #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.06); transform: translateY(-1px); }
        .range-track { height: 6px; background: #f1f5f9; border-radius: 3px; position: relative; margin: 12px 0 4px; }
        .range-normal { position: absolute; top: 0; height: 100%; background: #bbf7d0; border-radius: 3px; }
        .range-marker { position: absolute; top: 50%; transform: translate(-50%, -50%); width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.2); }
        .pill { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
      `}</style>

      <div className="results-page">
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px 60px' }}>

          {/* Header card */}
          <div className="fade-up" style={{
            background: 'white', borderRadius: 24, border: '1px solid #f1f5f9',
            padding: 28, marginBottom: 20, animationDelay: '0s'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                {/* Report type */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 14,
                    background: '#f0fdfa', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: 22
                  }}>
                    🏥
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 2 }}>
                      Report Analysis
                    </p>
                    <h1 className="serif" style={{ fontSize: 22, color: '#0f172a', fontWeight: 400 }}>
                      {result.report_type || 'Lab Report'}
                    </h1>
                  </div>
                </div>

                {/* Meta info */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                  {report.lab?.collectedAt && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 14 }}>🗓</span>
                      <div>
                        <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>TEST DATE</p>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#0d9488' }}>
                          {new Date(report.lab.collectedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  )}
                  {report.patient?.name && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 14 }}>👤</span>
                      <div>
                        <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>PATIENT</p>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                          {report.patient.name}{report.patient.age && `, ${report.patient.age} yrs`}
                        </p>
                      </div>
                    </div>
                  )}
                  {report.lab?.labName && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 14 }}>🔬</span>
                      <div>
                        <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>LAB</p>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                          {report.lab.labName}
                        </p>
                      </div>
                    </div>
                  )}
                  {report.lab?.referredBy && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 14 }}>👨‍⚕️</span>
                      <div>
                        <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>REFERRED BY</p>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                          Dr. {report.lab.referredBy}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats pills */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span className="pill" style={{ background: '#f0fdf4', color: '#15803d' }}>
                    ✓ {normalCount} Normal
                  </span>
                  {abnormalCount > 0 && (
                    <span className="pill" style={{ background: '#fef2f2', color: '#991b1b' }}>
                      ↑ {abnormalCount} Abnormal
                    </span>
                  )}
                </div>
                {criticalCount > 0 && (
                  <span className="pill" style={{ background: '#dc2626', color: 'white' }}>
                    ⚠ {criticalCount} Urgent
                  </span>
                )}
                <p style={{ fontSize: 11, color: '#cbd5e1' }}>
                  {totalCount} parameters analyzed
                </p>
              </div>
            </div>
          </div>

          {/* Urgent flags */}
          {result.urgent_flags?.length > 0 && (
            <div className="fade-up" style={{
              background: 'linear-gradient(135deg, #fef2f2, #fff1f2)',
              border: '1.5px solid #fecaca', borderRadius: 20,
              padding: 24, marginBottom: 20, animationDelay: '0.05s'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: '#dc2626', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 18
                }}>⚠️</div>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: '#991b1b' }}>Needs Immediate Attention</h2>
                  <p style={{ fontSize: 12, color: '#fca5a5' }}>Please contact your doctor today</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {result.urgent_flags.map((flag, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    background: 'white', borderRadius: 12, padding: '10px 14px',
                    border: '1px solid #fecaca'
                  }}>
                    <span style={{ color: '#dc2626', fontSize: 14, marginTop: 1, flexShrink: 0 }}>•</span>
                    <p style={{ fontSize: 13, color: '#7f1d1d', lineHeight: 1.5 }}>{flag}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="fade-up" style={{
            background: 'linear-gradient(135deg, #f0fdfa, #ecfdf5)',
            border: '1px solid #99f6e4', borderRadius: 20,
            padding: 28, marginBottom: 24, animationDelay: '0.1s',
            position: 'relative', overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute', top: -20, right: -20,
              width: 100, height: 100, borderRadius: '50%',
              background: 'rgba(13,148,136,0.06)'
            }} />
            <p style={{ fontSize: 11, color: '#0d9488', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
              AI Summary
            </p>
            <p style={{ fontSize: 15, color: '#134e4a', lineHeight: 1.75, fontWeight: 500 }}>
              {result.summary}
            </p>
          </div>

          {/* Parameters */}
          <div className="fade-up" style={{ marginBottom: 24, animationDelay: '0.15s' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                All Parameters
              </h2>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>
                {totalCount} values
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {result.parameters?.map((param, i) => {
                const style = statusConfig[param.status?.toLowerCase()] || statusConfig.normal
                const pos     = getValuePosition(param.value, param.reference_range)
                const isAbnormal = param.status !== 'normal'

                return (
                  <div key={i} className="param-card" style={{
                    borderColor: isAbnormal ? style.border : '#f1f5f9',
                    background: isAbnormal ? style.bg : 'white',
                    animationDelay: `${0.05 * i}s`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>

                      {/* Left */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                            {param.name}
                          </span>
                          <span style={{ fontSize: 18, fontWeight: 700, color: style.color }}>
                            {param.value}
                            <span style={{ fontSize: 12, fontWeight: 500, color: '#94a3b8', marginLeft: 3 }}>
                              {param.unit}
                            </span>
                          </span>
                        </div>

                        {/* Range bar */}
                        {param.reference_range && param.reference_range !== 'Not specified' && (
                          <div>
                            <div className="range-track">
                              <div className="range-normal" style={{ left: '20%', width: '60%' }} />
                              <div className="range-marker" style={{
                                left: `${pos}%`,
                                background: style.color
                              }} />
                            </div>
                            <p style={{ fontSize: 11, color: '#94a3b8' }}>
                              Normal range: {param.reference_range}
                            </p>
                          </div>
                        )}

                        {/* Explanation */}
                        <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, marginTop: 10 }}>
                          {param.explanation}
                        </p>

                        {/* Action — only if abnormal */}
                        {isAbnormal && param.action && (
                          <div style={{
                            marginTop: 12, padding: '10px 14px',
                            background: 'white', borderRadius: 10,
                            border: `1px solid ${style.border}`,
                            display: 'flex', alignItems: 'flex-start', gap: 8
                          }}>
                            <span style={{ fontSize: 13, flexShrink: 0 }}>💡</span>
                            <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.5, fontWeight: 500 }}>
                              {param.action}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Status badge */}
                      <div style={{
                        flexShrink: 0,
                        background: style.badge,
                        color: style.badgeText,
                        fontSize: 12, fontWeight: 700,
                        padding: '6px 12px', borderRadius: 20,
                        display: 'flex', alignItems: 'center', gap: 4
                      }}>
                        <span>{style.icon}</span>
                        <span>{style.label}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Doctor questions */}
          {result.doctor_questions?.length > 0 && (
            <div className="fade-up" style={{
              background: 'white', borderRadius: 20,
              border: '1px solid #f1f5f9', padding: 24,
              marginBottom: 16, animationDelay: '0.2s'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: '#eff6ff', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 18
                }}>
                  💬
                </div>
                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Ask Your Doctor</h2>
                  <p style={{ fontSize: 12, color: '#94a3b8' }}>Prepare these questions for your next visit</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {result.doctor_questions.map((q, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    padding: '12px 16px', background: '#f8fafc',
                    borderRadius: 12, border: '1px solid #f1f5f9'
                  }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: '50%',
                      background: '#dbeafe', color: '#1d4ed8',
                      fontSize: 11, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, marginTop: 1
                    }}>
                      {i + 1}
                    </span>
                    <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.6 }}>{q}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lifestyle tip */}
          {result.lifestyle_note && (
            <div className="fade-up" style={{
              background: 'linear-gradient(135deg, #fffbeb, #fef9ee)',
              border: '1px solid #fde68a', borderRadius: 20,
              padding: 24, marginBottom: 16, animationDelay: '0.25s'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: '#fef3c7', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, flexShrink: 0
                }}>
                  🌱
                </div>
                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: '#92400e', marginBottom: 8 }}>
                    Lifestyle Tip
                  </h2>
                  <p style={{ fontSize: 13, color: '#78350f', lineHeight: 1.7 }}>
                    {result.lifestyle_note}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="fade-up" style={{
            background: '#f8fafc', borderRadius: 16,
            padding: '14px 18px', marginBottom: 24,
            animationDelay: '0.3s'
          }}>
            <p style={{ fontSize: 11, color: '#cbd5e1', lineHeight: 1.6, textAlign: 'center' }}>
              🛡️ {result.disclaimer}
            </p>
          </div>

          {/* Action buttons */}
          <div className="fade-up" style={{
            display: 'flex', gap: 10, marginBottom: 12,
            animationDelay: '0.35s'
          }}>
            <Link href="/upload" style={{
              flex: 1, padding: '14px', borderRadius: 14,
              border: '1px solid #e2e8f0', background: 'white',
              fontSize: 14, fontWeight: 600, color: '#64748b',
              textDecoration: 'none', textAlign: 'center',
              transition: 'all 0.2s'
            }}>
              New Report
            </Link>
            <Link href="/dashboard" style={{
              flex: 1, padding: '14px', borderRadius: 14,
              background: '#0d9488', color: 'white',
              fontSize: 14, fontWeight: 600,
              textDecoration: 'none', textAlign: 'center',
              transition: 'all 0.2s'
            }}>
              Dashboard →
            </Link>
          </div>

          <div className="fade-up" style={{ animationDelay: '0.4s' }}>
            <DownloadButton 
            report={JSON.parse(JSON.stringify(report))} 
            result={JSON.parse(JSON.stringify(result))} 
          />
          </div>

        </div>
      </div>
    </>
  )
}