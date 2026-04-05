import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Report from '@/models/report'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    await connectDB()

    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json(
        { error: 'Not logged in' },
        { status: 401 }
      )
    }

    const reports = await Report.find({ userId })
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