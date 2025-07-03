import express from 'express'
import { createServer } from 'http'
import { Server as SocketIO } from 'socket.io'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { spawn } from 'child_process'
import { writeFileSync, unlinkSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { tmpdir } from 'os'
import vm from 'vm'

// Import routes and models - updated to use existing project structure
import authRoutes, { optionalAuth, authenticate } from './routes/auth.js'
import Session from './models/Session.js'
import { connectDB, healthCheck } from './config/database.js'

// Environment configuration
dotenv.config({ path: '.env' })

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PORT = process.env.PORT || 3001

// Core Server Setup
const app = express()
const server = createServer(app)
const io = new SocketIO(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
})

// CORS configuration
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
}

// Security and middleware setup
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))
app.use(cors(corsOptions))
app.use(compression())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

// AI Integration (Gemini API)
const geminiConfig = {
  model: "gemini-2.0-flash",
  generationConfig: {
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 1024,
  },
  safetySettings: [
    {
      category: "HARM_CATEGORY_HARASSMENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_HATE_SPEECH",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
  ],
}

// Dual API Key Support with fallback
let genAI, model, fallbackGenAI, fallbackModel
const GEMINI_RATE_LIMIT_MS = 5000
let lastGeminiCall = 0
let usingFallbackKey = false

// Initialize primary Gemini API
if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    model = genAI.getGenerativeModel(geminiConfig)
    console.log('✅ Primary Gemini API initialized')
  } catch (error) {
    console.error('❌ Failed to initialize primary Gemini API:', error)
  }
} else {
  console.warn('⚠️ Primary GEMINI_API_KEY not found in environment')
}

// Initialize fallback Gemini API
if (process.env.GEMINI_API_KEY_FALLBACK) {
  try {
    fallbackGenAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_FALLBACK)
    fallbackModel = fallbackGenAI.getGenerativeModel(geminiConfig)
    console.log('✅ Fallback Gemini API initialized')
  } catch (error) {
    console.error('❌ Failed to initialize fallback Gemini API:', error)
  }
} else {
  console.warn('⚠️ Fallback GEMINI_API_KEY_FALLBACK not found in environment')
}

// MongoDB connection functions are imported from config/database.js

// Advanced AI conversation helper
class ConversationManager {
  constructor() {
    this.contexts = new Map()
    this.performanceMetrics = new Map()
  }

  getContext(sessionId) {
    if (!this.contexts.has(sessionId)) {
      this.contexts.set(sessionId, {
        history: [],
        performanceMetrics: {
          responseQuality: [],
          technicalDepth: [],
          communicationClarity: []
        }
      })
    }
    return this.contexts.get(sessionId)
  }

  addToHistory(sessionId, interaction) {
    const context = this.getContext(sessionId)
    context.history.push({
      ...interaction,
      timestamp: new Date().toISOString()
    })
    
    // Keep only recent history (last 10 interactions)
    if (context.history.length > 10) {
      context.history = context.history.slice(-10)
    }
  }

  updatePerformance(sessionId, metrics) {
    const context = this.getContext(sessionId)
    if (metrics.responseQuality) context.performanceMetrics.responseQuality.push(metrics.responseQuality)
    if (metrics.technicalDepth) context.performanceMetrics.technicalDepth.push(metrics.technicalDepth)
    if (metrics.communicationClarity) context.performanceMetrics.communicationClarity.push(metrics.communicationClarity)
    
    // Keep only recent metrics
    Object.keys(context.performanceMetrics).forEach(key => {
      if (context.performanceMetrics[key].length > 5) {
        context.performanceMetrics[key] = context.performanceMetrics[key].slice(-5)
      }
    })
  }

  generateContextualPrompt(sessionId, basePrompt) {
    const context = this.getContext(sessionId)
    const recentHistory = context.history.slice(-3)
    
    if (recentHistory.length === 0) return basePrompt
    
    const contextualInfo = recentHistory.map(h => 
      `${h.type}: ${h.question ? h.question.substring(0, 100) : ''} -> ${h.response ? h.response.substring(0, 50) : ''}`
    ).join('\n')
    
    return `${basePrompt}\n\nRecent conversation context:\n${contextualInfo}\n\nContinue the conversation naturally.`
  }
}

const conversationManager = new ConversationManager()

// Rate-limited Gemini API caller with fallback support
async function callGeminiWithRateLimit(prompt) {
  const now = Date.now()
  const timeSinceLastCall = now - lastGeminiCall
  
  if (timeSinceLastCall < GEMINI_RATE_LIMIT_MS) {
    const waitTime = GEMINI_RATE_LIMIT_MS - timeSinceLastCall
    console.log(`Rate limiting: waiting ${waitTime}ms before Gemini call`)
    await new Promise(resolve => setTimeout(resolve, waitTime))
  }
  
  lastGeminiCall = Date.now()
  
  // Try primary key first
  if (model && !usingFallbackKey) {
    try {
      console.log('🚀 Attempting AI call with primary key...')
      const result = await Promise.race([
        model.generateContent(prompt),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 30000)
        )
      ])
      const response = await result.response.text()
      console.log('✅ Primary AI call successful')
      return response
    } catch (error) {
      console.error('❌ Primary AI call failed:', error.message)
      if (error.message.includes('429') || error.message.includes('quota')) {
        usingFallbackKey = true
      }
    }
  }
  
  // Try fallback key if primary failed or we're already using fallback
  if (fallbackModel) {
    try {
      console.log('🔄 Attempting AI call with fallback key...')
      const result = await Promise.race([
        fallbackModel.generateContent(prompt),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 30000)
        )
      ])
      const response = await result.response.text()
      console.log('✅ Fallback AI call successful')
      return response
    } catch (error) {
      console.error('❌ Fallback AI call failed:', error.message)
    }
  }
  
  throw new Error('NO_API_KEYS_AVAILABLE')
}

// Memory Management
const questionRateLimit = new Map() // sessionId -> last request time
const sessionQuestionHistory = new Map() // sessionId -> Set of questions
const conversationContexts = new Map() // sessionId -> conversation data

