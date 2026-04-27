'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const ChatWidget = dynamic(
  () => import('@/components/chatWidget'),
  { ssr: false }
)

export default function ClientChatWidget() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  if (!mounted) return null
  return <ChatWidget />
}