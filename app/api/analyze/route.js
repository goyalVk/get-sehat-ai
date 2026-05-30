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

export const maxDuration = 60   // Vercel: allow up to 60s before killing the function

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

async function compressImage(buffer) {
  const sharp = (await import('sharp')).default

  let compressed = await sharp(buffer)
    .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80 })
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
    throw new Error('Photo bahut badi hai 😕 — 5MB se chhoti photo try karo')
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
    const anonId      = formData.get('anonId')?.toString() || null
    const userAgent   = req.headers.get('user-agent') || null
    const visitCount  = parseInt(formData.get('visitCount')) || 1
    const honeypot    = formData.get('_hp') || ''
    const ip                           = getIPAddress(req)
    const { deviceType, os, browser }  = parseDeviceInfo(userAgent || '')
    const { uploadHour, uploadDay }    = getUploadTime()
    const referralSource               = formData.get('ref') || 'direct'
    console.log('Device info:', { ip, deviceType, os, browser })

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
        userId: null, anonId, sessionId: crypto.randomUUID(),
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
      console.log('Sample file detected...')
      const cachedReport = await Report.findOne({
        fileName: { $in: SAMPLE_NAMES },
        status:   'completed',
        isSample: true
      }).sort({ createdAt: -1 })

      if (cachedReport) {
        console.log('Sample cache hit ✅ — 0 tokens used!')
        const sampleCookies = await cookies()
        const sampleUserId  = sampleCookies.get('userId')?.value
        if (sampleUserId) {
          await User.findByIdAndUpdate(sampleUserId, { $inc: { reportsUsed: 1 } })
        }
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
      await Report.create({
        fileName: file.name, fileType: file.type, fileSize: file.size,
        userId: null, anonId, sessionId: crypto.randomUUID(),
        status: 'failed', isSpam: true, spamReason: 'invalid_file_type', userAgent,
      })
      return NextResponse.json(
        { error: 'Yeh file type support nahi hoti 😕 — sirf PDF ya photo (JPG, PNG) upload karo' },
        { status: 400 }
      )
    }

    // ── Min file size: 10KB ───────────────────────────
    if (file.size < 10 * 1024) {
      await Report.create({
        fileName: file.name, fileType: file.type, fileSize: file.size,
        userId: null, anonId, sessionId: crypto.randomUUID(),
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

    // ── Absolute max size ─────────────────────────────
    if (file.size > PRO_MAX_SIZE) {
      return NextResponse.json(
        { error: 'File bahut badi hai 😕 — 20MB se chhoti file bhejo' },
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
      isPro = user?.plan === 'pro' ||
              user?.plan === 'paid'
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
    // Pro user          → Sonnet (better analysis)
    // Free user         → Haiku  (fast + cost effective)
    const useSonnet  = isPro
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

    // ── Bot detection — anonId 10+ uploads today ─────
    if (anonId && !userId) {
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      const todayCount = await Report.countDocuments({ anonId, createdAt: { $gte: todayStart } })
      if (todayCount >= 10) {
        await Report.create({
          fileName: file.name, fileType: file.type, fileSize: file.size,
          userId: null, anonId, sessionId: crypto.randomUUID(),
          status: 'failed', isSpam: true, spamReason: 'bot_suspected', userAgent, visitCount,
        })
        return NextResponse.json({ error: 'Bahut zyada requests ⏳ — 1 minute baad dobara try karo' }, { status: 429 })
      }
    }

    // ── Image too small (<100KB) ──────────────────────
    if (file.type !== 'application/pdf' && file.size < 100 * 1024) {
      await Report.create({
        fileName: file.name, fileType: file.type, fileSize: file.size,
        userId: user?._id?.toString() || null, anonId, sessionId: crypto.randomUUID(),
        status: 'failed', preCheckFailed: true, spamReason: 'low_quality', userAgent,
      })
      return NextResponse.json({ error: 'Photo thodi unclear hai 📸 — achhi roshni mein seedha camera se report ki photo lo' }, { status: 400 })
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

    // ── PDF size check ────────────────────────────────
    if (resolvedFileType === 'application/pdf' && buffer.length > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'PDF bahut bada hai 📄 — 5MB se chhota wala upload karo' }, { status: 400 })
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

    let finalBuffer        = buffer
    let effectiveMediaType = resolvedFileType

    if (resolvedFileType !== 'application/pdf') {
      if (buffer.length > 4 * 1024 * 1024) {
        console.log('Compressing:', buffer.length, 'bytes')
        finalBuffer        = await compressImage(buffer)
        effectiveMediaType = 'image/jpeg'
        console.log('Compressed to:', finalBuffer.length, 'bytes')
      }

      if (finalBuffer.length > 4.5 * 1024 * 1024) {
        return NextResponse.json({
          error: 'Photo bahut badi hai 😕 — 5MB se chhoti photo try karo'
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
      if (userId) {
        await User.findByIdAndUpdate(userId, { $inc: { reportsUsed: 1 } })
      }
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
      ipAddress:      ip,
      deviceType,
      os,
      browser,
      referralSource,
      uploadHour,
      uploadDay,
    })
    reportId = report._id.toString()

    // ── Haiku pre-check — is this a medical document? ─
    try {
      const preCheckContent = [
        { type: 'text', text: 'Is this a medical lab report or health test result? Reply with only YES or NO.' },
        resolvedFileType === 'application/pdf'
          ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } }
          : { type: 'image',    source: { type: 'base64', media_type: effectiveMediaType,  data: base64 } }
      ]
      const preCheckResp = await anthropic.messages.create({
        model: HAIKU_MODEL, max_tokens: 10,
        messages: [{ role: 'user', content: preCheckContent }]
      })
      const preCheckAnswer = preCheckResp.content[0].text.trim().toUpperCase()
      if (!preCheckAnswer.startsWith('YES')) {
        await Report.findByIdAndUpdate(reportId, {
          status: 'failed', isNonMedical: true, isSpam: false,
          spamReason: 'non_medical', userAgent,
        })
        return NextResponse.json({
          error: 'Yeh medical report nahi lagti 🩺 — CBC, blood test ya thyroid report upload karo',
          isNonMedical: true
        }, { status: 400 })
      }
    } catch (preErr) {
      console.warn('Pre-check skipped:', preErr.message)
      // Pre-check failure → continue with full analysis
    }

    const startTime = Date.now()

    // ── AI Analysis with retry + 60s timeout ─────────
    const MAX_RETRIES = 2

    const doAnalysis = async () => {
      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          return resolvedFileType === 'application/pdf'
            ? await analyzeWithPDF(base64, modelToUse)
            : await analyzeWithVision(base64, effectiveMediaType, modelToUse)
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
    }

    let timeoutId
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        const err = new Error('Analysis timeout — server busy hai, thodi der baad try karo ⏳')
        err.isTimeout = true
        reject(err)
      }, 30_000)
    })

    const { interpretation, tokenUsage } = await Promise.race([doAnalysis(), timeoutPromise])
      .finally(() => clearTimeout(timeoutId))

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

    // ── Upgrade nudge — free limit reached ───────────
    try {
      if (userId && user?.plan === 'free') {
        const updatedUser = await User.findById(userId).lean()

        if (updatedUser?.reportsUsed >= updatedUser?.reportsLimit) {
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
            'patient.name': { $regex: new RegExp(patientName, 'i') }
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

    // ── Login nudge — anonymous user ─────────────────
    if (!userId && anonId) {
      try {
        const { default: PushTokenModel } = await import('@/models/PushToken')
        const adminSdk = await import('@/lib/firebaseAdmin')

        const anonTokens = await PushTokenModel.find({
          active: true,
          anonId,
          userId: null
        }).lean()

        const anonList = anonTokens.map(t => t.token)

        if (anonList.length > 0) {
          await adminSdk.default.messaging()
            .sendEachForMulticast({
              tokens: anonList,
              webpush: {
                fcmOptions: { link: 'https://sehat24.com/auth/login' },
                data: {
                  title: '🔓 Login karo — Full Access Pao!',
                  body:  'History dekho, trends track karo, PDF download karo — bilkul free!',
                  url:   'https://sehat24.com/auth/login',
                  icon:  'https://sehat24.com/icon-192x192.png'
                }
              }
            }).catch(console.error)
        }
      } catch (err) {
        console.error('Login nudge error:', err.message)
      }
    }

    // ── Push notification ─────────────────────────────
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

          console.log('📲 Notification sent:',
            tokens.length, 'devices')
        }
      }
    } catch (pushErr) {
      console.error('Push notification error:',
        pushErr.message)
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
      const isCorrupted =
        err.message.includes('Could not process') ||
        err.message.includes('JSON repair failed') ||
        err.message.includes('corrupt') ||
        err.message.includes('Unable to read') ||
        err.message.includes('Invalid PDF')
      const errorType = err.isTruncated                                                      ? 'report_too_large'
        : err.isParseError                                                                   ? 'parse_error'
        : /timeout|ETIMEDOUT/i.test(err.message)                                            ? 'timeout'
        : /overload|529|rate.?limit/i.test(err.message)                                     ? 'rate_limit'
        : /Could not process|corrupt|Unable to read|Invalid PDF/i.test(err.message)         ? 'corrupted'
        : 'unknown'
      await Report.findByIdAndUpdate(reportId, {
        status:       'failed',
        errorMessage: err.message,
        errorType,
        userAgent,
        ...(isCorrupted ? { isSpam: false, preCheckFailed: true, spamReason: 'corrupted' } : {}),
      })
    }

    // Truncated — return 400 with flag so frontend can show upgrade upsell
    if (err.isTruncated) {
      return NextResponse.json({ error: err.message, isTruncated: true }, { status: 400 })
    }

    const userMessage = err.isParseError || err.message.includes('bahut badi') || err.message.includes('bahut bada')
  ? err.message
  : err.message.includes('Could not process')
  ? 'Photo padh nahi paaye 😕 — dobara clear photo lo ya PDF try karo'
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
  const params = {
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
          source: { type: 'base64', media_type: 'application/pdf', data: base64 }
        }
      ]
    }]
  }

  const response = await anthropic.messages.create(params)

  if (response.stop_reason === 'max_tokens') {
    const err = new Error('Report bahut badi hai — Pro plan mein badi reports analyze hoti hain 🚀')
    err.isTruncated = true
    throw err
  }

  const interpretation = parseClaudeResponse(response.content[0].text)
  const tokenUsage     = calculateTokenUsage(response.usage, model)
  return { interpretation, tokenUsage }
}

// ── analyzeWithVision — model aware ───────────────────
async function analyzeWithVision(base64, mediaType, model = HAIKU_MODEL) {
  const params = {
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
          source: { type: 'base64', media_type: mediaType, data: base64 }
        }
      ]
    }]
  }

  const response = await anthropic.messages.create(params)

  if (response.stop_reason === 'max_tokens') {
    const err = new Error('Report bahut badi hai — Pro plan mein badi reports analyze hoti hain 🚀')
    err.isTruncated = true
    throw err
  }

  const interpretation = parseClaudeResponse(response.content[0].text)
  const tokenUsage     = calculateTokenUsage(response.usage, model)
  return { interpretation, tokenUsage }
}