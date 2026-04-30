// scripts/check-payment.js
const mongoose = require('mongoose')

async function checkUser() {
  await mongoose.connect("mongodb+srv://vkgoyalvk85:Vivek007@get-sehat-ai.l6cglqo.mongodb.net/getsehat?retryWrites=true&w=majority&appName=get-sehat-ai")
  const db = mongoose.connection.db

  // Apna phone number daalo
  const phone = '+919711221836' // ← apna number

  const user = await db.collection('users')
    .findOne({ phone })

  console.log('User found:', user)
  await mongoose.disconnect()
}

checkUser()