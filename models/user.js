import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
  {
    phone:        { type: String, required: true, unique: true },
    firebaseUid:  { type: String, default: null, sparse: true },
    
    // Personal info
    firstName:    { type: String, default: null },
    lastName:     { type: String, default: null },
    email:        { type: String, default: null, sparse: true },
    
    // Plan
    plan:         { type: String, enum: ['free', 'paid', 'pro'], default: 'free' },
    reportsUsed:  { type: Number, default: 0 },
    reportsLimit: { type: Number, default: 5 },

    // Permanent flag — free user ne kabhi bhi report analyze ki hai
    // Delete se reset nahi hoga
    hasAnalyzed: { type: Boolean, default: false },

    // Legal consent — DPDP Act 2023
    consent: {
      agreed:   { type: Boolean, default: false },
      version:  { type: String,  default: null },
      agreedAt: { type: Date,    default: null },
    },

    paidAt:             { type: Date,    default: null },
    paymentId:          { type: String,  default: null },
    paymentAmount:      { type: Number,  default: null },
    paymentMethod:      { type: String,  default: null },
    subscriptionEndsAt: { type: Date,    default: null },
    
    // Status
    isActive:     { type: Boolean, default: true },
    isBlocked:    { type: Boolean, default: false },
    blockedReason: { type: String, default: null },

    // OTP Auth
    otp:         { type: String, default: null },
    otpExpiry:   { type: Date,   default: null },
    otpAttempts: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export default mongoose.models.User || mongoose.model('User', UserSchema)


