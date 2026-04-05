import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/user'
import { cookies } from 'next/headers'

export async function POST(req) {
  await connectDB()

  try {
    const { phone, firebaseUid, token } = await req.json()

    if (!phone || !firebaseUid) {
      return NextResponse.json(
        { error: 'Invalid data' },
        { status: 400 }
      )
    }

    // User dhundo ya banao
    let user = await User.findOne({ firebaseUid })

    if (!user) {
      // Naya user
      user = await User.create({
        phone,
        firebaseUid,
        plan: 'free',
        reportsUsed: 0,
        reportsLimit: 3
      })
    }

    // Simple session cookie set karo
    const cookieStore = await cookies()
    cookieStore.set('userId', user._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    })

    cookieStore.set('firebaseToken', token, {
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