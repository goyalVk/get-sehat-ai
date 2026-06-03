import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/user'
import PushToken from '@/models/PushToken'
import admin from '@/lib/firebaseAdmin'
import mongoose from 'mongoose'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()

  const now             = new Date()
  const twoDaysFromNow  = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
  const fourDaysFromNow = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000)

  const expiringUsers = await User.find({
    plan: { $in: ['paid', 'pro'] },
    subscriptionEndsAt: {
      $gte: twoDaysFromNow,
      $lte: fourDaysFromNow
    }
  }).lean()

  let sent   = 0
  let failed = 0

  for (const user of expiringUsers) {
    try {
      const tokens = await PushToken.find({
        userId: new mongoose.Types.ObjectId(user._id),
        active: true
      }).lean()

      if (tokens.length === 0) continue

      const daysLeft = Math.ceil(
        (new Date(user.subscriptionEndsAt) - now) / (1000 * 60 * 60 * 24)
      )

      await admin.messaging().sendEachForMulticast({
        tokens: tokens.map(t => t.token),
        webpush: {
          fcmOptions: { link: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://sehat24.com'}/upgrade` },
          data: {
            title: `⏰ Pro plan ${daysLeft} din mein khatam ho raha hai`,
            body:  'Renew karo — report history aur PDF download band na ho 🔄',
            url:   `${process.env.NEXT_PUBLIC_BASE_URL || 'https://sehat24.com'}/upgrade`,
            icon:  'https://sehat24.com/icon-192x192.png'
          }
        }
      })

      sent++
    } catch (e) {
      console.error('Subscription reminder error:', e)
      failed++
    }
  }

  return NextResponse.json({
    success:   true,
    sent,
    failed,
    timestamp: new Date().toISOString()
  })
}
