import { NextResponse } from 'next/server'
import admin from '@/lib/firebaseAdmin'
import { connectDB } from '@/lib/mongodb'
import PushToken from '@/models/PushToken'
import mongoose from 'mongoose'

export async function POST(req) {
  // const token = req.headers.get('authorization')?.split(' ')[1]
  // if (!token) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  // }
  // try {
  //   await admin.auth().verifyIdToken(token)
  // } catch {
  //   return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  // }
  try {
    await connectDB()
    const {
      title,
      body,
      url       = 'https://sehat24.com',
      sendToAll = false,
      userId    = null,
      anonId    = null,
    } = await req.json()

    if (!title || !body) {
      return NextResponse.json(
        { error: 'title and body required' },
        { status: 400 }
      )
    }

    const query = { active: true }
    if (!sendToAll) {
      if (userId) {
        try {
          query.userId = new mongoose.Types
            .ObjectId(userId)
        } catch {
          return NextResponse.json(
            { error: 'Invalid userId' },
            { status: 400 }
          )
        }
      }
      if (anonId) query.anonId = anonId
    }

    const docs = await PushToken.find(query).lean()
    const tokens = docs.map(d => d.token)

    if (tokens.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No tokens found'
      })
    }

    const BATCH_SIZE   = 500
    const messaging    = admin.messaging()
    let totalSuccess   = 0
    let totalFailed    = 0
    const failedTokens = []

    for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
      const batch    = tokens.slice(i, i + BATCH_SIZE)
      const response = await messaging.sendEachForMulticast({
        tokens: batch,
        notification: { title, body },
        webpush: {
          fcmOptions: { link: url },
          data: {
            title,
            body,
            url,
            icon: 'https://sehat24.com/android-chrome-192x192.png'
          }
        }
      })

      totalSuccess += response.successCount
      totalFailed  += response.failureCount

      response.responses.forEach((r, idx) => {
        if (!r.success) {
          console.error('Token failed:', {
            token:        batch[idx].substring(0, 20),
            errorCode:    r.error?.code,
            errorMessage: r.error?.message
          })
          failedTokens.push(batch[idx])
        }
      })
    }

    if (failedTokens.length > 0) {
      await PushToken.updateMany(
        { token: { $in: failedTokens } },
        { active: false }
      )
    }

    return NextResponse.json({
      success: true,
      sent:    totalSuccess,
      failed:  totalFailed
    })

  } catch (err) {
    console.error('Push send error — message:', err.message)
    console.error('Push send error — code:', err.code ?? 'none')
    console.error('Push send error — stack:', err.stack)
    return NextResponse.json(
      { error: 'Failed' },
      { status: 500 }
    )
  }
}