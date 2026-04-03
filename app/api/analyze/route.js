import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Report from '@/models/report'
import { buildHealthPrompt } from '@/lib/healthPrompt'

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

export async function POST(req) {
  await connectDB()
  let reportId = null

  try {
    const formData = await req.formData()
    const file = formData.get('file')

    // Validations
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Upload PDF or image.' }, { status: 400 })
    }

    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 20MB allowed.' }, { status: 400 })
    }

    if (file.type !== 'application/pdf' && file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image too large. Max 5MB.' }, { status: 400 })
    }

    // DB mein processing record banao
    const report = await Report.create({
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      status: 'processing'
    })
    reportId = report._id.toString()

    // File buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')

    // Timer start
    const startTime = Date.now()

    // AI Analysis
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

    // Sirf EK baar save karo — sab fields ek saath
    await Report.findByIdAndUpdate(reportId, {
      status:         'completed',
      result:         interpretation,
      reportType:     interpretation.report_type    || null,
      reportCategory: interpretation.report_category || 'other',
      parameters:     interpretation.parameters     || [],
      urgentFlags:    interpretation.urgent_flags   || [],
      patient:        interpretation.patient        || {},
      lab:            interpretation.lab            || {},
      tokensUsed:     tokenUsage,
      analysisTimeMs,
      modelUsed:      'claude-sonnet-4-20250514'
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
    model: 'claude-sonnet-4-20250514',
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
    model: 'claude-sonnet-4-20250514',
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