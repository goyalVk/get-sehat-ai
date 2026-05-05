// app/chat/page.js  ← server component, 'use client' NAHI
import ChatPage from './ChatPage' // rename current file to ChatPage.jsx

export const metadata = {
  title: 'Medicine Chat | Sehat24 — Hindi mein Health Advice',
  description: 'Medicine ka naam ya photo bhejo — side effects, dose, generic option Hindi mein jaano. Symptoms batao, Ayurvedic tips pao. Free health assistant.',
}

export default function Page() {
  return <ChatPage />
}