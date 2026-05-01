import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Report from '@/models/report'
import { buildHealthPrompt } from '@/lib/healthPrompt'
import { cookies } from 'next/headers'
import User from '@/models/user'
import { jsonrepair } from 'jsonrepair'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })



function parseClaudeResponse(rawText) {
  let text = rawText.trim()

  // Step 1 — Clean markdown
  text = text.replace(/^```json\s*/i, '')
  text = text.replace(/^```\s*/i, '')
  text = text.replace(/\s*```$/i, '')
  text = text.trim()

  // Step 2 — First { se last } tak lo
  const firstBrace = text.indexOf('{')
  const lastBrace = text.lastIndexOf('}')

  if (firstBrace !== -1 && lastBrace !== -1) {
    text = text.substring(firstBrace, lastBrace + 1)
  }

  // Step 3 — jsonrepair se fix karo
  try {
    const repaired = jsonrepair(text)
    return JSON.parse(repaired)
  } catch (e) {
    console.error('JSON repair failed:', e.message)
    throw new Error(
      'Report analyze nahi ho saki — dobara try karo 🙏'
    )
  }
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

  // Pehle aggressive resize karo
  let compressed = await sharp(buffer)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 70 })
    .toBuffer()

  console.log(`After first compress: ${compressed.length} bytes`)

  // Still > 4MB?
  if (compressed.length > 4 * 1024 * 1024) {
    compressed = await sharp(buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 50 })
      .toBuffer()
    console.log(`After second compress: ${compressed.length} bytes`)
  }

  // Still > 4MB?
  if (compressed.length > 4 * 1024 * 1024) {
    compressed = await sharp(buffer)
      .resize(600, 600, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 40 })
      .toBuffer()
    console.log(`After third compress: ${compressed.length} bytes`)
  }

  // Still > 4.5MB? Error
  if (compressed.length > 4.5 * 1024 * 1024) {
    throw new Error(
      'PDF bahut badi hai — 5MB se kam rakho ya photo upload karo 🙏'
    )
  }

  console.log(`✅ Compressed: ${buffer.length} → ${compressed.length} bytes`)
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
            error: 'Aapki 1 free report use ho gayi 🙏 Pro upgrade karo — unlimited reports lo!',
            limitReached: true,
            upgradeUrl: 'https://rzp.io/rzp/f5GzI7Qj'
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

let finalBuffer = buffer
let effectiveMediaType = file.type

// ── 1MB se badi SARI images compress karo ──
if (file.type !== 'application/pdf') {
  if (buffer.length > 1 * 1024 * 1024) {
    console.log('Compressing:', buffer.length, 'bytes')
    finalBuffer = await compressImage(buffer)
    effectiveMediaType = 'image/jpeg'
    console.log('Compressed to:', finalBuffer.length, 'bytes')
  }

  // Final safety check
  if (finalBuffer.length > 4.5 * 1024 * 1024) {
    return NextResponse.json({
      error: 'Image bahut badi hai — compress karke upload karo 🙏'
    }, { status: 400 })
  }
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

    // Fix — Hinglish specific messages
    const userMessage = err.message.includes('bahut badi')
      ? err.message
      : err.message.includes('JSON repair failed')
      ? 'Report analyze nahi ho saki — dobara try karo 🙏'
      : err.message.includes('Could not process')
      ? 'Report clearly visible nahi hai — better quality image upload karo 🙏'
      : 'Kuch gadbad hui — thodi der baad try karo 🙏'

    return NextResponse.json(
      { error: userMessage },
      { status: 500 }
    )
  }
}

async function analyzeWithPDF(base64) {
  const response = await anthropic.messages.create({
    model:      'claude-haiku-4-5-20251001',
    max_tokens: 4096,
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
          text: buildHealthPrompt('Extract ALL medical values from this PDF report. Analyze every page.')
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
    max_tokens: 4096,
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
          text: buildHealthPrompt('Extract ALL medical values from this lab report image. Read every number carefully.')
        }
      ]
    }]
  })

  const interpretation = parseClaudeResponse(response.content[0].text)
  const tokenUsage     = calculateTokenUsage(response.usage)
  return { interpretation, tokenUsage }
}