import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Report from '@/models/report'
import { buildHealthPrompt } from '@/lib/healthPrompt'
import { cookies } from 'next/headers'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function parseClaudeResponse(rawText) {
  let text = rawText.trim()
  text = text.replace(/^```json\s*/i, '')
  text = text.replace(/^```\s*/i, '')
  text = text.replace(/\s*```$/i, '')
  return JSON.parse(text.trim())
}

function calculateTokenUsage(usage) {
  const inputTokens  = usage.input_tokens  || 0
  const outputTokens = usage.output_tokens || 0
  const totalTokens  = inputTokens + outputTokens
  const inputCost    = (inputTokens  / 1_000_000) * 0.80
  const outputCost   = (outputTokens / 1_000_000) * 4.00
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

export async function POST(req) {
  await connectDB()
  let reportId = null

  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

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

    if (file.type !== 'application/pdf' && file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image too large. Max 5MB.' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    const report = await Report.create({
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      userId: userId || null,
      status: 'processing'
    })
    reportId = report._id.toString()

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')

    const startTime = Date.now()

    let interpretation
    let tokenUsage

    if (file.type === 'application/pdf') {
      const result = await analyzeWithPDF(base64)
      interpretation = result.interpretation
      tokenUsage = result.tokenUsage
    } else {
      const result = await analyzeWithVision(base64, file.type)
      interpretation = result.interpretation
      tokenUsage = result.tokenUsage
    }

    const analysisTimeMs = Date.now() - startTime

    // Date validate karo
    const labData = interpretation.lab || {}
    labData.collectedAt = validateReportDate(labData.collectedAt)
    labData.reportedAt  = validateReportDate(labData.reportedAt)

    // Duplicate check — same user, same report type, same collection date
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

    // Sirf ek baar save karo
    await Report.findByIdAndUpdate(reportId, {
      status:         'completed',
      result:         interpretation,
      reportType:     interpretation.report_type    || null,
      reportCategory: interpretation.report_category || 'other',
      parameters:     interpretation.parameters     || [],
      urgentFlags:    interpretation.urgent_flags   || [],
      patient:        interpretation.patient        || {},
      lab:            labData,
      fileSize:       file.size,
      tokensUsed:     tokenUsage,
      analysisTimeMs,
      modelUsed:      'claude-haiku-4-5-20251001'
    })

    return NextResponse.json({
      success: true,
      reportId,
      data: interpretation
    })

  } catch (err) {
    console.error('Analysis error:', err.message)

    if (reportId) {
      await Report.findByIdAndUpdate(reportId, {
        status: 'failed',
        errorMessage: err.message
      })
    }

    return NextResponse.json(
      { error: 'Analysis failed. Please try again.' },
      { status: 500 }
    )
  }
}

async function analyzeWithPDF(base64) {
  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 8000,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'document',
          source: {
            type: 'base64',
            media_type: 'application/pdf',
            data: base64
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
  const tokenUsage = calculateTokenUsage(response.usage)
  return { interpretation, tokenUsage }
}

async function analyzeWithVision(base64, mediaType) {
  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 8000,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: mediaType,
            data: base64
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
  const tokenUsage = calculateTokenUsage(response.usage)
  return { interpretation, tokenUsage }
}