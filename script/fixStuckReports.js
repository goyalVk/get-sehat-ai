'use strict'

const mongoose = require('mongoose')
const fs       = require('fs')
const path     = require('path')

// ── ANSI colours ──────────────────────────────────────────────────────────────
const C = {
  reset: '\x1b[0m', bold:   '\x1b[1m',
  red:   '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
  cyan:  '\x1b[36m', gray:  '\x1b[90m',
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
  console.error(r('❌ MONGODB_URI not found'))
  process.exit(1)
}

const STUCK_THRESHOLD_MINUTES = 30
const DRY_RUN = process.argv.includes('--dry-run')

// ── Minimal Report schema ─────────────────────────────────────────────────────
const ReportSchema = new mongoose.Schema({
  status:       String,
  errorMessage: String,
  errorType:    String,
  fileType:     String,
  userId:       String,
  createdAt:    Date,
  updatedAt:    Date,
}, { strict: false, timestamps: true })

const Report = mongoose.models.Report || mongoose.model('Report', ReportSchema, 'reports')

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(b('\n══════════════════════════════════════════════'))
  console.log(b('  Sehat24 — Fix Stuck Processing Reports'))
  if (DRY_RUN) console.log(y('  MODE: DRY RUN — no writes will happen'))
  console.log(b('══════════════════════════════════════════════\n'))

  await mongoose.connect(MONGODB_URI)
  console.log(g('✅ MongoDB connected\n'))

  // ── 1. Find all processing reports ───────────────────────────────────────
  const allProcessing = await Report.find({ status: 'processing' })
    .sort({ createdAt: 1 })
    .lean()

  console.log(`Total reports in "processing" status: ${cy(allProcessing.length)}`)

  if (allProcessing.length === 0) {
    console.log(g('\n✅ No stuck reports found — nothing to fix!\n'))
    await mongoose.disconnect()
    return
  }

  // ── 2. Split: stuck vs recently started ──────────────────────────────────
  const cutoff = new Date(Date.now() - STUCK_THRESHOLD_MINUTES * 60 * 1000)
  const stuck   = allProcessing.filter(d => new Date(d.createdAt) < cutoff)
  const recent  = allProcessing.filter(d => new Date(d.createdAt) >= cutoff)

  console.log(`  → Older than ${STUCK_THRESHOLD_MINUTES} min (stuck): ${r(stuck.length)}`)
  console.log(`  → Within last ${STUCK_THRESHOLD_MINUTES} min (recent): ${g(recent.length)}`)

  if (recent.length > 0) {
    console.log(gr('\n  Recent reports (skipping):'))
    for (const doc of recent) {
      const age = Math.round((Date.now() - new Date(doc.createdAt)) / 1000)
      console.log(gr(`    _id: ${doc._id}  age: ${age}s  fileType: ${doc.fileType || 'unknown'}`))
    }
  }

  if (stuck.length === 0) {
    console.log(g('\n✅ No stuck reports older than 30 min — nothing to fix!\n'))
    await mongoose.disconnect()
    return
  }

  // ── 3. Show what will be fixed ────────────────────────────────────────────
  console.log(b(`\n${stuck.length} stuck report(s) to fix:\n`))
  for (const doc of stuck) {
    const ageMin = Math.round((Date.now() - new Date(doc.createdAt)) / 60000)
    console.log(
      `  ${r('•')} ${cy(doc._id.toString())}  ` +
      `age: ${y(ageMin + 'min')}  ` +
      `fileType: ${doc.fileType || 'unknown'}  ` +
      `userId: ${doc.userId ? gr(doc.userId.slice(-8)) : gr('guest')}`
    )
  }

  // ── 4. Apply fix ──────────────────────────────────────────────────────────
  if (DRY_RUN) {
    console.log(y(`\n⚠  DRY RUN — would have updated ${stuck.length} report(s). Run without --dry-run to apply.\n`))
  } else {
    const ids = stuck.map(d => d._id)
    const result = await Report.updateMany(
      { _id: { $in: ids } },
      {
        $set: {
          status:       'failed',
          errorType:    'stuck_processing',
          errorMessage: 'Report processing timeout',
        }
      }
    )
    console.log(g(`\n✅ Fixed ${result.modifiedCount} of ${stuck.length} stuck report(s)\n`))
    if (result.modifiedCount !== stuck.length) {
      console.warn(y(`⚠  ${stuck.length - result.modifiedCount} report(s) were not updated — they may have been updated concurrently`))
    }
  }

  await mongoose.disconnect()
  console.log(gr('MongoDB disconnected.\n'))
}

main().catch(err => {
  console.error(r('❌ Fatal error:'), err)
  process.exit(1)
})
