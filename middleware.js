import { NextResponse } from 'next/server'

export function middleware(request) {
  const ua = request.headers.get('user-agent') || ''

  if (!ua.trim()) {
    return NextResponse.json(
      { error: 'Access denied' },
      { status: 403 }
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/analyze'
}
