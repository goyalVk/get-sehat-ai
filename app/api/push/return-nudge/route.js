import { connectDB } from '@/lib/mongodb'
import PushToken from '@/models/PushToken'
import Report from '@/models/report'
import admin from '@/lib/firebaseAdmin'
import { NextResponse } from 'next/server'

export async function GET() {
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

    await admin.messaging().sendEachForMulticast({
      tokens: tokenList,
      webpush: {
        fcmOptions: { link: 'https://sehat24.com/upload' },
        data: {
          title: '📋 Sehat24 yaad hai?',
          body:  'Nayi report upload karo — Free 🇮🇳',
          url:   'https://sehat24.com/upload',
          icon:  'https://sehat24.com/icon-192x192.png'
        }
      }
    }).catch(console.error)

    return NextResponse.json({ success: true, sent: tokenList.length })

  } catch (err) {
    console.error('Return nudge error:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
