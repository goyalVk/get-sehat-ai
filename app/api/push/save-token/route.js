import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import PushToken from '@/models/PushToken'
import { cookies } from 'next/headers'
import User from '@/models/user'

export async function POST(req) {
  try {
    await connectDB()
    const { token, anonId } = await req.json()

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value
    const user   = userId ? await User.findById(userId).lean() : null

    // Delete old tokens for same user
    if (user?._id) {
      await PushToken.deleteMany({
        userId: user._id,
        token: { $ne: token }
      })
    }

    if (anonId) {
      await PushToken.deleteMany({
        anonId,
        token: { $ne: token }
      })
    }

    await PushToken.findOneAndUpdate(
      { token },
      {
        token,
        userId:   user?._id || null,
        anonId:   anonId || null,
        active:   true,
        platform: 'web',
      },
      { upsert: true, returnDocument: 'after' }
    )

    // If user is already logged in, backfill any other anon tokens for the same anonId
    if (anonId && user?._id) {
      await PushToken.updateMany(
        { anonId, userId: null },
        { $set: { userId: user._id } }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Save token error:', err.message)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
