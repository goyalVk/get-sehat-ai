const mongoose = require('mongoose')
const fs = require('fs')

async function exportAllData() {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect("mongodb+srv://vkgoyalvk85:Vivek007@get-sehat-ai.l6cglqo.mongodb.net/getsehat?retryWrites=true&w=majority&appName=get-sehat-ai")
    console.log('Connected ✅')

    const db = mongoose.connection.db

    // ── All Collections List ──
    const collections = await db.listCollections().toArray()
    console.log('Collections found:', collections.map(c => c.name))

    // ── Export Each Collection ──
    for (const col of collections) {
      const name = col.name
      const data = await db.collection(name).find({}).toArray()
      
      // JSON file banao
      fs.writeFileSync(
        `export_${name}.json`,
        JSON.stringify(data, null, 2)
      )
      
      console.log(`✅ ${name}: ${data.length} documents exported`)
    }

    // ── Summary ──
    const reports = await db.collection('reports').find({}).toArray()
    const users   = await db.collection('users').find({}).toArray()

    const summary = {
      exportDate: new Date().toISOString(),
      totalReports: reports.length,
      completedReports: reports.filter(r => r.status === 'completed').length,
      failedReports: reports.filter(r => r.status === 'failed').length,
      processingReports: reports.filter(r => r.status === 'processing').length,
      totalUsers: users.length,
      reportTypes: [...new Set(reports.map(r => r.reportType).filter(Boolean))],
      avgFileSize: reports.length > 0
        ? (reports.reduce((a, b) => a + (b.fileSize || 0), 0) / reports.length / 1024).toFixed(2) + ' KB'
        : 'N/A',
      totalTokensUsed: reports.reduce((a, b) => a + (b.tokensUsed?.totalTokens || 0), 0),
      totalCost: '$' + reports.reduce((a, b) => a + (b.tokensUsed?.estimatedCost || 0), 0).toFixed(4),
      dateRange: {
        first: reports.length > 0
          ? new Date(Math.min(...reports.map(r => new Date(r.createdAt)))).toISOString()
          : 'N/A',
        last: reports.length > 0
          ? new Date(Math.max(...reports.map(r => new Date(r.createdAt)))).toISOString()
          : 'N/A'
      }
    }

    fs.writeFileSync(
      'export_summary.json',
      JSON.stringify(summary, null, 2)
    )

    console.log('\n=== SEHAT24 FULL SUMMARY ===')
    console.log(JSON.stringify(summary, null, 2))
    console.log('\nSab files export ho gayi ✅')
    console.log('export_reports.json')
    console.log('export_users.json')
    console.log('export_summary.json')

    await mongoose.disconnect()
    process.exit(0)

  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
}

exportAllData()