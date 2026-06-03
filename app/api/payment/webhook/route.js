import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/user'

const RAZORPAY_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET
if (!RAZORPAY_SECRET) {
  throw new Error('Missing RAZORPAY_WEBHOOK_SECRET env var — set in Vercel Environment Variables')
}

export async function POST(req) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-razorpay-signature')

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_SECRET)
      .update(body)
      .digest('hex')

    if (expectedSignature !== signature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    const event = JSON.parse(body)

    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity

      // ── Phone number — sab formats handle karo ──
      const rawPhone = payment.contact || ''
      const cleanPhone = rawPhone.replace(/\s/g, '').trim()
      const phoneWithout91 = cleanPhone
        .replace('+91', '')
        .replace(/^91/, '')

      await connectDB()

      // ── Sab formats mein dhundho ──
      const user = await User.findOne({
        $or: [
          { phone: cleanPhone },              // +919711221836
          { phone: phoneWithout91 },          // 9711221836
          { phone: '+91' + phoneWithout91 },  // +919711221836
          { phone: '91' + phoneWithout91 },   // 919711221836
        ]
      })

      if (user?.plan === 'paid' && user?.paymentId === payment.id) {
        return NextResponse.json({ ok: true })
      }

      if (user) {
        await User.findByIdAndUpdate(user._id, {
          plan:               'paid',
          reportsLimit:       999999,
          reportsUsed:        0,
          paidAt:             new Date(),
          paymentId:          payment.id,
          paymentAmount:      payment.amount / 100,
          subscriptionEndsAt: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          )
        })

        // ── Pro welcome push notification ─────────────
        try {
          const { default: PushToken } = await import('@/models/PushToken')
          const { default: mongoose }  = await import('mongoose')
          const adminSdk               = await import('@/lib/firebaseAdmin')

          const proTokens = await PushToken.find({
            active: true,
            userId: new mongoose.Types.ObjectId(user._id)
          }).lean()

          const proList = proTokens.map(t => t.token)

          if (proList.length > 0) {
            await adminSdk.default.messaging()
              .sendEachForMulticast({
                tokens: proList,
                webpush: {
                  fcmOptions: { link: 'https://sehat24.com/upload' },
                  data: {
                    title: '🎉 Welcome to Sehat24 Pro!',
                    body:  'Unlimited reports, PDF download, History — sab unlock ho gaya!',
                    url:   'https://sehat24.com/upload',
                    icon:  'https://sehat24.com/icon-192x192.png'
                  }
                }
              }).catch(console.error)
          }
        } catch (notifErr) {
          console.error('Pro welcome notif error:', notifErr.message)
        }

      } else {
        console.error('PAYMENT USER NOT FOUND:', {
          phone:     cleanPhone,
          paymentId: payment.id,
          amount:    payment.amount / 100,
        })
      }
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json(
      { error: 'Webhook failed' },
      { status: 500 }
    )
  }
}