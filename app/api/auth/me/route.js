import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/user'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

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
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}