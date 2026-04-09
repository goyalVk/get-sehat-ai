'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function getTrendAdvice(paramName, trend) {
  if (trend.length < 2) return null

  const latest   = trend[trend.length - 1]
  const previous = trend[trend.length - 2]
  const diff = latest.value - previous.value
  const pct  = Math.abs((diff / previous.value) * 100).toFixed(1)
  const improving = diff < 0

  const adviceMap = {
    'hba1c': {
      improving: `HbA1c ${pct}% kam hua — bahut achha! Diet aur exercise continue karo. Next test 3 mahine baad.`,
      worsening: `HbA1c ${pct}% badha — diabetes risk hai. Mithai, chawal, maida kam karo. Doctor se milna zaroori hai.`,
      stable:    `HbA1c stable hai. Lifestyle maintain karo — roz 30 min walk aur kam sugar.`
    },
    'glucose': {
      improving: `Blood sugar control improve hua — ${pct}% kam. Yeh achi nishani hai!`,
      worsening: `Blood sugar ${pct}% badha. Meethi cheezein aur processed food avoid karo.`,
      stable:    `Blood sugar stable. Balanced diet aur exercise maintain karo.`
    },
    'cholesterol': {
      improving: `Cholesterol ${pct}% kam hua — heart ke liye achha! Oily food avoid karte raho.`,
      worsening: `Cholesterol ${pct}% badha. Ghee, butter, fried food kam karo. Walking shuru karo.`,
      stable:    `Cholesterol stable. Healthy diet continue karo.`
    },
    'hdl': {
      improving: `Good cholesterol (HDL) badha — yeh heart ke liye bahut achha hai!`,
      worsening: `Good cholesterol (HDL) kam hua. Exercise badhao — HDL sirf exercise se improve hota hai.`,
      stable:    `HDL stable hai.`
    },
    'ldl': {
      improving: `Bad cholesterol (LDL) kam hua — ${pct}% improvement. Heart risk kam ho raha hai.`,
      worsening: `Bad cholesterol (LDL) ${pct}% badha. Fatty food aur red meat avoid karo.`,
      stable:    `LDL stable. Diet dhyan rakho.`
    },
    'creatinine': {
      improving: `Kidney function improve ho rahi hai — creatinine ${pct}% kam. Paani zyada piyo.`,
      worsening: `Kidney marker ${pct}% badha — nephrology consultation lo. Paani 3L+ daily piyo.`,
      stable:    `Kidney function stable. Hydration maintain karo.`
    },
    'hemoglobin': {
      improving: `Hemoglobin ${pct}% badha — anemia improve ho raha hai! Iron rich food continue karo.`,
      worsening: `Hemoglobin ${pct}% kam — anemia ka risk. Palak, chana, khajoor, meat badhao.`,
      stable:    `Hemoglobin stable. Iron rich diet maintain karo.`
    },
    'tsh': {
      improving: `Thyroid levels normal ki taraf aa rahe hain — medicine sahi kaam kar rahi hai.`,
      worsening: `Thyroid levels change hue — doctor se dose adjust karwao.`,
      stable:    `Thyroid stable. Regular checkup continue karo.`
    },
    'vitamin d': {
      improving: `Vitamin D ${pct}% improve hua! Supplementation aur dhoop kaam aa rahi hai.`,
      worsening: `Vitamin D aur kam hua. Roz 15-20 min dhoop mein baitho. Supplement lo.`,
      stable:    `Vitamin D stable. Supplementation continue karo.`
    },
    'uric acid': {
      improving: `Uric acid ${pct}% kam hua. Diet changes kaam kar rahi hain!`,
      worsening: `Uric acid ${pct}% badha. Red meat, seafood, alcohol avoid karo.`,
      stable:    `Uric acid stable. Paani zyada piyo.`
    },
    'default': {
      improving: `${paramName} mein ${pct}% improvement — achha trend hai! Lifestyle maintain karo.`,
      worsening: `${paramName} mein ${pct}% change — doctor se discuss karo.`,
      stable:    `${paramName} stable hai.`
    }
  }

  const key = Object.keys(adviceMap).find(k =>
    paramName.toLowerCase().includes(k)
  ) || 'default'

  const advice = adviceMap[key]
  if (diff === 0) return { text: advice.stable,    type: 'stable' }
  if (improving)  return { text: advice.improving, type: 'improving' }
  return { text: advice.worsening, type: 'worsening' }
}

