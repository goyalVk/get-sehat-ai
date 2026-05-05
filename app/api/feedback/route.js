import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Report from '@/models/report'

export async function POST(req) {
  try {
    await connectDB()
    const { reportId, rating, question } = await req.json()

    if (!reportId) {
      return NextResponse.json({ error: 'reportId required' }, { status: 400 })
    }

    if (rating !== undefined) {
      const r = Number(rating)
      if (!Number.isInteger(r) || r < 1 || r > 5) {
        return NextResponse.json({ error: 'Rating must be 1–5' }, { status: 400 })
      }
      await Report.findByIdAndUpdate(reportId, {
        $set: { 'feedback.rating': r, 'feedback.ratedAt': new Date() },
      })
    }

    if (question) {
      const q = String(question).trim().slice(0, 500)
      if (q) {
        await Report.findByIdAndUpdate(reportId, {
          $push: { 'feedback.clarifications': { question: q, askedAt: new Date() } },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Feedback error:', err.message)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
