'use strict'

const mongoose = require('mongoose')
const fs       = require('fs')
const path     = require('path')

// ── ANSI colours ──────────────────────────────────────────────────────────────
const C = {
  reset: '\x1b[0m', bold:    '\x1b[1m',
  red:   '\x1b[31m', green:  '\x1b[32m', yellow: '\x1b[33m',
  blue:  '\x1b[34m', cyan:   '\x1b[36m', gray:   '\x1b[90m',
  white: '\x1b[97m', magenta:'\x1b[35m',
}
const b  = s => `${C.bold}${s}${C.reset}`
const g  = s => `${C.green}${s}${C.reset}`
const r  = s => `${C.red}${s}${C.reset}`
const y  = s => `${C.yellow}${s}${C.reset}`
const cy = s => `${C.cyan}${s}${C.reset}`
const gr = s => `${C.gray}${s}${C.reset}`
const mg = s => `${C.magenta}${s}${C.reset}`

// ── Load .env.local ───────────────────────────────────────────────────────────
function loadEnv() {
  const envFile = path.resolve(__dirname, '../.env.local')
  if (!fs.existsSync(envFile)) {
    console.warn(y('⚠  .env.local not found — using process.env directly'))
    return
  }
  const lines = fs.readFileSync(envFile, 'utf8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
    if (key && !process.env[key]) process.env[key] = val
  }
}

loadEnv()

const MONGODB_URI = "mongodb+srv://vkgoyalvk85:Vivek007@get-sehat-ai.l6cglqo.mongodb.net/getsehat?retryWrites=true&w=majority&appName=get-sehat-ai"
if (!MONGODB_URI) {
  console.error(r('❌ MONGODB_URI not found'))
  process.exit(1)
}

// ── Known error patterns — these are already categorized, exclude them ────────
const KNOWN_PATTERNS = [
  'credit balance is too low',
  'credit',
  'low_quality',
  'non_medical',
  'password protected',
  'file_too_small',
  'rate_limit_error',
  'image exceeds 5 mb',
  'bahut bada',   // PDF too large
  'bahut badi',   // image too large
  'overload',
  '529',
  'timeout',
  'timed out',
]

// ── Minimal Report schema (read-only, no validation needed) ───────────────────
const ReportSchema = new mongoose.Schema({
  status:        String,
  errorMessage:  String,
  errorType:     String,
  spamReason:    String,
  isSpam:        Boolean,
  isNonMedical:  Boolean,
  preCheckFailed:Boolean,
  retryCount:    Number,
  fileType:      String,
  fileSize:      Number,
  userId:        String,
  anonId:        String,
  createdAt:     Date,
  updatedAt:     Date,
}, { strict: false, timestamps: true })

const Report = mongoose.models.Report || mongoose.model('Report', ReportSchema, 'reports')

