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
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    const event = JSON.parse(body)

    // Payment captured
    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity
      const phone = payment.contact?.replace('+91', '')

      await connectDB()

      // Phone se user dhundho
      const user = await User.findOne({ phone })

      if (user) {
        await User.findByIdAndUpdate(user._id, {
          plan:          'paid',
          reportsLimit:  999999,
          paidAt:        new Date(),
          paymentId:     payment.id,
          subscriptionEndsAt: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          )
        })
        console.log('User upgraded:', phone)
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