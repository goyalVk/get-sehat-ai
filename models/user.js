import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
  {
    phone:        { type: String, required: true, unique: true },
    firebaseUid:  { type: String, required: true, unique: true },
    
    // Personal info
    firstName:    { type: String, default: null },
    lastName:     { type: String, default: null },
    email:        { type: String, default: null, sparse: true },
    
    // Plan
    plan:         { type: String, enum: ['free', 'paid'], default: 'free' },
    reportsUsed:  { type: Number, default: 0 },
    reportsLimit: { type: Number, default: 3 },
    
    // Status
    isActive:     { type: Boolean, default: true },
    isBlocked:    { type: Boolean, default: false },
    blockedReason: { type: String, default: null },
  },
  { timestamps: true }
)

export default mongoose.models.User || mongoose.model('User', UserSchema)