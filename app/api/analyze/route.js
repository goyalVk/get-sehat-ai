import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Report from '@/models/report'
import { buildHealthPrompt } from '@/lib/healthPrompt'
import { cookies } from 'next/headers'
import User from '@/models/user'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function parseClaudeResponse(rawText) {
  let text = rawText.trim()
  text = text.replace(/^```json\s*/i, '')
  text = text.replace(/^```\s*/i, '')
  text = text.replace(/\s*```$/i, '')
  text = text.trim()

  if (!text.endsWith('}')) {
    console.error('Claude response truncated — last 100 chars:', text.slice(-100))
    throw new Error('AI response was cut off. Please try again with a smaller report.')
  }

  return JSON.parse(text)
}

function calculateTokenUsage(usage) {
  const inputTokens   = usage.input_tokens  || 0
  const outputTokens  = usage.output_tokens || 0
  const totalTokens   = inputTokens + outputTokens
  const inputCost     = (inputTokens  / 1_000_000) * 0.80
  const outputCost    = (outputTokens / 1_000_000) * 4.00
  const estimatedCost = inputCost + outputCost

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
    .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer()

  if (compressed.length > 5 * 1024 * 1024) {
    compressed = await sharp(buffer)
      .resize(1280, 1280, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 60 })
      .toBuffer()
  }

  if (compressed.length > 5 * 1024 * 1024) {
    throw new Error('File bahut badi hai — choti file upload karo 🙏')
  }

  console.log(`Image compressed: ${buffer.length} → ${compressed.length} bytes`)
  return compressed
}

export async function POST(req) {
  await connectDB()
  let reportId = null

  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // ══════════════════════════════════════
    // SAMPLE FILE CACHE — DB SE RESULT LO
    // ══════════════════════════════════════
    const SAMPLE_NAMES = [
      'sample-cbc-report.pdf',
      'sample_report.pdf',
      'sample-report.pdf'
    ]

    const isSampleFile = SAMPLE_NAMES.includes(
      file.name?.toLowerCase()
    )

    if (isSampleFile) {
      console.log('Sample file detected...')

      // Pehle DB mein saved result check karo
      const cachedReport = await Report.findOne({
        fileName: { $in: SAMPLE_NAMES },
        status: 'completed',
        isSample: true
      }).sort({ createdAt: -1 })

      if (cachedReport) {
        // DB mein result hai — seedha do
        console.log('Sample cache hit ✅ — 0 tokens used!')
        return NextResponse.json({
          success:   true,
          reportId:  cachedReport._id.toString(),
          data:      cachedReport.result,
          fromCache: true
        })
      } //69f2d4a68c01082c314913f4
      

      // DB mein nahi hai — pehli baar analyze karo
      // Aur isSample: true flag lagao save karte waqt
      console.log('Sample not in cache — analyzing and saving...')
    }
    // ══════════════════════════════════════

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

    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Max 20MB allowed.' },
        { status: 400 }
      )
    }

    // Cookie se userId nikalo
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    // Free limit check
    if (userId) {
      const user = await User.findById(userId)

      if (!user) {
        console.log('User not found — skipping limit check')
      } else if (user.plan === 'free' && user.reportsUsed >= user.reportsLimit) {
        return NextResponse.json({
          error: 'Free limit reached. Please upgrade to continue.',
          limitReached: true
        }, { status: 403 })
      }
    }

    // Report create karo
    const report = await Report.create({
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      userId:   userId || null,
      status:   'processing',
      isSample: isSampleFile // ← Sample flag
    })
    reportId = report._id.toString()

    // File buffer banao
    const bytes  = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Image compress karo agar > 4MB
    let finalBuffer = buffer
    let effectiveMediaType = file.type

    if (file.type !== 'application/pdf' && buffer.length > 4 * 1024 * 1024) {
      finalBuffer = await compressImage(buffer)
      effectiveMediaType = 'image/jpeg'
    }

    const base64 = finalBuffer.toString('base64')
    const startTime = Date.now()

    // AI Analysis
    let interpretation
    let tokenUsage

    if (file.type === 'application/pdf') {
      const result   = await analyzeWithPDF(base64)
      interpretation = result.interpretation
      tokenUsage     = result.tokenUsage
    } else {
      const result   = await analyzeWithVision(base64, effectiveMediaType)
      interpretation = result.interpretation
      tokenUsage     = result.tokenUsage
    }

    const analysisTimeMs = Date.now() - startTime

    // Date validate karo
    const labData = interpretation.lab || {}
    labData.collectedAt = validateReportDate(labData.collectedAt)
    labData.reportedAt  = validateReportDate(labData.reportedAt)

    // Duplicate check
    if (labData.collectedAt && userId) {
      const startOfDay = new Date(labData.collectedAt)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(labData.collectedAt)
      endOfDay.setHours(23, 59, 59, 999)

      const existing = await Report.findOne({
        userId,
        reportType: interpretation.report_type,
        'lab.collectedAt': { $gte: startOfDay, $lte: endOfDay },
        status: 'completed'
      })

      if (existing) {
        await Report.findByIdAndDelete(existing._id)
        console.log('Duplicate report removed:', existing._id)
      }
    }

    // Result save karo
    await Report.findByIdAndUpdate(reportId, {
      status:         'completed',
      result:         interpretation,
      reportType:     interpretation.report_type     || null,
      reportCategory: interpretation.report_category || 'other',
      parameters:     normalizeParameters(interpretation.parameters),
      urgentFlags:    interpretation.urgent_flags    || [],
      patient:        interpretation.patient         || {},
      lab:            labData,
      fileSize:       file.size,
      tokensUsed:     tokenUsage,
      analysisTimeMs,
      modelUsed:      'claude-haiku-4-5-20251001',
      isSample:       isSampleFile // ← Sample flag
    })

    // Sample tha toh log karo
    if (isSampleFile) {
      console.log('✅ Sample analyzed & cached — next time DB se aayega!')
      console.log('Sample Report ID:', reportId)
    }

    // reportsUsed increment karo
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        $inc: { reportsUsed: 1 }
      })
    }

    return NextResponse.json({
      success: true,
      reportId,
      data: interpretation
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
      : 'Analysis failed. Please try again.'

    return NextResponse.json(
      { error: userMessage },
      { status: 500 }
    )
  }
}

async function analyzeWithPDF(base64) {
  const response = await anthropic.messages.create({
    model:      'claude-haiku-4-5-20251001',
    max_tokens: 8000,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'document',
          source: {
            type:       'base64',
            media_type: 'application/pdf',
            data:       base64
          }
        },
        {
          type: 'text',
          text: buildHealthPrompt('Extract ALL medical test values from this PDF. Ignore non-medical pages.')
        }
      ]
    }]
  })

  const interpretation = parseClaudeResponse(response.content[0].text)
  const tokenUsage     = calculateTokenUsage(response.usage)
  return { interpretation, tokenUsage }
}

async function analyzeWithVision(base64, mediaType) {
  const response = await anthropic.messages.create({
    model:      'claude-haiku-4-5-20251001',
    max_tokens: 8000,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type:       'base64',
            media_type: mediaType,
            data:       base64
          }
        },
        {
          type: 'text',
          text: buildHealthPrompt('Extract ALL values from the lab report image.')
        }
      ]
    }]
  })

  const interpretation = parseClaudeResponse(response.content[0].text)
  const tokenUsage     = calculateTokenUsage(response.usage)
  return { interpretation, tokenUsage }
}