// Session cleanup function
const cleanupOldSessions = () => {
  const oneHourAgo = Date.now() - (60 * 60 * 1000)
  
  for (const [sessionId, timestamp] of questionRateLimit.entries()) {
    if (timestamp < oneHourAgo) {
      questionRateLimit.delete(sessionId)
      sessionQuestionHistory.delete(sessionId)
      conversationContexts.delete(sessionId)
    }
  }
  
  console.log('🧹 Cleaned up old session data')
}

// Run cleanup every hour
setInterval(cleanupOldSessions, 60 * 60 * 1000)

// Auth routes
app.use('/api/auth', authRoutes)

// Health & Status Endpoints
app.get('/api/health', async (req, res) => {
  const dbHealth = await healthCheck()
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbHealth,
    gemini: {
      primary: !!process.env.GEMINI_API_KEY,
      fallback: !!process.env.GEMINI_API_KEY_FALLBACK,
      usingFallback: usingFallbackKey,
      model: "gemini-2.0-flash"
    }
  })
})

app.get('/api', optionalAuth, (req, res) => {
  res.json({
    message: 'AI Interviewer API',
    version: '1.0.0',
    user: req.user ? {
      id: req.user._id,
      name: req.user.name,
      isGuest: req.user.isGuest
    } : null,
    timestamp: new Date().toISOString()
  })
})

