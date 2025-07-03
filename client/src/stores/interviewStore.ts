import { create } from 'zustand'

export interface InterviewQuestion {
  id: string
  type: 'behavioral' | 'technical' | 'system-design' | 'coding'
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  question: string
  expectedTopics?: string[]
  timeLimit?: number
  hints?: string[]
  followUpQuestions?: string[]
}

export interface DetailedAnalysis {
  keywordUsage: string[]
  conceptsIdentified: string[]
  missingConcepts: string[]
  responseStructure: string
  confidenceLevel: number
}

export interface NextSteps {
  recommendedTopics: string[]
  difficultyAdjustment: string
  followUpQuestions: string[]
}

export interface InterviewEvaluation {
  score: number
  strengths: string[]
  improvements: string[]
  overallFeedback: string
  technicalAccuracy: number
  communicationClarity: number
  completeness: number
  problemSolving?: number
  creativity?: number
  detailedAnalysis?: DetailedAnalysis
  nextSteps?: NextSteps
}

export interface CodeAnalysis {
  codeQuality: {
    readability: number
    efficiency: number
    maintainability: number
    bestPractices: number
  }
  algorithmicComplexity: {
    timeComplexity: string
    spaceComplexity: string
    explanation: string
  }
  suggestions: {
    improvements: string[]
    optimizations: string[]
    patterns: string[]
  }
  designPatterns: string[]
  securityIssues: string[]
  overallAssessment: string
}

export interface SessionAnalytics {
  sessionSummary: {
    totalQuestions: number
    totalResponses: number
    averageScore: number
    sessionDuration: number
  }
  performanceTrends: {
    responseQuality: number[]
    technicalDepth: number[]
    communicationClarity: number[]
  }
  skillAssessment: {
    strongAreas: string[]
    improvementAreas: string[]
    recommendedTopics: string[]
  }
  conversationFlow: Array<{
    type: string
    timestamp: string
    score: number | null
  }>
}

export interface LearningRecommendations {
  overallAssessment: string
  learningPath: {
    immediate: string[]
    shortTerm: string[]
    longTerm: string[]
  }
  skillGaps: {
    technical: string[]
    communication: string[]
    problemSolving: string[]
  }
  recommendedResources: {
    courses: string[]
    books: string[]
    practiceProblems: string[]
    projects: string[]
  }
  nextInterviewFocus: string[]
  strengthsToLeverage: string[]
  motivationalMessage: string
}

export interface InterviewSession {
  id: string
  mode: 'technical' | 'coding'
  startTime: Date
  endTime?: Date
  questions: InterviewQuestion[]
  currentQuestionIndex: number
  responses: Record<string, string>
  evaluations: Record<string, InterviewEvaluation>
  scores: Record<string, number>
  transcript: string
  analytics?: SessionAnalytics
  recommendations?: LearningRecommendations
}

interface InterviewStore {
  currentSession: InterviewSession | null
  sessions: InterviewSession[]
  questionBank: InterviewQuestion[]
  
  startSession: (mode: 'technical' | 'coding') => void
  endSession: () => void
  nextQuestion: () => void
  previousQuestion: () => void
  saveResponse: (questionId: string, response: string) => void
  saveEvaluation: (questionId: string, evaluation: InterviewEvaluation) => void
  updateScore: (questionId: string, score: number) => void
  loadQuestionBank: () => void
  loadAnalytics: (sessionId: string) => Promise<void>
  loadRecommendations: (sessionId: string, targetRole?: string, experience?: string) => Promise<void>
}

export const useInterviewStore = create<InterviewStore>((set, get) => ({
  currentSession: null,
  sessions: [],
  questionBank: [],

  startSession: (mode) => {
    const session: InterviewSession = {
      id: Date.now().toString(),
      mode,
      startTime: new Date(),
      questions: [],
      currentQuestionIndex: 0,
      responses: {},
      evaluations: {},
      scores: {},
      transcript: '',
    }
    
    set({ currentSession: session })
  },

  endSession: () => {
    const { currentSession, sessions } = get()
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        endTime: new Date(),
      }
      set({ 
        currentSession: null,
        sessions: [...sessions, updatedSession]
      })
    }
  },

  nextQuestion: () => {
    const { currentSession } = get()
    if (currentSession && currentSession.currentQuestionIndex < currentSession.questions.length - 1) {
      set({
        currentSession: {
          ...currentSession,
          currentQuestionIndex: currentSession.currentQuestionIndex + 1
        }
      })
    }
  },

  previousQuestion: () => {
    const { currentSession } = get()
    if (currentSession && currentSession.currentQuestionIndex > 0) {
      set({
        currentSession: {
          ...currentSession,
          currentQuestionIndex: currentSession.currentQuestionIndex - 1
        }
      })
    }
  },

  saveResponse: (questionId, response) => {
    const { currentSession } = get()
    if (currentSession) {
      set({
        currentSession: {
          ...currentSession,
          responses: {
            ...currentSession.responses,
            [questionId]: response
          }
        }
      })
    }
  },

  saveEvaluation: (questionId, evaluation) => {
    const { currentSession } = get()
    if (currentSession) {
      set({
        currentSession: {
          ...currentSession,
          evaluations: {
            ...currentSession.evaluations,
            [questionId]: evaluation
          }
        }
      })
    }
  },

  updateScore: (questionId, score) => {
    const { currentSession } = get()
    if (currentSession) {
      set({
        currentSession: {
          ...currentSession,
          scores: {
            ...currentSession.scores,
            [questionId]: score
          }
        }
      })
    }
  },

  loadAnalytics: async (sessionId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/interview/analytics/${sessionId}`)
      if (response.ok) {
        const analytics = await response.json()
        const { currentSession } = get()
        if (currentSession && currentSession.id === sessionId) {
          set({
            currentSession: {
              ...currentSession,
              analytics
            }
          })
        }
      }
    } catch (error) {
      console.error('Failed to load analytics:', error)
    }
  },

  loadRecommendations: async (sessionId, targetRole = 'Software Engineer', experience = 'Mid-level') => {
    try {
      const response = await fetch('http://localhost:3001/api/interview/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          targetRole,
          experience
        })
      })
      
      if (response.ok) {
        const recommendations = await response.json()
        const { currentSession } = get()
        if (currentSession && currentSession.id === sessionId) {
          set({
            currentSession: {
              ...currentSession,
              recommendations
            }
          })
        }
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error)
    }
  },

  loadQuestionBank: () => {
    const questions: InterviewQuestion[] = [
      {
        id: '1',
        type: 'behavioral',
        category: 'Leadership',
        difficulty: 'medium',
        question: 'Tell me about a time when you had to lead a team through a difficult project.',
        timeLimit: 300,
      },
      {
        id: '2',
        type: 'technical',
        category: 'Algorithms',
        difficulty: 'hard',
        question: 'Explain the difference between depth-first search and breadth-first search.',
        expectedTopics: ['DFS', 'BFS', 'Time Complexity', 'Use Cases'],
      },
      {
        id: '3',
        type: 'coding',
        category: 'Data Structures',
        difficulty: 'medium',
        question: 'Implement a function to reverse a linked list.',
        timeLimit: 1800,
      },
    ]
    
    set({ questionBank: questions })
  },
}))
