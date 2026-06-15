import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/user'
import bcrypt from 'bcryptjs'
import { randomInt } from 'crypto'

export async function POST(req) {
  try {
    const { phone } = await req.json()

    // Validate — 10-digit Indian number
    if (!phone || !/^\d{10}$/.test(phone)) {
      return NextResponse.json(
        { error: 'Valid 10 digit mobile number enter karo' },
        { status: 400 }
      )
    }

    await connectDB()

    // Rate limit — max 3 OTP requests per 10 minutes
    const existing = await User.findOne({ phone: `+91${phone}` }).lean()
    if (existing) {
      const tenMinAgo = new Date(Date.now() + 30 * 60 * 1000)
      if (existing.otpAttempts >= 3 && existing.otpExpiry > tenMinAgo) {
        return NextResponse.json(
          { error: 'Bahut zyada requests. 10 minute baad try karo.' },
          { status: 429 }
        )
      }
    }

    // Generate 6-digit OTP — cryptographically secure
    const otp = randomInt(100000, 999999).toString()

    // Hash before storing
    const hashedOtp = await bcrypt.hash(otp, 10)
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

    // Send via 2Factor
    const twoFactorRes = await fetch(
      `https://2factor.in/API/V1/${process.env.TWOFACTOR_API_KEY}/SMS/${phone}/${otp}/OTP1`,
      { method: 'GET' }
    )
    const twoFactorText = await twoFactorRes.text()
    console.log('2Factor raw response:', twoFactorText)
    let twoFactorBody
    try {
      twoFactorBody = JSON.parse(twoFactorText)
    } catch {
      twoFactorBody = { Status: 'Error', Details: twoFactorText }
    }

    if (twoFactorBody.Status !== 'Success') {
      return NextResponse.json(
        { error: 'OTP bhejne mein problem aayi — dobara try karo' },
        { status: 500 }
      )
    }

    // Upsert user — save hashed OTP
    await User.findOneAndUpdate(
      { phone: `+91${phone}` },
      {
        otp: hashedOtp,
        otpExpiry,
        $inc: { otpAttempts: 1 },
      },
      { upsert: true, new: true }
    )

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('send-otp error:', err.message)
    return NextResponse.json(
      { error: 'Server error — dobara try karo' },
      { status: 500 }
    )
  }
}
