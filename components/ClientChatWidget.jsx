'use client'
import dynamic from 'next/dynamic'

const ChatWidget = dynamic(
  () => import('@/components/chatWidget'),
  { ssr: false }
)

export default function ClientChatWidget() {
  return <ChatWidget />
}