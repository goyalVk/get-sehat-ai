import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Report from '@/models/report'
import { cookies } from 'next/headers'

export async function POST(req) {
  try {
    await connectDB()

    const { rating, feedback, totalReports, reportTypes } = await req.json()

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating 1-5 required' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const cookieUserId = cookieStore.get('userId')?.value || null

    let jwtUserId = null
    const tokenCookie = cookieStore.get('token')?.value
    if (tokenCookie) {
      try {
        const jwt = await import('jsonwebtoken')
        const decoded = jwt.default.verify(tokenCookie, process.env.JWT_SECRET)
        jwtUserId = decoded.userId
      } catch {}
    }

    const resolvedUserId = jwtUserId || cookieUserId || null

    if (!resolvedUserId) {
      return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
    }

    const recentReport = await Report.findOne({
      userId: resolvedUserId,
      status: 'completed'
    }).sort({ createdAt: -1 })

    if (!recentReport) {
      return NextResponse.json({ error: 'No reports found' }, { status: 404 })
    }

    await Report.findByIdAndUpdate(recentReport._id, {
      $set: {
        'historyFeedback.rating':        Number(rating),
        'historyFeedback.comment':       feedback?.trim()?.slice(0, 500) || null,
        'historyFeedback.ratedAt':       new Date(),
        'historyFeedback.totalReports':  totalReports || null,
        'historyFeedback.reportTypes':   reportTypes  || [],
      }
    })

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('History feedback error:', err.message)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
