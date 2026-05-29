'use strict'

const mongoose = require('mongoose')
const fs       = require('fs')
const path     = require('path')

// ── ANSI colours ──────────────────────────────────────────────────────────────
const C = {
  reset:  '\x1b[0m',  bold:   '\x1b[1m',
  red:    '\x1b[31m', green:  '\x1b[32m', yellow: '\x1b[33m',
  blue:   '\x1b[34m', cyan:   '\x1b[36m', gray:   '\x1b[90m',
  white:  '\x1b[97m', magenta:'\x1b[35m',
}
const b  = s => `${C.bold}${s}${C.reset}`
const g  = s => `${C.green}${s}${C.reset}`
const r  = s => `${C.red}${s}${C.reset}`
const y  = s => `${C.yellow}${s}${C.reset}`
const cy = s => `${C.cyan}${s}${C.reset}`
const gr = s => `${C.gray}${s}${C.reset}`

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
  console.error(r('❌ MONGODB_URI not found in .env.local'))
  process.exit(1)
}

// ── Failure categories ────────────────────────────────────────────────────────
const CATEGORIES = {
  ai_overloaded:      'AI API Overloaded / Rate Limited',
  ai_timeout:         'AI API Timeout / Slow Response',
  api_credits:        'API Credits Exhausted',
  parse_error:        'AI Response Parse Error (JSON)',
  invalid_file_type:  'File Format Not Supported',
  file_too_small:     'File Too Small',
  file_too_large:     'File Too Large',
  corrupt_file:       'Empty / Corrupt File',
  password_protected: 'Password Protected PDF',
  low_quality:        'Low Quality / Blurry Image',
  non_medical_doc:    'Non-Medical Document Uploaded',
  pre_check_failed:   'Pre-Check Failed (Spam Filter)',
  bot_spam:           'Bot / Spam Detection',
  unknown:            'Unknown Error',
}

