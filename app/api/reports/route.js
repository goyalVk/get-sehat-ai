import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Report from '@/models/report'
import { cookies } from 'next/headers'
import User from '@/models/user'
import { isValidObjectId } from 'mongoose'

export async function GET() {
  try {
    await connectDB()

    const cookieStore = await cookies()
    const cookieUserId = cookieStore.get('userId')?.value

    // JWT token support — OTP users ke liye
    let jwtUserId = null
    const tokenCookie = cookieStore.get('token')?.value
    if (tokenCookie) {
      try {
        const jwt = await import('jsonwebtoken')
        const decoded = jwt.default.verify(
          tokenCookie,
          process.env.JWT_SECRET
        )
        jwtUserId = decoded.userId
      } catch {
        // Invalid token — ignore
      }
    }

    const userId = jwtUserId || cookieUserId || null

    if (!userId) {
      return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
    }

    // Sirf completed reports
    const reports = await Report.find({
      userId,
      status: 'completed'  // ← only completed
    })
      .sort({ 'lab.collectedAt': -1, createdAt: -1 })
      .select('fileName reportType parameters urgentFlags result patient lab createdAt status')
      .lean()

    return NextResponse.json({ reports })

  } catch (err) {
    console.error('Reports fetch error:', err.message)
    return NextResponse.json(
      { error: 'Reports fetch nahi ho sake' },
      { status: 500 }
    )
  }
}

// Delete report
export async function DELETE(req) {
  try {
    await connectDB()

    const cookieStore = await cookies()
    const cookieUserId = cookieStore.get('userId')?.value

    // JWT token support — OTP users ke liye
    let jwtUserId = null
    const tokenCookie = cookieStore.get('token')?.value
    if (tokenCookie) {
      try {
        const jwt = await import('jsonwebtoken')
        const decoded = jwt.default.verify(
          tokenCookie,
          process.env.JWT_SECRET
        )
        jwtUserId = decoded.userId
      } catch {
        // Invalid token — ignore
      }
    }

    const userId = jwtUserId || cookieUserId || null

    if (!userId) {
      return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const reportId = searchParams.get('id')

    if (!reportId) {
      return NextResponse.json({ error: 'Report ID missing' }, { status: 400 })
    }

    if (!isValidObjectId(reportId)) {
      return NextResponse.json({ error: 'Invalid report ID' }, { status: 400 })
    }

    // Sirf apni report delete kar sake
    const report = await Report.findOneAndDelete({
      _id: reportId,
      userId
    })

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // Pro users = decrement karo (unlimited reports hain)
    // Free users = decrement mat karo (hasAnalyzed flag se control hoga)
    const deletedUser = await User.findById(userId).lean()
    const isProUser = deletedUser &&
      (deletedUser.plan === 'paid' || deletedUser.plan === 'pro') &&
      (!deletedUser.subscriptionEndsAt ||
        new Date(deletedUser.subscriptionEndsAt) > new Date())

    if (isProUser) {
      await User.findByIdAndUpdate(
        userId,
        { $inc: { reportsUsed: -1 } },
        { new: true }
      ).catch(err => console.error('Failed to decrement reportsUsed:', err.message))
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('Delete error:', err.message)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}