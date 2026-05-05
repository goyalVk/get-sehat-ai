import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { connectDB } from '@/lib/mongodb'
import Report from '@/models/report'
import { buildHealthPrompt } from '@/lib/healthPrompt'
import { cookies } from 'next/headers'
import User from '@/models/user'
import { jsonrepair } from 'jsonrepair'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ── Model config ──────────────────────────────────────
const HAIKU_MODEL   = 'claude-haiku-4-5-20251001'
const SONNET_MODEL  = 'claude-sonnet-4-5'
const FREE_MAX_SIZE = 10 * 1024 * 1024   // 10MB — free users
const PRO_MAX_SIZE  = 20 * 1024 * 1024  // 20MB — pro users

// ── Non-medical filenames (module level) ─────────────
const NON_MEDICAL_FILENAMES = [
  'aadhaar', 'aadhar', 'adhar',
  'pan card', 'pancard', 'pan_card',
  'driving licence', 'driving license', 'drivinglicence',
  'passport',
  'vehicle registration', 'rc book', 'rc_book',
  'invoice', 'bill',
  'electricity', 'bijli',
  'bank statement', 'bankstatement',
  'salary slip', 'salaryslip', 'payslip',
  'resume', 'cv_',
  'admit card', 'admitcard',
  'marksheet', 'result',
  'school', 'university', 'college',
  'certificate',
  'voter id', 'voterid',
  'ration card', 'rationcard'
]

