// scripts/update-limits.js

const mongoose = require('mongoose')

async function updateLimits() {
  await mongoose.connect("mongodb+srv://vkgoyalvk85:Vivek007@get-sehat-ai.l6cglqo.mongodb.net/getsehat?retryWrites=true&w=majority&appName=get-sehat-ai")
  const db = mongoose.connection.db

  // Sab free users ka limit 2 karo
  const result = await db.collection('users').updateMany(
    { plan: 'free' },
    { $set: { reportsLimit: 2 } }
  )

  console.log('Updated users:', result.modifiedCount)
  await mongoose.disconnect()
}

updateLimits()