import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/user'
import { cookies } from 'next/headers'

export async function POST(req) {
  await connectDB()

  try {
    const { phone, firebaseUid, token, name } = await req.json()

    if (!phone || !firebaseUid) {
      return NextResponse.json(
        { error: 'Invalid data' },
        { status: 400 }
      )
    }

    let user = await User.findOne({ firebaseUid })

    if (!user) {
      // New user — name save karo
      user = await User.create({
        phone,
        firebaseUid,
        firstName: name || null,
        plan: 'free',
        reportsUsed: 0,
        reportsLimit: 2
      })
    }

    const cookieStore = await cookies()
    cookieStore.set('userId', user._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/'
    })

    // ── Welcome notification — new users only ────────
    const isNewUser =
      (Date.now() - new Date(user.createdAt).getTime()) < 5 * 60 * 1000

    if (isNewUser) {
      try {
        const { default: PushTokenModel } = await import('@/models/PushToken')
        const { default: mongoose }       = await import('mongoose')
        const adminSdk                    = await import('@/lib/firebaseAdmin')

        const welcomeTokens = await PushTokenModel.find({
          active: true,
          userId: new mongoose.Types.ObjectId(user._id)
        }).lean()

        const welcomeList = welcomeTokens.map(t => t.token)

        if (welcomeList.length > 0) {
          await adminSdk.default.messaging()
            .sendEachForMulticast({
              tokens: welcomeList,
              webpush: {
                fcmOptions: { link: 'https://sehat24.com/upload' },
                data: {
                  title: '👋 Sehat24 mein swagat hai!',
                  body:  'Apni reports upload karo — Hindi mein sab explain hoga. Free 🇮🇳',
                  url:   'https://sehat24.com/upload',
                  icon:  'https://sehat24.com/icon-192x192.png'
                }
              }
            }).catch(console.error)
        }
      } catch (err) {
        console.error('Welcome notif error:', err.message)
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        phone: user.phone,
        name: user.firstName,
        plan: user.plan,
        reportsUsed: user.reportsUsed,
        reportsLimit: user.reportsLimit
      }
    })

  } catch (err) {
    console.error('Auth error:', err.message)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}