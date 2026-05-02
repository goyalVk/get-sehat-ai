'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const ChatWidget = dynamic(
  () => import('@/components/chatWidget'),  // ← Capital C fix
  { ssr: false, loading: () => null }
)

export default function ClientChatWidget() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)  // ← Delay hatao, turant load karo
  }, [])

  if (!mounted) return null
  return <ChatWidget />
}