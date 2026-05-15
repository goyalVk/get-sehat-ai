import { connectDB } from '@/lib/mongodb'
import PushToken from '@/models/PushToken'
import Report from '@/models/report'
import admin from '@/lib/firebaseAdmin'

const TIPS = [
  {
    title: '💡 Vitamin D tip',
    body: 'Roz 15 min dhoop lena Vitamin D ke liye zaroori hai',
    url: '/blog/vitamin-d-ki-kami'
  },
  {
    title: '🩸 Hemoglobin tip',
    body: 'Palak, rajma, chana — khoon badhane wale foods',
    url: '/blog/hemoglobin-kam-hona'
  },
  {
    title: '🍬 Sugar tip',
    body: 'HbA1c test se 3 mahine ka sugar average pata chalta hai',
    url: '/blog/hba1c-kya-hota-hai'
  },
  {
    title: '🦋 Thyroid tip',
    body: 'Thakaan aur weight gain? TSH test zaroor karwao',
    url: '/blog/thyroid-tsh-report-hindi'
  }
]

export async function GET(req) {
  try {
    await connectDB()

    const today = new Date()
    const isMonday = today.getDay() === 1
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000)

    const results = {
      nudge: 0,
      abnormal: 0,
      reengagement: 0,
      weeklyTip: 0
    }

    // ── 1. Return Nudge — 3 din inactive ──
    const inactiveAnons = await Report.aggregate([
      { $match: {
        status: 'completed',
        createdAt: { $lt: threeDaysAgo }
      }},
      { $group: {
        _id: '$anonId',
        lastUpload: { $max: '$createdAt' }
      }},
      { $match: {
        lastUpload: { $lt: threeDaysAgo },
        _id: { $ne: null }
      }}
    ])

    const nudgeAnonIds = inactiveAnons.map(u => u._id).filter(Boolean)

    if (nudgeAnonIds.length > 0) {
      const nudgeTokens = await PushToken.find({
        active: true,
        anonId: { $in: nudgeAnonIds }
      })
      const nudgeList = nudgeTokens.map(t => t.token)

      if (nudgeList.length > 0) {
        await admin.messaging().sendEachForMulticast({
          tokens: nudgeList,
          notification: {
            title: '📋 Sehat24 yaad hai?',
            body: 'Nayi report upload karo — Free 🇮🕳'
          },
          webpush: {
            fcmOptions: { link: 'https://sehat24.com/upload' }
          }
        }).catch(console.error)
        results.nudge = nudgeList.length
      }
    }

    // ── 2. Abnormal Value Reminder ──
    const abnormalReports = await Report.find({
      status: 'completed',
      createdAt: { $gte: twoDaysAgo, $lte: oneDayAgo },
      urgentFlags: { $exists: true, $ne: [] }
    }).lean()

    for (const report of abnormalReports) {
      const orQuery = []
      if (report.userId) orQuery.push({ userId: report.userId })
      if (report.anonId) orQuery.push({ anonId: report.anonId })
      if (orQuery.length === 0) continue

      const tokens = await PushToken.find({ active: true, $or: orQuery })
      const tokenList = tokens.map(t => t.token)
      if (tokenList.length === 0) continue

      await admin.messaging().sendEachForMulticast({
        tokens: tokenList,
        notification: {
          title: '⚠️ Doctor se mila aap?',
          body: 'Aapki report mein urgent flags the — dhyan dein 🙏'
        },
        webpush: {
          fcmOptions: { link: `https://sehat24.com/results/${report._id}` }
        }
      }).catch(console.error)
      results.abnormal++
    }

    // ── 3. Re-engagement — 7 din inactive ──
    const activeAnons = await Report.distinct(
      'anonId',
      { createdAt: { $gte: sevenDaysAgo } }
    )

    const reengageTokens = await PushToken.find({
      active: true,
      anonId: { $nin: activeAnons }
    })
    const reengageList = reengageTokens.map(t => t.token)

    if (reengageList.length > 0) {
      await admin.messaging().sendEachForMulticast({
        tokens: reengageList,
        notification: {
          title: '😊 Bahut din ho gaye!',
          body: 'Family ki report bhi check karo — Free 🇮🕳'
        },
        webpush: {
          fcmOptions: { link: 'https://sehat24.com/upload' }
        }
      }).catch(console.error)
      results.reengagement = reengageList.length
    }

    // ── 4. Weekly Tip — Sirf Monday ──
    if (isMonday) {
      const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000))
      const tip = TIPS[weekNumber % TIPS.length]

      const allTokens = await PushToken.find({ active: true })
      const allList = allTokens.map(t => t.token)

      if (allList.length > 0) {
        const batchSize = 500
        for (let i = 0; i < allList.length; i += batchSize) {
          const batch = allList.slice(i, i + batchSize)
          await admin.messaging().sendEachForMulticast({
            tokens: batch,
            notification: { title: tip.title, body: tip.body },
            webpush: {
              fcmOptions: { link: `https://sehat24.com${tip.url}` }
            }
          }).catch(console.error)
        }
        results.weeklyTip = allList.length
      }
    }

    return Response.json({
      success: true,
      date: today.toISOString(),
      isMonday,
      results
    })
  } catch (err) {
    console.error('Cron all error:', err)
    return Response.json({ error: 'Failed' }, { status: 500 })
  }
}
