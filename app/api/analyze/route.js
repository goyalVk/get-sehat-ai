import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { connectDB } from '@/lib/mongodb'
import Report from '@/models/report'
import { buildHealthPrompt } from '@/lib/healthPrompt'
import { cookies } from 'next/headers'
import User from '@/models/user'
import { jsonrepair } from 'jsonrepair'
import { parseDeviceInfo, getIPAddress, getUploadTime } from '@/lib/deviceInfo'
import { rateLimit } from '@/lib/rateLimit'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export const maxDuration = 300  // Vercel: allow up to 300s (5min) for large reports
export const dynamic     = 'force-dynamic'  // never cache — reads cookies() on every request

// ── Model config ──────────────────────────────────────
const HAIKU_MODEL    = 'claude-haiku-4-5-20251001'
const SONNET_MODEL   = 'claude-sonnet-4-5'
const FREE_MAX_PAGES = 10  // 10 pages — free users only
// Pro = unlimited pages, any file size
// Guest = blocked completely
// Pro = unlimited — no page check needed

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

  // Step 2b — Fix common AI JSON malformations before jsonrepair
  // doctor_questions array sometimes split: ["Q1"], \n "Q2"]
  text = text.replace(
    /"doctor_questions"\s*:\s*\[\s*("(?:[^"\\]|\\.)*")\s*\]\s*,\s*\n\s*("(?:[^"\\]|\\.)*")\s*\]/g,
    '"doctor_questions": [$1, $2]'
  )
  // Trailing commas before closing brackets/braces
  text = text.replace(/,\s*\]/g, ']')
  text = text.replace(/,\s*\}/g, '}')

  // Step 3 — jsonrepair se fix karo
  let parsed
  try {
    const repaired = jsonrepair(text)
    parsed = JSON.parse(repaired)
  } catch (e) {
    console.error('JSON repair failed:', e.message)
    console.error('[parseClaudeResponse] Raw response:\n', rawText)
    const err = new Error('Report clearly nahi dikhi 😕 — PDF format mein try karo ya achhi roshni mein photo lo')
    err.isParseError = true
    throw err
  }

  // Step 4 — Required fields validate karo
  if (!parsed.report_type || !parsed.lab) {
    console.error('[parseClaudeResponse] Missing fields — report_type:', parsed.report_type, 'lab:', !!parsed.lab)
    console.error('[parseClaudeResponse] Raw response:\n', rawText)
    const err = new Error('Report clearly nahi dikhi 😕 — PDF format mein try karo ya achhi roshni mein photo lo')
    err.isParseError = true
    throw err
  }

  return parsed
}

// ── Retry classification ──────────────────────────────
function isRetriableError(err) {
  if (err.isTruncated) return false  // same large report will always truncate
  if (err.isParseError) return true
  const msg = err.message || ''
  return /timeout|ETIMEDOUT|ECONNRESET|fetch failed|overload|529|rate.?limit|503|502/i.test(msg)
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

  return { inputTokens, outputTokens, totalTokens, estimatedCost }
}

function validateReportDate(dateStr) {
  if (!dateStr) return null
  const date = new Date(dateStr)
  const now = new Date()
  const fiveYearsAgo = new Date()
  fiveYearsAgo.setFullYear(now.getFullYear() - 5)
  if (isNaN(date.getTime()) || date > now || date < fiveYearsAgo) {
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

// Detect real MIME type from magic bytes — browser-reported type can be wrong
// (e.g. JPEG files sometimes arrive declared as image/webp on some Android browsers)
function detectMimeFromBuffer(buf) {
  if (!buf || buf.length < 12) return null
  // JPEG: FF D8 FF
  if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return 'image/jpeg'
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) return 'image/png'
  // WebP: RIFF????WEBP
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
      buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) return 'image/webp'
  // PDF: %PDF
  if (buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46) return 'application/pdf'
  return null
}

// One-time migration per server instance: free users with old limit (2) → new limit (5)
let _migrationDone = false
async function maybeRunMigrations() {
  if (_migrationDone) return
  _migrationDone = true
  try {
    const User = (await import('@/models/user')).default
    await User.updateMany(
      { plan: 'free', reportsLimit: 2 },
      { $set: { reportsLimit: 5 } }
    )
  } catch (err) {
    console.error('Migration error:', err.message)
  }
}

