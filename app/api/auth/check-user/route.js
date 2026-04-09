import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/user'

export async function POST(req) {
  await connectDB()
  const { phone } = await req.json()
  const user = await User.findOne({ phone })
  return NextResponse.json({ exists: !!user })
}