// ── Normalise an error message into a fingerprint for grouping ────────────────
// Strips dynamic parts: UUIDs, object IDs, file sizes, byte counts, URLs
function fingerprint(msg) {
  return msg
    .replace(/[0-9a-f]{24}/gi,   '<id>')        // MongoDB ObjectId
    .replace(/[0-9a-f-]{36}/gi,  '<uuid>')       // UUID
    .replace(/\b\d{4,}\s*bytes?\b/gi, '<N bytes>') // byte counts
    .replace(/\b\d+(\.\d+)?\s*(mb|kb|gb)\b/gi,  '<N MB>') // file sizes
    .replace(/https?:\/\/\S+/g,  '<url>')        // URLs
    .replace(/\b[a-f0-9]{8,}\b/gi, '<hex>')      // long hex strings
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(b('\n══════════════════════════════════════════════'))
  console.log(b('  Sehat24 — Unknown Error Investigation'))
  console.log(b('══════════════════════════════════════════════\n'))

  await mongoose.connect(MONGODB_URI)
  console.log(g('✅ MongoDB connected\n'))

  // ── 1. All failed reports ─────────────────────────────────────────────────
  const allFailed = await Report.find({ status: 'failed' }).lean()
  console.log(`${b('Total failed reports:')} ${r(allFailed.length)}`)

  // ── 2. Reports with null errorMessage ────────────────────────────────────
  const nullErrorMsg = allFailed.filter(d => !d.errorMessage)
  console.log(`${b('  → errorMessage is null/empty:')} ${y(nullErrorMsg.length)}`)

  // ── 3. Reports with no errorType field ───────────────────────────────────
  const noErrorType = allFailed.filter(d => d.errorType === undefined || d.errorType === null)
  console.log(`${b('  → errorType field missing/null:')} ${y(noErrorType.length)}`)

  // ── 4. Reports stuck in "processing" ─────────────────────────────────────
  const stuckProcessing = await Report.find({ status: 'processing' }).lean()
  console.log(`${b('  → stuck in "processing" status:')} ${y(stuckProcessing.length)}`)
  if (stuckProcessing.length > 0) {
    const oldest = stuckProcessing.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0]
    console.log(gr(`     oldest: ${oldest.createdAt?.toISOString?.() ?? 'unknown'} — _id: ${oldest._id}`))
  }

  // ── 5. Unknown reports — exclude known patterns ───────────────────────────
  console.log(b('\n──────────────────────────────────────────────'))
  console.log(b('  Unknown / Uncategorized Failures'))
  console.log(b('──────────────────────────────────────────────\n'))

  const withError = allFailed.filter(d => !!d.errorMessage)
  const unknown   = withError.filter(d => {
    const msg = d.errorMessage.toLowerCase()
    return !KNOWN_PATTERNS.some(p => msg.includes(p))
  })

  console.log(`Reports with errorMessage:   ${cy(withError.length)}`)
  console.log(`Excluded by known patterns:  ${g(withError.length - unknown.length)}`)
  console.log(`Unknown / unmatched:         ${r(unknown.length)}\n`)

  if (unknown.length === 0) {
    console.log(g('🎉 No unknown errors found — all failures are categorized!\n'))
  } else {
    // ── 6. Group by fingerprinted error pattern ─────────────────────────────
    const groups = {}
    for (const doc of unknown) {
      const fp = fingerprint(doc.errorMessage)
      if (!groups[fp]) {
        groups[fp] = { count: 0, sample: doc.errorMessage, docs: [] }
      }
      groups[fp].count++
      if (groups[fp].docs.length < 3) groups[fp].docs.push(doc._id.toString())
    }

    const sorted = Object.entries(groups).sort((a, b) => b[1].count - a[1].count)

    console.log(b(`${sorted.length} unique error pattern(s):\n`))

    sorted.forEach(([fp, info], i) => {
      const rank = String(i + 1).padStart(2, ' ')
      console.log(`${cy(`${rank}.`)} ${b(`[${info.count}x]`)} ${r(info.sample)}`)
      console.log(gr(`      fingerprint: ${fp}`))
      console.log(gr(`      sample _ids: ${info.docs.join(', ')}`))
      console.log()
    })
  }

  // ── 7. errorType distribution across ALL failed ───────────────────────────
  console.log(b('──────────────────────────────────────────────'))
  console.log(b('  errorType Field Distribution'))
  console.log(b('──────────────────────────────────────────────\n'))

  const typeCounts = {}
  for (const doc of allFailed) {
    const t = doc.errorType || '(none / null)'
    typeCounts[t] = (typeCounts[t] || 0) + 1
  }
  const typeSorted = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])
  typeSorted.forEach(([t, count]) => {
    const pct = ((count / allFailed.length) * 100).toFixed(1)
    const bar = '█'.repeat(Math.round(count / allFailed.length * 20))
    console.log(`  ${mg(t.padEnd(24))} ${String(count).padStart(5)}  ${pct.padStart(5)}%  ${cy(bar)}`)
  })

  // ── 8. retryCount distribution ────────────────────────────────────────────
  console.log(b('\n──────────────────────────────────────────────'))
  console.log(b('  Retry Count Distribution (failed reports)'))
  console.log(b('──────────────────────────────────────────────\n'))

  const retryCounts = {}
  for (const doc of allFailed) {
    const rc = doc.retryCount ?? 0
    retryCounts[rc] = (retryCounts[rc] || 0) + 1
  }
  Object.entries(retryCounts)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .forEach(([rc, count]) => {
      const pct = ((count / allFailed.length) * 100).toFixed(1)
      console.log(`  retryCount=${y(String(rc).padEnd(3))}  ${String(count).padStart(5)} reports  ${pct}%`)
    })

  // ── 9. Build export ───────────────────────────────────────────────────────
  const unknownGroups = {}
  for (const doc of unknown) {
    const fp = fingerprint(doc.errorMessage)
    if (!unknownGroups[fp]) {
      unknownGroups[fp] = {
        count:          0,
        sampleMessage:  doc.errorMessage,
        sampleIds:      [],
        errorTypes:     {},
        spamReasons:    {},
        fileTypes:      {},
      }
    }
    const g = unknownGroups[fp]
    g.count++
    if (g.sampleIds.length < 5) g.sampleIds.push(doc._id.toString())
    const et = doc.errorType   || 'none'
    const sr = doc.spamReason  || 'none'
    const ft = doc.fileType    || 'unknown'
    g.errorTypes[et]  = (g.errorTypes[et]  || 0) + 1
    g.spamReasons[sr] = (g.spamReasons[sr] || 0) + 1
    g.fileTypes[ft]   = (g.fileTypes[ft]   || 0) + 1
  }

  const output = {
    generatedAt:          new Date().toISOString(),
    totalFailed:          allFailed.length,
    nullErrorMessage:     nullErrorMsg.length,
    noErrorTypeField:     noErrorType.length,
    stuckInProcessing:    stuckProcessing.length,
    totalWithErrorMsg:    withError.length,
    totalUnknown:         unknown.length,
    errorTypeDistribution: Object.fromEntries(typeSorted),
    retryCountDistribution: Object.fromEntries(
      Object.entries(retryCounts).sort((a, b) => Number(a[0]) - Number(b[0]))
    ),
    unknownErrorGroups: Object.entries(unknownGroups)
      .sort((a, b) => b[1].count - a[1].count)
      .map(([fp, info]) => ({ fingerprint: fp, ...info })),
    stuckProcessingIds: stuckProcessing.slice(0, 20).map(d => ({
      _id:       d._id.toString(),
      createdAt: d.createdAt,
      fileType:  d.fileType,
    })),
  }

  const outFile = path.resolve(__dirname, 'unknown_errors_analysis.json')
  fs.writeFileSync(outFile, JSON.stringify(output, null, 2), 'utf8')
  console.log(g(`\n✅ Exported to ${outFile}`))

  await mongoose.disconnect()
  console.log(gr('MongoDB disconnected.\n'))
}

main().catch(err => {
  console.error(r('❌ Fatal error:'), err)
  process.exit(1)
})
