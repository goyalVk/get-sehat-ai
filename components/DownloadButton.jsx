'use client'

export default function DownloadButton({ report, result }) {
  const handleDownload = () => {
    const content = `
SEHAT24 — REPORT INTERPRETATION
=================================
Report Type: ${result.report_type || 'Lab Report'}
File: ${report.fileName}
${report.lab?.collectedAt
  ? `Test Date: ${new Date(report.lab.collectedAt).toLocaleDateString('en-IN')}`
  : `Uploaded: ${new Date(report.createdAt).toLocaleDateString('en-IN')}`
}
${report.patient?.name ? `Patient: ${report.patient.name}` : ''}
${report.patient?.age ? `Age: ${report.patient.age}` : ''}
${report.lab?.labName ? `Lab: ${report.lab.labName}` : ''}
${report.lab?.referredBy ? `Referred by: Dr. ${report.lab.referredBy}` : ''}

SUMMARY
-------
${result.summary}

ALL VALUES
----------
${result.parameters?.map(p =>
  `${p.name}: ${p.value} ${p.unit} — ${p.status.toUpperCase()}
  Normal range: ${p.reference_range}
  ${p.explanation}
  ${p.status !== 'normal' ? `Action: ${p.action}` : ''}`
).join('\n\n')}

${result.urgent_flags?.length > 0
  ? `URGENT FLAGS\n------------\n${result.urgent_flags.join('\n')}\n`
  : ''
}
ASK YOUR DOCTOR
---------------
${result.doctor_questions?.map((q, i) => `${i + 1}. ${q}`).join('\n')}

LIFESTYLE TIP
-------------
${result.lifestyle_note}

---
${result.disclaimer}
    `.trim()

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sehat-ai-${report.fileName}-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={handleDownload}
      className="w-full py-3.5 border border-stone-200 rounded-2xl text-sm text-stone-500 hover:bg-stone-50 hover:text-stone-700 hover:border-stone-300 transition-colors bg-white flex items-center justify-center gap-2 cursor-pointer"
    >
      ⬇ Download Report Summary
    </button>
  )
}