// Session Management Endpoints
app.post('/api/sessions/start', optionalAuth, async (req, res) => {
  try {
    const { mode, techStack, level } = req.body
    const userId = req.user?.id || null
    
    console.log('🎬 Starting new session:', { mode, techStack, level, userId })
    
    const sessionId = `${mode}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const session = new Session({
      sessionId,
      user: userId,
      mode,
      techStack,
      level,
      startTime: new Date(),
      questions: [],
      responses: new Map(),
      scores: new Map(),
      isActive: true
    })
    
    await session.save()
    console.log('✅ Session created in database:', sessionId)
    
    res.json({
      success: true,
      sessionId,
      session: {
        id: session._id,
        sessionId,
        mode,
        techStack,
        level,
        startTime: session.startTime
      }
    })
  } catch (error) {
    console.error('❌ Error starting session:', error)
    res.status(500).json({ error: 'Failed to start session' })
  }
})

app.post('/api/sessions/update', optionalAuth, async (req, res) => {
  try {
    const { sessionId, question, response, evaluation } = req.body
    const userId = req.user?.id || null
    
    console.log('🔄 Updating session:', { sessionId, hasQuestion: !!question, hasResponse: !!response })
    
    const query = userId ? { sessionId, user: userId } : { sessionId }
    const session = await Session.findOne(query)
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' })
    }
    
    if (question) {
      session.questions.push(question)
    }
    
    if (response) {
      session.responses.set(String(question?.id || 'response'), response)
    }
    
    if (evaluation) {
      // Store just the score number in the scores Map
      const scoreValue = typeof evaluation === 'object' ? evaluation.score : evaluation
      session.scores.set(String(question?.id || 'evaluation'), scoreValue || 0)
      
      // Store evaluation data for coding tests  
      if (session.mode === 'coding' && evaluation.analysis) {
        session.evaluation = {
          ...session.evaluation,
          score: scoreValue || 0,
          analysis: evaluation.analysis
        }
        console.log('💾 Stored evaluation analysis for coding test')
      }
    }
    
    await session.save()
    console.log('✅ Session updated successfully')
    
    res.json({ success: true })
  } catch (error) {
    console.error('❌ Error updating session:', error)
    res.status(500).json({ error: 'Failed to update session' })
  }
})

app.post('/api/sessions/end', optionalAuth, async (req, res) => {
  try {
    const { sessionId, overallScore, finalData } = req.body
    console.log('🔚 Ending session:', { sessionId, overallScore, hasFinalData: !!finalData, hasUser: !!req.user })
    
    const userId = req.user?.id || null
    const query = userId ? { sessionId, user: userId } : { sessionId }
    const session = await Session.findOne(query)
    
    if (!session) {
      console.log('❌ Session not found:', { sessionId, userId })
      return res.status(404).json({ error: 'Session not found' })
    }
    
    // Calculate duration in minutes
    const duration = Math.round((new Date() - session.startTime) / (1000 * 60))
    
    session.endTime = new Date()
    session.duration = duration
    session.isActive = false // Mark session as inactive
    
    if (overallScore !== undefined) {
      session.overallScore = overallScore
    }
    
    // Store final analysis data if provided
    if (finalData) {
      session.analysis = finalData
      console.log('📊 Stored analysis data in session')
    }
    
    await session.save()
    console.log('✅ Session ended successfully:', session._id, 'with analysis data')
    
    res.json({
      success: true,
      session: {
        id: session._id,
        sessionId,
        duration,
        endTime: session.endTime,
        overallScore: session.overallScore,
        hasAnalysis: !!finalData
      }
    })
  } catch (error) {
    console.error('❌ Error ending session:', error)
    res.status(500).json({ error: 'Failed to end session' })
  }
})

app.get('/api/sessions/:sessionId/analysis', optionalAuth, async (req, res) => {
  try {
    const { sessionId } = req.params
    console.log('📊 Fetching analysis for session:', sessionId)
    
    const userId = req.user?.id || null
    let session
    const query = userId ? { sessionId, user: userId } : { sessionId }
    session = await Session.findOne(query)
    
    // If not found by sessionId and it looks like an ObjectId, try finding by _id
    if (!session && sessionId.match(/^[0-9a-fA-F]{24}$/)) {
      const objectIdQuery = userId ? { _id: sessionId, user: userId } : { _id: sessionId }
      session = await Session.findOne(objectIdQuery)
    }
    
    if (!session) {
      console.log('❌ Session not found for analysis:', { sessionId, userId })
      return res.status(404).json({ error: 'Session not found' })
    }
    
    // Generate analysis from session data
    let sessionAnalysis = null
    if (session.evaluation && session.evaluation.analysis) {
      sessionAnalysis = session.evaluation.analysis
    } else if (session.analysis) {
      sessionAnalysis = session.analysis
    } else if (session.finalAnalysis) {
      sessionAnalysis = session.finalAnalysis
    }
    
    if (!sessionAnalysis) {
      sessionAnalysis = generateBasicAnalysis(session)
    }
    
    const analysisData = {
      sessionId: session.sessionId,
      mode: session.mode,
      techStack: session.techStack,
      level: session.level,
      startTime: session.startTime,
      endTime: session.endTime,
      duration: session.duration,
      overallScore: session.overallScore,
      analysis: sessionAnalysis,
      challenge: session.challenge,
      scores: Object.fromEntries(session.scores || new Map()),
      responses: Object.fromEntries(session.responses || new Map())
    }
    
    res.json(analysisData)
  } catch (error) {
    console.error('❌ Error fetching session analysis:', error)
    res.status(500).json({ error: 'Failed to fetch session analysis' })
  }
})

// Helper function to generate basic analysis
function generateBasicAnalysis(session) {
  const analysis = []
  
  if (session.overallScore !== undefined) {
    analysis.push({
      skill: 'Technical Knowledge',
      score: Math.max(session.overallScore - 5, 0),
      color: '#3b82f6'
    })
    
    analysis.push({
      skill: 'Communication',
      score: Math.min(session.overallScore + 5, 100),
      color: '#10b981'
    })
    
    analysis.push({
      skill: 'Problem Solving',
      score: session.overallScore,
      color: '#8b5cf6'
    })
    
    const completenessScore = session.duration > 5 ? 
      Math.min(session.overallScore + 10, 100) : 
      Math.max(session.overallScore - 20, 0)
    analysis.push({
      skill: 'Completeness',
      score: completenessScore,
      color: '#f59e0b'
    })
  } else {
    analysis.push(
      { skill: 'Technical Knowledge', score: 30, color: '#3b82f6' },
      { skill: 'Communication', score: 40, color: '#10b981' },
      { skill: 'Problem Solving', score: 35, color: '#8b5cf6' },
      { skill: 'Incomplete Session', score: 10, color: '#ef4444' }
    )
  }
  
  return analysis
}

// Interview Question Generation
app.post('/api/interview/generate-question', optionalAuth, async (req, res) => {
  try {
    const { type, difficulty, category, previousQuestions, sessionId = 'default' } = req.body

    console.log('=== GENERATING INTERVIEW QUESTION ===')
    console.log('Type:', type, 'Difficulty:', difficulty, 'Category:', category)

    // Rate limiting check
    const lastRequest = questionRateLimit.get(sessionId)
    const now = Date.now()
    if (lastRequest && (now - lastRequest) < 2000) {
      const waitTime = 2000 - (now - lastRequest)
      return res.status(429).json({ 
        error: 'Rate limited', 
        message: `Please wait ${Math.ceil(waitTime / 1000)} seconds before generating another question`,
        waitTime 
      })
    }
    questionRateLimit.set(sessionId, now)

    // Track questions for uniqueness
    if (!sessionQuestionHistory.has(sessionId)) {
      sessionQuestionHistory.set(sessionId, new Set())
    }
    const sessionQuestions = sessionQuestionHistory.get(sessionId)

    // Create difficulty-appropriate prompts
    const difficultyMapping = {
      'Basic': { level: 'beginner', depth: 'basic concepts and fundamentals', years: '0-2 years experience' },
      'Intermediate': { level: 'mid-level', depth: 'intermediate concepts and real-world applications', years: '2-5 years experience' },
      'Advanced': { level: 'senior', depth: 'advanced concepts and complex scenarios', years: '5+ years experience' },
      'Pro': { level: 'expert', depth: 'expert-level architecture and system design', years: '7+ years experience' }
    }

    const difficultyInfo = difficultyMapping[difficulty] || difficultyMapping['Basic']
    const allPreviousQuestions = [...(previousQuestions || []), ...Array.from(sessionQuestions)]

    let basePrompt
    if (difficulty === 'Basic') {
      basePrompt = `You are a friendly technical interviewer asking BASIC, FUNDAMENTAL questions for someone just starting out. Generate ONE simple, direct question about basic ${category === 'Generic' ? 'computer science' : category} concepts.

⚠️ FOR BASIC LEVEL - KEEP IT SIMPLE ⚠️
- Ask about FUNDAMENTAL concepts only
- Use DIRECT, SIMPLE language - NO complex scenarios
- Think "textbook fundamentals" not "workplace scenarios"

AVOID these previous questions: ${allPreviousQuestions?.map(q => q.substring(0, 50)).join(', ') || 'none'}

Return JSON format:
{
  "question": "your simple, direct, basic question here",
  "expectedTopics": ["basic topic1", "basic topic2"],
  "category": "${category}",
  "difficulty": "Basic"
}`
    } else {
      basePrompt = `You are a friendly and experienced technical interviewer conducting a ${difficultyInfo.level} level interview for someone with ${difficultyInfo.years}. Generate a single, **completely unique** ${difficulty} level ${type} interview question for ${category}.

⚠️ CRITICAL UNIQUENESS REQUIREMENTS ⚠️
- MUST avoid ANY similarity to these previous questions: ${allPreviousQuestions?.map(q => q.substring(0, 80)).join(', ') || 'none'}

DIFFICULTY LEVEL: ${difficulty} (${difficultyInfo.depth})
- Focus on ${difficultyInfo.depth}

Return the response in this exact JSON format:
{
  "question": "your completely unique interview question here",
  "expectedTopics": ["topic1", "topic2", "topic3"],
  "category": "${category}",
  "difficulty": "${difficulty}"
}`
    }

    if (!model && !fallbackModel) {
      return res.status(500).json({ 
        error: 'AI service unavailable. Cannot generate interview questions without API access.',
        requiresAPI: true
      })
    }

    let text
    try {
      text = await callGeminiWithRateLimit(basePrompt)
    } catch (error) {
      console.error('❌ Gemini API failed:', error.message)
      return res.status(500).json({ 
        error: 'Failed to generate question from AI. Please check API configuration and try again.',
        details: error.message,
        requiresAPI: true
      })
    }

    // Parse JSON response
    let questionData = null
    try {
      let cleanText = text.trim()
      if (cleanText.includes('```json')) {
        cleanText = cleanText.split('```json')[1].split('```')[0]
      } else if (cleanText.includes('```')) {
        cleanText = cleanText.split('```')[1].split('```')[0]
      }
      
      const jsonMatch = cleanText.match(/\{[\s\S]*?\}/)
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0])
        if (parsedData.question && parsedData.question.length > 10) {
          questionData = {
            id: `${sessionId}-${sessionQuestions.size + 1}`,
            question: parsedData.question,
            category: parsedData.category || category,
            difficulty: parsedData.difficulty || difficulty,
            expectedTopics: parsedData.expectedTopics || ['Technical knowledge'],
            timeLimit: 300,
            hints: ['Take your time to think through the answer', 'Provide specific examples if possible']
          }
        }
      }
    } catch (parseError) {
      console.warn('JSON parsing failed:', parseError.message)
    }

    if (!questionData) {
      return res.status(500).json({ 
        error: 'Failed to parse valid question from AI response. Please try again.',
        requiresAPI: true
      })
    }

    // Add to session history
    sessionQuestions.add(questionData.question)
    
    // Store in conversation context
    conversationManager.addToHistory(sessionId, {
      type: 'question_generated',
      question: questionData.question,
      category,
      difficulty,
      type
    })
    
    res.json(questionData)
  } catch (error) {
    console.error('❌ Error generating question:', error)
    return res.status(500).json({ 
      error: 'Failed to generate interview question.',
      details: error.message,
      requiresAPI: true
    })
  }
})

