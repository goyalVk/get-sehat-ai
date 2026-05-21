import mongoose from 'mongoose'


// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://vkgoyalvk85:Vivek007@get-sehat-ai.l6cglqo.mongodb.net/getsehat?retryWrites=true&w=majority&appName=get-sehat-ai")
    console.log('✅ MongoDB connected\n')
  } catch (error) {
    console.error('❌ Connection error:', error)
    process.exit(1)
  }
}

// Define Report model
const ParameterSchema = new mongoose.Schema({
  name: { type: String },
  value: { type: String },
  unit: { type: String },
  reference_range: { type: String },
  status: { type: String },
  explanation: { type: String },
  action: { type: String }
}, { _id: false })

const PatientSchema = new mongoose.Schema({
  name: { type: String, default: null },
  age: { type: String, default: null },
  gender: { type: String, default: null },
  phone: { type: String, default: null },
  email: { type: String, default: null },
}, { _id: false })

const LabSchema = new mongoose.Schema({
  labName: { type: String, default: null },
  labAddress: { type: String, default: null },
  referredBy: { type: String, default: null },
  collectedAt: { type: Date, default: null },
  reportedAt: { type: Date, default: null },
}, { _id: false })

const TokenSchema = new mongoose.Schema({
  inputTokens: { type: Number, default: 0 },
  outputTokens: { type: Number, default: 0 },
  totalTokens: { type: Number, default: 0 },
  estimatedCost: { type: Number, default: 0 }
}, { _id: false })

const ReportSchema = new mongoose.Schema({
  userId: { type: String, default: null },
  sessionId: { type: String, default: null },
  anonId: { type: String, default: null },
  fileName: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number, default: 0 },
  status: { type: String, enum: ['processing', 'completed', 'failed'], default: 'processing' },
  isSample: { type: Boolean, default: false },
  errorMessage: { type: String, default: null },
  patient: PatientSchema,
  lab: LabSchema,
  reportType: { type: String, default: null },
  reportCategory: { type: String, enum: ['blood', 'urine', 'thyroid', 'lipid', 'liver', 'kidney', 'diabetes', 'vitamin', 'full_body', 'other'], default: 'other' },
  result: { type: mongoose.Schema.Types.Mixed, default: null },
  parameters: [ParameterSchema],
  urgentFlags: [{ type: String }],
  tokensUsed: TokenSchema,
  analysisTimeMs: { type: Number, default: 0 },
  modelUsed: { type: String, default: null },
  reportHash: { type: String, default: null },
  analysisResult: { type: mongoose.Schema.Types.Mixed, default: null },
  uploadCount: { type: Number, default: 1 },
  firstUploadedAt: { type: Date, default: null },
  lastUploadedAt: { type: Date, default: null },
  feedback: {
    rating: { type: Number, min: 1, max: 5, default: null },
    ratedAt: { type: Date, default: null },
    clarifications: [{ question: { type: String, maxlength: 500 }, askedAt: { type: Date, default: Date.now }, _id: false }]
  },
  isSpam: { type: Boolean, default: false },
  spamReason: { type: String, default: null },
  isNonMedical: { type: Boolean, default: false },
  preCheckFailed: { type: Boolean, default: false },
  uploadSource: { type: String, default: 'web' },
  userAgent: { type: String, default: null },
  visitCount: { type: Number, default: 1 },
  ipAddress: { type: String, default: null },
  deviceType: { type: String, default: 'unknown' },
  os: { type: String, default: 'unknown' },
  browser: { type: String, default: 'unknown' },
  referralSource: { type: String, default: 'direct' },
  uploadHour: { type: Number, default: null },
  uploadDay: { type: Number, default: null },
}, { timestamps: true })

const Report = mongoose.model('Report', ReportSchema)

// ==================== ANALYTICS FUNCTIONS ====================

