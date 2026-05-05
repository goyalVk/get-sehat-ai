// scripts/health-insights.js
// Run: node scripts/health-insights.js
// Extracts real health data from Sehat24 reports for social media

import mongoose from 'mongoose'


const MONGODB_URI = "mongodb+srv://vkgoyalvk85:Vivek007@get-sehat-ai.l6cglqo.mongodb.net/getsehat?retryWrites=true&w=majority&appName=get-sehat-ai"

// ── Minimal Report Schema ─────────────────────────────
const ReportSchema = new mongoose.Schema({
  status:         String,
  reportType:     String,
  reportCategory: String,
  parameters:     Array,
  urgentFlags:    Array,
  patient:        Object,
  lab:            Object,
  result:         Object,
  analysisResult: Object,
  createdAt:      Date,
}, { timestamps: true })

const Report = mongoose.models.Report ||
  mongoose.model('Report', ReportSchema)

// ── Connect ───────────────────────────────────────────
async function connect() {
  await mongoose.connect(MONGODB_URI)
  console.log('✅ MongoDB connected\n')
}

// ── Main Analytics ────────────────────────────────────
async function extractInsights() {

  // Only completed reports
  const reports = await Report.find({
    status: 'completed',
    parameters: { $exists: true, $ne: [] }
  }).lean()

  console.log(`📊 Total completed reports: ${reports.length}\n`)
  console.log('='.repeat(60))

  // ── 1. Most Common Abnormal Parameters ───────────────
  const abnormalCount = {}
  const totalParamCount = {}
  let totalParams = 0

  reports.forEach(report => {
    const params = report.parameters || []
    params.forEach(param => {
      if (!param.name) return
      const name = param.name.trim()
      totalParamCount[name] = (totalParamCount[name] || 0) + 1
      totalParams++
      if (param.status && param.status !== 'normal') {
        abnormalCount[name] = (abnormalCount[name] || 0) + 1
      }
    })
  })

  // Calculate abnormal percentage
  const abnormalPercentage = {}
  Object.keys(abnormalCount).forEach(name => {
    const total = totalParamCount[name] || 1
    if (total >= 5) { // Only params seen 5+ times
      abnormalPercentage[name] = {
        abnormal: abnormalCount[name],
        total,
        percentage: Math.round((abnormalCount[name] / total) * 100)
      }
    }
  })

  // Sort by percentage
  const sortedAbnormal = Object.entries(abnormalPercentage)
    .sort((a, b) => b[1].percentage - a[1].percentage)
    .slice(0, 15)

  console.log('\n🔴 TOP ABNORMAL PARAMETERS (% of reports where it was abnormal)')
  console.log('─'.repeat(60))
  sortedAbnormal.forEach(([name, data]) => {
    const bar = '█'.repeat(Math.floor(data.percentage / 5))
    console.log(`${name.padEnd(30)} ${data.percentage}% ${bar} (${data.abnormal}/${data.total})`)
  })

  // ── 2. Most Common Urgent Flags ───────────────────────
  const flagCount = {}
  let reportsWithFlags = 0

  reports.forEach(report => {
    const flags = report.urgentFlags || []
    if (flags.length > 0) reportsWithFlags++
    flags.forEach(flag => {
      // Extract key words from flag
      const key = flag.substring(0, 50)
      flagCount[key] = (flagCount[key] || 0) + 1
    })
  })

  console.log(`\n⚠️  URGENT FLAGS`)
  console.log('─'.repeat(60))
  console.log(`Reports with urgent flags: ${reportsWithFlags}/${reports.length} (${Math.round(reportsWithFlags/reports.length*100)}%)`)

  // ── 3. Report Categories ──────────────────────────────
  const categoryCount = {}
  reports.forEach(report => {
    const cat = report.reportCategory || 'other'
    categoryCount[cat] = (categoryCount[cat] || 0) + 1
  })

  console.log('\n📋 REPORT TYPES UPLOADED')
  console.log('─'.repeat(60))
  Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      const pct = Math.round(count / reports.length * 100)
      const bar = '█'.repeat(Math.floor(pct / 3))
      console.log(`${cat.padEnd(20)} ${count} reports (${pct}%) ${bar}`)
    })

  // ── 4. Gender Split ───────────────────────────────────
  let male = 0, female = 0, unknown = 0
  reports.forEach(report => {
    const gender = report.patient?.gender?.toLowerCase()
    if (gender === 'male') male++
    else if (gender === 'female') female++
    else unknown++
  })

  console.log('\n👥 GENDER SPLIT')
  console.log('─'.repeat(60))
  console.log(`Male:    ${male} (${Math.round(male/reports.length*100)}%)`)
  console.log(`Female:  ${female} (${Math.round(female/reports.length*100)}%)`)
  console.log(`Unknown: ${unknown}`)

  // ── 5. Specific Key Parameters ────────────────────────
  const keyParams = [
    'Hemoglobin', 'Vitamin D', 'Vitamin B12',
    'TSH', 'HbA1c', 'Total Cholesterol',
    'Creatinine', 'SGPT', 'Ferritin'
  ]

  console.log('\n🩸 KEY PARAMETER DEFICIENCY ANALYSIS')
  console.log('─'.repeat(60))

  keyParams.forEach(paramName => {
    let low = 0, high = 0, normal = 0, total = 0

    reports.forEach(report => {
      const params = report.parameters || []
      params.forEach(param => {
        if (param.name?.toLowerCase().includes(paramName.toLowerCase())) {
          total++
          const status = param.status?.toLowerCase()
          if (status === 'low') low++
          else if (status === 'high') high++
          else if (status === 'normal') normal++
        }
      })
    })

    if (total >= 3) {
      const lowPct  = Math.round(low / total * 100)
      const highPct = Math.round(high / total * 100)
      console.log(`\n${paramName} (found in ${total} reports):`)
      console.log(`  Low:    ${low} (${lowPct}%)`)
      console.log(`  High:   ${high} (${highPct}%)`)
      console.log(`  Normal: ${normal} (${Math.round(normal/total*100)}%)`)
    }
  })

  // ── 6. Most Alarming Stat for Social Media ────────────
  console.log('\n' + '='.repeat(60))
  console.log('📱 SOCIAL MEDIA WORTHY STATS')
  console.log('='.repeat(60))

  // Find top 3 most shocking stats
  const socialStats = []

  // Vitamin D
  const vitDTotal = (totalParamCount['Vitamin D'] || 0) +
                    (totalParamCount['Vitamin D 25-OH'] || 0) +
                    (totalParamCount['25-OH Vitamin D'] || 0)
  const vitDLow = (abnormalCount['Vitamin D'] || 0) +
                  (abnormalCount['Vitamin D 25-OH'] || 0) +
                  (abnormalCount['25-OH Vitamin D'] || 0)
  if (vitDTotal > 0) {
    socialStats.push({
      stat: `Vitamin D deficiency`,
      value: Math.round(vitDLow / vitDTotal * 100),
      context: `${vitDLow} out of ${vitDTotal} Sehat24 users had low Vitamin D`
    })
  }

  // Hemoglobin
  const hbTotal = totalParamCount['Hemoglobin'] || 0
  const hbLow   = abnormalCount['Hemoglobin'] || 0
  if (hbTotal > 0) {
    socialStats.push({
      stat: `Anemia (Low Hemoglobin)`,
      value: Math.round(hbLow / hbTotal * 100),
      context: `${hbLow} out of ${hbTotal} users had low Hemoglobin`
    })
  }

  // B12
  const b12Total = totalParamCount['Vitamin B12'] || 0
  const b12Low   = abnormalCount['Vitamin B12'] || 0
  if (b12Total > 0) {
    socialStats.push({
      stat: `Vitamin B12 deficiency`,
      value: Math.round(b12Low / b12Total * 100),
      context: `${b12Low} out of ${b12Total} users had low B12`
    })
  }

  // TSH/Thyroid
  const tshTotal = totalParamCount['TSH'] || 0
  const tshAbnormal = abnormalCount['TSH'] || 0
  if (tshTotal > 0) {
    socialStats.push({
      stat: `Thyroid issues (TSH abnormal)`,
      value: Math.round(tshAbnormal / tshTotal * 100),
      context: `${tshAbnormal} out of ${tshTotal} users had abnormal TSH`
    })
  }

  socialStats.sort((a, b) => b.value - a.value)

  socialStats.forEach((s, i) => {
    console.log(`\n${i + 1}. ${s.stat}`)
    console.log(`   ${s.value}% affected`)
    console.log(`   ${s.context}`)
  })

  // ── 7. Final Summary Object ───────────────────────────
  const summary = {
    totalReports:      reports.length,
    reportsWithFlags:  reportsWithFlags,
    flagPercentage:    Math.round(reportsWithFlags / reports.length * 100),
    topAbnormal:       sortedAbnormal.slice(0, 5).map(([name, data]) => ({
      name,
      percentage: data.percentage
    })),
    categories:        categoryCount,
    gender:            { male, female, unknown },
    socialStats
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 RAW DATA FOR POST GENERATION:')
  console.log('='.repeat(60))
  console.log(JSON.stringify(summary, null, 2))

  return summary
}

// ── Run ───────────────────────────────────────────────
async function main() {
  try {
    await connect()
    const insights = await extractInsights()

    console.log('\n' + '='.repeat(60))
    console.log('✅ Done! Copy the stats above for your Instagram post.')
    console.log('='.repeat(60))

  } catch (err) {
    console.error('❌ Error:', err.message)
  } finally {
    await mongoose.disconnect()
    console.log('\n🔌 MongoDB disconnected')
  }
}

main()