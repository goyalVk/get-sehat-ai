'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function NavButtons() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => { if (data.id) setIsLoggedIn(true) })
      .catch(() => {})
  }, [])

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-stone-400 hidden md:block">
        🌐 Hindi • English • Tamil • Telugu • Marathi
      </span>
      {isLoggedIn ? (
        <Link href="/dashboard"
          className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all">
          Dashboard →
        </Link>
      ) : (
        <Link href="/upload"
          className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all">
          Try Free →
        </Link>
      )}
    </div>
  )
}