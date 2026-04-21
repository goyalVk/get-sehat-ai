'use client'
import { useState, useEffect } from 'react'

export default function LiveCounter() {
  const [count, setCount] = useState(null)

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(d => setCount(d.count))
      .catch(() => {})
  }, [])

  if (!count) return (
    <span style={{ fontSize: 32, fontWeight: 700, color: '#0d9488', fontFamily: "'DM Serif Display', serif" }}>
      500+
    </span>
  )

  return (
    <span style={{ fontSize: 32, fontWeight: 700, color: '#0d9488', fontFamily: "'DM Serif Display', serif" }}>
      {count.toLocaleString('en-IN')}+
    </span>
  )
}