// Compresses image in descending quality stages; caller checks final size against plan limit
async function compressImage(buffer) {
  const sharp = (await import('sharp')).default

  let compressed = await sharp(buffer)
    .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer()

  if (compressed.length > 4 * 1024 * 1024) {
    compressed = await sharp(buffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 60 })
      .toBuffer()
  }

  if (compressed.length > 4 * 1024 * 1024) {
    compressed = await sharp(buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 40 })
      .toBuffer()
  }

  if (compressed.length > 3 * 1024 * 1024) {
    compressed = await sharp(buffer)
      .resize(600, 600, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 30 })
      .toBuffer()
  }

  return compressed
}

export async function POST(req) {
  let reportId = null
  let userId   = null
  let anonId   = null

  const userAgent = req.headers.get('user-agent') || null

  try {
    await connectDB()
    maybeRunMigrations()  // fire-and-forget; idempotent
    const formData = await req.formData()
    const file    = formData.get('file')
    anonId            = formData.get('anonId')?.toString() || null
    const visitCount  = parseInt(formData.get('visitCount')) || 1
    const honeypot    = formData.get('_hp') || ''
    const ip                           = getIPAddress(req)
    const { deviceType, os, browser }  = parseDeviceInfo(userAgent || '')
    const { uploadHour, uploadDay }    = getUploadTime()
    const referralSource               = formData.get('ref') || 'direct'
    const rawUserId   = formData.get('userId')
    const earlyUserId = (rawUserId && rawUserId !== 'undefined' && rawUserId !== 'null')
      ? rawUserId
      : null

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // ── Honeypot check ────────────────────────────────
    if (honeypot) {
      await Report.create({
        fileName: file.name, fileType: file.type, fileSize: file.size,
        userId: earlyUserId, anonId, sessionId: crypto.randomUUID(),
        status: 'failed', isSpam: true, spamReason: 'honeypot', userAgent,
      })
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      )
    }

    // ── IP rate limit: 5 req/min ──────────────────────
    const { allowed } = rateLimit(ip, 5, 60_000)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Bahut zyada requests — ek minute baad try karo 🙏' },
        { status: 429 }
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
      const cachedReport = await Report.findOne({
        fileName: { $in: SAMPLE_NAMES },
        status:   'completed',
        isSample: true
      }).sort({ createdAt: -1 })

      if (cachedReport) {
        return NextResponse.json({
          success:   true,
          reportId:  cachedReport._id.toString(),
          data:      cachedReport.result,
          fromCache: true
        })
      }
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
      await Report.create({
        fileName: file.name, fileType: file.type, fileSize: file.size,
        userId: earlyUserId, anonId, sessionId: crypto.randomUUID(),
        status: 'failed', isSpam: true, spamReason: 'invalid_file_type', userAgent,
      })
      return NextResponse.json(
        { error: 'Yeh file type support nahi hoti 😕 — sirf PDF ya photo (JPG, PNG) upload karo' },
        { status: 400 }
      )
    }

    // ── Min file size: 4KB ────────────────────────────
    if (file.size < 4000) {
      await Report.create({
        fileName: file.name, fileType: file.type, fileSize: file.size,
        userId: earlyUserId, anonId, sessionId: crypto.randomUUID(),
        status: 'failed', isSpam: true, spamReason: 'file_too_small', userAgent,
      })
      return NextResponse.json(
        { error: 'File bahut chhoti hai 😕 — original lab report ka clear photo lo' },
        { status: 400 }
      )
    }

    // ── Non-medical filename check ────────────────────
    const fileNameLower = file.name.toLowerCase()
    const isNonMedical  = NON_MEDICAL_FILENAMES
      .some(keyword => fileNameLower.includes(keyword))

    if (isNonMedical) {
      return NextResponse.json({
        error: 'Yeh medical report nahi lagti 🩺 — CBC, blood test ya thyroid report upload karo',
        isNonMedical: true
      }, { status: 400 })
    }

    // ── Sanity cap (pre-auth) — anything over 16MB rejected immediately ──
    if (file.size > 16 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File bahut badi hai 😕 — 15MB se badi file support nahi hoti' },
        { status: 400 }
      )
    }

    // ── User + plan check — multiple fallbacks ────────
    // Method 1: httpOnly cookie (primary — logged-in users)
    const cookieStore  = await cookies()
    const cookieUserId = cookieStore.get('userId')?.value

    // Method 2: Authorization header (API / non-browser clients)
    const authHeader   = req.headers.get('authorization')
    const headerUserId = authHeader?.replace('Bearer ', '').trim() || null

    // earlyUserId fallback — from formData (handles cookie missing cases)
    const resolvedUserId = cookieUserId || headerUserId || earlyUserId || null
    userId               = resolvedUserId

    let user  = null
    let isPro = false

    if (userId) {
      user  = await User.findById(userId).catch(() => null)
      const now = new Date()
      isPro = (user?.plan === 'pro' || user?.plan === 'paid')
        && (!user?.subscriptionEndsAt || user.subscriptionEndsAt > now)
    }

    // ── Per-plan limits ───────────────────────────────
    const isGuestUser     = !userId
    // v4: No file size limits — only compression threshold
    const compressThreshold = isPro ? 10 * 1024 * 1024 : 3 * 1024 * 1024

    // ── Model selection ───────────────────────────────
    // Pro → Sonnet, Free first report → Sonnet (WOW moment), Guest → Haiku
    const modelToUse = (isPro || (!isPro && user && user.reportsUsed === 0))
      ? SONNET_MODEL
      : HAIKU_MODEL

    // ── Free user report limit check ──────────────────
    if (user) {
      if (!isPro && (user.reportsUsed >= 1 || user.hasAnalyzed)) {
        return NextResponse.json({
          error: 'Aapki free report use ho gayi 😊 Unlimited reports ke liye Pro lo!',
          limitReached: true,
          upgradeUrl: '/upgrade'
        }, { status: 403 })
      }
    }

    // ── Bot detection — anonId 10+ uploads today ─────
    if (anonId && !userId) {
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      const todayCount = await Report.countDocuments({ anonId, createdAt: { $gte: todayStart } })
      if (todayCount >= 10) {
        await Report.create({
          fileName: file.name, fileType: file.type, fileSize: file.size,
          userId: earlyUserId, anonId, sessionId: crypto.randomUUID(),
          status: 'failed', isSpam: true, spamReason: 'bot_suspected', userAgent, visitCount,
        })
        return NextResponse.json({ error: 'Bahut zyada requests ⏳ — 1 minute baad dobara try karo' }, { status: 429 })
      }
    }

    // Guest users = block completely — v4 paid model
    if (!userId) {
      return NextResponse.json(
        {
          loginRequired: true,
          error: 'Report analyze karne ke liye login karein — pehli report bilkul free! 🔓'
        },
        { status: 403 }
      )
    }

    // ── Image too small — warn but proceed to analysis ─
    const lowQualityWarning = file.type !== 'application/pdf' && file.size < 30 * 1024
    if (lowQualityWarning) {
      console.warn(`[precheck] Small image (${file.size}B < 30KB) — skipping hard-fail, proceeding to analysis`)
    }

    // ── File buffer ───────────────────────────────────
    const bytes  = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // ── Resolve true MIME type from magic bytes ───────
    // Overrides browser-declared type when they differ (e.g. JPEG mis-declared as image/webp)
    const detectedMime     = detectMimeFromBuffer(buffer)
    const resolvedFileType = detectedMime ?? file.type
    if (detectedMime && detectedMime !== file.type) {
      console.warn(`MIME mismatch — declared: ${file.type}, actual: ${detectedMime} — using actual`)
    }

    // ── Password protected PDF check ─────────────────
    if (resolvedFileType === 'application/pdf') {
      const pdfHeader = buffer.toString('latin1', 0, Math.min(buffer.length, 8192))
      if (pdfHeader.includes('/Encrypt')) {
        await Report.create({
          fileName: file.name, fileType: file.type, fileSize: file.size,
          userId: user?._id?.toString() || null, anonId, sessionId: crypto.randomUUID(),
          status: 'failed', isSpam: false, isNonMedical: false,
          preCheckFailed: true, spamReason: 'password_protected', userAgent,
        })
        return NextResponse.json({ error: 'PDF pe lock laga hai 🔒 — pehle password hataao, phir upload karo' }, { status: 400 })
      }
    }

    // ── PDF page count check (plan-aware) ─────────────
    if (resolvedFileType === 'application/pdf') {
      const pdfText   = buffer.toString('latin1')
      const pageCount = (pdfText.match(/\/Type\s*\/Page[^s]/g) || []).length
      // v4: Guest blocked above — sirf free vs pro
      const maxPages = isPro ? Infinity : FREE_MAX_PAGES

      if (pageCount > 0 && pageCount > maxPages) {
        await Report.create({
          fileName: file.name, fileType: resolvedFileType, fileSize: file.size,
          userId: user?._id?.toString() || null, anonId,
          sessionId: crypto.randomUUID(),
          status: 'failed', isSpam: false, preCheckFailed: true,
          spamReason: 'pdf_pages_free',
          errorMessage: `PDF mein ${pageCount} pages hain`,
          errorType: 'pdf_pages_free',
          userAgent,
        })
        return NextResponse.json({
          limitReached: true,
          upgradeUrl: '/upgrade',
          error: `${pageCount} page ki report ke liye Pro chahiye 😊 ₹599 → ₹199/month (Save 67%)`
        }, { status: 403 })
      }
    }

    let finalBuffer        = buffer
    let effectiveMediaType = resolvedFileType

    if (resolvedFileType !== 'application/pdf') {
      if (buffer.length > compressThreshold) {
        finalBuffer        = await compressImage(buffer)
        effectiveMediaType = 'image/jpeg'
      }

    }

    const base64 = finalBuffer.toString('base64')

    // ── Report hash cache ─────────────────────────────
    const reportHash   = createHash('md5').update(base64).digest('hex')
    const cachedByHash = await Report.findOne({ reportHash, status: 'completed' })

    if (cachedByHash?.analysisResult?.report_type) {
      // Check free limit
      if (user && !isPro && (user.reportsUsed >= 1 || user.hasAnalyzed)) {
        return NextResponse.json({
          error: 'Aapki free report use ho gayi 😊 Unlimited reports ke liye Pro lo!',
          limitReached: true,
          upgradeUrl: '/upgrade'
        }, { status: 403 })
      }

      // Create new report entry for this user
      // So it appears in their dashboard/history
      const newReport = await Report.create({
        // User identity
        userId:         userId || null,
        anonId:         anonId || null,

        // File info — copy from original
        fileName:       cachedByHash.fileName || 'report.pdf',
        fileType:       cachedByHash.fileType || 'application/pdf',
        fileSize:       cachedByHash.fileSize || 0,

        // Status
        status:         'completed',
        isSample:       false,

        // Patient + Lab — copy from original
        patient:        cachedByHash.patient || null,
        lab:            cachedByHash.lab     || null,

        // Report classification — copy from original
        reportType:     cachedByHash.reportType     || null,
        reportCategory: cachedByHash.reportCategory || 'other',

        // AI result — copy from original
        result:         cachedByHash.result         || null,
        analysisResult: cachedByHash.analysisResult || null,
        parameters:     cachedByHash.parameters     || [],
        urgentFlags:    cachedByHash.urgentFlags    || [],

        // Cache metadata
        reportHash:      reportHash,
        fromCache:       true,
        uploadCount:     1,
        firstUploadedAt: new Date(),
        lastUploadedAt:  new Date(),
      })

      // Update original cache hit count
      await Report.findByIdAndUpdate(cachedByHash._id, {
        $inc: { uploadCount: 1 },
        lastUploadedAt: new Date()
      })

      // Update user reportsUsed
      if (user) {
        await User.findByIdAndUpdate(user._id, {
          $inc: { reportsUsed: 1 },
          $set: { hasAnalyzed: true }
        })
      }

      return NextResponse.json({
        success:   true,
        reportId:  newReport._id.toString(),
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
      ipAddress:      ip,
      deviceType,
      os,
      browser,
      referralSource,
      uploadHour,
      uploadDay,
    })
    reportId = report._id.toString()

    const startTime = Date.now()

    // ── AI Analysis with retry — Vercel handles the hard 300s limit ──
    const MAX_RETRIES = 2

    const doAnalysis = async () => {
      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          return resolvedFileType === 'application/pdf'
            ? await analyzeWithPDF(base64, modelToUse, file.size, isPro)
            : await analyzeWithVision(base64, effectiveMediaType, modelToUse, file.size, isPro)
        } catch (e) {
          if (attempt < MAX_RETRIES && isRetriableError(e)) {
            console.warn(`Analysis attempt ${attempt + 1} failed (${e.message}) — retrying in 2s`)
            if (reportId) await Report.findByIdAndUpdate(reportId, { $inc: { retryCount: 1 } })
            await new Promise(r => setTimeout(r, 2000))
          } else {
            throw e
          }
        }
      }
      // Safety net — loop exhausted without returning or throwing
      throw new Error('Analysis failed after all retries — Claude API overloaded')
    }

    const { interpretation, tokenUsage } = await doAnalysis()

    const analysisTimeMs = Date.now() - startTime

    // ── Post-analysis quality gate for small images ────
    if (lowQualityWarning && (!interpretation.parameters || interpretation.parameters.length === 0)) {
      await Report.findByIdAndUpdate(reportId, { status: 'failed', preCheckFailed: true, spamReason: 'low_quality' })
      return NextResponse.json(
        { error: 'Report clearly nahi dikhi 😕 — PDF format mein try karo ya achhi roshni mein photo lo' },
        { status: 400 }
      )
    }

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
          .catch(err => console.error('Failed to delete duplicate (non-fatal):', err.message))
      }
    }

    // ── Save result ───────────────────────────────────
    const savedReport = await Report.findOneAndUpdate(
      { _id: reportId, status: 'processing' },
      {
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
        isSample:        isSampleFile,
        userAgent:       userAgent ? userAgent.substring(0, 300) : null,
        visitCount,
        ipAddress:       ip,
        deviceType,
        os,
        browser,
        referralSource,
        uploadHour,
        uploadDay,
        isSpam:          false,
        isNonMedical:    false,
        preCheckFailed:  false,
      },
      { new: true }
    )

    if (!savedReport) {
      console.error('findOneAndUpdate returned null — report may be stuck:', reportId)
      await Report.findByIdAndUpdate(reportId, {
        status:       'failed',
        errorMessage: 'Processing conflict — please try again',
        errorType:    'processing_conflict',
      })
      return NextResponse.json(
        { error: 'Processing conflict — dobara try karo' },
        { status: 409 }
      )
    }

    // ── Increment usage ───────────────────────────────
    if (userId && savedReport) {
      await User.findByIdAndUpdate(userId, {
        $inc: { reportsUsed: 1 },
        $set: { hasAnalyzed: true }
      })
    }

    // ── Upgrade nudge — free limit reached / pre-upgrade ─
    let isAtLimit = false
    try {
      if (userId && user?.plan === 'free') {
        const updatedUser = await User.findById(userId).lean()

        if (updatedUser?.reportsUsed >= 1 || updatedUser?.hasAnalyzed) {
          isAtLimit = true
          const { default: PushToken } = await import('@/models/PushToken')
          const { default: mongoose }  = await import('mongoose')

          const upgradeTokens = await PushToken.find({
            active: true,
            $or: [
              { userId: new mongoose.Types.ObjectId(userId) },
              ...(anonId ? [{ anonId }] : [])
            ]
          }).lean()

          const upgradeList = upgradeTokens.map(t => t.token)

          if (upgradeList.length > 0) {
            const adminSdk = await import('@/lib/firebaseAdmin')
            await adminSdk.default.messaging()
              .sendEachForMulticast({
                tokens: upgradeList,
                webpush: {
                  fcmOptions: { link: 'https://sehat24.com/upgrade' },
                  data: {
                    title: '📄 Free limit khatam ho gayi!',
                    body:  'Pro lo — Unlimited reports + History + PDF. Sirf ₹199/month',
                    url:   'https://sehat24.com/upgrade',
                    icon:  'https://sehat24.com/icon-192x192.png'
                  }
                }
              }).catch(console.error)
          }

        }
      }
    } catch (upgradeNotifErr) {
      console.error('Upgrade nudge error:', upgradeNotifErr.message)
    }

    // ── History nudge — 2nd same-type+patient report ─
    try {
      if (userId) {
        const patientName = interpretation?.patient?.name
          ?.trim()?.toLowerCase() || null

        if (patientName) {
          const { default: mongoose } = await import('mongoose')

          const samePatientCount = await Report.countDocuments({
            userId,
            status:     'completed',
            reportType: interpretation.report_type,
            'patient.name': { $regex: new RegExp(patientName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }
          })

          if (samePatientCount === 2) {
            const { default: PushToken } = await import('@/models/PushToken')

            const historyTokens = await PushToken.find({
              active: true,
              $or: [
                { userId: new mongoose.Types.ObjectId(userId) },
                ...(anonId ? [{ anonId }] : [])
              ]
            }).lean()

            const historyList = historyTokens.map(t => t.token)

            if (historyList.length > 0) {
              const adminSdk = await import('@/lib/firebaseAdmin')
              await adminSdk.default.messaging()
                .sendEachForMulticast({
                  tokens: historyList,
                  webpush: {
                    fcmOptions: { link: 'https://sehat24.com/history' },
                    data: {
                      title: '📈 Trend ready hai!',
                      body:  `${interpretation.report_type} ka trend dekho — 2 reports analyze ho gayi hain`,
                      url:   'https://sehat24.com/history',
                      icon:  'https://sehat24.com/icon-192x192.png'
                    }
                  }
                }).catch(console.error)
            }
          }
        }
      }
    } catch (historyNotifErr) {
      console.error('History nudge error:', historyNotifErr.message)
    }

    // ── Push notification ─────────────────────────────
    if (!isAtLimit) {
      try {
        const { default: adminApp } =
          await import('@/lib/firebaseAdmin')
        const { default: PushToken } =
          await import('@/models/PushToken')

        const tokenQuery = { active: true }

        if (userId) {
          const { default: mongoose } =
            await import('mongoose')
          tokenQuery.$or = [
            { userId: new mongoose.Types.ObjectId(userId) },
            { anonId: anonId || '' }
          ].filter(q => Object.values(q)[0])
        } else if (anonId) {
          tokenQuery.anonId = anonId
        }

        if (tokenQuery.$or || tokenQuery.anonId) {
          const pushTokens = await PushToken
            .find(tokenQuery).lean()
          const tokens = pushTokens
            .map(t => t.token)
            .filter(Boolean)

          if (tokens.length > 0) {
            const reportType =
              interpretation.report_type || 'Report'

            await adminApp.messaging()
              .sendEachForMulticast({
                tokens,
                webpush: {
                  fcmOptions: {
                    link: `https://sehat24.com/results/${reportId}`
                  },
                  data: {
                    title: `✅ ${reportType} ready hai!`,
                    body:  'Hindi mein result dekho →',
                    url:   `https://sehat24.com/results/${reportId}`,
                    icon:  'https://sehat24.com/icon-192x192.png'
                  }
                }
              }).catch(err =>
                console.error('Push error:', err.message)
              )

          }
        }
      } catch (pushErr) {
        console.error('Push notification error:',
          pushErr.message)
      }
    }

    return NextResponse.json({
      success:   true,
      reportId,
      data:      interpretation,
      modelUsed: modelToUse
    })

  } catch (err) {
    const msg = err?.message || ''
    console.error('Analysis error:', msg)

    if (reportId) {
      const isCorrupted =
        msg.includes('Could not process') ||
        msg.includes('JSON repair failed') ||
        msg.includes('corrupt') ||
        msg.includes('Unable to read') ||
        msg.includes('Invalid PDF')
      const errorType = err.isTruncated                                          ? 'report_too_large'
        : err.isParseError                                                       ? 'parse_error'
        : /timeout|ETIMEDOUT/i.test(msg)                                        ? 'timeout'
        : /overload|529|rate.?limit/i.test(msg)                                 ? 'rate_limit'
        : /Could not process|corrupt|Unable to read|Invalid PDF/i.test(msg)     ? 'corrupted'
        : 'unknown'
      await Report.findByIdAndUpdate(reportId, {
        status:       'failed',
        errorMessage: msg,
        errorType,
        userAgent,
        ...(isCorrupted ? { isSpam: false, preCheckFailed: true, spamReason: 'corrupted' } : {}),
      })

      if (userId || anonId) {
        try {
          const { default: PushToken } = await import('@/models/PushToken')
          const { default: adminSdk }  = await import('@/lib/firebaseAdmin')
          const failTokens = await PushToken.find({
            $or: [
              ...(userId ? [{ userId }] : []),
              ...(anonId ? [{ anonId }] : [])
            ],
            active: true
          }).lean()

          if (failTokens.length > 0) {
            await adminSdk.default.messaging().sendEachForMulticast({
              tokens: failTokens.map(t => t.token),
              webpush: {
                fcmOptions: { link: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://sehat24.com'}/upload` },
                data: {
                  title: '⚠️ Report analyze nahi ho payi',
                  body:  'Dobara try karo — clear photo ya PDF use karo 📸',
                  url:   `${process.env.NEXT_PUBLIC_BASE_URL || 'https://sehat24.com'}/upload`,
                  icon:  'https://sehat24.com/icon-192x192.png'
                }
              }
            }).catch(console.error)
          }
        } catch (e) {
          console.error('Failed notification error:', e.message)
        }
      }
    }

    // Truncated — return 400 with flag so frontend can show upgrade upsell
    if (err.isTruncated) {
      return NextResponse.json({ error: msg, isTruncated: true }, { status: 400 })
    }

    const isOverload =
      err?.status === 529 ||
      msg.includes('overloaded') ||
      msg.includes('529') ||
      err?.error?.type === 'overloaded_error'

    const userMessage = err.isParseError || msg.includes('bahut badi') || msg.includes('bahut bada')
      ? msg
      : msg.includes('Could not process')
      ? 'Photo padh nahi paaye 😕 — dobara clear photo lo ya PDF try karo'
      : msg.includes('timeout') || msg.includes('ETIMEDOUT')
      ? 'Server busy hai — thodi der baad try karo 🙏'
      : msg.includes('ECONNRESET') || msg.includes('fetch failed')
      ? 'Internet connection check karo aur dobara try karo 🙏'
      : isOverload
      ? 'Server thoda busy hai — 2-3 minute baad dobara try karo 🙏'
      : 'Kuch problem aayi — report dobara upload karo 🙏'

    return NextResponse.json(
      { error: userMessage },
      { status: 500 }
    )
  }
}