function parseClaudeResponse(rawText) {
  let text = rawText.trim()

  // Step 1 — Clean markdown
  text = text.replace(/^```json\s*/i, '')
  text = text.replace(/^```\s*/i, '')
  text = text.replace(/\s*```$/i, '')
  text = text.trim()

  // Step 2 — First { se last } tak lo
  const firstBrace = text.indexOf('{')
  const lastBrace  = text.lastIndexOf('}')

  if (firstBrace !== -1 && lastBrace !== -1) {
    text = text.substring(firstBrace, lastBrace + 1)
  }

  // Step 3 — jsonrepair se fix karo
  try {
    const repaired = jsonrepair(text)
    return JSON.parse(repaired)
  } catch (e) {
    console.error('JSON repair failed:', e.message)
    throw new Error('Report analyze nahi ho saki — dobara try karo 🙏')
  }
}

// ── Token cost — model aware ──────────────────────────
function calculateTokenUsage(usage, model = HAIKU_MODEL) {
  const inputTokens  = usage.input_tokens  || 0
  const outputTokens = usage.output_tokens || 0
  const totalTokens  = inputTokens + outputTokens

  const isSonnet    = model === SONNET_MODEL
  const inputCost   = (inputTokens  / 1_000_000) * (isSonnet ? 3.00 : 0.80)
  const outputCost  = (outputTokens / 1_000_000) * (isSonnet ? 15.00 : 4.00)
  const estimatedCost = inputCost + outputCost

  console.log(`Model: ${model}`)
  console.log(`Tokens — Input: ${inputTokens}, Output: ${outputTokens}, Total: ${totalTokens}`)
  console.log(`Estimated cost: $${estimatedCost.toFixed(6)}`)

  return { inputTokens, outputTokens, totalTokens, estimatedCost }
}

function validateReportDate(dateStr) {
  if (!dateStr) return null
  const date = new Date(dateStr)
  const now = new Date()
  const fiveYearsAgo = new Date()
  fiveYearsAgo.setFullYear(now.getFullYear() - 5)
  if (isNaN(date.getTime()) || date > now || date < fiveYearsAgo) {
    console.log('Invalid date detected:', dateStr, '— setting to null')
    return null
  }
  return date
}

function normalizeParameters(parameters) {
  if (!parameters) return []
  return parameters.map(param => ({
    ...param,
    status: param.status?.toLowerCase().trim() || 'normal'
  }))
}

async function compressImage(buffer) {
  const sharp = (await import('sharp')).default

  let compressed = await sharp(buffer)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 70 })
    .toBuffer()

  console.log(`After first compress: ${compressed.length} bytes`)

  if (compressed.length > 4 * 1024 * 1024) {
    compressed = await sharp(buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 50 })
      .toBuffer()
    console.log(`After second compress: ${compressed.length} bytes`)
  }

  if (compressed.length > 4 * 1024 * 1024) {
    compressed = await sharp(buffer)
      .resize(600, 600, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 40 })
      .toBuffer()
    console.log(`After third compress: ${compressed.length} bytes`)
  }

  if (compressed.length > 4.5 * 1024 * 1024) {
    throw new Error('Image bahut badi hai — compress karke upload karo 🙏')
  }

  console.log(`✅ Compressed: ${buffer.length} → ${compressed.length} bytes`)
  return compressed
}

export async function POST(req) {
  await connectDB()
  let reportId = null

  try {
    const formData = await req.formData()
    const file    = formData.get('file')
    const anonId  = formData.get('anonId')?.toString() || null

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // ── Sample file cache ─────────────────────────────
    const SAMPLE_NAMES = [
      'sample-cbc-report.pdf',
      'sample_report.pdf',
      'sample-report.pdf'
    ]

    const isSampleFile = SAMPLE_NAMES.includes(file.name?.toLowerCase())

    if (isSampleFile) {
      console.log('Sample file detected...')
      const cachedReport = await Report.findOne({
        fileName: { $in: SAMPLE_NAMES },
        status:   'completed',
        isSample: true
      }).sort({ createdAt: -1 })

      if (cachedReport) {
        console.log('Sample cache hit ✅ — 0 tokens used!')
        return NextResponse.json({
          success:   true,
          reportId:  cachedReport._id.toString(),
          data:      cachedReport.result,
          fromCache: true
        })
      }
      console.log('Sample not in cache — analyzing and saving...')
    }

    // ── File type check ───────────────────────────────
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Upload PDF or image.' },
        { status: 400 }
      )
    }

    // ── Non-medical filename check ────────────────────
    const fileNameLower = file.name.toLowerCase()
    const isNonMedical  = NON_MEDICAL_FILENAMES
      .some(keyword => fileNameLower.includes(keyword))

    if (isNonMedical) {
      return NextResponse.json({
        error: 'Yeh medical lab report nahi lagti. Kripya blood test, MRI, ya pathology report upload karein.',
        isNonMedical: true
      }, { status: 400 })
    }

    // ── Absolute max size ─────────────────────────────
    if (file.size > PRO_MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Max 20MB allowed.' },
        { status: 400 }
      )
    }

    // ── User + plan check ─────────────────────────────
    const cookieStore = await cookies()
    const userId      = cookieStore.get('userId')?.value

    let user  = null
    let isPro = false

    if (userId) {
      user  = await User.findById(userId)
      isPro = user?.plan === 'pro'
    }

    // ── Large file + free user → upgrade prompt ───────
    if (file.size > FREE_MAX_SIZE && !isPro) {
      return NextResponse.json({
        error: `Aapki file ${(file.size / 1024 / 1024).toFixed(1)}MB ki hai. Badi reports ke liye Pro plan chahiye.`,
        requiresUpgrade: true,
        reason:          'large_file',
        fileSizeMB:      (file.size / 1024 / 1024).toFixed(1),
        upgradeUrl:      'https://rzp.io/rzp/f5GzI7Qj'
      }, { status: 403 })
    }

    // ── Model selection ───────────────────────────────
    // Pro user + large file → Sonnet (better for complex reports)
    // Everyone else         → Haiku  (fast + cost effective)
    const useSonnet  = isPro && file.size > FREE_MAX_SIZE
    const modelToUse = useSonnet ? SONNET_MODEL : HAIKU_MODEL

    console.log(`File: ${(file.size/1024/1024).toFixed(2)}MB | Plan: ${isPro ? 'pro' : 'free'} | Model: ${modelToUse}`)

    // ── Free user report limit check ──────────────────
    if (user) {
      if (user.plan === 'free' && user.reportsUsed >= user.reportsLimit) {
        return NextResponse.json({
          error:        'Aapki free report use ho gayi 🙏 Pro upgrade karo — unlimited reports lo!',
          limitReached: true,
          upgradeUrl:   'https://rzp.io/rzp/f5GzI7Qj'
        }, { status: 403 })
      }
    }

    // ── File buffer ───────────────────────────────────
    const bytes  = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    let finalBuffer        = buffer
    let effectiveMediaType = file.type

    if (file.type !== 'application/pdf') {
      if (buffer.length > 1 * 1024 * 1024) {
        console.log('Compressing:', buffer.length, 'bytes')
        finalBuffer        = await compressImage(buffer)
        effectiveMediaType = 'image/jpeg'
        console.log('Compressed to:', finalBuffer.length, 'bytes')
      }

      if (finalBuffer.length > 4.5 * 1024 * 1024) {
        return NextResponse.json({
          error: 'Image bahut badi hai — compress karke upload karo 🙏'
        }, { status: 400 })
      }
    }

    const base64 = finalBuffer.toString('base64')

    // ── Report hash cache ─────────────────────────────
    const reportHash   = createHash('md5').update(base64).digest('hex')
    const cachedByHash = await Report.findOne({ reportHash })

    if (cachedByHash?.analysisResult?.report_type) {
      console.log('Hash cache hit ✅ — 0 tokens used!')
      await Report.findByIdAndUpdate(cachedByHash._id, {
        $inc:          { uploadCount: 1 },
        lastUploadedAt: new Date()
      })
      return NextResponse.json({
        success:   true,
        reportId:  cachedByHash._id.toString(),
        data:      cachedByHash.analysisResult,
        fromCache: true
      })
    }

    // ── Create report record ──────────────────────────
    const now    = new Date()
    const report = await Report.create({
      fileName:  file.name,
      fileType:  file.type,
      fileSize:  file.size,
      userId:    user?._id?.toString() || null,
      anonId,
      sessionId: crypto.randomUUID(),
      status:    'processing',
      isSample:  isSampleFile,
    })
    reportId = report._id.toString()

    const startTime = Date.now()

    // ── AI Analysis ───────────────────────────────────
    let interpretation
    let tokenUsage

    if (file.type === 'application/pdf') {
      const result   = await analyzeWithPDF(base64, modelToUse)
      interpretation = result.interpretation
      tokenUsage     = result.tokenUsage
    } else {
      const result   = await analyzeWithVision(base64, effectiveMediaType, modelToUse)
      interpretation = result.interpretation
      tokenUsage     = result.tokenUsage
    }

    const analysisTimeMs = Date.now() - startTime

    // ── Date validate ─────────────────────────────────
    const labData = interpretation.lab || {}
    labData.collectedAt = validateReportDate(labData.collectedAt)
    labData.reportedAt  = validateReportDate(labData.reportedAt)

    // ── Duplicate check ───────────────────────────────
    if (labData.collectedAt && userId) {
      const startOfDay = new Date(labData.collectedAt)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(labData.collectedAt)
      endOfDay.setHours(23, 59, 59, 999)

      const existing = await Report.findOne({
        userId,
        reportType:        interpretation.report_type,
        'lab.collectedAt': { $gte: startOfDay, $lte: endOfDay },
        status:            'completed'
      })

      if (existing) {
        await Report.findByIdAndDelete(existing._id)
        console.log('Duplicate report removed:', existing._id)
      }
    }

    // ── Save result ───────────────────────────────────
    await Report.findByIdAndUpdate(reportId, {
      status:          'completed',
      result:          interpretation,
      analysisResult:  interpretation,
      reportHash,
      uploadCount:     1,
      firstUploadedAt: now,
      lastUploadedAt:  now,
      reportType:      interpretation.report_type     || null,
      reportCategory:  interpretation.report_category || 'other',
      parameters:      normalizeParameters(interpretation.parameters),
      urgentFlags:     interpretation.urgent_flags    || [],
      patient:         interpretation.patient         || {},
      lab:             labData,
      fileSize:        file.size,
      tokensUsed:      tokenUsage,
      analysisTimeMs,
      modelUsed:       modelToUse,
      isSample:        isSampleFile
    })

    if (isSampleFile) {
      console.log('✅ Sample analyzed & cached!')
      console.log('Sample Report ID:', reportId)
    }

    // ── Increment usage ───────────────────────────────
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        $inc: { reportsUsed: 1 }
      })
    }

    return NextResponse.json({
      success:   true,
      reportId,
      data:      interpretation,
      modelUsed: modelToUse
    })

  } catch (err) {
    console.error('Analysis error:', err.message)

    if (reportId) {
      await Report.findByIdAndUpdate(reportId, {
        status:       'failed',
        errorMessage: err.message
      })
    }

    const userMessage = err.message.includes('bahut badi')
  ? err.message
  : err.message.includes('JSON repair failed')
  ? 'Report samajh nahi aayi — clearer photo ya PDF upload karo 🙏'
  : err.message.includes('Could not process')
  ? 'Photo clear nahi hai — achhi roshni mein dobara photo lo 🙏'
  : err.message.includes('timeout') || err.message.includes('ETIMEDOUT')
  ? 'Server busy hai — thodi der baad try karo 🙏'
  : err.message.includes('ECONNRESET') || err.message.includes('fetch failed')
  ? 'Internet connection check karo aur dobara try karo 🙏'
  : 'Kuch problem aayi — report dobara upload karo 🙏'

    return NextResponse.json(
      { error: userMessage },
      { status: 500 }
    )
  }
}

// ── analyzeWithPDF — model aware ──────────────────────
async function analyzeWithPDF(base64, model = HAIKU_MODEL) {
  const response = await anthropic.messages.create({
    model,
    max_tokens: model === SONNET_MODEL ? 12000 : 8000,
    messages: [{
      role: 'user',
      content: [
        {
          type:          'text',
          text:          buildHealthPrompt('Extract ALL medical values from this PDF report. Analyze every page.'),
          cache_control: { type: 'ephemeral' }
        },
        {
          type: 'document',
          source: {
            type:       'base64',
            media_type: 'application/pdf',
            data:       base64
          }
        }
      ]
    }]
  })

  const interpretation = parseClaudeResponse(response.content[0].text)
  const tokenUsage     = calculateTokenUsage(response.usage, model)
  return { interpretation, tokenUsage }
}

// ── analyzeWithVision — model aware ───────────────────
async function analyzeWithVision(base64, mediaType, model = HAIKU_MODEL) {
  const response = await anthropic.messages.create({
    model,
    max_tokens: model === SONNET_MODEL ? 12000 : 8000,
    messages: [{
      role: 'user',
      content: [
        {
          type:          'text',
          text:          buildHealthPrompt('Extract ALL medical values from this lab report image. Read every number carefully.'),
          cache_control: { type: 'ephemeral' }
        },
        {
          type: 'image',
          source: {
            type:       'base64',
            media_type: mediaType,
            data:       base64
          }
        }
      ]
    }]
  })

  const interpretation = parseClaudeResponse(response.content[0].text)
  const tokenUsage     = calculateTokenUsage(response.usage, model)
  return { interpretation, tokenUsage }
}