// Response Evaluation
app.post('/api/interview/evaluate-response', optionalAuth, async (req, res) => {
  try {
    const { question, response, type, difficulty, sessionId = 'default' } = req.body
    
    const context = conversationManager.getContext(sessionId)
    
    let evaluationCriteria = ''
    if (difficulty === 'Basic') {
      evaluationCriteria = `
⚠️ BASIC LEVEL EVALUATION CRITERIA ⚠️
- Focus on FUNDAMENTAL understanding, not advanced concepts
- Score based on basic knowledge demonstration
- Look for simple, clear explanations
- Basic concepts correctly identified = good score (70-85)`
    } else {
      evaluationCriteria = `
ADVANCED LEVEL EVALUATION CRITERIA:
- Expect detailed analysis and complex reasoning
- Look for in-depth understanding and practical application
- Consider real-world scenarios and trade-offs`
    }
    
    const basePrompt = `Evaluate this interview response:
    
    Question: ${question}
    Response: ${response}
    Difficulty Level: ${difficulty || 'Basic'}
    
    ${evaluationCriteria}
    
    Provide detailed evaluation as JSON:
    {
      "score": number (0-100),
      "strengths": string[],
      "improvements": string[],
      "overallFeedback": string,
      "technicalAccuracy": number (0-100),
      "communicationClarity": number (0-100),
      "completeness": number (0-100),
      "problemSolving": number (0-100),
      "creativity": number (0-100),
      "detailedAnalysis": {
        "keywordUsage": string[],
        "conceptsIdentified": string[],
        "missingConcepts": string[],
        "responseStructure": string,
        "confidenceLevel": number (0-100)
      },
      "nextSteps": {
        "recommendedTopics": string[],
        "difficultyAdjustment": "maintain",
        "followUpQuestions": string[]
      }
    }`

    const contextualPrompt = conversationManager.generateContextualPrompt(sessionId, basePrompt)

    try {
      const result = await callGeminiWithRateLimit(contextualPrompt)
      const evaluation = JSON.parse(result)
      
      // Store in conversation context
      conversationManager.addToHistory(sessionId, {
        type: 'response_evaluated',
        question,
        response,
        evaluation
      })
      
      // Update performance metrics
      conversationManager.updatePerformance(sessionId, {
        responseQuality: evaluation.score,
        technicalDepth: evaluation.technicalAccuracy,
        communicationClarity: evaluation.communicationClarity
      })
      
      res.json(evaluation)
    } catch (parseError) {
      // Fallback evaluation if parsing fails
      const fallbackEvaluation = {
        score: 75,
        strengths: ["Response provided"],
        improvements: ["Could be more detailed"],
        overallFeedback: "Basic response received",
        technicalAccuracy: 75,
        communicationClarity: 80,
        completeness: 70,
        problemSolving: 75,
        creativity: 70,
        detailedAnalysis: {
          keywordUsage: [],
          conceptsIdentified: [],
          missingConcepts: [],
          responseStructure: "Basic response structure",
          confidenceLevel: 70
        },
        nextSteps: {
          recommendedTopics: [],
          difficultyAdjustment: "maintain",
          followUpQuestions: []
        }
      }
      
      res.json(fallbackEvaluation)
    }
  } catch (error) {
    console.error('Error evaluating response:', error)
    res.status(500).json({ error: 'Failed to evaluate response' })
  }
})

