import mongoose from 'mongoose'

const sessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Allow null for guest sessions
    default: null
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  mode: {
    type: String,
    enum: ['technical', 'coding'],
    required: true
  },
  techStack: {
    type: String,
    required: true
  },
  level: {
    type: String,
    enum: ['Basic', 'Intermediate', 'Pro'],
    required: true
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  questions: [{
    id: String,
    text: String,
    category: String,
    difficulty: String,
    expectedPoints: [String],
    techStack: String,
    timeLimit: Number
  }],
  responses: {
    type: Map,
    of: String,
    default: new Map()
  },
  evaluations: {
    type: Map,
    of: {
      score: Number,
      strengths: [String],
      improvements: [String],
      overallFeedback: String,
      technicalAccuracy: Number,
      communicationClarity: Number,
      completeness: Number,
      problemSolving: Number
    },
    default: new Map()
  },
  scores: {
    type: Map,
    of: Number,
    default: new Map()
  },
  transcript: {
    type: String,
    default: ''
  },
  overallScore: {
    type: Number,
    min: 0,
    max: 100
  },
  feedback: {
    strengths: [String],
    improvements: [String],
    overallAssessment: String
  },
  analytics: {
    sessionSummary: {
      totalQuestions: Number,
      totalResponses: Number,
      averageScore: Number,
      sessionDuration: Number
    },
    performanceTrends: {
      responseQuality: [Number],
      technicalDepth: [Number],
      communicationClarity: [Number]
    },
    skillAssessment: {
      strongAreas: [String],
      improvementAreas: [String],
      recommendedTopics: [String]
    }
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active'
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    browserInfo: String
  },
  // Additional fields for coding test analysis
  challenge: {
    id: String,
    title: String,
    description: String,
    testCases: [{
      input: String,
      expectedOutput: String,
      hidden: Boolean
    }],
    language: String,
    timeLimit: Number
  },
  response: {
    type: String,
    default: ''
  },
  evaluation: {
    score: Number,
    analysis: {
      codeQuality: {
        overall: Number,
        readability: Number,
        efficiency: Number,
        bestPractices: Number
      },
      performance: {
        timeComplexity: String,
        spaceComplexity: String,
        optimality: Number
      },
      testResults: [{
        input: String,
        expected: String,
        actual: String,
        passed: Boolean,
        executionTime: Number,
        memoryUsage: Number
      }],
      feedback: {
        strengths: [String],
        improvements: [String],
        suggestions: [String]
      },
      breakdown: {
        correctness: Number,
        efficiency: Number,
        codeQuality: Number,
        problemSolving: Number
      }
    }
  },
  finalAnalysis: mongoose.Schema.Types.Mixed
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for performance
sessionSchema.index({ user: 1, createdAt: -1 })
sessionSchema.index({ mode: 1, techStack: 1 })
sessionSchema.index({ startTime: -1 })

// Virtual for calculated duration if endTime exists
sessionSchema.virtual('calculatedDuration').get(function() {
  if (this.endTime && this.startTime) {
    return Math.round((this.endTime - this.startTime) / (1000 * 60)) // minutes
  }
  return this.duration || 0
})

// Virtual for completion percentage
sessionSchema.virtual('completionPercentage').get(function() {
  if (this.questions.length === 0) return 0
  const responsesCount = this.responses ? this.responses.size : 0
  return Math.round((responsesCount / this.questions.length) * 100)
})

// Pre-save middleware to calculate duration
sessionSchema.pre('save', function(next) {
  if (this.endTime && this.startTime) {
    this.duration = Math.round((this.endTime - this.startTime) / (1000 * 60))
  }
  next()
})

// Instance method to complete session
sessionSchema.methods.complete = function() {
  this.endTime = new Date()
  this.status = 'completed'
  
  // Calculate overall score from individual scores
  if (this.scores && this.scores.size > 0) {
    const scoresArray = Array.from(this.scores.values())
    this.overallScore = Math.round(
      scoresArray.reduce((sum, score) => sum + score, 0) / scoresArray.length
    )
  }
  
  return this.save()
}

// Static method to find user sessions
sessionSchema.statics.findByUser = function(userId, options = {}) {
  const query = this.find({ user: userId })
  
  if (options.mode) query.where('mode', options.mode)
  if (options.techStack) query.where('techStack', options.techStack)
  if (options.status) query.where('status', options.status)
  if (options.limit) query.limit(options.limit)
  
  return query.sort({ createdAt: -1 }).populate('user', 'name email')
}

// Static method to get user statistics
sessionSchema.statics.getUserStats = async function(userId) {
  const sessions = await this.find({ user: userId, status: 'completed' })
  
  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      totalTime: 0,
      averageScore: 0,
      skillsAssessed: [],
      recentPerformance: []
    }
  }
  
  const totalTime = sessions.reduce((acc, session) => acc + (session.duration || 0), 0)
  const sessionsWithScores = sessions.filter(session => session.overallScore !== undefined)
  const averageScore = sessionsWithScores.length > 0 
    ? Math.round(sessionsWithScores.reduce((acc, session) => acc + session.overallScore, 0) / sessionsWithScores.length)
    : 0
  
  const skillsAssessed = [...new Set(sessions.map(session => session.techStack))]
  
  const recentPerformance = sessions
    .slice(-10)
    .map(session => ({
      date: session.createdAt.toISOString().split('T')[0],
      score: session.overallScore || 0,
      type: session.mode,
      techStack: session.techStack
    }))
  
  return {
    totalSessions: sessions.length,
    totalTime,
    averageScore,
    skillsAssessed,
    recentPerformance
  }
}

export default mongoose.model('Session', sessionSchema)
