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
        reportsLimit: 3
      })
    }

    const cookieStore = await cookies()
    cookieStore.set('userId', user._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30,
      path: '/'
    })

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