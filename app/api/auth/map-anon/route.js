import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { connectDB } from '@/lib/mongodb'
import Report from '@/models/report'

// UUID v4 format produced by utils/anonId.js
const UUID_RE     = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
// MongoDB ObjectId — 24 hex chars
const OBJECTID_RE = /^[0-9a-f]{24}$/i

export async function POST(req) {
  // Auth: caller must be the logged-in user (cookie set by /api/auth/verify)
  const cookieStore  = await cookies()
  const cookieUserId = cookieStore.get('userId')?.value

  if (!cookieUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let anonId, userId
  try {
    ;({ anonId, userId } = await req.json())
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // Validate anonId is a proper UUID v4
  if (!anonId || !UUID_RE.test(anonId)) {
    return NextResponse.json({ error: 'Invalid anonId format' }, { status: 400 })
  }

  // Validate userId is a MongoDB ObjectId
  if (!userId || !OBJECTID_RE.test(userId)) {
    return NextResponse.json({ error: 'Invalid userId format' }, { status: 400 })
  }

  // Prevent privilege escalation — body userId must match the authenticated session
  if (userId !== cookieUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()

  const result = await Report.updateMany(
    { anonId, userId: null },
    { $set: { userId } }
  )

  return NextResponse.json({ ok: true, updated: result.modifiedCount })
}
