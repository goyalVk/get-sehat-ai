import { connectDB } from '@/lib/mongodb'
import Report from '@/models/report'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const statusConfig = {
  normal:   { bg: 'bg-green-50',  border: 'border-green-100',  badge: 'bg-green-100 text-green-700',  label: 'Normal ✓' },
  low:      { bg: 'bg-amber-50',  border: 'border-amber-100',  badge: 'bg-amber-100 text-amber-700',  label: 'Low ↓' },
  high:     { bg: 'bg-red-50',    border: 'border-red-100',    badge: 'bg-red-100 text-red-700',      label: 'High ↑' },
  critical: { bg: 'bg-red-100',   border: 'border-red-300',    badge: 'bg-red-600 text-white',        label: '⚠ Urgent' },
}

export default async function ResultsPage({ params }) {
  const { id } = await params
  await connectDB()
  const report = await Report.findById(id).lean()
  if (!report) notFound()

  if (report.status === 'processing') {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-medium text-stone-700">Report analyze ho rahi hai...</p>
          <p className="text-sm text-stone-400 mt-1">Usually 20-30 seconds</p>
          <meta httpEquiv="refresh" content="3" />
        </div>
      </main>
    )
  }

  if (report.status === 'failed') {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-4">❌</div>
          <p className="font-medium text-stone-800 mb-2">Report analyze nahi ho saki</p>
          <p className="text-sm text-stone-400 mb-6">{report.errorMessage || 'Dobara try karo.'}</p>
          <Link href="/upload" className="bg-teal-600 text-white px-6 py-3 rounded-2xl text-sm font-medium">
            Dobara try karo
          </Link>
        </div>
      </main>
    )
  }

  const result = report.result

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-stone-800 serif">{result.report_type || 'Lab Report'}</h1>
          <p className="text-sm text-stone-400 mt-0.5">{report.fileName}</p>
        </div>
        <Link href="/upload"
          className="text-sm bg-stone-100 hover:bg-stone-200 px-4 py-2 rounded-xl text-stone-600 transition-colors flex-shrink-0 ml-4">
          New report
        </Link>
      </div>

      {/* Urgent flags */}
      {result.urgent_flags?.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-5">
          <h2 className="font-semibold text-red-700 mb-3">⚠️ Turant doctor se milo</h2>
          {result.urgent_flags.map((flag, i) => (
            <p key={i} className="text-sm text-red-600 mb-1.5">• {flag}</p>
          ))}
          <p className="text-xs text-red-400 mt-3 border-t border-red-100 pt-3">
            Yeh values serious hain — aaj hi apne doctor se baat karo.
          </p>
        </div>
      )}

      {/* Summary */}
      <div className="bg-teal-50 border border-teal-100 rounded-2xl p-5 mb-5">
        <h2 className="font-semibold text-teal-800 mb-2 text-sm uppercase tracking-wide">Summary</h2>
        <p className="text-sm text-teal-900 leading-relaxed">{result.summary}</p>
      </div>

      {/* Parameters */}
      <h2 className="font-medium text-stone-400 text-xs uppercase tracking-widest mb-3">
        Saari values ({result.parameters?.length || 0})
      </h2>

      <div className="space-y-3 mb-6">
        {result.parameters?.map((param, i) => {
          const style = statusConfig[param.status] || statusConfig.normal
          return (
            <div key={i} className={`rounded-2xl p-5 border ${style.bg} ${style.border}`}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <span className="font-medium text-stone-800 text-sm">{param.name}</span>
                  <span className="text-stone-600 text-sm ml-2">{param.value} {param.unit}</span>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full flex-shrink-0 ${style.badge}`}>
                  {style.label}
                </span>
              </div>
              <p className="text-xs text-stone-400 mb-2">Normal: {param.reference_range}</p>
              <p className="text-sm text-stone-700 leading-relaxed">{param.explanation}</p>
              {param.status !== 'normal' && param.action && (
                <div className="mt-3 pt-3 border-t border-stone-200">
                  <p className="text-xs font-semibold text-stone-500 mb-1">KYA KARNA HAI:</p>
                  <p className="text-sm text-stone-700">{param.action}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Doctor questions */}
      {result.doctor_questions?.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-5">
          <h2 className="font-semibold text-blue-800 mb-3 text-sm">Doctor se yeh poochho</h2>
          {result.doctor_questions.map((q, i) => (
            <div key={i} className="flex gap-3 mb-2.5 last:mb-0">
              <span className="text-blue-300 font-medium text-sm flex-shrink-0">{i + 1}.</span>
              <p className="text-sm text-blue-800 leading-relaxed">{q}</p>
            </div>
          ))}
        </div>
      )}

      {/* Lifestyle tip */}
      {result.lifestyle_note && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-5">
          <h2 className="font-semibold text-amber-800 mb-2 text-sm">💡 Lifestyle tip</h2>
          <p className="text-sm text-amber-900 leading-relaxed">{result.lifestyle_note}</p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-stone-100 rounded-2xl p-4 mb-6">
        <p className="text-xs text-stone-400 leading-relaxed text-center">{result.disclaimer}</p>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <Link href="/upload"
          className="flex-1 py-3.5 bg-teal-600 text-white rounded-2xl text-sm text-center hover:bg-teal-700 transition-colors font-medium">
          New report →
        </Link>
      </div>
    </main>
  )
}