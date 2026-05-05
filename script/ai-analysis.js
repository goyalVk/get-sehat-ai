/**
 * SEHAT24 — AI ACCURACY CHECKER v4
 * Date filtered version — check specific date/time range
 *
 * Run: node scripts/sehat24_ai_accuracy_v4.mjs
 */

import mongoose from 'mongoose'
import fs from 'fs'

const MONGO_URI ="mongodb+srv://vkgoyalvk85:Vivek007@get-sehat-ai.l6cglqo.mongodb.net/getsehat?retryWrites=true&w=majority&appName=get-sehat-ai"

if (!MONGO_URI) {
  console.error('❌ MONGODB_URI not found in .env.local')
  process.exit(1)
}

// ── DATE FILTER — Change these as needed ─────────────
// Check records AFTER 1st May 2026 1:00 PM IST
// IST = UTC+5:30, so 1:00 PM IST = 07:30 UTC
const FILTER_FROM = new Date('2026-05-04T07:30:00.000Z') // 1 May 1 PM IST
const FILTER_TO   =  new Date('2026-05-05T07:30:00.000Z')  // null = no end limit (till now)

// To check all records, set both to null
// const FILTER_FROM = null
// const FILTER_TO   = null
// ─────────────────────────────────────────────────────

const ReportSchema = new mongoose.Schema({
  userId:         String,
  fileName:       String,
  fileType:       String,
  status:         String,
  isSample:       Boolean,
  errorMessage:   String,
  patient:        mongoose.Schema.Types.Mixed,
  reportType:     String,
  reportCategory: String,
  result:         mongoose.Schema.Types.Mixed,
  parameters:     mongoose.Schema.Types.Mixed,
  urgentFlags:    [String],
  tokensUsed:     mongoose.Schema.Types.Mixed,
  analysisTimeMs: Number,
  modelUsed:      String,
}, { timestamps: true })

const Report = mongoose.models.Report ||
  mongoose.model('Report', ReportSchema)

// ── Parse reference range ─────────────────────────────
function parseRange(rangeStr) {
  if (!rangeStr || typeof rangeStr !== 'string') return null
  const s = rangeStr.trim()

  const between = s.match(/^([\d.]+)\s*(?:[-–—]|to)\s*([\d.]+)/i)
  if (between) {
    const low  = parseFloat(between[1])
    const high = parseFloat(between[2])
    if (isNaN(low) || isNaN(high) || low > high) return null
    return { low, high }
  }

  const lessThan = s.match(/^(?:[<≤]|less\s+than)\s*([\d.]+)/i)
  if (lessThan) return { low: 0, high: parseFloat(lessThan[1]) }

  const greaterThan = s.match(/^(?:[>≥]|greater\s+than)\s*([\d.]+)/i)
  if (greaterThan) return { low: parseFloat(greaterThan[1]), high: Infinity }

  const upto = s.match(/up\s*to\s*([\d.]+)/i)
  if (upto) return { low: 0, high: parseFloat(upto[1]) }

  return null
}

// ── Unit normalization ────────────────────────────────
function normalizeUnits(rawValue, range, paramName) {
  const val  = parseFloat(rawValue)
  const name = (paramName || '').toLowerCase()

  const isWBC = name.includes('wbc') || name.includes('tlc') ||
    name.includes('leucocyte') || name.includes('leukocyte') ||
    name.includes('total wbc') || name.includes('white blood')

  if (isWBC && val < 500 && range.high > 500) return val * 1000
  if (isWBC && val > 500 && range.high < 500) return val / 1000

  const isPlatelet = name.includes('platelet') ||
    name.includes('plt') || name.includes('thrombocyte')

  if (isPlatelet && val > 10000 && range.high < 1000) return val / 100000
  if (isPlatelet && val < 100 && range.low > 1000)    return val * 100000

  const isHCT = name.includes('hematocrit') ||
    name.includes('haematocrit') || name.includes('hct') ||
    name.includes('pcv')

  if (isHCT && val < 1 && range.low > 1) return val * 100

  return val
}

// ── Status helpers ────────────────────────────────────
function getActualStatus(val, range) {
  if (val < range.low)  return 'low'
  if (val > range.high) return 'high'
  return 'normal'
}

function normalizeAIStatus(status) {
  if (!status) return null
  const s = status.toLowerCase().trim()
  if (['normal', 'low', 'high', 'critical'].includes(s)) return s
  return null
}

function wasCorrect(aiStatus, actualStatus) {
  if (aiStatus === actualStatus) return true
  if (aiStatus === 'critical' && actualStatus !== 'normal') return true
  return false
}