// 1. User Feedback Analysis
const getUserFeedbackAnalysis = async () => {
  console.log('\n📊 USER FEEDBACK ANALYSIS')
  console.log('=' .repeat(50))
  
  const feedback = await Report.aggregate([
    { $match: { 'feedback.rating': { $exists: true, $ne: null } } },
    {
      $group: {
        _id: '$feedback.rating',
        count: { $sum: 1 },
        avgTokens: { $avg: '$tokensUsed.totalTokens' }
      }
    },
    { $sort: { _id: 1 } }
  ])

  const totalFeedback = await Report.countDocuments({ 'feedback.rating': { $exists: true, $ne: null } })
  const avgRating = await Report.aggregate([
    { $match: { 'feedback.rating': { $exists: true, $ne: null } } },
    { $group: { _id: null, avg: { $avg: '$feedback.rating' } } }
  ])

  console.log(`\n📈 Total Feedback: ${totalFeedback}`)
  console.log(`⭐ Average Rating: ${avgRating[0]?.avg.toFixed(2) || 'N/A'}`)
  console.log('\nRating Distribution:')
  feedback.forEach(item => {
    const stars = '⭐'.repeat(item._id)
    console.log(`${stars} (${item._id}): ${item.count} users (avg tokens: ${item.avgTokens.toFixed(0)})`)
  })

  // 5-star users (best outcome)
  const bestUsers = await Report.aggregate([
    { $match: { 'feedback.rating': 5 } },
    {
      $group: {
        _id: '$anonId',
        count: { $sum: 1 },
        avgTime: { $avg: '$analysisTimeMs' },
        reportTypes: { $push: '$reportCategory' }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ])

  console.log('\n🏆 Top 5-Star Users (Best Outcomes):')
  bestUsers.forEach((user, idx) => {
    console.log(`${idx + 1}. User: ${user._id} | Reports: ${user.count} | Avg Time: ${user.avgTime.toFixed(0)}ms`)
  })
}

// 2. Spam & Non-Medical Detection
const getSpamAnalysis = async () => {
  console.log('\n\n🚨 SPAM & BOT DETECTION ANALYSIS')
  console.log('=' .repeat(50))

  const spamStats = await Report.aggregate([
    {
      $facet: {
        totalSpam: [
          { $match: { isSpam: true } },
          { $count: 'count' }
        ],
        spamByReason: [
          { $match: { isSpam: true } },
          { $group: { _id: '$spamReason', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ],
        nonMedical: [
          { $match: { isNonMedical: true } },
          { $count: 'count' }
        ],
        preCheckFailed: [
          { $match: { preCheckFailed: true } },
          { $count: 'count' }
        ],
        totalReports: [
          { $count: 'count' }
        ]
      }
    }
  ])

  const stats = spamStats[0]
  const totalReports = stats.totalReports[0]?.count || 0
  const spamCount = stats.totalSpam[0]?.count || 0
  const spamPercentage = totalReports > 0 ? ((spamCount / totalReports) * 100).toFixed(2) : 0

  console.log(`\n📊 Total Reports: ${totalReports}`)
  console.log(`🚫 Spam Reports: ${spamCount} (${spamPercentage}%)`)
  console.log(`❌ Non-Medical: ${stats.nonMedical[0]?.count || 0}`)
  console.log(`⚠️  Pre-Check Failed: ${stats.preCheckFailed[0]?.count || 0}`)

  console.log('\nSpam Breakdown by Reason:')
  stats.spamByReason.forEach(item => {
    console.log(`  • ${item._id}: ${item.count}`)
  })

  // Spam users (multiple spam uploads)
  const spamUsers = await Report.aggregate([
    { $match: { isSpam: true } },
    { $group: { _id: '$anonId', spamCount: { $sum: 1 }, ips: { $addToSet: '$ipAddress' } } },
    { $sort: { spamCount: -1 } },
    { $limit: 10 }
  ])

  console.log('\n🔴 Repeat Spam Users:')
  spamUsers.forEach((user, idx) => {
    console.log(`${idx + 1}. User: ${user._id} | Spam Reports: ${user.spamCount} | IPs: ${user.ips.length}`)
  })
}

// 3. Upload Count Analysis
const getUploadAnalysis = async () => {
  console.log('\n\n📤 UPLOAD COUNT ANALYSIS')
  console.log('=' .repeat(50))

  const uploadStats = await Report.aggregate([
    {
      $group: {
        _id: '$anonId',
        totalReports: { $sum: 1 },
        totalTokensWasted: { $sum: '$tokensUsed.totalTokens' },
        totalCost: { $sum: '$tokensUsed.estimatedCost' },
        failedReports: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
        spamReports: { $sum: { $cond: ['$isSpam', 1, 0] } },
        duplicates: { $sum: { $cond: [{ $gt: ['$uploadCount', 1] }, '$uploadCount', 0] } }
      }
    },
    { $sort: { totalReports: -1 } },
    { $limit: 15 }
  ])

  console.log('\n🏅 Power Users (Most Uploads):')
  uploadStats.forEach((user, idx) => {
    const wastedTokens = user.spamReports * 5000 + user.failedReports * 2000 // estimate
    console.log(`${idx + 1}. User: ${user._id}`)
    console.log(`   📊 Total Reports: ${user.totalReports}`)
    console.log(`   💸 Total Cost: ₹${(user.totalCost || 0).toFixed(2)}`)
    console.log(`   ❌ Failed: ${user.failedReports} | 🚫 Spam: ${user.spamReports}`)
    console.log(`   ⚠️  Wasted Tokens: ~${wastedTokens}`)
  })

  // Duplicate detection
  const duplicates = await Report.aggregate([
    { $match: { uploadCount: { $gt: 1 } } },
    { $group: { _id: '$reportHash', count: { $sum: 1 }, uploadCounts: { $sum: '$uploadCount' } } },
    { $sort: { uploadCounts: -1 } },
    { $limit: 10 }
  ])

  console.log('\n🔄 Duplicate Reports (Same Hash):')
  duplicates.forEach((dup, idx) => {
    console.log(`${idx + 1}. Hash: ${dup._id?.substring(0, 10) || 'null'}... | Re-uploads: ${dup.uploadCounts}`)
  })
}

// 4. Bot Detection
const getBotDetection = async () => {
  console.log('\n\n🤖 BOT DETECTION ANALYSIS')
  console.log('=' .repeat(50))

  // Suspicious patterns
  const botPatterns = await Report.aggregate([
    {
      $group: {
        _id: '$ipAddress',
        uploadCount: { $sum: 1 },
        uniqueSessions: { $addToSet: '$sessionId' },
        uniqueUsers: { $addToSet: '$anonId' },
        avgTimeMs: { $avg: '$analysisTimeMs' },
        spamRate: { $avg: { $cond: ['$isSpam', 1, 0] } },
        failureRate: { $avg: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
        tokenBurn: { $sum: '$tokensUsed.totalTokens' }
      }
    },
    { $match: { uploadCount: { $gte: 5 } } }, // Only heavy users
    { $sort: { uploadCount: -1 } },
    { $limit: 15 }
  ])

  console.log('\n⚡ High-Activity IPs (Potential Bots):')
  botPatterns.forEach((ip, idx) => {
    const spamPercentage = (ip.spamRate * 100).toFixed(1)
    const failurePercentage = (ip.failureRate * 100).toFixed(1)
    const riskScore = (ip.spamRate * 50 + ip.failureRate * 30 + (ip.uploadCount > 50 ? 20 : 0)).toFixed(0)

    console.log(`${idx + 1}. IP: ${ip._id}`)
    console.log(`   📤 Uploads: ${ip.uploadCount} | Sessions: ${ip.uniqueSessions.length} | Users: ${ip.uniqueUsers.length}`)
    console.log(`   🚫 Spam Rate: ${spamPercentage}% | Failure Rate: ${failurePercentage}%`)
    console.log(`   💾 Token Burn: ${ip.tokenBurn.toFixed(0)} | ⚠️  Risk Score: ${riskScore}/100`)
    
    if (riskScore > 60) console.log('   🚨 HIGH RISK - Consider blocking')
  })

  // Rapid-fire uploads (time-based)
  const rapidUploads = await Report.aggregate([
    { $match: { createdAt: { $gte: new Date(Date.now() - 3600000) } } }, // Last 1 hour
    { $group: { _id: '$ipAddress', count: { $sum: 1 } } },
    { $match: { count: { $gte: 10 } } }, // 10+ in 1 hour
    { $sort: { count: -1 } }
  ])

  console.log('\n⚡ Rapid-Fire Uploads (Last 1 Hour):')
  if (rapidUploads.length === 0) {
    console.log('✅ No suspicious activity detected')
  } else {
    rapidUploads.forEach((item, idx) => {
      console.log(`${idx + 1}. IP: ${item._id} | ${item.count} uploads in 1 hour 🚨`)
    })
  }
}

// 5. Geographic Analysis
const getGeographicAnalysis = async () => {
  console.log('\n\n🗺️  GEOGRAPHIC ANALYSIS')
  console.log('=' .repeat(50))

  const locationStats = await Report.aggregate([
    {
      $group: {
        _id: '$ipAddress',
        reportCount: { $sum: 1 },
        avgCost: { $avg: '$tokensUsed.estimatedCost' },
        deviceTypes: { $addToSet: '$deviceType' },
        browsers: { $addToSet: '$browser' },
        conversions: { $sum: { $cond: [{ $gt: ['$feedback.rating', 3] }, 1, 0] } }
      }
    },
    {
      $project: {
        _id: 1,
        reportCount: 1,
        avgCost: 1,
        deviceTypes: 1,
        browsers: 1,
        conversions: 1,
        conversionRate: { $multiply: [{ $divide: ['$conversions', '$reportCount'] }, 100] }
      }
    },
    { $sort: { reportCount: -1 } },
    { $limit: 20 }
  ])

  console.log('\n🌍 Top Upload Locations (by IP):')
  locationStats.forEach((loc, idx) => {
    console.log(`${idx + 1}. IP: ${loc._id}`)
    console.log(`   📊 Reports: ${loc.reportCount} | Conversions: ${loc.conversions} (${loc.conversionRate.toFixed(1)}%)`)
    console.log(`   📱 Devices: ${loc.deviceTypes.join(', ') || 'unknown'} | 🌐 Browsers: ${loc.browsers.join(', ') || 'unknown'}`)
  })

  // Cities (from referral/analytics)
  const cityStats = await Report.aggregate([
    { $match: { referralSource: { $ne: 'direct' } } },
    { $group: { _id: '$referralSource', count: { $sum: 1 }, avgRating: { $avg: '$feedback.rating' } } },
    { $sort: { count: -1 } }
  ])

  console.log('\n🏙️  Referral Sources:')
  cityStats.forEach(item => {
    console.log(`  • ${item._id}: ${item.count} reports (avg rating: ${item.avgRating?.toFixed(2) || 'N/A'})`)
  })
}

// 6. System Health & Token Efficiency
const getSystemHealth = async () => {
  console.log('\n\n⚙️  SYSTEM HEALTH & TOKEN EFFICIENCY')
  console.log('=' .repeat(50))

  const health = await Report.aggregate([
    {
      $facet: {
        overallStats: [
          {
            $group: {
              _id: null,
              totalReports: { $sum: 1 },
              successRate: { $avg: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
              totalTokens: { $sum: '$tokensUsed.totalTokens' },
              totalCost: { $sum: '$tokensUsed.estimatedCost' },
              avgAnalysisTime: { $avg: '$analysisTimeMs' },
              spamRate: { $avg: { $cond: ['$isSpam', 1, 0] } }
            }
          }
        ],
        modelUsage: [
          { $group: { _id: '$modelUsed', count: { $sum: 1 }, tokens: { $sum: '$tokensUsed.totalTokens' } } },
          { $sort: { count: -1 } }
        ]
      }
    }
  ])

  const overall = health[0].overallStats[0]

  console.log(`\n📊 Overall Stats:`)
  console.log(`   Total Reports: ${overall.totalReports}`)
  console.log(`   ✅ Success Rate: ${(overall.successRate * 100).toFixed(2)}%`)
  console.log(`   💾 Total Tokens: ${overall.totalTokens.toFixed(0)}`)
  console.log(`   💸 Total Cost: ₹${overall.totalCost.toFixed(2)}`)
  console.log(`   ⏱️  Avg Analysis Time: ${overall.avgAnalysisTime.toFixed(0)}ms`)
  console.log(`   🚫 Spam Rate: ${(overall.spamRate * 100).toFixed(2)}%`)

  // Token efficiency
  const tokenPerReport = (overall.totalTokens / overall.totalReports).toFixed(0)
  const costPerReport = (overall.totalCost / overall.totalReports).toFixed(2)

  console.log(`\n💡 Efficiency:`)
  console.log(`   Tokens per Report: ${tokenPerReport}`)
  console.log(`   Cost per Report: ₹${costPerReport}`)

  console.log(`\n🤖 Model Usage:`)
  health[0].modelUsage.forEach(model => {
    console.log(`   ${model._id || 'null'}: ${model.count} reports (${model.tokens} tokens)`)
  })
}

// 7. Recommendations
const getRecommendations = async () => {
  console.log('\n\n💡 ACTIONABLE RECOMMENDATIONS')
  console.log('=' .repeat(50))

  const recommendations = []

  // Check spam rate
  const spamCount = await Report.countDocuments({ isSpam: true })
  const totalCount = await Report.countDocuments()
  const spamRate = (spamCount / totalCount) * 100

  if (spamRate > 10) {
    recommendations.push(`🚨 High spam rate (${spamRate.toFixed(1)}%). Implement stricter pre-checks or CAPTCHA.`)
  }

  // Check failure rate
  const failureCount = await Report.countDocuments({ status: 'failed' })
  const failureRate = (failureCount / totalCount) * 100

  if (failureRate > 5) {
    recommendations.push(`⚠️  High failure rate (${failureRate.toFixed(1)}%). Review PDF parsing and API errors.`)
  }

  // Check feedback
  const lowRatings = await Report.countDocuments({ 'feedback.rating': { $lte: 2 } })

  if (lowRatings > 0) {
    recommendations.push(`📉 ${lowRatings} low ratings detected. Analyze 1-2 star feedback for UX issues.`)
  }

  // Check token efficiency
  const avgTokens = await Report.aggregate([
    { $group: { _id: null, avg: { $avg: '$tokensUsed.totalTokens' } } }
  ])

  if (avgTokens[0]?.avg > 10000) {
    recommendations.push(`💸 High token usage (avg ${avgTokens[0].avg.toFixed(0)}). Optimize prompts or truncate long reports.`)
  }

  // Check duplicate uploads
  const duplicateCount = await Report.countDocuments({ uploadCount: { $gt: 1 } })

  if (duplicateCount > 0) {
    recommendations.push(`🔄 ${duplicateCount} duplicate uploads detected. Add client-side hash validation.`)
  }

  console.log('\n' + recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n'))
}

// ==================== MAIN EXECUTION ====================

const runAnalytics = async () => {
  await connectDB()

  try {
    await getUserFeedbackAnalysis()
    await getSpamAnalysis()
    await getUploadAnalysis()
    await getBotDetection()
    await getGeographicAnalysis()
    await getSystemHealth()
    await getRecommendations()

    console.log('\n\n✅ Analysis Complete!')
    console.log('=' .repeat(50))
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await mongoose.connection.close()
    console.log('\n🔌 Connection closed')
    process.exit(0)
  }
}

runAnalytics()
