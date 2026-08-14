import { connectDB } from '@/lib/mongodb'
import PushToken from '@/models/PushToken'
import Report from '@/models/report'
import admin from '@/lib/firebaseAdmin'
import { NextResponse } from 'next/server'

export async function GET(req) {
  const token = req.headers.get('authorization')?.split(' ')[1]
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    await admin.auth().verifyIdToken(token)
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
  try {
    await connectDB()

    const threeDaysAgo = new Date(
      Date.now() - 3 * 24 * 60 * 60 * 1000
    )

    const activeAnons   = await Report.distinct('anonId',  { createdAt: { $gte: threeDaysAgo } })
    const activeUserIds = await Report.distinct('userId',  { createdAt: { $gte: threeDaysAgo } })

    const tokens = await PushToken.find({
      active: true,
      $and: [
        { anonId: { $nin: activeAnons } },
        {
          $or: [
            { userId: null },
            { userId: { $nin: activeUserIds } }
          ]
        }
      ]
    }).lean()

    const tokenList = tokens.map(t => t.token)

    if (tokenList.length === 0) {
      return NextResponse.json({ success: true, message: 'No inactive users' })
    }

    const BATCH_SIZE   = 500
    const messaging    = admin.messaging()
    const failedTokens = []

    for (let i = 0; i < tokenList.length; i += BATCH_SIZE) {
      const batch    = tokenList.slice(i, i + BATCH_SIZE)
      const response = await messaging.sendEachForMulticast({
        tokens: batch,
        notification: {
          title: '📋 Sehat24 yaad hai?',
          body:  'Nayi report upload karo 🇮🇳',
        },
        webpush: {
          fcmOptions: { link: 'https://sehat24.com/upload' },
          data: {
            title: '📋 Sehat24 yaad hai?',
            body:  'Nayi report upload karo 🇮🇳',
            url:   'https://sehat24.com/upload',
            icon:  'https://sehat24.com/icon-192x192.png'
          }
        }
      }).catch(e => { console.error('Batch send error:', e.message); return null })

      if (response) {
        response.responses.forEach((r, idx) => {
          if (!r.success) failedTokens.push(batch[idx])
        })
      }
    }

    if (failedTokens.length > 0) {
      await PushToken.updateMany(
        { token: { $in: failedTokens } },
        { active: false }
      )
    }

    return NextResponse.json({ success: true, sent: tokenList.length })

  } catch (err) {
    console.error('Return nudge error:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
