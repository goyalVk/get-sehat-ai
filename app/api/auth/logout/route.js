import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('token')
    cookieStore.delete('userId')
    cookieStore.delete('firebaseToken')

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('logout error:', err.message)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
