import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const rateLimitMap = new Map()

const SYSTEM_PROMPT = `You are Sehat24 Medicine Assistant for Indians.
RULES:
- ONLY answer medicine/medical questions
- Reply in Hinglish only
- Keep replies SHORT — max 4-5 lines
- NEVER diagnose, prescribe, or give person-specific dosage
- Always say "generally" or "usually"
- End EVERY reply with: "⚕️ Doctor se zaroor milein."
- Non-medical questions: "Sirf medicine questions answer karta hoon. 🙏"
- Serious symptoms: "Turant doctor ke paas jaao."
HELP WITH: Medicine info, side effects, fake vs original, Indian brands, photo identification, storage, generic vs brand.`

function checkRateLimit(userId) {
  const today   = new Date().toDateString()
  const key     = `${userId}_${today}`
  const current = rateLimitMap.get(key) || 0
  if (current >= 20) return false
  rateLimitMap.set(key, current + 1)
  return true
}

export async function POST(req) {
  try {
    const formData = await req.formData()
    const message  = formData.get('message')
    const image    = formData.get('image')
    const history  = JSON.parse(formData.get('history') || '[]')

    if (!message && !image) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const userId      = cookieStore.get('userId')?.value

    if (userId && !checkRateLimit(userId)) {
      return NextResponse.json({
        error: 'Aaj ke 20 messages ho gaye. Kal wapas aao! 🙏',
        limitReached: true
      }, { status: 429 })
    }

    const recentHistory = history
      .filter(m => m.role && m.content && m.content.trim())
      .slice(-3)
      .map(m => ({ role: m.role, content: m.content }))

    const messages = [
      ...recentHistory,
      {
        role: 'user',
        content: image
          ? [
              { type: 'image', source: { type: 'base64', media_type: image.type, data: Buffer.from(await image.arrayBuffer()).toString('base64') } },
              { type: 'text', text: message || 'Is medicine ke baare mein batao' }
            ]
          : message
      }
    ]

    // Streaming response
    const stream = await anthropic.messages.stream({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system:     SYSTEM_PROMPT,
      messages
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta?.text) {
            controller.enqueue(encoder.encode(chunk.delta.text))
          }
        }
        controller.close()
      }
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked'
      }
    })

  } catch (err) {
    console.error('Chat error:', err.message)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}