// ── analyzeWithPDF — model aware ──────────────────────
async function analyzeWithPDF(base64, model = HAIKU_MODEL, fileSize = 0, isPro = false) {
  const params = {
    model,
    max_tokens: model === SONNET_MODEL ? 12000 : 8000,
    messages: [{
      role: 'user',
      content: [
        {
          type:          'text',
          text:          buildHealthPrompt('Extract ALL medical values from this PDF report. Analyze every page.' +
            (fileSize / 1024 / 1024 > 1.5 && isPro ? '\n\nPRO USER: Provide comprehensive analysis. Include all parameters, doctor questions, herbs, detailed interpretation.' : '')),
          cache_control: { type: 'ephemeral' }
        },
        {
          type: 'document',
          source: { type: 'base64', media_type: 'application/pdf', data: base64 }
        }
      ]
    }]
  }

  const response = await anthropic.messages.create(params)

  if (response.stop_reason === 'max_tokens') {
    const err = new Error('Aapki report bahut badi hai 😕 Pro mein unlimited pages + deep analysis + PDF download — ₹199/month. sehat24.com/upgrade')
    err.isTruncated = true
    throw err
  }

  const interpretation = parseClaudeResponse(response.content[0].text)
  const tokenUsage     = calculateTokenUsage(response.usage, model)
  return { interpretation, tokenUsage }
}

