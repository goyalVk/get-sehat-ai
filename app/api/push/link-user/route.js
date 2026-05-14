import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import PushToken from '@/models/PushToken'
import { cookies } from 'next/headers'
import User from '@/models/user'

export async function POST(req) {
  try {
    await connectDB()
    const { token, anonId } = await req.json()

    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    if (!userId) {
      return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
    }

    const user = await User.findById(userId).lean()
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Link the specific FCM token to this user
    if (token) {
      await PushToken.findOneAndUpdate(
        { token },
        { $set: { userId: user._id } }
      )
    }

    // Backfill all anonymous tokens with the same anonId
    if (anonId) {
      await PushToken.updateMany(
        { anonId, userId: null },
        { $set: { userId: user._id } }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Link user error:', err.message)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