// ── Extract AI summary ────────────────────────────────
function getAISummary(result) {
  if (!result) return null
  const s = result.summary || result.overall_summary ||
    result.ai_summary || result.interpretation ||
    result.health_summary || result.findings ||
    result.conclusion || result.report_summary
  if (s && typeof s === 'string') return s.substring(0, 400)
  return null
}

// ── Format date for display ───────────────────────────
function fmtDate(d) {
  if (!d) return 'N/A'
  const dt = new Date(d)
  return dt.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
    timeZone: 'Asia/Kolkata'
  })
}

// ── MAIN ──────────────────────────────────────────────
async function run() {
  await mongoose.connect(MONGO_URI)

  // Build date query
  const dateQuery = {}
  if (FILTER_FROM) dateQuery.$gte = FILTER_FROM
  if (FILTER_TO)   dateQuery.$lte = FILTER_TO

  const query = {
    status:   'completed',
    isSample: { $ne: true },
    ...(Object.keys(dateQuery).length > 0 ? { createdAt: dateQuery } : {})
  }

  const reports = await Report.find(query)
    .sort({ createdAt: 1 })
    .lean()

  const fromLabel = FILTER_FROM ? fmtDate(FILTER_FROM) : 'All time'
  const toLabel   = FILTER_TO   ? fmtDate(FILTER_TO)   : 'Now'

  console.log('\n' + '═'.repeat(68))
  console.log('  SEHAT24 — AI ACCURACY CHECKER v4 (Date Filtered)')
  console.log(`  Period: ${fromLabel}  →  ${toLabel}`)
  console.log(`  Reports found: ${reports.length}`)
  console.log('═'.repeat(68))

  if (reports.length === 0) {
    console.log('\n⚠️  No reports found in this date range.')
    console.log('   Try changing FILTER_FROM / FILTER_TO at top of script.')
    await mongoose.disconnect()
    return
  }

  // ── Counters ──
  let totalParams = 0, skippedNoValue = 0, skippedBadValue = 0
  let skippedNoRange = 0, skippedBadRange = 0, skippedNoStatus = 0
  let unitNormalized = 0, evaluated = 0, correct = 0
  let wrongSevere = 0, wrongMedium = 0

  const severeList = [], mediumList = []
  const byType = {}, paramErrCount = {}

  for (const report of reports) {
    const params     = report.parameters || []
    const reportId   = report._id.toString()
    const reportType = report.reportType || 'Unknown'
    const storedAt   = fmtDate(report.createdAt)
    const aiSummary  = getAISummary(report.result)

    if (!byType[reportType]) {
      byType[reportType] = {
        count: 0, evaluated: 0, correct: 0,
        severe: 0, medium: 0
      }
    }
    byType[reportType].count++

    for (const param of params) {
      totalParams++

      const rawValue = param.value
      if (!rawValue || String(rawValue).trim() === '') { skippedNoValue++; continue }

      const numValue = parseFloat(rawValue)
      if (isNaN(numValue)) { skippedBadValue++; continue }

      const rawRange = param.reference_range
      if (!rawRange || String(rawRange).trim() === '') { skippedNoRange++; continue }

      const range = parseRange(rawRange)
      if (!range) { skippedBadRange++; continue }

      const aiStatus = normalizeAIStatus(param.status)
      if (!aiStatus) { skippedNoStatus++; continue }

      const beforeNorm = numValue
      const normValue  = normalizeUnits(numValue, range, param.name)
      if (normValue !== beforeNorm) unitNormalized++

      evaluated++
      byType[reportType].evaluated++

      const actualStatus = getActualStatus(normValue, range)
      const isCorrect    = wasCorrect(aiStatus, actualStatus)

      if (isCorrect) {
        correct++
        byType[reportType].correct++
        continue
      }

      const isSevere = aiStatus === 'normal' && actualStatus !== 'normal'

      if (isSevere) {
        wrongSevere++
        byType[reportType].severe++
        const key = (param.name || 'Unknown').trim()
        paramErrCount[key] = (paramErrCount[key] || 0) + 1

        if (severeList.length < 300) {
          severeList.push({
            reportId,
            storedAt,
            reportType,
            fileName:           report.fileName,
            paramName:          param.name,
            storedValue:        rawValue,
            normalizedValue:    normValue !== numValue ? normValue : null,
            referenceRange:     rawRange,
            parsedRange:        `${range.low}–${range.high}`,
            aiSaid:             aiStatus,
            shouldBe:           actualStatus,
            aiExplanation:      (param.explanation || '').substring(0, 250),
            aiAction:           (param.action || '').substring(0, 150),
            aiSummary:          aiSummary ? aiSummary.substring(0, 350) : null,
          })
        }
      } else {
        wrongMedium++
        byType[reportType].medium++

        if (mediumList.length < 200) {
          mediumList.push({
            reportId,
            storedAt,
            reportType,
            fileName:           report.fileName,
            paramName:          param.name,
            storedValue:        rawValue,
            normalizedValue:    normValue !== numValue ? normValue : null,
            referenceRange:     rawRange,
            parsedRange:        `${range.low}–${range.high}`,
            aiSaid:             aiStatus,
            shouldBe:           actualStatus,
            aiExplanation:      (param.explanation || '').substring(0, 250),
            aiSummary:          aiSummary ? aiSummary.substring(0, 350) : null,
          })
        }
      }
    }
  }

  // ── Stats ──
  const totalWrong = wrongSevere + wrongMedium
  const accuracy   = evaluated > 0 ? ((correct / evaluated) * 100).toFixed(2) : '0.00'
  const sevRate    = evaluated > 0 ? ((wrongSevere / evaluated) * 100).toFixed(2) : '0.00'
  const medRate    = evaluated > 0 ? ((wrongMedium / evaluated) * 100).toFixed(2) : '0.00'

  const worstParams = Object.entries(paramErrCount)
    .sort((a, b) => b[1] - a[1]).slice(0, 15)

  const typeRanked = Object.entries(byType)
    .filter(([, v]) => v.evaluated >= 2)
    .sort((a, b) => b[1].severe - a[1].severe)

  // ── Build output ──
  const lines = []
  const L = (s = '') => lines.push(s)

  L('═'.repeat(68))
  L('  SEHAT24 — AI ACCURACY CHECKER v4')
  L(`  Period: ${fromLabel}  →  ${toLabel}`)
  L('═'.repeat(68))

  L('\n┌─ DATA SUMMARY ─────────────────────────────────────────┐')
  L(`  Total Reports in period:    ${reports.length}`)
  L(`  Total Parameters:           ${totalParams}`)
  L(`  Evaluated:                  ${evaluated}`)
  L(`  Unit Normalizations:        ${unitNormalized}`)
  L(`  Skipped (no value):         ${skippedNoValue}`)
  L(`  Skipped (non-numeric):      ${skippedBadValue}`)
  L(`  Skipped (no range):         ${skippedNoRange}`)
  L(`  Skipped (bad range):        ${skippedBadRange}`)
  L('└────────────────────────────────────────────────────────┘')

  L('\n┌─ AI ACCURACY ──────────────────────────────────────────┐')
  L(`  ✅ Correct:                 ${correct}`)
  L(`  ❌ Total Wrong:             ${totalWrong}`)
  L(`  🔴 SEVERE:                 ${wrongSevere}  ← AI said NORMAL, was ABNORMAL`)
  L(`  ⚠️  MEDIUM:                 ${wrongMedium}  ← AI said ABNORMAL, was NORMAL`)
  L('')
  L(`  📊 OVERALL ACCURACY:       ${accuracy}%`)
  L(`  📊 SEVERE ERROR RATE:      ${sevRate}%`)
  L(`  📊 MEDIUM ERROR RATE:      ${medRate}%`)
  L('')
  const acc = parseFloat(accuracy)
  if      (acc >= 97) L('  STATUS: ✅ EXCELLENT — AI fix kaam kar raha hai!')
  else if (acc >= 93) L('  STATUS: ⚠️  GOOD — kuch aur improvement chahiye')
  else if (acc >= 85) L('  STATUS: 🟠 MODERATE — fix aur karo')
  else                L('  STATUS: 🔴 CRITICAL — immediately fix karo')
  L('└────────────────────────────────────────────────────────┘')

  L('\n┌─ PARAMS WITH MOST ERRORS ──────────────────────────────┐')
  if (worstParams.length === 0) {
    L('  ✅ No errors found in this period!')
  } else {
    worstParams.forEach(([name, count], i) => {
      L(`  ${String(i+1).padStart(2)}. ${name.padEnd(40)} ${count} errors`)
    })
  }
  L('└────────────────────────────────────────────────────────┘')

  // ── SEVERE errors ──
  L('\n┌─ SEVERE ERRORS — AI said NORMAL, was ABNORMAL ─────────┐')
  L('  🔴 These are DANGEROUS — user gets wrong health info')
  L('')

  if (severeList.length === 0) {
    L('  ✅ ZERO severe errors in this period!')
    L('  🎉 AI fix is working!')
  } else {
    severeList.forEach((e, i) => {
      L(`  ─── Error #${i+1} ` + '─'.repeat(50))
      L(`  Report ID:    ${e.reportId}`)
      L(`  Stored At:    ${e.storedAt}`)
      L(`  File:         ${e.fileName}`)
      L(`  Report Type:  ${e.reportType}`)
      L('')
      L(`  Parameter:    ${e.paramName}`)
      L(`  Stored Value: ${e.storedValue}`)
      if (e.normalizedValue !== null) {
        L(`  Normalized:   ${e.normalizedValue}  ← unit fix applied`)
      }
      L(`  DB Range:     ${e.referenceRange}`)
      L(`  AI Status:    ${e.aiSaid}  ← WRONG`)
      L(`  Should Be:    ${e.shouldBe}`)
      L('')
      L(`  AI Explanation: "${e.aiExplanation || 'Not stored'}"`)
      L(`  AI Action:      "${e.aiAction || 'Not stored'}"`)
      L('')
      if (e.aiSummary) {
        L(`  AI Summary:`)
        L(`  "${e.aiSummary}"`)
      }
      L('')
    })
  }
  L('└────────────────────────────────────────────────────────┘')

  // ── MEDIUM errors ──
  L('\n┌─ MEDIUM ERRORS — AI said ABNORMAL, was NORMAL ─────────┐')
  L('  ⚠️  These cause unnecessary patient anxiety')
  L('')

  if (mediumList.length === 0) {
    L('  ✅ ZERO medium errors in this period!')
  } else {
    mediumList.slice(0, 30).forEach((e, i) => {
      L(`  ─── Error #${i+1} ` + '─'.repeat(50))
      L(`  Report ID:    ${e.reportId}`)
      L(`  Stored At:    ${e.storedAt}`)
      L(`  File:         ${e.fileName}`)
      L(`  Report Type:  ${e.reportType}`)
      L('')
      L(`  Parameter:    ${e.paramName}`)
      L(`  Stored Value: ${e.storedValue}`)
      L(`  DB Range:     ${e.referenceRange}`)
      L(`  AI Status:    ${e.aiSaid}  ← Possibly wrong`)
      L(`  Should Be:    ${e.shouldBe}`)
      L('')
      L(`  AI Explanation: "${e.aiExplanation || 'Not stored'}"`)
      L('')
    })
    if (mediumList.length > 30) {
      L(`  ... and ${mediumList.length - 30} more in JSON`)
    }
  }
  L('└────────────────────────────────────────────────────────┘')

  // ── By report type ──
  L('\n┌─ ACCURACY BY REPORT TYPE ──────────────────────────────┐')
  if (typeRanked.length === 0) {
    L('  No report types with enough data')
  } else {
    typeRanked.forEach(([type, s]) => {
      const a    = s.evaluated > 0
        ? ((s.correct / s.evaluated) * 100).toFixed(1) : 'N/A'
      const icon = s.severe > 3 ? '🔴' : s.severe > 0 ? '⚠️ ' : '✅'
      const name = type.length > 45 ? type.substring(0, 42) + '...' : type
      L(`  ${icon} ${name}`)
      L(`     Reports:${s.count}  Evaluated:${s.evaluated}  Acc:${a}%  Severe:${s.severe}  Medium:${s.medium}`)
      L('')
    })
  }
  L('└────────────────────────────────────────────────────────┘')

  L('\n' + '═'.repeat(68))
  L(`  PERIOD: ${fromLabel} → ${toLabel}`)
  L(`  ACCURACY: ${accuracy}% | Evaluated: ${evaluated}`)
  L(`  Severe: ${wrongSevere} | Medium: ${wrongMedium} | Unit fixes: ${unitNormalized}`)
  L('═'.repeat(68))

  const summaryText = lines.join('\n')
  console.log(summaryText)

  // Save
  const suffix = FILTER_FROM
    ? `_from_${FILTER_FROM.toISOString().substring(0,10)}`
    : '_all'

  fs.writeFileSync(`sehat24_accuracy_v4${suffix}_summary.txt`, summaryText, 'utf8')
  fs.writeFileSync(`sehat24_accuracy_v4${suffix}_full.json`, JSON.stringify({
    period: { from: FILTER_FROM, to: FILTER_TO },
    accuracy: parseFloat(accuracy),
    severeRate: parseFloat(sevRate),
    mediumRate: parseFloat(medRate),
    totalReports: reports.length,
    totalParams, evaluated, correct,
    wrongSevere, wrongMedium, unitNormalized,
    worstParams: Object.fromEntries(worstParams),
    severeErrors: severeList,
    mediumErrors: mediumList,
    byReportType: byType
  }, null, 2), 'utf8')

  console.log(`\n✅ Saved: sehat24_accuracy_v4${suffix}_summary.txt`)
  console.log(`✅ Saved: sehat24_accuracy_v4${suffix}_full.json\n`)

  await mongoose.disconnect()
}

run().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