// ── analyzeWithVision — model aware ───────────────────
async function analyzeWithVision(base64, mediaType, model = HAIKU_MODEL, fileSize = 0, isPro = false) {
  const params = {
    model,
    max_tokens: model === SONNET_MODEL ? 12000 : 8000,
    messages: [{
      role: 'user',
      content: [
        {
          type:          'text',
          text:          buildHealthPrompt('Extract ALL medical values from this lab report image. Read every number carefully.' +
            (fileSize / 1024 / 1024 > 1.5 && isPro ? '\n\nPRO USER: Provide comprehensive analysis. Include all parameters, doctor questions, herbs, detailed interpretation.' : '')),
          cache_control: { type: 'ephemeral' }
        },
        {
          type: 'image',
          source: { type: 'base64', media_type: mediaType, data: base64 }
        }
      ]
    }]
  }

  const response = await anthropic.messages.create(params)

  if (response.stop_reason === 'max_tokens') {
    const err = new Error('Aapki report bahut badi hai 😕 Pro mein unlimited pages + deep analysis + PDF download — ₹199/month. sehat24.com/upgrade')
    err.isTruncated = true
    throw err
  }

  const interpretation = parseClaudeResponse(response.content[0].text)
  const tokenUsage     = calculateTokenUsage(response.usage, model)
  return { interpretation, tokenUsage }
}