// Coding Challenge Generation
app.post('/api/coding/generate-challenge', optionalAuth, async (req, res) => {
  try {
    const { techStack, difficulty = 'Medium', count = 1 } = req.body

    const topics = [
      'algorithms and data structures', 'string manipulation', 'array processing',
      'asynchronous programming', 'object-oriented design', 'recursion',
      'searching and sorting', 'tree traversal', 'API design',
      'error handling', 'performance optimization', 'mathematical computations'
    ]
    
    const randomTopic = topics[Math.floor(Math.random() * topics.length)]
    const timestamp = Date.now()
    
    let challengePrompt
    if (difficulty === 'Basic' || difficulty === 'Easy') {
      challengePrompt = `Generate ${count} SIMPLE, FUNDAMENTAL ${techStack === 'Generic' ? 'DSA' : techStack} challenge(s) at ${difficulty} level.

⚠️ KEEP IT SIMPLE FOR BEGINNERS ⚠️
Focus on basic concepts only. No complex scenarios.

FOCUS: ${randomTopic} (simplified)
ID: ${timestamp}

IMPORTANT: For starterCode, provide function with PROPER PARAMETERS based on the problem:
- Two Sum: function twoSum(nums, target) or def two_sum(nums, target)
- Palindrome: function isPalindrome(s) or def is_palindrome(s)
- Sum Array: function calculateSum(numbers) or def calculate_sum(numbers)
- Always include the specific parameters the function needs!

Return ONLY valid JSON:
[
  {
    "id": 1,
    "title": "Simple Challenge Title",
    "description": "Clear, simple problem description with examples",
    "difficulty": "${difficulty}",
    "techStack": "${techStack}",
    "starterCode": "function challengeFunction(param1, param2) {\n    // Your code here\n    return null;\n}",
    "testCases": [
      {
        "input": "simple input",
        "expectedOutput": "expected output",
        "description": "test description"
      }
    ],
    "hints": ["basic hint 1", "basic hint 2"],
    "timeLimit": 20,
    "tags": ["basic", "fundamentals"]
  }
]`
    } else {
      challengePrompt = `Generate ${count} UNIQUE ${techStack === 'Generic' ? 'DSA' : techStack} challenge(s) at ${difficulty} level.

FOCUS: ${randomTopic}
ID: ${timestamp}

IMPORTANT: For starterCode, provide function with PROPER PARAMETERS based on the problem:
- Two Sum: function twoSum(nums, target) or def two_sum(nums, target)
- Palindrome: function isPalindrome(s) or def is_palindrome(s)
- Tree Depth: function maxDepth(root) or def max_depth(root)
- Always include the specific parameters the function needs!

Return ONLY valid JSON:
[
  {
    "id": 1,
    "title": "Challenge Title",
    "description": "Clear problem description with examples",
    "difficulty": "${difficulty}",
    "techStack": "${techStack}",
    "starterCode": "function challengeFunction(param1, param2) {\n    // Your code here\n    return null;\n}",
    "testCases": [
      {
        "input": "input value",
        "expectedOutput": "expected output",
        "description": "test description"
      }
    ],
    "hints": ["helpful hint 1", "helpful hint 2"],
    "timeLimit": 35,
    "tags": ["algorithm", "programming"]
  }
]`
    }

    let responseText
    try {
      responseText = await callGeminiWithRateLimit(challengePrompt)
    } catch (error) {
      return res.status(503).json({
        success: false,
        error: 'AI service temporarily unavailable.',
        techStack,
        difficulty,
        retryAfter: 30
      })
    }

    // Parse challenges
    let challenges = []
    try {
      let cleanedText = responseText.trim()
      cleanedText = cleanedText.replace(/```json\s*/g, '').replace(/```\s*/g, '')
      
      const jsonStart = cleanedText.indexOf('[')
      const jsonEnd = cleanedText.lastIndexOf(']') + 1
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        cleanedText = cleanedText.substring(jsonStart, jsonEnd)
      }
      
      const parsedResponse = JSON.parse(cleanedText)
      challenges = Array.isArray(parsedResponse) ? parsedResponse : [parsedResponse]
    } catch (parseError) {
      return res.status(500).json({ 
        error: 'Failed to parse AI response. Please try again.',
        techStack,
        difficulty
      })
    }

    // Validate and enhance challenges
    const validatedChallenges = challenges.map((challenge, index) => ({
      id: challenge.id || (index + 1),
      title: challenge.title || `${techStack} Challenge ${index + 1}`,
      description: challenge.description || 'No description provided',
      difficulty: challenge.difficulty || difficulty,
      techStack: challenge.techStack || techStack,
      starterCode: challenge.starterCode || 'function solution() {\n    // Your code here\n}',
      testCases: Array.isArray(challenge.testCases) ? challenge.testCases : [
        { input: 'example', expectedOutput: 'example', description: 'example test' }
      ],
      hints: Array.isArray(challenge.hints) ? challenge.hints : ['Consider the requirements'],
      timeLimit: challenge.timeLimit || 30,
      tags: Array.isArray(challenge.tags) ? challenge.tags : ['general']
    }))

    res.json({
      success: true,
      challenges: validatedChallenges,
      techStack,
      difficulty,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error generating coding challenge:', error)
    res.status(500).json({ error: 'Failed to generate coding challenge' })
  }
})

// Code Execution Engine
const executeCode = async (code, language, testCases) => {
  const results = []
  
  for (const testCase of testCases) {
    try {
      let output, executionTime
      const startTime = Date.now()
      
      console.log(`Executing ${language} code for test case: ${JSON.stringify(testCase.input)}`);
      
      switch (language.toLowerCase()) {
        case 'javascript':
          output = await executeJavaScript(code, testCase.input)
          break
        case 'python':
          output = await executePython(code, testCase.input)
          break
        case 'java':
          output = await executeJava(code, testCase.input)
          break
        case 'cpp':
        case 'c++':
          console.log('Starting C++ execution...');
          output = await executeCpp(code, testCase.input)
          console.log('C++ execution completed with output:', output);
          break
        default:
          throw new Error(`Unsupported language: ${language}`)
      }
      
      executionTime = Date.now() - startTime
      
      // Compare outputs with type conversion
      const passed = compareOutputs(output, testCase.expectedOutput)
      
      results.push({
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: output,
        passed,
        executionTime,
        error: null
      })
    } catch (error) {
      console.error(`Error executing ${language} code:`, error.message);
      results.push({
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: null,
        passed: false,
        executionTime: 0,
        error: error.message
      })
    }
  }
  
  return results
}

// JavaScript execution with VM sandbox
const executeJavaScript = async (code, input) => {
  const timeout = 3000
  
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Execution timeout'))
    }, timeout)
    
    try {
      // Create a safer context with global access
      const context = {
        console: {
          log: (...args) => args.join(' ')
        },
        setTimeout, clearTimeout, setInterval, clearInterval,
        // Add result storage
        __result: undefined,
        __input: input
      }
      
      // Extract function name from code using regex
      let functionName = null;
      const patterns = [
        /(?:const|let|var)\s+(\w+)\s*=\s*(?:\([^)]*\)\s*=>\s*{|function\s*\([^)]*\)\s*{)/,
        /function\s+(\w+)\s*\([^)]*\)\s*{/,
        /(\w+)\s*:\s*function\s*\([^)]*\)\s*{/
      ];
      
      for (const pattern of patterns) {
        const match = code.match(pattern);
        if (match && match[1]) {
          functionName = match[1];
          break;
        }
      }
      
      console.log('Detected function name:', functionName);
      
      // Create wrapped code that tries multiple approaches
      const wrappedCode = `
        ${code}
        
        let result;
        
        // Try different ways to call the function
        try {
          // Method 1: Try common names first
          if (typeof solution === 'function') {
            result = solution(__input);
          } else if (typeof main === 'function') {
            result = main(__input);
          } else if (${functionName ? `typeof ${functionName} === 'function'` : 'false'}) {
            result = ${functionName ? `${functionName}(__input)` : 'undefined'};
          } else {
            // Method 2: Try to find any function by scanning the code
            const codeStr = \`${code.replace(/`/g, '\\`')}\`;
            const funcMatch = codeStr.match(/(?:const|let|var)\\s+(\\w+)\\s*=|function\\s+(\\w+)\\s*\\(/);
            if (funcMatch) {
              const detectedName = funcMatch[1] || funcMatch[2];
              if (typeof eval(detectedName) === 'function') {
                result = eval(detectedName + '(__input)');
              }
            }
          }
        } catch (e) {
          console.log('Function execution error:', e.message);
          result = 'Error: ' + e.message;
        }
        
        __result = result;
        result;
      `;
      
      const script = new vm.Script(wrappedCode)
      const vmContext = vm.createContext(context)
      const result = script.runInContext(vmContext, { timeout })
      
      clearTimeout(timer)
      
      // Return the result from context or direct result
      const finalResult = context.__result !== undefined ? context.__result : result;
      console.log('JavaScript execution result:', finalResult);
      
      resolve(String(finalResult !== undefined ? finalResult : ''))
    } catch (error) {
      clearTimeout(timer)
      console.error('JavaScript execution error:', error);
      reject(error)
    }
  })
}

