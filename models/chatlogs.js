import mongoose from 'mongoose'

const ChatLogSchema = new mongoose.Schema({
  userId:  { type: String, required: true },
  message: { type: String },
}, { timestamps: true })

export default mongoose.models.ChatLog ||
  mongoose.model('ChatLog', ChatLogSchema)