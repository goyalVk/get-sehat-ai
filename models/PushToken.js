import mongoose from 'mongoose'

const PushTokenSchema = new mongoose.Schema({
  token:    { type: String, required: true, unique: true },
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  anonId:   { type: String, default: null },
  active:   { type: Boolean, default: true },
  platform: { type: String, default: 'web' },
}, { timestamps: true })

// token index removed — unique:true already creates it
PushTokenSchema.index({ userId: 1 })
PushTokenSchema.index({ anonId: 1 })
PushTokenSchema.index({ active: 1 })

export default mongoose.models.PushToken || mongoose.model('PushToken', PushTokenSchema)