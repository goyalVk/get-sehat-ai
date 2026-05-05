import mongoose from 'mongoose'

const ChatLogSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  anonId:    { type: String, default: null },
  sessionId: { type: String, default: null },
  role:      { type: String, enum: ['user', 'assistant'], required: true },
  message:   { type: String, required: true },
  chatType:  { type: String, enum: ['medicine', 'report'], default: 'medicine' },
}, { timestamps: true })

ChatLogSchema.index({ userId:    1, createdAt: -1 })
ChatLogSchema.index({ anonId:    1, createdAt: -1 })
ChatLogSchema.index({ sessionId: 1, createdAt: -1 })

export default mongoose.models.ChatLog ||
  mongoose.model('ChatLog', ChatLogSchema)