// Python execution
const executePython = async (code, input) => {
  return new Promise((resolve, reject) => {
    const tempDir = join(tmpdir(), 'ai-interviewer-python')
    try {
      mkdirSync(tempDir, { recursive: true })
    } catch (e) {}
    
    const fileName = `solution_${Date.now()}.py`
    const filePath = join(tempDir, fileName)
    
    // Wrap code to handle input and detect main function
    const wrappedCode = `
import sys
import json

${code}

# Try to detect and call the main function
input_data = ${JSON.stringify(input)}
result = None

if 'solution' in globals() and callable(globals()['solution']):
    result = solution(input_data)
elif 'main' in globals() and callable(globals()['main']):
    result = main(input_data)

if result is not None:
    print(result)
`
    
    try {
      writeFileSync(filePath, wrappedCode)
      
      const child = spawn('python3', [filePath], {
        timeout: 3000,
        killSignal: 'SIGKILL'
      })
      
      let stdout = ''
      let stderr = ''
      
      child.stdout.on('data', (data) => {
        stdout += data.toString()
      })
      
      child.stderr.on('data', (data) => {
        stderr += data.toString()
      })
      
      child.on('close', (code) => {
        try {
          unlinkSync(filePath)
        } catch (e) {}
        
        if (code === 0) {
          resolve(stdout.trim())
        } else {
          reject(new Error(stderr || `Python execution failed with code ${code}`))
        }
      })
      
      child.on('error', (error) => {
        try {
          unlinkSync(filePath)
        } catch (e) {}
        reject(error)
      })
    } catch (error) {
      try {
        unlinkSync(filePath)
      } catch (e) {}
      reject(error)
    }
  })
}

// Java execution
const executeJava = async (code, input) => {
  return new Promise((resolve, reject) => {
    const tempDir = join(tmpdir(), 'ai-interviewer-java')
    try {
      mkdirSync(tempDir, { recursive: true })
    } catch (e) {}
    
    const className = 'Solution'
    const fileName = `${className}.java`
    const filePath = join(tempDir, fileName)
    
    // Wrap code in a class structure
    const wrappedCode = `
public class ${className} {
    ${code}
    
    public static void main(String[] args) {
        ${className} sol = new ${className}();
        String input = ${JSON.stringify(input)};
        
        try {
            java.lang.reflect.Method solution = sol.getClass().getMethod("solution", String.class);
            Object result = solution.invoke(sol, input);
            System.out.println(result);
        } catch (Exception e1) {
            try {
                java.lang.reflect.Method main = sol.getClass().getMethod("main", String.class);
                Object result = main.invoke(sol, input);
                System.out.println(result);
            } catch (Exception e2) {
                System.err.println("No solution or main method found");
            }
        }
    }
}
`
    
    try {
      writeFileSync(filePath, wrappedCode)
      
      // Compile
      const compileChild = spawn('javac', [filePath], {
        timeout: 5000,
        cwd: tempDir
      })
      
      compileChild.on('close', (compileCode) => {
        if (compileCode !== 0) {
          try {
            unlinkSync(filePath)
          } catch (e) {}
          reject(new Error('Java compilation failed'))
          return
        }
        
        // Execute
        const runChild = spawn('java', [className], {
          timeout: 3000,
          cwd: tempDir,
          killSignal: 'SIGKILL'
        })
        
        let stdout = ''
        let stderr = ''
        
        runChild.stdout.on('data', (data) => {
          stdout += data.toString()
        })
        
        runChild.stderr.on('data', (data) => {
          stderr += data.toString()
        })
        
        runChild.on('close', (runCode) => {
          // Cleanup
          try {
            unlinkSync(filePath)
            unlinkSync(join(tempDir, `${className}.class`))
          } catch (e) {}
          
          if (runCode === 0) {
            resolve(stdout.trim())
          } else {
            reject(new Error(stderr || `Java execution failed with code ${runCode}`))
          }
        })
        
        runChild.on('error', (error) => {
          try {
            unlinkSync(filePath)
            unlinkSync(join(tempDir, `${className}.class`))
          } catch (e) {}
          reject(error)
        })
      })
      
      compileChild.on('error', (error) => {
        try {
          unlinkSync(filePath)
        } catch (e) {}
        reject(error)
      })
    } catch (error) {
      reject(error)
    }
  })
}

