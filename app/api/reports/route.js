import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Report from '@/models/report'
import { cookies } from 'next/headers'
import User from '@/models/user'

export async function GET() {
  try {
    await connectDB()

    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
    }

    // Sirf completed reports
    const reports = await Report.find({
      userId,
      status: 'completed'  // ← only completed
    })
      .sort({ 'lab.collectedAt': -1, createdAt: -1 })
      .select('fileName reportType reportCategory parameters urgentFlags patient lab createdAt status')
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
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const reportId = searchParams.get('id')

    if (!reportId) {
      return NextResponse.json({ error: 'Report ID missing' }, { status: 400 })
    }

    // Sirf apni report delete kar sake
    const report = await Report.findOneAndDelete({
      _id: reportId,
      userId
    })

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // reportsUsed decrement karo
    await User.findByIdAndUpdate(userId, {
      $inc: { reportsUsed: -1 }
    })

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('Delete error:', err.message)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}