import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/user'
import { cookies } from 'next/headers'

export async function PUT(req) {
  try {
    await connectDB()

    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json(
        { error: 'Not logged in' },
        { status: 401 }
      )
    }

    const { firstName, lastName, email } = await req.json()

    const updated = await User.findByIdAndUpdate(
      userId,
      {
        firstName: firstName || null,
        lastName:  lastName  || null,
        email:     email     || null,
      },
      { new: true }
    )

    return NextResponse.json({
      success:   true,
      firstName: updated.firstName,
      lastName:  updated.lastName,
      email:     updated.email,
    })

  } catch (err) {
    console.error('Profile update error:', err.message)
    return NextResponse.json(
      { error: 'Profile update failed' },
      { status: 500 }
    )
  }
}