import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/user'

export async function POST(req) {
  try {
    const { phone } = await req.json()

    if (!phone) {
      return NextResponse.json({ exists: false, hasName: false })
    }

    await connectDB()
    const user = await User.findOne({ phone }).lean()

    return NextResponse.json({
      exists:  !!user,
      hasName: !!(user?.firstName)
    })

  } catch (err) {
    console.error('check-user error:', err.message)
    return NextResponse.json({ exists: false, hasName: false })
  }
}