import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Report from '@/models/report'

export async function GET() {
  try {
    await connectDB()
    const count = await Report.countDocuments({ status: 'completed' })
    return NextResponse.json({ count })
  } catch (err) {
    return NextResponse.json({ count: 0 })
  }
}