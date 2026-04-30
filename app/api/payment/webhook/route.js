import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/user'

export async function POST(req) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-razorpay-signature')

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex')

    if (expectedSignature !== signature) {
      console.log('Invalid signature ❌')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    const event = JSON.parse(body)
    console.log('Webhook event:', event.event)

    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity

      // ── Phone number — sab formats handle karo ──
      const rawPhone = payment.contact || ''
      const cleanPhone = rawPhone.replace(/\s/g, '').trim()
      const phoneWithout91 = cleanPhone
        .replace('+91', '')
        .replace(/^91/, '')

      console.log('Raw phone:', rawPhone)
      console.log('Clean phone:', cleanPhone)
      console.log('Without 91:', phoneWithout91)
      console.log('Amount: ₹', payment.amount / 100)

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
        console.log('✅ User upgraded:', user.phone)
      } else {
        console.log('❌ User not found for:', cleanPhone)
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