// C++ execution
const executeCpp = async (code, input) => {
  return new Promise((resolve, reject) => {
    const tempDir = join(tmpdir(), 'ai-interviewer-cpp')
    try {
      mkdirSync(tempDir, { recursive: true })
    } catch (e) {}
    
    const fileName = `solution_${Date.now()}.cpp`
    const filePath = join(tempDir, fileName)
    const execPath = join(tempDir, `solution_${Date.now()}`)
    
    // Wrap code with input handling
    const wrappedCode = `
#include <iostream>
#include <string>
#include <vector>
#include <sstream>
#include <any>
using namespace std;

${code}

// Attempt to parse input
template <typename T>
T parseInput(const string& input) {
    if constexpr (is_same<T, int>::value) {
        return stoi(input);
    } else if constexpr (is_same<T, double>::value) {
        return stod(input);
    } else {
        return input;  // String as default
    }
}

// Function to tokenize a string by commas for array inputs
vector<string> tokenize(const string& str) {
    vector<string> tokens;
    string token;
    istringstream tokenStream(str);
    
    while (getline(tokenStream, token, ',')) {
        // Remove brackets, spaces, and quotes
        token.erase(remove(token.begin(), token.end(), '['), token.end());
        token.erase(remove(token.begin(), token.end(), ']'), token.end());
        token.erase(remove(token.begin(), token.end(), '"'), token.end());
        token.erase(remove(token.begin(), token.end(), ' '), token.end());
        
        if (!token.empty()) {
            tokens.push_back(token);
        }
    }
    
    return tokens;
}

int main() {
    string input = ${JSON.stringify(input)};
    
    // Try to detect and call solution function
    // This is a basic implementation to handle common cases
    
    try {
        // Handle different input formats based on typical patterns
        if (input.find("[") != string::npos) {
            // Array input
            vector<string> tokens = tokenize(input);
            vector<int> intArray;
            
            for (const auto& t : tokens) {
                try {
                    intArray.push_back(stoi(t));
                } catch (...) {
                    // Not an integer array
                }
            }
            
            if (!intArray.empty()) {
                // Attempt to call a solution function
                auto result = solution(intArray);
                cout << result << endl;
                return 0;
            }
        } else if (isdigit(input[0]) || input[0] == '-') {
            // Numeric input
            try {
                int numInput = stoi(input);
                auto result = solution(numInput);
                cout << result << endl;
                return 0;
            } catch (...) {
                // Not an integer
            }
        }
        
        // Default: treat as string
        auto result = solution(input);
        cout << result << endl;
    } catch (const exception& e) {
        cerr << "Error executing solution: " << e.what() << endl;
        return 1;
    }
    
    return 0;
}
`
    
    try {
      console.log(`Creating C++ file for execution: ${filePath}`);
      writeFileSync(filePath, wrappedCode)
      console.log(`Compiling C++ code with input: ${JSON.stringify(input)}`);
      
      // Compile with better error messages and C++11 support
      const compileChild = spawn('g++', ['-std=c++11', '-Wall', '-o', execPath, filePath], {
        timeout: 5000,
        killSignal: 'SIGKILL'
      })
      
      let compileStderr = '';
      compileChild.stderr.on('data', (data) => {
        compileStderr += data.toString();
      });
      
      compileChild.on('close', (compileCode) => {
        if (compileCode !== 0) {
          try {
            unlinkSync(filePath)
          } catch (e) {}
          const errorMsg = compileStderr ? 
            `C++ compilation failed: ${compileStderr.trim()}` : 
            'C++ compilation failed without specific errors';
          console.error('C++ compilation error:', errorMsg);
          reject(new Error(errorMsg))
          return
        }
        
        // Execute
        const runChild = spawn(execPath, [], {
          timeout: 3000,
          killSignal: 'SIGKILL'
        })
        
        let stdout = ''
        let stderr = ''
        
        runChild.stdout.on('data', (data) => {
          stdout += data.toString()
        })
        
        runChild.stderr.on('data', (data) => {
          stderr += data.toString()
        })
        
        runChild.on('close', (runCode) => {
          // Cleanup
          try {
            unlinkSync(filePath)
            unlinkSync(execPath)
          } catch (e) {}
          
          if (runCode === 0) {
            console.log('C++ execution succeeded with stdout:', stdout);
            resolve(stdout.trim())
          } else {
            console.error('C++ execution failed with stderr:', stderr);
            reject(new Error(stderr || `C++ execution failed with code ${runCode}`))
          }
        })
        
        runChild.on('error', (error) => {
          try {
            unlinkSync(filePath)
            unlinkSync(execPath)
          } catch (e) {}
          reject(error)
        })
      })
      
      compileChild.on('error', (error) => {
        try {
          unlinkSync(filePath)
        } catch (e) {}
        reject(error)
      })
    } catch (error) {
      reject(error)
    }
  })
}

