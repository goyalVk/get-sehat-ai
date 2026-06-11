import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/user'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export async function GET() {
  try {
    const cookieStore = await cookies()

    // Try JWT token cookie first (new OTP auth)
    let userId = null
    const tokenCookie = cookieStore.get('token')?.value
    if (tokenCookie) {
      try {
        const decoded = jwt.verify(tokenCookie, process.env.JWT_SECRET)
        userId = decoded.userId
      } catch (e) {
        // Invalid/expired JWT — try fallback
      }
    }

    // Fallback — old Firebase userId cookie
    if (!userId) {
      userId = cookieStore.get('userId')?.value
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Not logged in' },
        { status: 401 }
      )
    }

    await connectDB()
    const user = await User.findById(userId).lean()

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id:           user._id,
      phone:        user.phone,
      firstName:    user.firstName,
      lastName:     user.lastName,
      email:        user.email,
      plan:         user.plan,
      reportsUsed:  user.reportsUsed,
      reportsLimit: user.reportsLimit,
      createdAt:    user.createdAt,
    })

  } catch (err) {
    console.error('auth/me error:', err.message)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