function getAccumulatedAdvice(reports) {
  if (!reports || reports.length === 0) return null
  const latest   = reports[reports.length - 1]
  const abnormal = latest.parameters?.filter(p => p.status !== 'normal') || []
  const critical = latest.parameters?.filter(p => p.status === 'critical') || []

  const advice = { critical: [], diet: [], lifestyle: [], nextTest: null }

  critical.forEach(p => {
    advice.critical.push(`${p.name} ke liye turant doctor se milo`)
  })

  abnormal.forEach(p => {
    const name = p.name?.toLowerCase() || ''

    if (name.includes('hba1c') || name.includes('glucose') || name.includes('sugar')) {
      advice.diet.push('Chawal, roti, mithai, maida kam karo')
      advice.diet.push('Brown rice, oats, daliya try karo')
      advice.lifestyle.push('Roz 30-45 min walk — blood sugar ke liye sabse effective')
      advice.nextTest = '3 mahine baad HbA1c dobara karwao'
    }
    if (name.includes('cholesterol') || name.includes('ldl') || name.includes('triglyceride')) {
      advice.diet.push('Fried food, ghee, butter, red meat avoid karo')
      advice.diet.push('Almonds, walnuts, olive oil include karo')
      advice.lifestyle.push('Smoking aur alcohol band karo — cholesterol directly affect hota hai')
      advice.nextTest = advice.nextTest || '3 mahine baad lipid profile dobara karwao'
    }
    if (name.includes('hemoglobin') || name.includes('rbc') || name.includes('hb')) {
      advice.diet.push('Palak, chana, rajma, khajoor, pomegranate roz khao')
      advice.diet.push('Iron absorption ke liye Vitamin C — nimbu paani, amla')
      advice.lifestyle.push('Chai aur coffee khane ke saath mat lo — iron absorb nahi hota')
      advice.nextTest = advice.nextTest || '6 hafte baad CBC dobara karwao'
    }
    if (name.includes('creatinine') || name.includes('urea') || name.includes('egfr')) {
      advice.diet.push('Protein thoda kam karo — dal, paneer, meat controlled rakkho')
      advice.diet.push('Roz 3-4 liter paani piyo')
      advice.lifestyle.push('Painkillers (ibuprofen, diclofenac) avoid karo — kidney damage karte hain')
      advice.nextTest = advice.nextTest || '1 mahine baad KFT dobara karwao'
    }
    if (name.includes('tsh') || name.includes('thyroid')) {
      advice.diet.push('Iodized namak use karo')
      advice.lifestyle.push('Medicine roz same time pe lo — kabhi skip mat karo')
      advice.nextTest = advice.nextTest || '3 mahine baad thyroid dobara karwao'
    }
    if (name.includes('vitamin d')) {
      advice.diet.push('Egg yolk, fatty fish, fortified milk include karo')
      advice.lifestyle.push('Roz subah 7-9 baje 15-20 min dhoop mein baitho')
      advice.nextTest = advice.nextTest || '3 mahine baad Vitamin D dobara karwao'
    }
    if (name.includes('b12')) {
      advice.diet.push('Agar vegetarian ho toh B12 supplement zaroor lo')
      advice.diet.push('Milk, eggs, paneer, fish include karo')
      advice.nextTest = advice.nextTest || '3 mahine baad B12 dobara karwao'
    }
    if (name.includes('uric acid')) {
      advice.diet.push('Red meat, seafood, alcohol avoid karo')
      advice.diet.push('Roz 3-4 liter paani piyo')
      advice.lifestyle.push('Weight kam karo — uric acid directly weight se linked hai')
      advice.nextTest = advice.nextTest || '3 mahine baad uric acid dobara karwao'
    }
    if (name.includes('sgpt') || name.includes('sgot') || name.includes('bilirubin')) {
      advice.diet.push('Alcohol bilkul band karo')
      advice.diet.push('Oily, fried, spicy food avoid karo')
      advice.lifestyle.push('Unnecessary medicines aur supplements avoid karo')
      advice.nextTest = advice.nextTest || '6 hafte baad LFT dobara karwao'
    }
  })

  advice.diet      = [...new Set(advice.diet)]
  advice.lifestyle = [...new Set(advice.lifestyle)]
  return advice
}