// Output comparison with type conversion
const compareOutputs = (actual, expected) => {
  if (actual === expected) return true
  
  // Try numeric comparison
  const actualNum = parseFloat(actual)
  const expectedNum = parseFloat(expected)
  if (!isNaN(actualNum) && !isNaN(expectedNum)) {
    return Math.abs(actualNum - expectedNum) < 0.0001
  }
  
  // Try string comparison (case insensitive, trimmed)
  return String(actual).trim().toLowerCase() === String(expected).trim().toLowerCase()
}

// Code execution endpoint
app.post('/api/code/execute', optionalAuth, async (req, res) => {
  try {
    const { code, language, testCases } = req.body
    
    if (!code || !language || !testCases) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    
    console.log(`🚀 Executing ${language} code with ${testCases.length} test cases`)
    
    const results = await executeCode(code, language, testCases)
    
    const passedCount = results.filter(r => r.passed).length
    const totalCount = results.length
    const score = Math.round((passedCount / totalCount) * 100)
    
    res.json({
      success: true,
      results,
      summary: {
        passed: passedCount,
        total: totalCount,
        score,
        language
      }
    })
  } catch (error) {
    console.error('Code execution error:', error)
    res.status(500).json({ 
      error: 'Code execution failed',
      message: error.message 
    })
  }
})

// Dashboard endpoint
app.get('/api/dashboard', optionalAuth, async (req, res) => {
  try {
    console.log('📊 Dashboard data requested for user:', req.user?.id || 'guest')
    
    const userId = req.user?.id || null
    const query = userId ? { user: userId } : { user: null }
    
    const totalSessions = await Session.countDocuments(query)
    const sessions = await Session.find(query).sort({ startTime: -1 }).limit(50)
    
    if (totalSessions === 0) {
      return res.json({
        sessions: 0,
        totalTime: 0,
        averageScore: 0,
        skillsAssessed: [],
        recentPerformance: [],
        skillBreakdown: [],
        recentSessions: []
      })
    }
    
    // Calculate metrics
    const completedSessions = sessions.filter(s => s.endTime && s.duration)
    const totalTime = completedSessions.reduce((sum, session) => sum + (session.duration || 0), 0)
    
    const sessionsWithScores = sessions.filter(s => s.overallScore !== undefined && s.overallScore !== null)
    const averageScore = sessionsWithScores.length > 0 
      ? Math.round(sessionsWithScores.reduce((sum, s) => sum + s.overallScore, 0) / sessionsWithScores.length)
      : 0
    
    // Skills assessed
    const skillsSet = new Set()
    sessions.forEach(session => {
      if (session.techStack) skillsSet.add(session.techStack)
      if (session.mode) skillsSet.add(session.mode)
    })
    const skillsAssessed = Array.from(skillsSet)
    
    // Recent performance
    const recentPerformance = sessions
      .filter(s => s.overallScore !== undefined && s.endTime)
      .slice(0, 10)
      .reverse()
      .map(session => ({
        date: session.endTime.toISOString().split('T')[0],
        score: session.overallScore,
        type: session.mode || 'Interview'
      }))
    
    // Skill breakdown
    const skillGroups = {}
    sessions.forEach(session => {
      if (session.techStack && session.overallScore !== undefined) {
        if (!skillGroups[session.techStack]) {
          skillGroups[session.techStack] = { scores: [], color: getSkillColor(session.techStack) }
        }
        skillGroups[session.techStack].scores.push(session.overallScore)
      }
    })
    
    const skillBreakdown = Object.entries(skillGroups).map(([skill, data]) => ({
      skill,
      score: Math.round(data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length),
      color: data.color
    }))
    
    // Recent sessions
    const recentSessions = sessions.slice(0, 10).map(session => ({
      id: session._id.toString(),
      sessionId: session.sessionId,
      mode: session.mode || 'Interview',
      techStack: session.techStack || 'General',
      level: session.level || 'Basic',
      startTime: session.startTime.toISOString(),
      endTime: session.endTime ? session.endTime.toISOString() : null,
      duration: session.duration || 0,
      overallScore: session.overallScore,
      questionsCount: session.questions.length
    }))
    
    const dashboardData = {
      sessions: totalSessions,
      totalTime,
      averageScore,
      skillsAssessed,
      recentPerformance,
      skillBreakdown,
      recentSessions
    }
    
    res.json(dashboardData)
  } catch (error) {
    console.error('❌ Error fetching dashboard data:', error)
    res.status(500).json({ 
      error: 'Failed to fetch dashboard data',
      sessions: 0,
      totalTime: 0,
      averageScore: 0,
      skillsAssessed: [],
      recentPerformance: [],
      skillBreakdown: [],
      recentSessions: []
    })
  }
})

// Helper function for skill colors
function getSkillColor(skill) {
  const colors = {
    'JavaScript': '#f7df1e',
    'Python': '#3776ab',
    'React': '#61dafb',
    'Node.js': '#339933',
    'Java': '#007396',
    'C++': '#00599c',
    'Generic': '#6366f1',
    'coding': '#10b981',
    'technical': '#3b82f6'
  }
  return colors[skill] || '#6b7280'
}

// Real-Time Features (Socket.IO)
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  // Handle real-time transcript updates
  socket.on('transcript-update', (data) => {
    socket.broadcast.emit('transcript-received', data)
  })

  // Handle AI response requests
  socket.on('request-ai-response', async (data) => {
    try {
      const { message, context } = data
      
      const prompt = `You are an AI interviewer. Respond naturally and helpfully to: "${message}"
      
      Context: ${context || 'Technical interview session'}
      
      Keep responses conversational, encouraging, and professional. Ask follow-up questions when appropriate.`

      const result = await callGeminiWithRateLimit(prompt)

      socket.emit('ai-response', {
        message: result,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error generating AI response:', error)
      socket.emit('ai-response', {
        message: "I'm sorry, I'm having trouble responding right now. Please continue with your answer.",
        timestamp: new Date().toISOString()
      })
    }
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Initialize database and start server
const startServer = async () => {
  try {
    await connectDB()
    
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
      console.log(`Gemini API configured: ${!!(process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_FALLBACK)}`)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

// Start the server
startServer()
