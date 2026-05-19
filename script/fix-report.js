// scripts/fix-reports-used.js
import mongoose from 'mongoose'
const UserSchema = new mongoose.Schema({
  reportsUsed:  Number,
  reportsLimit: Number,
  plan:         String,
}, { timestamps: true })

const ReportSchema = new mongoose.Schema({
  userId: String, // ← String hai ObjectId nahi
  status: String,
}, { timestamps: true })

const User = mongoose.models.User || 
  mongoose.model('User', UserSchema)
const Report = mongoose.models.Report || 
  mongoose.model('Report', ReportSchema)

async function fixReportsUsed() {
  await mongoose.connect("mongodb+srv://vkgoyalvk85:Vivek007@get-sehat-ai.l6cglqo.mongodb.net/getsehat?retryWrites=true&w=majority&appName=get-sehat-ai")
  console.log('✅ Connected\n')

  const users = await User.find({}).lean()
  console.log(`Total users: ${users.length}\n`)

  let fixed = 0

  for (const user of users) {
    
    // userId String ke saath match karo
    const userIdStr = user._id.toString()
    
    const completedCount = await Report.countDocuments({
      userId: userIdStr, // ← String se match
      status: 'completed'
    })

    console.log(`User: ${userIdStr}`)
    console.log(`  reportsUsed: ${user.reportsUsed}`)
    console.log(`  Completed reports: ${completedCount}`)

    if (user.reportsUsed !== completedCount) {
      await User.findByIdAndUpdate(user._id, {
        $set: { reportsUsed: completedCount }
      })
      console.log(`  ✅ Fixed: ${user.reportsUsed} → ${completedCount}\n`)
      fixed++
    } else {
      console.log(`  ✓ Already correct\n`)
    }
  }

  console.log(`Total fixed: ${fixed} users`)
  await mongoose.disconnect()
  console.log('🔌 Done!')
}

fixReportsUsed().catch(console.error)