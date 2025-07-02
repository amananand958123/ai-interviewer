import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: function() {
      return this.authProvider === 'local'
    },
    minLength: 6,
    select: false // Exclude password from queries by default
  },
  authProvider: {
    type: String,
    enum: ['local', 'google', 'github'],
    default: 'local'
  },
  providerId: {
    type: String,
    sparse: true
  },
  avatar: {
    type: String,
    default: null
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    difficultyLevel: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    preferredTechStack: {
      type: String,
      default: 'JavaScript'
    },
    notifications: {
      email: { type: Boolean, default: true },
      practice: { type: Boolean, default: true },
      weekly: { type: Boolean, default: true }
    }
  },
  stats: {
    totalSessions: { type: Number, default: 0 },
    totalTime: { type: Number, default: 0 }, // in minutes
    averageScore: { type: Number, default: 0 },
    lastActivity: { type: Date, default: Date.now }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for performance
userSchema.index({ providerId: 1, authProvider: 1 })
userSchema.index({ createdAt: -1 })

// Virtual for full name display
userSchema.virtual('displayName').get(function() {
  return this.name || this.email.split('@')[0]
})

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next()
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password)
  } catch (error) {
    throw error
  }
}

// Instance method to update stats
userSchema.methods.updateStats = function(sessionData) {
  this.stats.totalSessions += 1
  this.stats.totalTime += sessionData.duration || 0
  if (sessionData.score) {
    const totalScore = (this.stats.averageScore * (this.stats.totalSessions - 1)) + sessionData.score
    this.stats.averageScore = Math.round(totalScore / this.stats.totalSessions)
  }
  this.stats.lastActivity = new Date()
  return this.save()
}

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() })
}

export default mongoose.model('User', userSchema)
