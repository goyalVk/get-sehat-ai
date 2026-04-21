'use client'
import { useState, useRef } from 'react'

export default function DownloadButton({ report, result }) {
  const [loading, setLoading] = useState(null)
  const fullRef   = useRef(null)
  const doctorRef = useRef(null)

  const generatePDF = async (ref, type) => {
    setLoading(type)
    try {
      const html2canvas = (await import('html2canvas')).default
      const { jsPDF }   = await import('jspdf')

      const el = ref.current
      el.style.display = 'block'
      await new Promise(r => setTimeout(r, 200))

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 794,
        windowWidth: 794,
      })

      el.style.display = 'none'

      const imgData = canvas.toDataURL('image/png')
      const pdf     = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' })
      const pdfW    = pdf.internal.pageSize.getWidth()
      const pdfH    = pdf.internal.pageSize.getHeight()
      const imgH    = (canvas.height * pdfW) / canvas.width

      let pos = 0
      pdf.addImage(imgData, 'PNG', 0, pos, pdfW, imgH)
      let remaining = imgH - pdfH
      while (remaining > 0) {
        pos -= pdfH
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, pos, pdfW, imgH)
        remaining -= pdfH
      }

      const name   = String(result.report_type || 'Report').replace(/[^\x00-\x7F]/g, '').replace(/\s+/g, '-')
      const suffix = type === 'doctor' ? 'Doctor-Summary' : 'Full-Report'
      pdf.save(`Sehat24-${name}-${suffix}-${new Date().toISOString().split('T')[0]}.pdf`)

    } catch (err) {
      console.error('PDF error:', err)
      alert('PDF generate karne mein error. Please try again.')
    }
    setLoading(null)
  }

  const normalCount    = result.parameters?.filter(p => p.status?.toLowerCase() === 'normal').length || 0
  const abnormalCount  = result.parameters?.filter(p => p.status?.toLowerCase() !== 'normal').length || 0
  const criticalCount  = result.parameters?.filter(p => p.status?.toLowerCase() === 'critical').length || 0
  const totalCount     = result.parameters?.length || 0
  const abnormalParams = result.parameters?.filter(p => p.status?.toLowerCase() !== 'normal') || []

  const statusStyle = (s) => {
    switch(s?.toLowerCase()) {
      case 'high':     return { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', badge: '#dc2626', label: 'HIGH ↑' }
      case 'low':      return { color: '#d97706', bg: '#fffbeb', border: '#fde68a', badge: '#d97706', label: 'LOW ↓' }
      case 'critical': return { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', badge: '#7f1d1d', label: 'URGENT ⚠' }
      default:         return { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', badge: '#16a34a', label: 'NORMAL ✓' }
    }
  }

  const metaItems = [
    report.lab?.collectedAt && { label: 'Test Date',   value: new Date(report.lab.collectedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
    report.patient?.name    && { label: 'Patient',     value: report.patient.name },
    report.patient?.age     && { label: 'Age',         value: `${report.patient.age} years` },
    report.patient?.gender  && { label: 'Gender',      value: report.patient.gender },
    report.lab?.labName     && { label: 'Lab',         value: report.lab.labName },
    report.lab?.labAddress  && { label: 'Location',    value: report.lab.labAddress },
    report.lab?.referredBy  && { label: 'Referred by', value: `Dr. ${report.lab.referredBy}` },
  ].filter(Boolean)

  const lifestyleTips = result.lifestyle ? [
    { icon: '🥗', label: 'Diet',           value: result.lifestyle.diet },
    { icon: '🚶', label: 'Activity',       value: result.lifestyle.activity },
    { icon: '😴', label: 'Sleep & Stress', value: result.lifestyle.sleep_stress },
    { icon: '🚫', label: 'Avoid',          value: result.lifestyle.avoid },
  ].filter(t => t.value) : []

  const noBreak = { pageBreakInside: 'avoid', breakInside: 'avoid' }

  const Header = () => (
    <div style={{ background: 'linear-gradient(135deg, #0d9488, #0891b2)', padding: '28px 40px 24px', color: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 4 }}>Sehat24</div>
          <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 16 }}>sehat24.com — India ka AI Health Companion</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{result.report_type || 'Lab Report'}</div>
          <div style={{ fontSize: 11, opacity: 0.8 }}>Generated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { label: 'Total',    value: totalCount,    bg: 'rgba(255,255,255,0.2)' },
            { label: 'Normal',   value: normalCount,   bg: 'rgba(34,197,94,0.3)' },
            { label: 'Abnormal', value: abnormalCount, bg: 'rgba(251,146,60,0.3)' },
            { label: 'Urgent',   value: criticalCount, bg: 'rgba(239,68,68,0.3)' },
          ].map((s, i) => (
            <div key={i} style={{ background: s.bg, borderRadius: 10, padding: '10px 14px', textAlign: 'center', minWidth: 56 }}>
              <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 9, marginTop: 4, opacity: 0.9 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {metaItems.map((m, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 6, padding: '4px 10px', fontSize: 11 }}>
            <span style={{ opacity: 0.75 }}>{m.label}: </span>
            <span style={{ fontWeight: 600 }}>{m.value}</span>
          </div>
        ))}
      </div>
    </div>
  )

  const UrgentFlags = () => result.urgent_flags?.length > 0 ? (
    <div style={{ margin: '20px 40px 0', background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 12, padding: '16px 20px', ...noBreak }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ background: '#dc2626', borderRadius: 6, padding: '4px 10px', color: 'white', fontSize: 11, fontWeight: 700 }}>⚠ URGENT</div>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#991b1b' }}>See your doctor today</span>
      </div>
      {result.urgent_flags.map((f, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
          <span style={{ color: '#dc2626', fontWeight: 700 }}>•</span>
          <span style={{ fontSize: 12, color: '#7f1d1d' }}>{f}</span>
        </div>
      ))}
    </div>
  ) : null

  const Summary = () => (
    <div style={{ margin: '20px 40px 0', background: 'linear-gradient(135deg, #f0fdfa, #ecfdf5)', border: '1px solid #99f6e4', borderRadius: 12, padding: '16px 20px', ...noBreak }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#0d9488', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>AI Summary</div>
      <div style={{ fontSize: 13, color: '#134e4a', lineHeight: 1.7, fontWeight: 500 }}>{result.summary}</div>
    </div>
  )

  const ParamCard = ({ param }) => {
    const st = statusStyle(param.status)
    const isAb = param.status?.toLowerCase() !== 'normal'
    return (
      <div style={{
        background: isAb ? st.bg : '#f8fafc',
        border: `1px solid ${isAb ? st.border : '#e2e8f0'}`,
        borderRadius: 10, padding: '12px 16px',
        borderLeft: `4px solid ${st.badge}`,
        ...noBreak
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{param.name}</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: st.color }}>
                {param.value} <span style={{ fontSize: 11, fontWeight: 500, color: '#94a3b8' }}>{param.unit}</span>
              </span>
              {param.reference_range && param.reference_range !== 'Not specified' && (
                <span style={{ fontSize: 10, color: '#94a3b8' }}>Normal: {param.reference_range}</span>
              )}
            </div>
            <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.6 }}>{param.explanation}</div>
            {isAb && param.action && (
              <div style={{ marginTop: 6, padding: '6px 10px', background: 'white', borderRadius: 6, border: `1px solid ${st.border}`, fontSize: 11, color: '#334155', display: 'flex', gap: 6 }}>
                <span style={{ fontWeight: 700, color: st.color, flexShrink: 0 }}>Action:</span>
                <span>{param.action}</span>
              </div>
            )}
          </div>
          <div style={{ marginLeft: 12, flexShrink: 0, background: st.badge, color: 'white', borderRadius: 6, padding: '4px 10px', fontSize: 10, fontWeight: 700 }}>
            {st.label}
          </div>
        </div>
      </div>
    )
  }

  const DoctorQuestions = () => result.doctor_questions?.length > 0 ? (
    <div style={{ margin: '24px 40px 0' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12, paddingBottom: 8, borderBottom: '2px solid #f1f5f9' }}>
        Ask Your Doctor
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {result.doctor_questions.map((q, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 14px', background: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe', ...noBreak }}>
            <div style={{ width: 22, height: 22, background: '#1d4ed8', borderRadius: '50%', color: 'white', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
            <span style={{ fontSize: 12, color: '#1e3a5f', lineHeight: 1.6 }}>{q}</span>
          </div>
        ))}
      </div>
    </div>
  ) : null

  const Footer = () => (
    <>
      <div style={{ margin: '24px 40px 0', background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 10, padding: '14px 18px', ...noBreak }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', marginBottom: 6 }}>🛡️ Medical Disclaimer — Zaroor Padhein</div>
        <div style={{ fontSize: 11, color: '#7f1d1d', lineHeight: 1.7 }}>
          Yeh report sirf samajhne ke liye hai — doctor ka replacement nahi hai. Koi bhi <strong>medicine, herb ya supplement</strong> lene se pehle apne doctor se zaroor milein. Sehat24 medical advice, diagnosis ya treatment provide nahi karta.
        </div>
      </div>
      <div style={{ margin: '20px 40px 32px', paddingTop: 16, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 11, color: '#0d9488', fontWeight: 700 }}>Sehat24</div>
        <div style={{ fontSize: 10, color: '#94a3b8' }}>sehat24.com — India ka AI Health Companion</div>
        <div style={{ fontSize: 10, color: '#94a3b8' }}>{new Date().toLocaleDateString('en-IN')}</div>
      </div>
    </>
  )

  return (
    <>
      {/* ── 2 Buttons ── */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={() => generatePDF(fullRef, 'full')}
          disabled={loading !== null}
          style={{
            flex: 1, padding: '14px', borderRadius: 14,
            border: '1.5px solid #99f6e4',
            background: loading === 'full' ? '#f0fdfa' : 'linear-gradient(135deg, #f0fdfa, #ecfdf5)',
            fontSize: 13, fontWeight: 700, color: '#0d9488',
            cursor: loading !== null ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            opacity: loading !== null ? 0.7 : 1, transition: 'all 0.2s'
          }}
        >
          {loading === 'full'
            ? <><div style={{ width: 14, height: 14, border: '2px solid #0d9488', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Generating...</>
            : <>📋 Full Report PDF</>}
        </button>

        <button
          onClick={() => generatePDF(doctorRef, 'doctor')}
          disabled={loading !== null}
          style={{
            flex: 1, padding: '14px', borderRadius: 14,
            border: '1.5px solid #bfdbfe',
            background: loading === 'doctor' ? '#eff6ff' : 'linear-gradient(135deg, #eff6ff, #dbeafe)',
            fontSize: 13, fontWeight: 700, color: '#1d4ed8',
            cursor: loading !== null ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            opacity: loading !== null ? 0.7 : 1, transition: 'all 0.2s'
          }}
        >
          {loading === 'doctor'
            ? <><div style={{ width: 14, height: 14, border: '2px solid #1d4ed8', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Generating...</>
            : <>🏥 Doctor Summary PDF</>}
        </button>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* ════════════════════
          FULL PDF TEMPLATE
      ════════════════════ */}
      <div ref={fullRef} style={{ display: 'none' }}>
        <div style={{ width: 794, background: '#ffffff', fontFamily: 'Arial, sans-serif', color: '#0f172a', fontSize: 13 }}>

          <Header />
          <UrgentFlags />
          <Summary />

          {/* All Parameters */}
          <div style={{ margin: '24px 40px 0' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12, paddingBottom: 8, borderBottom: '2px solid #f1f5f9' }}>
              All Parameters — {totalCount} values
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {result.parameters?.map((param, i) => <ParamCard key={i} param={param} />)}
            </div>
          </div>

          <DoctorQuestions />

          {/* Lifestyle */}
          {lifestyleTips.length > 0 && (
            <div style={{ margin: '24px 40px 0' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12, paddingBottom: 8, borderBottom: '2px solid #f1f5f9' }}>
                Lifestyle Tips
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {lifestyleTips.map((tip, i) => (
                  <div key={i} style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '12px 14px', borderLeft: '4px solid #d97706', ...noBreak }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <span style={{ fontSize: 16 }}>{tip.icon}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{tip.label}</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#78350f', lineHeight: 1.6 }}>{tip.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Herbs */}
          {result.ayurvedic_herbs?.length > 0 && (
            <div style={{ margin: '24px 40px 0' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12, paddingBottom: 8, borderBottom: '2px solid #f1f5f9' }}>
                Ayurvedic Herbs — Natural Support
              </div>
              <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 8, padding: '8px 14px', marginBottom: 12, fontSize: 11, color: '#92400e', ...noBreak }}>
                ⚠️ Koi bhi herb lene se pehle doctor se milein — especially agar koi medicine chal rahi hai.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {result.ayurvedic_herbs.map((herb, i) => (
                  <div key={i} style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '14px 16px', borderLeft: '4px solid #16a34a', ...noBreak }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#14532d', marginBottom: 8 }}>🌿 {herb.name}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                      <div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#16a34a' }}>FAIDA: </span>
                        <span style={{ fontSize: 11, color: '#166534' }}>{herb.benefit}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#16a34a' }}>KAISE LEIN: </span>
                        <span style={{ fontSize: 11, color: '#166534' }}>{herb.how_to_use}</span>
                      </div>
                    </div>
                    <div style={{ background: '#fefce8', borderRadius: 6, padding: '5px 10px', fontSize: 10, color: '#92400e' }}>
                      ⚠️ {herb.caution}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10, background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: 8, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', ...noBreak }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0d9488' }}>🌿 Yeh herbs khareedni hain?</div>
                  <div style={{ fontSize: 11, color: '#0d9488', marginTop: 2 }}>100+ authentic herbs available</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0d9488' }}>satvikhavan.com</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>WhatsApp: +91 8076170877</div>
                </div>
              </div>
            </div>
          )}

          <Footer />
        </div>
      </div>

      {/* ════════════════════════
          DOCTOR SUMMARY TEMPLATE
      ════════════════════════ */}
      <div ref={doctorRef} style={{ display: 'none' }}>
        <div style={{ width: 794, background: '#ffffff', fontFamily: 'Arial, sans-serif', color: '#0f172a', fontSize: 13 }}>

          <Header />

          <div style={{ margin: '20px 40px 0', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, ...noBreak }}>
            <div style={{ background: '#1d4ed8', borderRadius: 6, padding: '4px 10px', color: 'white', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>🏥 Doctor Summary</div>
            <span style={{ fontSize: 12, color: '#1e3a5f' }}>Sirf important findings — abnormal values aur doctor questions. Normal values exclude kiye hain.</span>
          </div>

          <UrgentFlags />
          <Summary />

          {/* Abnormal Only */}
          <div style={{ margin: '24px 40px 0' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12, paddingBottom: 8, borderBottom: '2px solid #f1f5f9' }}>
              {abnormalCount > 0 ? `Abnormal Parameters — ${abnormalCount} values need attention` : 'All Parameters Normal ✓'}
            </div>
            {abnormalCount === 0 ? (
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '16px 20px', textAlign: 'center', ...noBreak }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#16a34a', marginBottom: 6 }}>✓ Sabhi values normal hain</div>
                <div style={{ fontSize: 12, color: '#166534' }}>Koi abnormal finding nahi hai is report mein.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {abnormalParams.map((param, i) => <ParamCard key={i} param={param} />)}
              </div>
            )}
          </div>

          {/* Normal pills */}
          {normalCount > 0 && (
            <div style={{ margin: '20px 40px 0' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10, paddingBottom: 8, borderBottom: '2px solid #f1f5f9' }}>
                Normal Parameters ({normalCount} values)
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {result.parameters?.filter(p => p.status?.toLowerCase() === 'normal').map((param, i) => (
                  <div key={i} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '4px 10px', fontSize: 11, color: '#166534' }}>
                    <span style={{ fontWeight: 600 }}>{param.name}</span>: {param.value} {param.unit}
                  </div>
                ))}
              </div>
            </div>
          )}

          <DoctorQuestions />
          <Footer />
        </div>
      </div>
    </>
  )
}