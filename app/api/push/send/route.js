import { NextResponse } from 'next/server'
import admin from '@/lib/firebaseAdmin'
import { connectDB } from '@/lib/mongodb'
import PushToken from '@/models/PushToken'

export async function POST(req) {
  try {
    await connectDB()
    const {
      title,
      body,
      url        = 'https://sehat24.com',
      sendToAll  = false,
      userId     = null,
      anonId     = null,
    } = await req.json()

    if (!title || !body) {
      return NextResponse.json({ error: 'title and body required' }, { status: 400 })
    }

    const query = { active: true }
    if (!sendToAll) {
      if (userId) query.userId = userId
      if (anonId) query.anonId = anonId
    }

    const docs   = await PushToken.find(query).lean()
    const tokens = docs.map(d => d.token)

    if (tokens.length === 0) {
      return NextResponse.json({ success: false, message: 'No tokens found' })
    }

    const results = await admin.messaging().sendEachForMulticast({
      tokens,
      notification: { title, body },
      webpush: {
        fcmOptions: { link: url },
        notification: {
          title,
          body,
          icon: 'https://sehat24.com/icon-192x192.png',
        },
      },
    })

    // Deactivate tokens that bounced
    const failedTokens = results.responses
      .map((r, i) => (!r.success ? tokens[i] : null))
      .filter(Boolean)

    if (failedTokens.length > 0) {
      await PushToken.updateMany(
        { token: { $in: failedTokens } },
        { active: false }
      )
    }

    return NextResponse.json({
      success: true,
      sent:    results.successCount,
      failed:  results.failureCount,
    })
  } catch (err) {
    console.error('Push send error:', err.message)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
