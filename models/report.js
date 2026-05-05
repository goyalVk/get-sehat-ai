import mongoose from 'mongoose'

const ParameterSchema = new mongoose.Schema({
  name:            { type: String },
  value:           { type: String },
  unit:            { type: String },
  reference_range: { type: String },
  status:          { type: String }, // normal, low, high, critical
  explanation:     { type: String },
  action:          { type: String }
}, { _id: false })

const PatientSchema = new mongoose.Schema({
  name:        { type: String, default: null }, // PDF se extract
  age:         { type: String, default: null },
  gender:      { type: String, default: null },
  phone:       { type: String, default: null },
  email:       { type: String, default: null },
}, { _id: false })

const LabSchema = new mongoose.Schema({
  labName:      { type: String, default: null }, // SRL, Lal PathLabs etc
  labAddress:   { type: String, default: null },
  referredBy:   { type: String, default: null }, // Doctor name
  collectedAt:  { type: Date,   default: null },  // Sample collection date
  reportedAt:   { type: Date,   default: null },  // Report date
}, { _id: false })

const TokenSchema = new mongoose.Schema({
  inputTokens:   { type: Number, default: 0 },
  outputTokens:  { type: Number, default: 0 },
  totalTokens:   { type: Number, default: 0 },
  estimatedCost: { type: Number, default: 0 }
}, { _id: false })

const ReportSchema = new mongoose.Schema(
  {
    // User identity — future login ke liye
    userId:      { type: String, default: null },
    sessionId:   { type: String, default: null }, // Anonymous user track
    anonId:      { type: String, default: null },

    // File info
    fileName:    { type: String, required: true },
    fileType:    { type: String, required: true },
    fileSize:    { type: Number, default: 0 },     // bytes mein

    // Processing
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'processing'
    },
    isSample: { type: Boolean, default: false },
    errorMessage: { type: String, default: null },

    // Patient info — PDF se AI extract karega
    patient: PatientSchema,

    // Lab info — PDF se AI extract karega  
    lab: LabSchema,

    // Report classification
    reportType:    { type: String, default: null }, // CBC, LFT, Full Body etc
    reportCategory: {
      type: String,
      enum: ['blood', 'urine', 'thyroid', 'lipid', 'liver', 'kidney', 'diabetes', 'vitamin', 'full_body', 'other'],
      default: 'other'
    },

    // AI result
    result: { type: mongoose.Schema.Types.Mixed, default: null },

    // Individual parameters — comparison ke liye
    parameters: [ParameterSchema],

    // Urgent flags
    urgentFlags: [{ type: String }],

    // Token usage
    tokensUsed: TokenSchema,

    // Analytics
    analysisTimeMs: { type: Number, default: 0 }, // Kitna time laga
    modelUsed:      { type: String, default: null }, // Haiku ya Sonnet

    // Hash caching
    reportHash:      { type: String, default: null },
    analysisResult:  { type: mongoose.Schema.Types.Mixed, default: null },
    uploadCount:     { type: Number, default: 1 },
    firstUploadedAt: { type: Date,   default: null },
    lastUploadedAt:  { type: Date,   default: null },

    // User feedback
    feedback: {
      rating:    { type: Number, min: 1, max: 5, default: null },
      ratedAt:   { type: Date, default: null },
      clarifications: [{
        question: { type: String, maxlength: 500 },
        askedAt:  { type: Date, default: Date.now },
        _id: false,
      }],
    },
  },
  { timestamps: true } // createdAt, updatedAt automatic
)

// Future comparison ke liye index
ReportSchema.index({ userId: 1, reportType: 1, createdAt: -1 })
ReportSchema.index({ sessionId: 1, createdAt: -1 })
ReportSchema.index({ reportHash: 1 })
ReportSchema.index({ 'patient.name': 1 })

export default mongoose.models.Report || mongoose.model('Report', ReportSchema)