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

    await PushToken.findOneAndUpdate(
      { token },
      {
        token,
        userId:   user?._id || null,
        anonId:   anonId || null,
        active:   true,
        platform: 'web',
      },
      { upsert: true, new: true }
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Save token error:', err.message)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
