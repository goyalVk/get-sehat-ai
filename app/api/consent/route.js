import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/user'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export async function POST(req) {
  try {
    await connectDB()
    const { consent, version, timestamp } = await req.json()

    const cookieStore  = await cookies()
    const cookieUserId = cookieStore.get('userId')?.value

    let jwtUserId = null
    const tokenCookie = cookieStore.get('token')?.value
    if (tokenCookie) {
      try {
        const decoded = jwt.verify(tokenCookie, process.env.JWT_SECRET)
        jwtUserId = decoded.userId
      } catch {}
    }

    const userId = jwtUserId || cookieUserId || null

    // Save consent to user if logged in
    if (userId && consent) {
      await User.findByIdAndUpdate(userId, {
        $set: {
          'consent.agreed':   true,
          'consent.version':  version || 'v1',
          'consent.agreedAt': new Date(timestamp || Date.now()),
        }
      })
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('Consent error:', err.message)
    return NextResponse.json({ success: true }) // Always return success
  }
}