function categorize(report) {
  const err  = (report.errorMessage || '').toLowerCase()
  const spam = report.spamReason    || ''

  // Spam/bot
  if (spam === 'honeypot' || spam === 'bot_suspected')    return 'bot_spam'
  if (report.isSpam && !spam)                             return 'bot_spam'

  // spamReason exact matches
  if (spam === 'invalid_file_type')                       return 'invalid_file_type'
  if (spam === 'file_too_small')                          return 'file_too_small'
  if (spam === 'corrupted')                               return 'corrupt_file'
  if (spam === 'password_protected')                      return 'password_protected'
  if (spam === 'low_quality')                             return 'low_quality'
  if (spam === 'non_medical')                             return 'non_medical_doc'

  // Structural flags
  if (report.preCheckFailed)                              return 'pre_check_failed'
  if (report.isNonMedical)                                return 'non_medical_doc'

  // Error message keywords
  if (/overload|529|too many req|rate.?limit/i.test(err)) return 'ai_overloaded'
  if (/timeout|timed.?out|deadline/i.test(err))           return 'ai_timeout'
  if (/credit|quota|insufficient|billing/i.test(err))     return 'api_credits'
  if (/json.?repair|parse.?error|json|analyze nahi/i.test(err)) return 'parse_error'
  if (/password|encrypt|protected/i.test(err))            return 'password_protected'
  if (/corrupt|damaged|invalid.{0,10}pdf/i.test(err))     return 'corrupt_file'
  if (/too large|size.*exceed|exceed.*size|bahut badi|compress/i.test(err)) return 'file_too_large'
  if (/format|unsupported|invalid file type/i.test(err))  return 'invalid_file_type'

  return 'unknown'
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function pct(n, total) {
  return total === 0 ? '0.0%' : `${((n / total) * 100).toFixed(1)}%`
}

function bar(n, max, width = 24) {
  const filled = max === 0 ? 0 : Math.round((n / max) * width)
  return '█'.repeat(filled) + '░'.repeat(width - filled)
}

function pad(s, len) {
  return String(s).padEnd(len)
}

function fmtDate(d) {
  if (!d) return 'N/A'
  return new Date(d).toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
}

function fmtSize(bytes) {
  if (!bytes) return 'N/A'
  if (bytes < 1024)            return `${bytes} B`
  if (bytes < 1024 * 1024)     return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

function divider(char = '═', len = 70) {
  return char.repeat(len)
}

// ── Query ─────────────────────────────────────────────────────────────────────
async function fetchFailed(db) {
  return db.collection('reports').find({
    $or: [
      { status: { $in: ['failed', 'error'] } },
      { isSpam: true },
      { preCheckFailed: true },
      { isNonMedical: true },
      { errorMessage: { $exists: true, $nin: [null, ''] } },
    ],
  }).sort({ createdAt: -1 }).toArray()
}

// ── Analysis ──────────────────────────────────────────────────────────────────
function analyze(reports) {
  const total = reports.length

  // Category buckets
  const byCat = {}
  for (const key of Object.keys(CATEGORIES)) byCat[key] = []

  for (const rpt of reports) {
    const cat = categorize(rpt)
    byCat[cat].push(rpt)
  }

  // Date range
  const dates = reports.map(r => new Date(r.createdAt)).filter(d => !isNaN(d))
  const firstFail = dates.length ? new Date(Math.min(...dates)) : null
  const lastFail  = dates.length ? new Date(Math.max(...dates)) : null

  // File types
  const fileTypeCounts = {}
  for (const rpt of reports) {
    const ft = (rpt.fileType || 'unknown').split('/').pop().toLowerCase()
    fileTypeCounts[ft] = (fileTypeCounts[ft] || 0) + 1
  }
  const fileTypes = Object.entries(fileTypeCounts)
    .sort((a, b) => b[1] - a[1])

  // Peak hours (0-23)
  const hourCounts = Array(24).fill(0)
  for (const rpt of reports) {
    if (rpt.createdAt) {
      hourCounts[new Date(rpt.createdAt).getUTCHours()]++
    }
  }

  // Guest vs logged-in
  const guestCount     = reports.filter(r => !r.userId).length
  const loggedInCount  = total - guestCount

  // Avg file size
  const validSizes = reports.map(r => r.fileSize).filter(Boolean)
  const avgSize = validSizes.length
    ? validSizes.reduce((a, b) => a + b, 0) / validSizes.length
    : 0

  // Sample messages per category (up to 3)
  const sampleMessages = {}
  for (const [cat, rpts] of Object.entries(byCat)) {
    sampleMessages[cat] = rpts
      .filter(r => r.errorMessage)
      .slice(0, 3)
      .map(r => r.errorMessage)
  }

  return {
    total, byCat, firstFail, lastFail,
    fileTypes, hourCounts,
    guestCount, loggedInCount, avgSize,
    sampleMessages,
  }
}

// ── Console report ─────────────────────────────────────────────────────────────
function printReport(stats) {
  const { total, byCat, firstFail, lastFail, fileTypes, hourCounts,
          guestCount, loggedInCount, avgSize, sampleMessages } = stats

  console.log('\n' + cy(divider()))
  console.log(cy('  SEHAT24 — FAILED REPORTS ANALYSIS'))
  console.log(cy(`  Generated: ${new Date().toISOString()}`))
  console.log(cy(divider()))

  // ── Overview ──
  console.log('\n' + b('📊  OVERVIEW'))
  console.log(`  Total failed reports : ${b(r(String(total)))}`)
  console.log(`  Date range           : ${fmtDate(firstFail)}  →  ${fmtDate(lastFail)}`)
  console.log(`  Guest (no userId)    : ${guestCount} ${gr(`(${pct(guestCount, total)})`)}`)
  console.log(`  Logged-in users      : ${loggedInCount} ${gr(`(${pct(loggedInCount, total)})`)}`)
  console.log(`  Avg file size        : ${fmtSize(avgSize)}`)

  // ── Breakdown ──
  console.log('\n' + b('🔍  FAILURE BREAKDOWN'))
  const sorted = Object.entries(byCat)
    .filter(([, rpts]) => rpts.length > 0)
    .sort((a, b) => b[1].length - a[1].length)
  const maxCount = sorted[0]?.[1].length || 1

  console.log(gr(`  ${'#'.padEnd(3)} ${'Category'.padEnd(38)} ${'Count'.padEnd(7)} ${'%'.padEnd(7)} Bar`))
  console.log(gr('  ' + '─'.repeat(68)))

  sorted.forEach(([cat, rpts], i) => {
    const label = CATEGORIES[cat] || cat
    const count = rpts.length
    const colour = count > maxCount * 0.3 ? r : count > maxCount * 0.1 ? y : g
    console.log(
      `  ${String(i + 1).padEnd(3)} ${pad(label, 38)} ${colour(pad(count, 7))} ${gr(pad(pct(count, total), 7))} ${y(bar(count, maxCount, 22))}`
    )
  })

  // Categories with 0 hits
  const empty = Object.keys(CATEGORIES).filter(k => (byCat[k] || []).length === 0)
  if (empty.length) {
    console.log(gr(`\n  Zero occurrences: ${empty.map(k => CATEGORIES[k]).join(', ')}`))
  }

  // ── File types ──
  console.log('\n' + b('📁  FILE TYPE DISTRIBUTION'))
  const ftMax = fileTypes[0]?.[1] || 1
  for (const [ft, count] of fileTypes) {
    console.log(
      `  ${pad(ft, 20)} ${pad(count, 6)} ${gr(pct(count, total).padEnd(7))} ${cy(bar(count, ftMax, 20))}`
    )
  }

  // ── Peak hours ──
  console.log('\n' + b('⏰  PEAK FAILURE HOURS (UTC)'))
  const maxHour = Math.max(...hourCounts)
  const topHours = hourCounts
    .map((cnt, hr) => ({ hr, cnt }))
    .filter(h => h.cnt > 0)
    .sort((a, b) => b.cnt - a.cnt)
    .slice(0, 8)
  for (const { hr, cnt } of topHours) {
    const label = `${String(hr).padStart(2, '0')}:00`
    console.log(`  ${label}  ${cy(bar(cnt, maxHour, 28))} ${cnt}`)
  }

  // ── Sample messages ──
  console.log('\n' + b('💬  SAMPLE ERROR MESSAGES PER CATEGORY'))
  for (const [cat, msgs] of Object.entries(sampleMessages)) {
    if (!msgs.length) continue
    console.log(`\n  ${y(CATEGORIES[cat] || cat)}`)
    for (const msg of msgs) {
      const truncated = msg.length > 110 ? msg.slice(0, 110) + '…' : msg
      console.log(`    ${gr('•')} ${truncated}`)
    }
  }

  // ── Bot/spam detail ──
  const botRpts = byCat['bot_spam'] || []
  if (botRpts.length) {
    const reasons = {}
    for (const rpt of botRpts) {
      const sr = rpt.spamReason || 'no_reason'
      reasons[sr] = (reasons[sr] || 0) + 1
    }
    console.log('\n' + b('🤖  BOT/SPAM BREAKDOWN'))
    for (const [reason, cnt] of Object.entries(reasons).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${pad(reason, 22)} ${cnt}`)
    }
  }

  console.log('\n' + cy(divider()))
}

// ── Build export object ───────────────────────────────────────────────────────
function buildExport(reports, stats) {
  const { total, byCat, firstFail, lastFail, fileTypes, hourCounts,
          guestCount, loggedInCount, avgSize } = stats

  const catSummary = {}
  for (const [cat, rpts] of Object.entries(byCat)) {
    catSummary[cat] = {
      label:      CATEGORIES[cat],
      count:      rpts.length,
      percentage: pct(rpts.length, total),
      samples: rpts.slice(0, 5).map(r => ({
        _id:          r._id,
        userId:       r.userId,
        createdAt:    r.createdAt,
        fileType:     r.fileType,
        fileSize:     r.fileSize,
        errorMessage: r.errorMessage,
        status:       r.status,
        spamReason:   r.spamReason,
        preCheckFailed: r.preCheckFailed,
        isSpam:       r.isSpam,
        isNonMedical: r.isNonMedical,
        retryCount:   r.retryCount || null,
        modelUsed:    r.modelUsed,
        uploadSource: r.uploadSource,
      })),
    }
  }

  const peakHours = hourCounts
    .map((cnt, hr) => ({ hour: hr, label: `${String(hr).padStart(2, '0')}:00 UTC`, count: cnt }))
    .sort((a, b) => b.count - a.count)

  return {
    meta: {
      generatedAt: new Date().toISOString(),
      scriptVersion: '1.0.0',
    },
    summary: {
      totalFailed:   total,
      dateRange:     { first: firstFail, last: lastFail },
      guestCount,
      loggedInCount,
      avgFileSizeBytes:  Math.round(avgSize),
      avgFileSizeHuman:  fmtSize(avgSize),
    },
    categoryBreakdown: catSummary,
    fileTypeDistribution: Object.fromEntries(fileTypes),
    peakFailureHours: peakHours,
    allFailed: reports.map(r => ({
      _id:           r._id,
      userId:        r.userId,
      anonId:        r.anonId,
      createdAt:     r.createdAt,
      fileType:      r.fileType,
      fileSize:      r.fileSize,
      errorMessage:  r.errorMessage,
      status:        r.status,
      spamReason:    r.spamReason,
      isSpam:        r.isSpam,
      isNonMedical:  r.isNonMedical,
      preCheckFailed: r.preCheckFailed,
      retryCount:    r.retryCount || null,
      modelUsed:     r.modelUsed,
      uploadSource:  r.uploadSource,
      category:      categorize(r),
    })),
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(cy('\n⟳  Connecting to MongoDB Atlas…'))

  await mongoose.connect(MONGODB_URI, { bufferCommands: false })
  console.log(g('✅ Connected'))

  const db = mongoose.connection.db

  console.log(cy('⟳  Querying failed reports…'))
  const reports = await fetchFailed(db)

  if (reports.length === 0) {
    console.log(g('\n✅ No failed reports found — system is clean!'))
    await mongoose.disconnect()
    return
  }

  console.log(g(`✅ Found ${b(String(reports.length))} failed/spam reports\n`))

  const stats = analyze(reports)
  printReport(stats)

  // ── Export JSON ──
  const exportData = buildExport(reports, stats)
  const outFile    = path.resolve(__dirname, 'failed_reports_analysis.json')
  fs.writeFileSync(outFile, JSON.stringify(exportData, null, 2), 'utf8')

  console.log(g(`\n✅ Full analysis exported → ${b(outFile)}`))
  console.log(gr(`   ${outFile}\n`))

  await mongoose.disconnect()
  process.exit(0)
}

main().catch(err => {
  console.error(r('\n❌ Fatal error:'), err.message)
  console.error(err.stack)
  process.exit(1)
})
