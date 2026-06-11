import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/user'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export async function POST(req) {
  try {
    const { phone, otp, name } = await req.json()

    if (!phone || !otp) {
      return NextResponse.json(
        { error: 'Phone aur OTP required hai' },
        { status: 400 }
      )
    }

    await connectDB()

    // Find user
    const user = await User.findOne({ phone: `+91${phone}` })
    if (!user) {
      return NextResponse.json(
        { error: 'User nahi mila — pehle OTP bhejo' },
        { status: 404 }
      )
    }

    // Check OTP expiry
    if (!user.otp || !user.otpExpiry || user.otpExpiry < new Date()) {
      return NextResponse.json(
        { error: 'OTP expire ho gaya — dobara bhejo' },
        { status: 400 }
      )
    }

    // Verify OTP
    const isValid = await bcrypt.compare(otp, user.otp)
    if (!isValid) {
      // Increment attempt counter
      await User.updateOne(
        { phone: `+91${phone}` },
        { $inc: { otpAttempts: 1 } }
      )
      // Block after 5 wrong attempts
      if (user.otpAttempts >= 4) {
        await User.updateOne(
          { phone: `+91${phone}` },
          { otp: null, otpExpiry: null, otpAttempts: 0 }
        )
        return NextResponse.json(
          { error: 'Bahut zyada galat attempts — dobara OTP bhejo' },
          { status: 429 }
        )
      }
      return NextResponse.json(
        { error: 'OTP galat hai — dobara try karo' },
        { status: 401 }
      )
    }

    // Save name if new user
    const isNewUser = !user.firstName
    if (isNewUser && name?.trim()) {
      user.firstName = name.trim()
    }

    // Clear OTP fields
    user.otp         = null
    user.otpExpiry   = null
    user.otpAttempts = 0
    await user.save()

    // Find updated user
    const updatedUser = await User.findOne({ phone: `+91${phone}` }).lean()
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Server error — dobara try karo' },
        { status: 500 }
      )
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: updatedUser._id.toString(), phone: updatedUser.phone },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    )

    // Set httpOnly cookie
    const cookieStore = await cookies()
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/'
    })

    // Also set userId cookie for backward compatibility
    cookieStore.set('userId', updatedUser._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/'
    })

    // FCM Welcome notification — new users only
    if (isNewUser) {
      try {
        const { default: PushTokenModel } = await import('@/models/PushToken')
        const { default: mongoose }       = await import('mongoose')
        const adminSdk                    = await import('@/lib/firebaseAdmin')

        const welcomeTokens = await PushTokenModel.find({
          active: true,
          userId: new mongoose.Types.ObjectId(updatedUser._id)
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
        id:           updatedUser._id,
        phone:        updatedUser.phone,
        name:         updatedUser.firstName,
        plan:         updatedUser.plan,
        reportsUsed:  updatedUser.reportsUsed,
        reportsLimit: updatedUser.reportsLimit,
      }
    })

  } catch (err) {
    console.error('verify-otp error:', err.message)
    return NextResponse.json(
      { error: 'Server error — dobara try karo' },
      { status: 500 }
    )
  }
}