const adviceStyle = {
  improving: 'bg-green-50 border-green-100 text-green-800',
  worsening: 'bg-red-50 border-red-100 text-red-800',
  stable:    'bg-amber-50 border-amber-100 text-amber-800',
}

const adviceIcon = {
  improving: '✓',
  worsening: '⚠',
  stable:    '→',
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

export default function HistoryPage() {
  const router = useRouter()
  const [grouped, setGrouped]         = useState({})
  const [loading, setLoading]         = useState(true)
  const [selected, setSelected]       = useState(null)
  const [totalReports, setTotalReports] = useState(0)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const authRes = await fetch('/api/auth/me')
      if (!authRes.ok) { router.push('/auth/login'); return }

      const res  = await fetch('/api/reports')
      const data = await res.json()
      const all  = data.reports || []
      setTotalReports(all.length)

      const groups = {}
      all.forEach(report => {
        const type = report.reportType || 'Other'
        if (!groups[type]) groups[type] = []
        groups[type].push(report)
      })
      setGrouped(groups)
    } catch {
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const getReportDate = (report) => {
    if (report.lab?.collectedAt) return new Date(report.lab.collectedAt)
    return new Date(report.createdAt)
  }

  const getTrend = (reports, paramName) => {
    return reports
      .map(r => {
        const param = r.parameters?.find(
          p => p.name?.toLowerCase() === paramName?.toLowerCase()
        )
        if (!param) return null
        return {
          value:    parseFloat(param.value),
          unit:     param.unit,
          status:   param.status,
          date:     getReportDate(r),
          reportId: r._id
        }
      })
      .filter(Boolean)
      .sort((a, b) => a.date - b.date)
  }

  const getTrendArrow = (values) => {
    if (values.length < 2) return null
    const last = values[values.length - 1].value
    const prev = values[values.length - 2].value
    if (last < prev) return { arrow: '↓', color: 'text-green-600', label: 'Improving' }
    if (last > prev) return { arrow: '↑', color: 'text-red-500',   label: 'Worsening' }
    return { arrow: '→', color: 'text-amber-500', label: 'Stable' }
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
          <Link href="/dashboard" className="text-lg font-semibold text-teal-700">
            Sehat24
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-stone-500 hover:text-stone-700">
              Dashboard
            </Link>
            <Link href="/upload"
              className="bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-medium">
              + New Report
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-stone-800 serif mb-1">
              Report History
            </h1>
            <p className="text-stone-500 text-sm">
              {totalReports} report{totalReports !== 1 ? 's' : ''} •
              Sample collection date se sorted
            </p>
          </div>
        </div>

        {totalReports === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-100 p-12 text-center">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-stone-500 mb-4">Abhi tak koi report nahi</p>
            <Link href="/upload"
              className="bg-teal-600 text-white px-6 py-3 rounded-xl text-sm font-medium">
              Report upload karo
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([type, typeReports]) => {

              const sortedReports = [...typeReports].sort(
                (a, b) => getReportDate(a) - getReportDate(b)
              )

              const allParams = new Set()
              sortedReports.forEach(r =>
                r.parameters?.forEach(p => { if (p.name) allParams.add(p.name) })
              )

              const latestReport = sortedReports[sortedReports.length - 1]
              const abnormalCount = latestReport?.parameters
                ?.filter(p => p.status !== 'normal')?.length || 0

              return (
                <div key={type}
                  className="bg-white rounded-2xl border border-stone-100 overflow-hidden">

                  {/* Header */}
                  <div className="px-6 py-4 border-b border-stone-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="font-semibold text-stone-800 mb-1">{type}</h2>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-stone-400">
                            {sortedReports.length} test{sortedReports.length > 1 ? 's' : ''}
                          </span>
                          {abnormalCount > 0 && (
                            <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">
                              ⚠ {abnormalCount} abnormal (latest)
                            </span>
                          )}
                          {sortedReports.length > 1 && (
                            <span className="text-xs bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full">
                              Trend available
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => setSelected(selected === type ? null : type)}
                        className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                      >
                        {selected === type ? 'Hide ↑' : 'Trend dekho ↓'}
                      </button>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="px-6 py-4">
                    <p className="text-xs text-stone-400 mb-3 uppercase tracking-wide">
                      Test Timeline (Sample Collection Date)
                    </p>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {sortedReports.map((report, i) => {
                        const isLatest = i === sortedReports.length - 1
                        const hasCollectionDate = !!report.lab?.collectedAt

                        const displayDate = hasCollectionDate
                          ? new Date(report.lab.collectedAt).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })
                          : new Date(report.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })

                        return (
                          <Link
                            key={report._id}
                            href={`/results/${report._id}`}
                            className={`flex-shrink-0 rounded-xl p-4 border transition-colors min-w-[160px]
                              ${isLatest
                                ? 'bg-teal-50 border-teal-200'
                                : 'bg-stone-50 border-stone-100 hover:border-teal-200'
                              }`}
                          >
                            {isLatest && (
                              <span className="text-xs bg-teal-600 text-white px-2 py-0.5 rounded-full mb-2 inline-block">
                                Latest
                              </span>
                            )}
                            <p className="text-xs font-medium text-stone-500 mb-0.5">
                              Report {i + 1}
                            </p>
                            <p className="text-sm font-semibold text-stone-800">
                              {displayDate}
                            </p>
                            <p className="text-xs text-stone-400 mt-0.5">
                              {hasCollectionDate ? 'Sample collected' : 'Uploaded date'}
                            </p>
                            {report.lab?.labName && (
                              <p className="text-xs text-stone-400 mt-1 truncate">
                                {report.lab.labName}
                              </p>
                            )}
                            {report.urgentFlags?.length > 0 && (
                              <p className="text-xs text-red-500 mt-1">
                                ⚠ {report.urgentFlags.length} urgent
                              </p>
                            )}
                          </Link>
                        )
                      })}
                    </div>
                  </div>

                  {/* Trend + Advice — expanded */}
                  {selected === type && (
                    <div className="border-t border-stone-50">
                      {sortedReports.length < 2 ? (
                        <div className="px-6 py-6 text-center">
                          <p className="text-sm text-stone-400">
                            Trend dekhne ke liye ek aur{' '}
                            <span className="font-medium">{type}</span> report upload karo
                          </p>
                          <Link href="/upload"
                            className="text-sm text-teal-600 underline mt-2 inline-block">
                            Upload karo →
                          </Link>
                        </div>
                      ) : (
                        <div className="px-6 py-6">

                          {/* Parameter trends */}
                          <p className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-4">
                            Parameter wise Trends
                          </p>
                          <div className="space-y-4 mb-8">
                            {[...allParams].map(paramName => {
                              const trend = getTrend(sortedReports, paramName)
                              if (trend.length < 2) return null

                              const arrow  = getTrendArrow(trend)
                              const advice = getTrendAdvice(paramName, trend)
                              const latest = trend[trend.length - 1]

                              return (
                                <div key={paramName}
                                  className="bg-stone-50 rounded-2xl p-4">

                                  <div className="flex items-center justify-between mb-3">
                                    <div>
                                      <span className="text-sm font-semibold text-stone-800">
                                        {paramName}
                                      </span>
                                      <span className={`text-xs px-2 py-0.5 rounded-full ml-2 font-medium ${statusColor(latest.status)}`}>
                                        {latest.status}
                                      </span>
                                    </div>
                                    {arrow && (
                                      <span className={`text-sm font-bold ${arrow.color}`}>
                                        {arrow.arrow} {arrow.label}
                                      </span>
                                    )}
                                  </div>

                                  {/* Values */}
                                  <div className="flex items-center gap-2 flex-wrap mb-3">
                                    {trend.map((item, i) => (
                                      <div key={i} className="flex items-center gap-2">
                                        <div className="text-center">
                                          <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${statusColor(item.status)}`}>
                                            {item.value} {item.unit}
                                          </span>
                                          <p className="text-xs text-stone-400 mt-1">
                                            {item.date.toLocaleDateString('en-IN', {
                                              day: 'numeric', month: 'short', year: '2-digit'
                                            })}
                                          </p>
                                        </div>
                                        {i < trend.length - 1 && (
                                          <span className="text-stone-300 text-sm mb-4">→</span>
                                        )}
                                      </div>
                                    ))}
                                  </div>

                                  {/* Per parameter advice */}
                                  {advice && (
                                    <div className={`border rounded-xl px-4 py-3 text-sm flex gap-2 items-start ${adviceStyle[advice.type]}`}>
                                      <span className="flex-shrink-0 font-bold">
                                        {adviceIcon[advice.type]}
                                      </span>
                                      <p>{advice.text}</p>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>

                          {/* Accumulated Advice */}
                          {(() => {
                            const advice = getAccumulatedAdvice(sortedReports)
                            if (!advice) return null
                            const hasContent = advice.critical.length > 0 ||
                              advice.diet.length > 0 ||
                              advice.lifestyle.length > 0
                            if (!hasContent) return null

                            return (
                              <div className="border-t border-stone-100 pt-6">
                                <h3 className="text-sm font-semibold text-stone-700 mb-4 uppercase tracking-wide">
                                  Accumulated Advice — Latest Report ke Basis Pe
                                </h3>

                                {advice.critical.length > 0 && (
                                  <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-4">
                                    <p className="text-sm font-semibold text-red-700 mb-2">⚠ Urgent</p>
                                    {advice.critical.map((item, i) => (
                                      <p key={i} className="text-sm text-red-700 mb-1">• {item}</p>
                                    ))}
                                  </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {advice.diet.length > 0 && (
                                    <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
                                      <p className="text-sm font-semibold text-green-800 mb-3">
                                        🥗 Kya Khayein / Kya Nahi
                                      </p>
                                      {advice.diet.map((item, i) => (
                                        <p key={i} className="text-sm text-green-800 mb-2 flex gap-2">
                                          <span className="flex-shrink-0 text-green-400">•</span>
                                          {item}
                                        </p>
                                      ))}
                                    </div>
                                  )}

                                  {advice.lifestyle.length > 0 && (
                                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                                      <p className="text-sm font-semibold text-blue-800 mb-3">
                                        🏃 Lifestyle Changes
                                      </p>
                                      {advice.lifestyle.map((item, i) => (
                                        <p key={i} className="text-sm text-blue-800 mb-2 flex gap-2">
                                          <span className="flex-shrink-0 text-blue-400">•</span>
                                          {item}
                                        </p>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {advice.nextTest && (
                                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mt-4">
                                    <p className="text-sm font-semibold text-amber-800 mb-1">
                                      📅 Next Test Reminder
                                    </p>
                                    <p className="text-sm text-amber-800">{advice.nextTest}</p>
                                  </div>
                                )}
                              </div>
                            )
                          })()}

                        </div>
                      )}
                    </div>
                  )}

                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}