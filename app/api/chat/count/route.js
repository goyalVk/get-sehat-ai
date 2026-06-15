import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import ChatLog from '@/models/chatlogs'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export async function GET() {
  try {
    await connectDB()

    const cookieStore  = await cookies()
    const cookieUserId = cookieStore.get('userId')?.value

    // JWT support
    let jwtUserId = null
    const tokenCookie = cookieStore.get('token')?.value
    if (tokenCookie) {
      try {
        const decoded = jwt.verify(tokenCookie, process.env.JWT_SECRET)
        jwtUserId = decoded.userId
      } catch {}
    }

    const userId = jwtUserId || cookieUserId || null

    if (!userId) {
      return NextResponse.json({ count: 0 })
    }

    const count = await ChatLog.countDocuments({
      userId,
      role: 'user'
    })

    return NextResponse.json({ count })

  } catch (err) {
    console.error('Chat count error:', err.message)
    return NextResponse.json({ count: 0 })
  }
}
