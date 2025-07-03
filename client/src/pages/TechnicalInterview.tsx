import { useState, useEffect, useCallback, useRef } from 'react'
import { ArrowLeft, X, Mic, RotateCcw, Video, Target, Sparkles, Loader2, AlertCircle, RefreshCw, Clock } from 'lucide-react'
import { useNavigate, useSearchParams } from "react-router-dom"
import { motion, AnimatePresence } from 'framer-motion'
import SpeechRecognition from '../components/SpeechRecognition'
import CameraPreview from '../components/CameraPreview'
import InterviewGuidelinesOverlay from '../components/InterviewGuidelinesOverlay'
import { useInterviewStore } from '../stores/interviewStore'
import { useSpeechStore } from '../stores/speechStore'
import * as interviewService from '../services/interviewService'

<<<<<<< HEAD
const API_URL = 'http://localhost:3001/api'

=======
>>>>>>> c538edd751c2e8f7c7773b287e3f6c83f630f35e
interface Question {
  id: number
  text: string
  category: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  expectedPoints: string[]
  techStack: string
}

export default function TechnicalInterview() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
<<<<<<< HEAD
  const selectedTechStack = searchParams.get('techStack') || 'Generic'
=======
  const selectedTechStack = searchParams.get('techStack') || 'JavaScript'
>>>>>>> c538edd751c2e8f7c7773b287e3f6c83f630f35e
  const selectedLevel = searchParams.get('level') || 'Basic'
  
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isQuestionSpeaking, setIsQuestionSpeaking] = useState(false)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true)
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionStarted, setSessionStarted] = useState(false)
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [showCameraWarning, setShowCameraWarning] = useState(false)
  const [cameraWasReady, setCameraWasReady] = useState(false)
  const [showGuidelinesOverlay, setShowGuidelinesOverlay] = useState(true)
  const [guidelinesCompleted, setGuidelinesCompleted] = useState(false)
  const [devicesReady, setDevicesReady] = useState(false)
  const [deviceCheckFailed, setDeviceCheckFailed] = useState(false)
  const [questionsLoaded, setQuestionsLoaded] = useState(false) // Flag to prevent re-loading
  const [followUpQuestion, setFollowUpQuestion] = useState<string | null>(null) // Store follow-up question
  const [showFollowUp, setShowFollowUp] = useState(false) // Flag to show follow-up question
  const [questionHasBeenSpoken, setQuestionHasBeenSpoken] = useState(false) // Track if current question was spoken
  
  // Countdown timer states
  const [showCountdown, setShowCountdown] = useState(false)
  const [countdownValue, setCountdownValue] = useState(3)
  const [interviewReady, setInterviewReady] = useState(false)
  
  const { saveResponse } = useInterviewStore()
<<<<<<< HEAD
  const { transcript, clearTranscript, speak, stopSpeaking, isSpeaking, startListening } = useSpeechStore()
=======
  const { transcript, clearTranscript, speak, stopSpeaking, isSpeaking, startListening, abortListening } = useSpeechStore()
>>>>>>> c538edd751c2e8f7c7773b287e3f6c83f630f35e
  
  // Camera reference for proper cleanup
  const cameraRef = useRef<any>(null)

  // Enhanced function to calculate text similarity with better detection
  const calculateSimilarity = (text1: string, text2: string): number => {
    // Convert to lowercase and remove common interviewer phrases for better comparison
    const normalize = (text: string) => 
      text.toLowerCase()
        .replace(/so,|let's|talk about|tell me|can you|how do you|what is|explain|describe|walk me through/g, '')
        .replace(/[^\w\s]/g, '') // Remove punctuation
        .trim()
    
    const normalized1 = normalize(text1)
    const normalized2 = normalize(text2)
    
    // Split into words and filter out common words
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'among', 'within', 'without', 'under', 'over', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'can', 'will', 'just', 'should', 'now'])
    
    const words1 = normalized1.split(/\s+/).filter(word => word.length > 2 && !commonWords.has(word))
    const words2 = normalized2.split(/\s+/).filter(word => word.length > 2 && !commonWords.has(word))
    
    if (words1.length === 0 || words2.length === 0) return 0
    
    // Calculate Jaccard similarity (intersection over union)
    const set1 = new Set(words1)
    const set2 = new Set(words2)
    const intersection = new Set([...set1].filter(x => set2.has(x)))
    const union = new Set([...set1, ...set2])
    
    const jaccardSimilarity = intersection.size / union.size
    
    // Also check for substring similarity (important technical terms)
    const longerWords1 = words1.filter(word => word.length > 4)
    const longerWords2 = words2.filter(word => word.length > 4)
    
    let substringMatches = 0
    for (const word1 of longerWords1) {
      for (const word2 of longerWords2) {
        if (word1.includes(word2) || word2.includes(word1)) {
          substringMatches++
        }
      }
    }
    
    const substringSimilarity = longerWords1.length > 0 ? 
      substringMatches / Math.max(longerWords1.length, longerWords2.length) : 0
    
    // Combine both metrics
    return Math.max(jaccardSimilarity, substringSimilarity * 0.7)
  }

  // Function to ensure camera is turned on
  const ensureCameraOn = async () => {
    try {
      // Check if devices are ready before starting the interview
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      })
      
      // Verify both video and audio tracks are available
      const videoTracks = stream.getVideoTracks()
      const audioTracks = stream.getAudioTracks()
      
      if (videoTracks.length === 0 || audioTracks.length === 0) {
        throw new Error('Camera or microphone not available')
      }
      
      setDevicesReady(true)
      setDeviceCheckFailed(false)
      
      // Stop the test stream - the actual camera will be started by CameraPreview
      stream.getTracks().forEach(track => track.stop())
      
      console.log('Devices verified and ready for interview')
      
      // Automatically start the session after devices are verified
      if (!sessionStarted && !sessionId) {
        console.log('🚀 Auto-starting session after device verification...')
        await startSession()
      }
    } catch (error) {
      console.error('Device check failed:', error)
      setDevicesReady(false)
      setDeviceCheckFailed(true)
      
      // Show error to user and redirect back to dashboard
      alert('Camera and microphone access is required for the interview. Please enable them and try again.')
    }
  }

  // Start a new session with the backend
  const startSession = async () => {
    console.log('🚀 Starting session...')
    try {
      const newSessionId = await interviewService.startSession(selectedTechStack, selectedLevel)
      console.log('✅ Session started successfully:', newSessionId)
      setSessionId(newSessionId)
      setSessionStarted(true)
      // Reset loading state to allow question loading to trigger
      setIsLoadingQuestions(false)
      console.log('Session started:', newSessionId)
    } catch (error) {
      console.error('❌ Error starting session:', error)
      // If session creation fails, show error and don't continue
      setLoadingError('Failed to start interview session. Please check your connection and try again.')
      setDeviceCheckFailed(true)
    }
  }

  // End the current session
  const endSession = async (overallScore?: number) => {
    if (!sessionId) return

    try {
      await interviewService.endSession(sessionId, overallScore)
      console.log('Session ended:', sessionId)
      
      // Set refresh flag for dashboard to update when user returns
      localStorage.setItem('dashboard-refresh-needed', 'true')
      console.log('🔄 Dashboard refresh flag set after interview completion')
    } catch (error) {
      console.error('Error ending session:', error)
    }
  }

  // Cleanup function for ending interview and stopping media
  const handleEndInterviewAndExit = async (redirectPath: string = '/') => {
    console.log('🔚 Ending interview and cleaning up...')
    
    try {
      // Stop all media streams
      stopSpeaking()
      setIsQuestionSpeaking(false)
      
      // Stop camera streams
      if (cameraRef.current && cameraRef.current.stopCamera) {
        cameraRef.current.stopCamera()
      }
      
      // Force stop all media tracks
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        stream.getTracks().forEach(track => track.stop())
      } catch (error) {
        // Ignore errors if no stream exists
        console.log('No active media stream to stop')
      }
      
      // End the interview session if one exists
      if (sessionId) {
        try {
          const overallScore = questions.length > 0 ? 
            Math.round(questions.reduce((acc, _, index) => acc + (75 + index * 5), 0) / questions.length) : 
            0
          
          await endSession(overallScore)
          console.log('✅ Interview session ended successfully')
        } catch (error) {
          console.warn('⚠️ Failed to end interview session:', error)
          // Continue with cleanup even if session ending fails
        }
      }
      
      // Clear local storage
      localStorage.removeItem('interview-session-id')
      
      // Reset component state
      setSessionId(null)
      setSessionStarted(false)
      setQuestions([])
      setCurrentQuestionIndex(0)
      setQuestionsLoaded(false)
      setIsLoadingQuestions(false)
      setLoadingError(null)
      
      console.log('🧹 Cleanup completed, navigating to:', redirectPath)
      
      // Navigate to the specified path
      navigate(redirectPath)
      
    } catch (error) {
      console.error('❌ Error during interview cleanup:', error)
      // Even if cleanup fails, still navigate away
      navigate(redirectPath)
    }
  }

  // Update session with question and response
  const updateSession = async (question: any, response?: string, evaluation?: any) => {
    if (!sessionId) return

    try {
      await interviewService.updateSession(sessionId, question, response, evaluation)
    } catch (error) {
      console.error('Error updating session:', error)
    }
  }

  // Initialize guidelines overlay on component mount  
  useEffect(() => {
    if (!guidelinesCompleted) {
      setShowGuidelinesOverlay(true)
    } else {
      setShowGuidelinesOverlay(false)
    }
  }, [guidelinesCompleted])

  
  
  useEffect(() => {
    if (guidelinesCompleted && !sessionStarted && devicesReady) {
      startSession()
    }
  }, [guidelinesCompleted, sessionStarted, devicesReady])
  useEffect(() => {
    return () => {
      // Stop any ongoing speech
      stopSpeaking()
      setIsQuestionSpeaking(false)
<<<<<<< HEAD
      // Clear session when leaving the interview page - but DON'T end the session
      // Sessions should only end when explicitly clicking "End Interview"
      localStorage.removeItem('interview-session-id')
      
      // Don't automatically end session on navigation - only on explicit user action
      // This allows users to navigate to dashboard without ending their interview
      console.log('🧹 Component cleanup - stopping speech but preserving session')
=======
      // Clear session when leaving the interview page
      localStorage.removeItem('interview-session-id')
      
      // End session if it exists - use current sessionId from closure
      const currentSessionId = sessionId
      if (currentSessionId) {
        const cleanup = async () => {
          try {
            await interviewService.endSession(currentSessionId, 0) // End with 0 score if user leaves abruptly
          } catch (error) {
            console.warn('Failed to end session on cleanup:', error)
          }
        }
        cleanup()
      }
>>>>>>> c538edd751c2e8f7c7773b287e3f6c83f630f35e
    }
  }, [stopSpeaking]) // Remove sessionId from dependencies to prevent cleanup on session change

  // Stop speech when user navigates away or closes browser
  useEffect(() => {
    const handleBeforeUnload = () => {
      const { stopListening } = useSpeechStore.getState()
      stopSpeaking()
      stopListening()
      setIsQuestionSpeaking(false)
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const { stopListening } = useSpeechStore.getState()
        stopSpeaking()
        stopListening()
        setIsQuestionSpeaking(false)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [stopSpeaking])
  
  const loadQuestions = useCallback(async (): Promise<boolean> => {
    // Only prevent if already successfully loaded
    if (questionsLoaded && questions.length > 0) {
      console.log('✅ Questions already loaded, skipping duplicate request')
      return true
    }
    
    // Prevent concurrent loading attempts
    if (isLoadingQuestions) {
      console.log('⚠️ Questions already loading, skipping duplicate request')
      return false
    }
    
    setIsLoadingQuestions(true)
    setLoadingError(null)
    
    console.log('🔍 Starting question loading process...')
    console.log('📋 Tech Stack:', selectedTechStack, 'Level:', selectedLevel, 'Session ID:', sessionId)
    
    try {
      // Load multiple questions for the interview (5 questions)
      const questionsToLoad = 5
      const loadedQuestions: Question[] = []
      const questionSources: string[] = [] // Track sources for consistency
      
      for (let i = 0; i < questionsToLoad; i++) {
        try {
          console.log(`🎯 Loading question ${i + 1}/${questionsToLoad}...`)
          console.log(`📋 Calling API with: techStack=${selectedTechStack}, level=${selectedLevel}, sessionId=${sessionId}`)
          console.log(`📝 Previous questions for context:`, loadedQuestions.map(q => q.text.substring(0, 50) + '...'))
          
          const generatedQuestion = await interviewService.generateQuestion(
            selectedTechStack,
            selectedLevel,
            loadedQuestions.map(q => q.text),
            sessionId || ''
          )
          
          console.log(`✅ Question ${i + 1} loaded successfully:`, {
            questionPreview: generatedQuestion.question.substring(0, 100) + '...',
            hasExpectedTopics: !!generatedQuestion.expectedTopics,
            topicsCount: generatedQuestion.expectedTopics?.length || 0,
            category: generatedQuestion.category,
            difficulty: generatedQuestion.difficulty
          })
          
          // Check if this question is too similar to previous ones
          const isDuplicate = loadedQuestions.some(existingQ => {
            const similarity = calculateSimilarity(existingQ.text, generatedQuestion.question)
            console.log(`🔍 Similarity check: ${similarity.toFixed(3)} between:`)
            console.log(`  - Existing: ${existingQ.text.substring(0, 60)}...`)
            console.log(`  - New: ${generatedQuestion.question.substring(0, 60)}...`)
            return similarity > 0.4 // Lowered threshold to catch more duplicates
          })
          
          if (isDuplicate) {
            console.warn(`⚠️ Question ${i + 1} appears to be duplicate (similarity > 0.4), trying again...`)
            // Try once more with stricter context including more details about previous questions
            const retryQuestion = await interviewService.generateQuestion(
              selectedTechStack,
              selectedLevel,
              [...loadedQuestions.map(q => `[AVOID] ${q.text}`), `[REJECTED] ${generatedQuestion.question}`],
              sessionId || ''
            )
            
            console.log(`🔄 Retry question ${i + 1}:`, {
              questionPreview: retryQuestion.question.substring(0, 100) + '...',
              category: retryQuestion.category
            })
            
            const newQuestion = {
              id: i + 1,
              text: retryQuestion.question,
              category: selectedTechStack,
              difficulty: selectedLevel as 'Easy' | 'Medium' | 'Hard',
              expectedPoints: retryQuestion.expectedTopics || [],
              techStack: selectedTechStack
            }
            
            loadedQuestions.push(newQuestion)
            questionSources.push('API-RETRY')
          } else {
            const newQuestion = {
              id: i + 1,
              text: generatedQuestion.question,
              category: selectedTechStack,
              difficulty: selectedLevel as 'Easy' | 'Medium' | 'Hard',
              expectedPoints: generatedQuestion.expectedTopics || [],
              techStack: selectedTechStack
            }
            
            loadedQuestions.push(newQuestion)
            questionSources.push('API')
          }
          
          // Update session with the new question (don't fail if this fails)
          try {
            await updateSession(loadedQuestions[loadedQuestions.length - 1], undefined, undefined)
          } catch (updateError) {
            console.warn('⚠️ Failed to update session, but continuing:', updateError)
          }
        } catch (questionError) {
          console.error(`❌ Error loading question ${i + 1}:`, questionError)
          // If we can't load a question from the API, fail the entire question loading process
          throw new Error(`Failed to generate question ${i + 1} from API: ${questionError instanceof Error ? questionError.message : 'Unknown error'}`)
        }
      }
      
      console.log('📊 Question loading summary:')
      console.log(`✅ Total questions loaded: ${loadedQuestions.length}`)
      console.log(`📈 Question sources: ${questionSources.join(', ')}`)
      console.log('📋 Questions preview:', loadedQuestions.map((q, i) => ({
        id: i + 1,
        preview: q.text.substring(0, 80) + '...',
        expectedPointsCount: q.expectedPoints.length,
        source: questionSources[i]
      })))
      
      setQuestions(loadedQuestions)
      setQuestionsLoaded(true)
      
      // Start countdown after questions are loaded
      setTimeout(() => {
        setShowCountdown(true)
        startCountdownSequence()
      }, 500)
      
      return true
    } catch (error) {
      console.error('Error loading questions:', error)
      setLoadingError(error instanceof Error ? error.message : 'Failed to load questions')
      return false
    } finally {
      setIsLoadingQuestions(false)
    }
  }, [selectedTechStack, selectedLevel, sessionId, updateSession])

  // Use a ref to track if questions are being loaded to prevent multiple concurrent loads
  const loadingQuestionsRef = useRef(false)

  // Only load questions when session is ready and not already loaded
  useEffect(() => {
    const shouldLoadQuestions = sessionStarted && sessionId && devicesReady && !deviceCheckFailed && questions.length === 0 && !questionsLoaded && !loadingQuestionsRef.current
    
    console.log('🔍 Question loading check:', {
      sessionStarted,
      sessionId: !!sessionId,
      devicesReady,
      deviceCheckFailed,
      questionsLength: questions.length,
      questionsLoaded,
      isLoadingQuestions,
      loadingQuestionsRefCurrent: loadingQuestionsRef.current,
      shouldLoadQuestions
    })
    
    if (shouldLoadQuestions) {
      console.log('✅ All conditions met, starting question loading...')
      loadingQuestionsRef.current = true
      
      // Reset isLoadingQuestions to false first to ensure clean state
      setIsLoadingQuestions(false)
      
      // Start loading immediately
      loadQuestions().finally(() => {
        loadingQuestionsRef.current = false
      })
    }
  }, [sessionStarted, sessionId, devicesReady, deviceCheckFailed, questions.length, questionsLoaded]) // Removed isLoadingQuestions and loadQuestions from dependencies

  const retryLoadQuestions = async () => {
    console.log('🔄 Retrying question loading...')
    setLoadingError(null)
    setQuestionsLoaded(false) // Reset the flag to allow retry
    setQuestions([]) // Clear existing questions
    setIsLoadingQuestions(false) // Reset loading state first
    loadingQuestionsRef.current = false // Reset ref state
    
    // Small delay to ensure state is reset
    setTimeout(() => {
      loadingQuestionsRef.current = true
      loadQuestions().finally(() => {
        loadingQuestionsRef.current = false
      })
    }, 100)
  }
  
  const currentQuestion = questions[currentQuestionIndex]
  const hasNextQuestion = currentQuestionIndex < questions.length - 1
  const hasPrevQuestion = currentQuestionIndex > 0
  const completionPercentage = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0

  // Speak the question when it changes and handle auto-recording
  useEffect(() => {
    // Only speak if countdown is completed, interview is ready, and question hasn't been spoken yet
    if (currentQuestion && !isSpeaking && interviewReady && !showCountdown && !questionHasBeenSpoken) {
<<<<<<< HEAD
      // ULTRA AGGRESSIVE STOP: Multiple methods to ensure speech recognition is completely disabled
      console.log('🛑 ULTRA AGGRESSIVE speech recognition shutdown before AI speaks')
      const { stopListening, abortListening: abort, isListening } = useSpeechStore.getState()
      
      // Method 1: Stop and abort listening immediately
      if (isListening) {
        stopListening()
        abort()
        console.log('🛑 Method 1: stopListening() and abortListening() called')
      }
      
      // Method 2: Clear transcript multiple times
      clearTranscript()
      clearTranscript()
      clearTranscript()
      console.log('🧹 Method 2: Triple transcript clear executed')
      
      // Method 3: Mark speaking states immediately
      setIsQuestionSpeaking(true)
      setQuestionHasBeenSpoken(true)
      
      // Method 4: Disable speech recognition globally
      try {
        if ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) {
          console.log('🛑 Method 4: Attempting to disable global speech recognition')
        }
      } catch (e) {
        console.log('🛑 Method 4: No global speech recognition to disable')
      }
      
      // Method 5: Continuous transcript clearing during AI speech preparation
      const clearingInterval = setInterval(() => {
        clearTranscript()
        console.log('🧹 Continuous transcript clearing active')
      }, 100)
      
      // Method 6: Delayed speech with multiple safety checks
      setTimeout(() => {
        clearTranscript()
        console.log('🧹 Pre-speech transcript clear #1')
        
        setTimeout(() => {
          clearTranscript()
          console.log('🧹 Pre-speech transcript clear #2')
          
          // Stop the clearing interval before speaking
          clearInterval(clearingInterval)
          
          setTimeout(() => {
            clearTranscript()
            console.log('🧹 Final transcript clear - AI about to speak')
            
            // Ensure voice consistency by loading voices first
            const { loadVoices, voicesLoaded } = useSpeechStore.getState()
            if (!voicesLoaded) {
              loadVoices()
            }
            
            // Create a more natural introduction to the question
            const questionIntro = `Here's question ${currentQuestionIndex + 1} of ${questions.length}.`
            const questionText = `${questionIntro} ${currentQuestion.text}`
            
            // Final safety check and speech
            setTimeout(() => {
              // One final transcript clear right before speaking
              clearTranscript()
              console.log('🎤 AI NOW SPEAKING (transcript should be COMPLETELY EMPTY):', questionIntro)
              speak(questionText)
              
              // Continue clearing transcript during speech
              const speechClearingInterval = setInterval(() => {
                clearTranscript()
              }, 500)
              
              // Stop clearing after 10 seconds (speech should be done by then)
              setTimeout(() => {
                clearInterval(speechClearingInterval)
                console.log('🧹 Stopped continuous transcript clearing during speech')
              }, 10000)
              
            }, 200)
          }, 300)
        }, 300)
      }, 500)
=======
      // AGGRESSIVE STOP: Use abortListening for more forceful stopping
      console.log('🛑 FORCE ABORTING speech recognition before AI speaks')
      abortListening()
      clearTranscript()
      
      // Mark question as speaking immediately to prevent any other triggers
      setIsQuestionSpeaking(true)
      setQuestionHasBeenSpoken(true)
      
      // Optimized delay sequence for faster AI response
      setTimeout(() => {
        // Clear transcript multiple times
        clearTranscript()
        console.log('🧹 First transcript clear')
        
        setTimeout(() => {
          clearTranscript()
          console.log('🧹 Final transcript clear - AI about to speak')
          
          // Ensure voice consistency by loading voices first
          const { loadVoices, voicesLoaded } = useSpeechStore.getState()
          if (!voicesLoaded) {
            loadVoices()
          }
          
          // Create a more natural introduction to the question
          const questionIntro = `Here's question ${currentQuestionIndex + 1} of ${questions.length}.`
          const questionText = `${questionIntro} ${currentQuestion.text}`
          
          // Minimal final delay for smooth transition
          setTimeout(() => {
            console.log('🎤 AI NOW SPEAKING:', questionIntro)
            speak(questionText)
          }, 200) // Reduced from 400ms to 200ms
        }, 250) // Reduced from 300ms to 250ms
      }, 500) // Reduced from 1000ms to 500ms for faster AI response
>>>>>>> c538edd751c2e8f7c7773b287e3f6c83f630f35e
    }
  }, [currentQuestionIndex, currentQuestion, speak, clearTranscript, questions.length, isSpeaking, interviewReady, showCountdown, questionHasBeenSpoken])

  // Reset question spoken state when question changes
  useEffect(() => {
    setQuestionHasBeenSpoken(false)
  }, [currentQuestionIndex])

  // Effect to handle actions after question speaking finishes
  useEffect(() => {
    if (!isSpeaking && isQuestionSpeaking) {
      setIsQuestionSpeaking(false)
      
<<<<<<< HEAD
      // Aggressive cleanup after AI finishes speaking
      console.log('🔊 AI finished speaking, preparing for user response...')
      
      // Multiple transcript clears to ensure no AI speech remnants remain
=======
      // Quick cleanup and restart - much shorter delays
      console.log('🔊 AI finished speaking, preparing for user response...')
      
      // Clear transcript once
>>>>>>> c538edd751c2e8f7c7773b287e3f6c83f630f35e
      clearTranscript()
      
      setTimeout(() => {
        clearTranscript() // Second clear for safety
<<<<<<< HEAD
        console.log('🧹 First post-AI transcript clear')
        
        setTimeout(() => {
          clearTranscript() // Third clear for extra safety
          console.log('🧹 Second post-AI transcript clear - ensuring clean slate for user')
          
          setTimeout(() => {
            clearTranscript() // Final clear before starting user recording
            console.log('🧹 Final transcript clear before starting user recording')
            
            // Check if speech recognition is ready before starting
            const { isListening } = useSpeechStore.getState()
            if (!isListening) {
              console.log('✅ Starting to listen for user response (AI speech blocked from transcript)')
              startListening()
            } else {
              console.log('🔄 Speech recognition already listening')
            }
          }, 200)
        }, 300)
      }, 400)
=======
        console.log('🧹 Clearing transcript after AI speech')
        
        setTimeout(() => {
          // Check if speech recognition is ready before starting
          const { isListening } = useSpeechStore.getState()
          if (!isListening) {
            console.log('✅ Starting to listen for user response after AI finished speaking')
            startListening()
          } else {
            console.log('🔄 Speech recognition already listening')
          }
        }, 200) // Optimized to 200ms for faster response
      }, 600) // Optimized to 600ms for faster transition
>>>>>>> c538edd751c2e8f7c7773b287e3f6c83f630f35e
    }
  }, [isSpeaking, isQuestionSpeaking, startListening, clearTranscript])

  const endInterview = async () => {
    console.log('🔚 Ending interview - stopping all services')
    
    // Stop speech synthesis and recognition immediately
    const { stopListening } = useSpeechStore.getState()
    stopSpeaking()
    stopListening()
    setIsQuestionSpeaking(false)
    
    // Stop camera monitoring
    if (cameraRef.current && cameraRef.current.stopCamera) {
      console.log('📹 Stopping camera via ref')
      cameraRef.current.stopCamera()
    }
    
    // Force stop all media devices globally
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      console.log('🎥 Available devices before global stop:', devices.filter(d => d.kind === 'videoinput').length)
      
      // Attempt to get and immediately stop all media streams
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          stream.getTracks().forEach(track => {
            console.log('🛑 Force stopping track:', track.kind)
            track.stop()
          })
        } catch (e) {
          console.log('No active streams to stop')
        }
      }
    } catch (e) {
      console.log('Could not enumerate/stop devices:', e)
    }
    
<<<<<<< HEAD
    // Get actual responses and evaluations from the interview store
=======
    // Get actual responses from the interview store
>>>>>>> c538edd751c2e8f7c7773b287e3f6c83f630f35e
    const { currentSession } = useInterviewStore.getState()
    const responses = currentSession?.responses || {}
    
    console.log('📊 Interview ending analysis:', {
      currentSession: !!currentSession,
      responsesCount: Object.keys(responses).length,
      responses: responses,
      questionsCount: questions.length,
      currentQuestionIndex
    })
    
<<<<<<< HEAD
    // Calculate actual performance metrics FIRST
=======
    // Calculate actual performance metrics
>>>>>>> c538edd751c2e8f7c7773b287e3f6c83f630f35e
    const questionsAnswered = Object.keys(responses).filter(key => {
      const response = responses[key]
      return response && response.trim().length > 0
    }).length
    
    const questionsAttempted = Math.max(currentQuestionIndex + 1, Object.keys(responses).length)
    const completionRate = questions.length > 0 ? Math.round((questionsAnswered / questions.length) * 100) : 0
    const hasAnyResponses = questionsAnswered > 0
    
    console.log('📈 Performance metrics:', {
      questionsAnswered,
      questionsAttempted,
      completionRate,
      hasAnyResponses,
      totalQuestions: questions.length
    })
    
<<<<<<< HEAD
    // Try to get stored evaluation data from the backend session - IMPROVED VERSION
    let backendAnalysis = null
    if (sessionId) {
      try {
        console.log('🔍 Fetching backend session analysis for sessionId:', sessionId)
        
        // Try multiple endpoint variations to ensure we get the data
        const endpoints = [
          `${API_URL}/sessions/${sessionId}/analysis`,
          `${API_URL}/sessions/${sessionId}`,
          `${API_URL}/interview/session/${sessionId}/analysis`
        ]
        
        for (const endpoint of endpoints) {
          try {
            console.log('🔍 Trying endpoint:', endpoint)
            const sessionResponse = await fetch(endpoint, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include'
            })
            
            if (sessionResponse.ok) {
              const sessionData = await sessionResponse.json()
              console.log('📊 Backend response from', endpoint, ':', sessionData)
              
              // Check multiple possible locations for analysis data
              backendAnalysis = sessionData.analysis || 
                               sessionData.evaluation?.analysis || 
                               sessionData.finalAnalysis ||
                               sessionData.session?.analysis ||
                               sessionData.session?.evaluation?.analysis ||
                               sessionData.data?.analysis
              
              if (backendAnalysis) {
                console.log('✅ Found backend analysis:', backendAnalysis)
                break
              } else {
                console.log('⚠️ No analysis found in response from', endpoint)
              }
            } else {
              console.log('❌ Failed to fetch from', endpoint, '- Status:', sessionResponse.status)
            }
          } catch (endpointError) {
            console.log('❌ Error with endpoint', endpoint, ':', endpointError)
          }
        }
        
        // If still no analysis found, try to get individual evaluations
        if (!backendAnalysis) {
          console.log('� No session analysis found, checking for individual evaluations...')
          try {
            const evaluationResponse = await fetch(`${API_URL}/interview/session/${sessionId}/evaluations`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include'
            })
            
            if (evaluationResponse.ok) {
              const evaluations = await evaluationResponse.json()
              console.log('�📊 Individual evaluations found:', evaluations)
              
              if (evaluations && evaluations.length > 0) {
                // Aggregate individual evaluations into overall analysis
                const totalScore = evaluations.reduce((sum: number, evaluation: any) => sum + (evaluation.score || 0), 0)
                const avgScore = Math.round(totalScore / evaluations.length)
                
                backendAnalysis = {
                  overallScore: avgScore,
                  technicalAccuracy: avgScore,
                  communicationClarity: Math.max(avgScore - 5, 0),
                  completeness: questionsAnswered > 0 ? Math.round((questionsAnswered / questions.length) * 100) : 0,
                  problemSolving: Math.max(avgScore - 3, 0),
                  strengths: evaluations.flatMap((e: any) => e.strengths || []).slice(0, 3),
                  improvements: evaluations.flatMap((e: any) => e.improvements || []).slice(0, 3),
                  overallFeedback: `Analysis based on ${evaluations.length} evaluated responses with an average score of ${avgScore}.`,
                  isAggregated: true
                }
                console.log('✅ Created aggregated analysis from evaluations:', backendAnalysis)
              }
            }
          } catch (evalError) {
            console.log('❌ Error fetching individual evaluations:', evalError)
          }
        }
        
      } catch (error) {
        console.warn('⚠️ Could not retrieve backend analysis:', error)
      }
    } else {
      console.warn('⚠️ No sessionId available for backend analysis')
    }
    
    let realAnalysis
    
    // Use backend analysis if available, otherwise create basic analysis
    if (backendAnalysis && backendAnalysis.overallScore !== undefined) {
      console.log('✅ Using real backend AI analysis')
      realAnalysis = {
        score: backendAnalysis.overallScore,
        technicalAccuracy: backendAnalysis.technicalAccuracy || backendAnalysis.score,
        communicationClarity: backendAnalysis.communicationClarity || Math.max(backendAnalysis.score - 10, 0),
        completeness: completionRate,
        problemSolving: backendAnalysis.problemSolving || Math.max(backendAnalysis.score - 5, 0),
        strengths: backendAnalysis.strengths || ["Completed the interview"],
        improvements: backendAnalysis.improvements || ["Continue practicing"],
        overallFeedback: backendAnalysis.overallFeedback || `You answered ${questionsAnswered} of ${questions.length} questions with AI-evaluated responses.`,
        questionsAnswered: questionsAnswered,
        totalQuestions: questions.length,
        duration: questionsAttempted <= 2 ? '2-5 minutes' : questionsAttempted <= 4 ? '8-12 minutes' : '15-20 minutes',
        techStack: selectedTechStack,
        completionRate: completionRate,
        hasResponses: hasAnyResponses,
        isAIAnalyzed: true
      }
    } else {
      console.log('⚠️ Using fallback basic analysis - no backend AI evaluation available')
      
      // Calculate basic scores based on response characteristics
      let technicalScore = 0
      let communicationScore = 0
      let completenessScore = completionRate
      let problemSolvingScore = 0
=======
    // Calculate realistic scores based on actual responses
    let technicalScore = 0
    let communicationScore = 0
    let completenessScore = completionRate
    let problemSolvingScore = 0
>>>>>>> c538edd751c2e8f7c7773b287e3f6c83f630f35e
    
    if (hasAnyResponses) {
      // Analyze response quality - filter out empty responses
      const validResponses = Object.values(responses).filter(r => r && (r as string).trim().length > 0)
      const responseLengths = validResponses.map(r => (r as string).trim().length)
      const avgResponseLength = responseLengths.length > 0 ? responseLengths.reduce((sum, len) => sum + len, 0) / responseLengths.length : 0
      const minResponseLength = responseLengths.length > 0 ? Math.min(...responseLengths) : 0
      const hasSubstantialResponses = avgResponseLength > 20 && minResponseLength > 5
      
      console.log('📝 Response analysis:', {
        validResponsesCount: validResponses.length,
        avgResponseLength,
        minResponseLength,
        hasSubstantialResponses
      })
      
      if (hasSubstantialResponses) {
        // Good responses - decent scores
        technicalScore = Math.min(40 + Math.floor(avgResponseLength / 10), 85)
        communicationScore = Math.min(35 + Math.floor(avgResponseLength / 8), 80)
        problemSolvingScore = Math.min(30 + Math.floor(avgResponseLength / 12), 75)
      } else {
        // Poor/short responses - low scores
        technicalScore = Math.max(Math.floor(avgResponseLength / 5), 10)
        communicationScore = Math.max(Math.floor(avgResponseLength / 4), 15)
        problemSolvingScore = Math.max(Math.floor(avgResponseLength / 6), 8)
      }
    } else {
      // No responses at all - very low scores
      technicalScore = 5
      communicationScore = 10
      problemSolvingScore = 5
      completenessScore = 0
    }
    
    const overallScore = Math.round((technicalScore + communicationScore + completenessScore + problemSolvingScore) / 4)
    
    // Generate realistic feedback based on performance
    let strengths = []
    let improvements = []
    let overallFeedback = ""
    
    if (!hasAnyResponses) {
      strengths = ["Showed up for the interview", "Listened to questions"]
      improvements = [
        "Provide verbal responses to questions",
        "Practice speaking your thoughts out loud",
        "Engage with the interviewer",
        "Prepare for basic technical questions",
        "Work on communication skills"
      ]
      overallFeedback = `Interview incomplete. You listened to ${questionsAttempted} question(s) but didn't provide any responses. Consider practicing speaking your answers out loud and engaging more actively in future interviews.`
    } else if (overallScore < 30) {
      strengths = [
        "Attempted to answer questions",
        questionsAnswered > 1 ? "Answered multiple questions" : "Provided some response"
      ]
      improvements = [
        "Provide more detailed explanations",
        "Practice technical concepts more thoroughly",
        "Work on articulating your thought process",
        "Expand your responses with examples",
        "Review fundamental concepts"
      ]
      overallFeedback = `Needs improvement. You answered ${questionsAnswered} of ${questions.length} questions, but responses were quite brief. Focus on providing more detailed explanations and practicing core ${selectedTechStack} concepts.`
    } else if (overallScore < 60) {
      strengths = [
        `Basic understanding of ${selectedTechStack}`,
        "Attempted to answer questions",
        questionsAnswered > 2 ? "Good participation level" : "Some engagement"
      ]
      improvements = [
        "Provide more comprehensive answers",
        "Include specific examples in responses",
        "Practice explaining concepts more clearly",
        "Work on technical depth"
      ]
      overallFeedback = `Fair performance. You answered ${questionsAnswered} of ${questions.length} questions with decent responses. Work on providing more detailed explanations and deeper technical insights.`
    } else {
      strengths = [
        `Good understanding of ${selectedTechStack} concepts`,
        "Clear communication",
        "Engaged with all questions",
        "Provided thoughtful responses"
      ]
      improvements = [
        "Consider more edge cases",
        "Expand on implementation details",
        "Practice with more complex scenarios"
      ]
<<<<<<< HEAD
      }
      
      realAnalysis = {
        score: overallScore,
        technicalAccuracy: technicalScore,
        communicationClarity: communicationScore,
        completeness: completenessScore,
        problemSolving: problemSolvingScore,
        strengths: strengths,
        improvements: improvements,
        overallFeedback: overallFeedback,
        questionsAnswered: questionsAnswered,
        totalQuestions: questions.length,
        duration: questionsAttempted <= 2 ? '2-5 minutes' : questionsAttempted <= 4 ? '8-12 minutes' : '15-20 minutes',
        techStack: selectedTechStack,
        completionRate: completionRate,
        hasResponses: hasAnyResponses,
        isAIAnalyzed: false
      }
=======
      overallFeedback = `Good performance! You answered ${questionsAnswered} of ${questions.length} questions with solid responses. Your communication was clear and you demonstrated good knowledge of ${selectedTechStack}.`
    }
    
    const realAnalysis = {
      score: overallScore,
      technicalAccuracy: technicalScore,
      communicationClarity: communicationScore,
      completeness: completenessScore,
      problemSolving: problemSolvingScore,
      strengths: strengths,
      improvements: improvements,
      overallFeedback: overallFeedback,
      questionsAnswered: questionsAnswered,
      totalQuestions: questions.length,
      duration: questionsAttempted <= 2 ? '2-5 minutes' : questionsAttempted <= 4 ? '8-12 minutes' : '15-20 minutes',
      techStack: selectedTechStack,
      completionRate: completionRate,
      hasResponses: hasAnyResponses
>>>>>>> c538edd751c2e8f7c7773b287e3f6c83f630f35e
    }
    
    setAnalysisData(realAnalysis)
    
    // End the session with the calculated overall score
<<<<<<< HEAD
    await endSession(realAnalysis.score)
=======
    await endSession(overallScore)
>>>>>>> c538edd751c2e8f7c7773b287e3f6c83f630f35e
    
    setShowAnalysis(true)
  }

  const goToNextQuestion = () => {
    if (hasNextQuestion) {
      const { stopListening } = useSpeechStore.getState()
      stopSpeaking()
      stopListening()
      setCurrentQuestionIndex(prev => prev + 1)
      clearTranscript()
    }
  }

  const goToPreviousQuestion = () => {
    if (hasPrevQuestion) {
      const { stopListening } = useSpeechStore.getState()
      stopSpeaking()
      stopListening()
      setCurrentQuestionIndex(prev => prev - 1)
      clearTranscript()
    }
  }

  const handleSubmitResponse = async () => {
    if (!transcript.trim() || !sessionId || !currentQuestion) return
    setIsSubmitting(true)
    
    try {
      // Save response locally
      saveResponse(currentQuestion.id.toString(), transcript)
      
      // Evaluate response with backend
      const evaluation = await interviewService.evaluateResponse(currentQuestion.text, transcript, sessionId)
      
      // Update session with response and evaluation
      await updateSession(currentQuestion, transcript, evaluation)
      
      // Check if there's a follow-up question from the evaluation
      if (evaluation?.nextSteps?.followUpQuestions && evaluation.nextSteps.followUpQuestions.length > 0) {
        console.log('📝 Follow-up questions available:', evaluation.nextSteps.followUpQuestions)
        
        // Select a random follow-up question
        const randomFollowUp = evaluation.nextSteps.followUpQuestions[
          Math.floor(Math.random() * evaluation.nextSteps.followUpQuestions.length)
        ]
        
        setFollowUpQuestion(randomFollowUp)
        setShowFollowUp(true)
        
        // Clear transcript for follow-up
        clearTranscript()
        
        // Speak the follow-up question
        setTimeout(() => {
          speak(`Follow-up question: ${randomFollowUp}`)
        }, 500)
        
        return // Don't move to next question yet
      }
      
      clearTranscript()
      
      if (hasNextQuestion) {
        setCurrentQuestionIndex(prev => prev + 1)
      } else {
        // This is the last question, automatically end the interview
        endInterview()
      }
    } catch (error) {
      console.error('Error submitting response:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const skipQuestion = async () => {
    const { stopListening } = useSpeechStore.getState()
    stopSpeaking()
    stopListening()
    clearTranscript()
    
    // If we're showing a follow-up, just proceed to next question
    if (showFollowUp) {
      setShowFollowUp(false)
      setFollowUpQuestion(null)
      
      if (hasNextQuestion) {
        setCurrentQuestionIndex(prev => prev + 1)
      } else {
        endInterview()
      }
      return
    }
    
    if (hasNextQuestion) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      // This is the last question, end the interview
      endInterview()
    }
  }

  const handleFollowUpResponse = async () => {
    if (!transcript.trim() || !sessionId || !currentQuestion || !followUpQuestion) return
    setIsSubmitting(true)
    
    try {
      // Save follow-up response locally
      saveResponse(`${currentQuestion.id}-followup`, transcript)
      
      // Evaluate follow-up response
      const evaluation = await interviewService.evaluateResponse(followUpQuestion, transcript, sessionId)
      
      // Update session with follow-up response
      await updateSession(currentQuestion, transcript, evaluation)
      
      // Clear follow-up state
      setShowFollowUp(false)
      setFollowUpQuestion(null)
      clearTranscript()
      
      if (hasNextQuestion) {
        setCurrentQuestionIndex(prev => prev + 1)
      } else {
        // This is the last question, automatically end the interview
        endInterview()
      }
    } catch (error) {
      console.error('Error submitting follow-up response:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Countdown sequence function
  const startCountdownSequence = () => {
    let count = 3
    setCountdownValue(count)
    
    const countdownInterval = setInterval(() => {
      count--
      if (count > 0) {
        setCountdownValue(count)
      } else {
        clearInterval(countdownInterval)
        setCountdownValue(0)
        // Show "Start - Good Luck!" message
        setTimeout(() => {
          setShowCountdown(false)
          setInterviewReady(true)
        }, 1000)
      }
    }, 1000)
  }

  if (showGuidelinesOverlay) {
    return (
      <InterviewGuidelinesOverlay
        isOpen={showGuidelinesOverlay}
        onClose={() => navigate('/dashboard')}
        onProceed={() => {
          setShowGuidelinesOverlay(false)
          setGuidelinesCompleted(true)
          ensureCameraOn()
        }}
        techStack={selectedTechStack}
        level={selectedLevel}
      />
    )
  }

  if (isLoadingQuestions || (!currentQuestion && !showCountdown)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-8 p-8"
        >
          <div className="relative">
            <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center shadow-2xl">
              <Loader2 className="h-12 w-12 text-white animate-spin" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full animate-pulse flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Preparing Your Interview
            </h2>
            <div className="space-y-2">
              <p className="text-xl text-blue-600 dark:text-blue-400 font-bold">
                {selectedTechStack} • {selectedLevel} Level
              </p>
              <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                {isLoadingQuestions ? 'Our AI is generating personalized technical questions just for you...' : 'Loading questions...'}
              </p>
            </div>
          </div>
          
          <div className="flex justify-center">
            <div className="flex space-x-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 bg-blue-500 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </div>
          
          {loadingError && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 max-w-md mx-auto"
            >
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                <h3 className="font-bold text-red-800 dark:text-red-200">Interview Setup Failed</h3>
              </div>
              <p className="text-red-700 dark:text-red-300 mb-4">{loadingError}</p>
              <p className="text-red-600 dark:text-red-400 text-sm mb-4">
                All questions must be generated by AI. Without API access, the interview cannot proceed.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={retryLoadQuestions}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors duration-200"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </button>
                <button
                  onClick={() => handleEndInterviewAndExit('/dashboard')}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-colors duration-200"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </button>
              </div>
            </motion.div>
          )}
          
          {/* Show retry button if loading is taking too long */}
          {isLoadingQuestions && !loadingError && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 max-w-md mx-auto"
            >
              <div className="flex items-center gap-3 mb-3">
                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-blue-800 dark:text-blue-200">Taking longer than usual?</h3>
              </div>
              <p className="text-blue-700 dark:text-blue-300 mb-4">
                If the questions are taking too long to load, you can retry the process.
              </p>
              <button
                onClick={retryLoadQuestions}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-200"
              >
                <RefreshCw className="h-4 w-4" />
                Retry Loading
              </button>
            </motion.div>
          )}
          
          <p className="text-sm text-gray-500 dark:text-gray-400">
            🤖 AI-powered dynamic questions with Gemini 2.0 Flash
          </p>
        </motion.div>
      </div>
    )
  }

  // Countdown Screen
  if (showCountdown) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.2 }}
          className="text-center space-y-12 p-8"
        >
          <div className="relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="w-48 h-48 mx-auto bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl"
            >
              {countdownValue > 0 ? (
                <motion.span
                  key={countdownValue}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-8xl font-bold text-white"
                >
                  {countdownValue}
                </motion.span>
              ) : (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold text-white mb-2">START</div>
                  <div className="text-xl text-white/80">Good Luck!</div>
                </motion.div>
              )}
            </motion.div>
          </div>
          
          <div className="space-y-4">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold text-gray-900 dark:text-white"
            >
              {countdownValue > 0 ? 'Get Ready!' : 'Starting Interview'}
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-2"
            >
              <p className="text-xl text-blue-600 dark:text-blue-400 font-bold">
                {selectedTechStack} • {selectedLevel} Level
              </p>
              <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                {countdownValue > 0 
                  ? `${questions.length} questions prepared and ready to go!`
                  : 'Your interview is beginning now...'
                }
              </p>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex justify-center space-x-4"
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    )
  }

  // Don't show main interview until countdown is complete
  if (!interviewReady) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900">
      {/* Header */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-xl border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => handleEndInterviewAndExit('/')}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 rounded-2xl transition-all duration-300 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                aria-label="End interview and return to home page"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-bold">End Interview</span>
              </button>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  Technical Interview
                </h1>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-500" />
                    <p className="text-lg text-blue-600 dark:text-blue-400 font-bold">
                      {selectedTechStack} Focus
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-500" />
                    <p className="text-lg text-purple-600 dark:text-purple-400 font-bold">
                      {selectedLevel} Level
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Enhanced Progress Section */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex items-center space-x-6"
              >
                <div className="text-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl px-6 py-4 border border-gray-200/50 dark:border-gray-700/50">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {currentQuestionIndex + 1} / {questions.length}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    Questions
                  </div>
                </div>
                
                <div className="relative">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-6 shadow-inner overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${completionPercentage}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 h-6 rounded-full shadow-lg relative progress-bar"
                    />
                  </div>
                  <div className="text-center mt-2">
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      {Math.round(completionPercentage)}% Complete
                    </span>
                  </div>
                </div>
              </motion.div>
              
              {/* Enhanced End Interview Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={endInterview}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl"
                aria-label="End interview"
              >
                <X className="h-5 w-5" />
                <span>End Interview</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Enhanced Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Enhanced Question Display */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="xl:col-span-1 bg-gradient-to-br from-white/90 to-blue-50/90 dark:from-gray-800/90 dark:to-blue-900/20 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50 dark:border-gray-700/50 hover-lift"
            >
              <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">Q</span>
                </div>
                {showFollowUp ? 'Follow-up Question' : `Question ${currentQuestionIndex + 1}`}
              </h3>
              <div className="space-y-6">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="text-gray-800 dark:text-gray-200 leading-relaxed text-lg bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border-l-4 border-blue-500"
                >
                  <p className="font-medium whitespace-pre-wrap">
                    {showFollowUp ? followUpQuestion : currentQuestion.text}
                  </p>
                </motion.div>
                
                {!showFollowUp && (
                  <div>
                    <h4 className="font-bold mb-4 text-gray-900 dark:text-white text-lg flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-500" />
                      Key Points to Cover:
                    </h4>
                    <ul className="space-y-3">
                      {currentQuestion.expectedPoints.map((point, index) => (
                        <motion.li 
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.6 + (index * 0.1) }}
                          className="flex items-start gap-3 text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 rounded-2xl p-3 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-200"
                        >
                          <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg">
                            <span className="text-white text-xs font-bold">{index + 1}</span>
                          </div>
                          <span className="leading-relaxed">{point}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {showFollowUp && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-4 border-l-4 border-yellow-500">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      💡 This is a follow-up question based on your previous response. Please elaborate or provide additional details.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
              
            {/* Enhanced Camera and Recording */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="xl:col-span-1 bg-gradient-to-br from-white/90 to-green-50/90 dark:from-gray-800/90 dark:to-green-900/20 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50 dark:border-gray-700/50 hover-lift"
            >
              <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Video className="h-6 w-6 text-white" />
                </div>
                Recording Studio
              </h3>                <div className="space-y-6">
                {/* Device Check Warning */}
                {deviceCheckFailed && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700 rounded-2xl p-4"
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-red-800 dark:text-red-200 mb-2">⚠️ Device Access Required</h4>
                        <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                          The interview requires both camera and microphone access. Please enable them and refresh the page.
                        </p>
                        <button
                          onClick={() => {
                            setDeviceCheckFailed(false)
                            ensureCameraOn()
                          }}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-colors"
                        >
                          🔄 Retry Device Check
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white/50 dark:border-gray-700/50">
                  <CameraPreview 
                    ref={cameraRef}
                    isVisible={true}
                    onToggle={(enabled) => {
                      setIsCameraReady(enabled)
                      if (enabled) {
                        setCameraWasReady(true)
                      }
                      if (!enabled && cameraWasReady) {
                        setShowCameraWarning(true)
                      } else {
                        setShowCameraWarning(false)
                      }
                    }}
                  />
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-4">
                  <SpeechRecognition />
                </div>
                
                {/* Camera Warning */}
                {showCameraWarning && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-600 rounded-2xl p-4 shadow-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-amber-800 dark:text-amber-200">Camera Not Ready</h4>
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                          Please enable your camera for the best interview experience. Click the camera button above to start.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
                {transcript && (
                  <>
                    {!isCameraReady && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-2xl p-4 mb-4 shadow-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Video className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          <div>
                            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                              Camera Recommended
                            </p>
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                              Enable your camera above for a complete interview experience
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={showFollowUp ? handleFollowUpResponse : handleSubmitResponse}
                      disabled={isSubmitting}
                      className={`w-full inline-flex items-center justify-center gap-3 px-6 py-4 ${
                        showFollowUp 
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700'
                          : hasNextQuestion 
                          ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700' 
                          : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                      } disabled:from-gray-400 disabled:to-gray-400 text-white rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:transform-none ${
                        !isCameraReady ? 'ring-2 ring-amber-400 ring-opacity-50' : ''
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <RotateCcw className="h-5 w-5 animate-spin" />
                          {showFollowUp ? 'Submitting Follow-up...' : hasNextQuestion ? 'Submitting...' : 'Finishing Interview...'}
                        </>
                      ) : (
                        <>
                          <Target className="h-5 w-5" />
                          {showFollowUp 
                            ? 'Submit Follow-up Response' 
                            : hasNextQuestion 
                            ? 'Submit Response' 
                            : 'Submit & End Interview'
                          }
                        </>
                      )}
                    </motion.button>
                  </>
                )}
                
                {/* Skip Question Button */}
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={skipQuestion}
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:transform-none"
                >
                  <ArrowLeft className="h-5 w-5 rotate-180" />
                  {showFollowUp 
                    ? 'Skip Follow-up' 
                    : hasNextQuestion 
                    ? 'Skip Question' 
                    : 'Skip & End Interview'
                  }
                </motion.button>
              </div>
            </motion.div>
              
            {/* Enhanced Transcript */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="xl:col-span-1 bg-gradient-to-br from-white/90 to-purple-50/90 dark:from-gray-800/90 dark:to-purple-900/20 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50 dark:border-gray-700/50 hover-lift"
            >
              <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Mic className="h-6 w-6 text-white" />
                </div>
                Live Transcript
              </h3>
              <div className="min-h-[300px] bg-gradient-to-br from-gray-50/90 to-white/90 dark:from-gray-700/90 dark:to-gray-800/90 rounded-3xl p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 shadow-inner">
<<<<<<< HEAD
                {isQuestionSpeaking ? (
                  // Show AI speaking indicator instead of transcript to prevent confusion
                  <div className="flex items-center justify-center h-full text-blue-600 dark:text-blue-400">
                    <div className="text-center">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1],
                          opacity: [0.7, 1, 0.7]
                        }}
                        transition={{ 
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <div className="w-16 h-16 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <Mic className="h-8 w-8 text-white" />
                        </div>
                      </motion.div>
                      <p className="text-lg font-medium">🤖 AI is speaking the question...</p>
                      <p className="text-sm mt-2 opacity-75">Please wait, then provide your response</p>
                    </div>
                  </div>
                ) : transcript ? (
=======
                {transcript ? (
>>>>>>> c538edd751c2e8f7c7773b287e3f6c83f630f35e
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-gray-800 dark:text-gray-200 leading-relaxed text-lg"
                  >
                    {transcript}
                  </motion.p>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <Mic className="h-16 w-16 mx-auto mb-4 text-purple-500" />
                      </motion.div>
<<<<<<< HEAD
                      <p className="text-lg font-medium">👤 Start speaking to see your transcript here...</p>
=======
                      <p className="text-lg font-medium">Start speaking to see your transcript here...</p>
>>>>>>> c538edd751c2e8f7c7773b287e3f6c83f630f35e
                      <p className="text-sm mt-2 opacity-75">Your voice will be captured in real-time</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
            
          {/* Enhanced Navigation */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex justify-between items-center bg-gradient-to-r from-white/90 to-gray-50/90 dark:from-gray-800/90 dark:to-gray-700/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-gray-200/50 dark:border-gray-700/50"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={goToPreviousQuestion}
              disabled={!hasPrevQuestion}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 disabled:from-gray-100 disabled:to-gray-100 disabled:text-gray-400 text-gray-700 rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl disabled:transform-none disabled:cursor-not-allowed disabled:shadow-none"
            >
              <ArrowLeft className="h-5 w-5" />
              Previous Question
            </motion.button>
            
            <div className="text-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl px-6 py-4 border border-gray-200/50 dark:border-gray-700/50">
              <div className="text-xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-500" />
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
                {currentQuestion.category}
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={goToNextQuestion}
              disabled={!hasNextQuestion}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-100 disabled:to-gray-100 disabled:text-gray-400 text-white rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl disabled:transform-none disabled:cursor-not-allowed disabled:shadow-none"
            >
              Next Question
              <ArrowLeft className="h-5 w-5 rotate-180" />
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Analysis Overlay - Modern Coral & Teal Theme */}
      <AnimatePresence>
        {showAnalysis && analysisData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-coral-200/30 dark:border-teal-700/30 max-w-4xl w-full max-h-[90vh] flex flex-col mx-4 overflow-hidden"
              style={{
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 127, 80, 0.1)'
              }}
            >
              {/* Header - Coral & Teal Gradient */}
              <div className={`${
                analysisData.hasResponses 
                  ? 'bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500' 
                  : 'bg-gradient-to-r from-coral-500 via-orange-500 to-amber-500'
              } p-8 text-white relative overflow-hidden`}
              style={{
                background: analysisData.hasResponses 
                  ? 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 50%, #10b981 100%)'
                  : 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 50%, #ff9f43 100%)'
              }}>
                <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
                <div className="relative">
                  <div className="flex items-center gap-6 mb-6">
                    <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center shadow-lg backdrop-blur-sm">
                      <Target className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-4xl font-bold text-white mb-2">Interview Analysis</h2>
                      <p className="text-white/90 text-xl font-medium">Your {analysisData.techStack} technical interview results</p>
                    </div>
                  </div>
                  <div className="bg-white/15 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-xl">
                    {analysisData.hasResponses ? (
                      <p className="text-lg text-white/95 leading-relaxed">
                        🎉 <strong>Interview Complete!</strong> You answered {analysisData.questionsAnswered} of {analysisData.totalQuestions} questions ({analysisData.completionRate}% completion) in {analysisData.duration}.
                      </p>
                    ) : (
                      <p className="text-lg text-white/95 leading-relaxed">
                        ⚠️ <strong>Interview Incomplete!</strong> No responses were provided to any of the {analysisData.totalQuestions} questions. Consider practicing speaking your answers out loud.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Content - Warm Neutral Background */}
              <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-slate-50 to-stone-100 dark:from-slate-900 dark:to-slate-800">
                {/* Overall Score */}
                <div className="text-center mb-12">
                  <div className={`inline-flex items-center justify-center w-40 h-40 ${
                    analysisData.score >= 70 
                      ? 'bg-gradient-to-br from-teal-500 to-emerald-600' 
                      : analysisData.score >= 40
                      ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                      : 'bg-gradient-to-br from-rose-500 to-pink-600'
                  } rounded-full mb-8 shadow-2xl border-4 border-white dark:border-slate-700 relative`}>
                    <span className="text-6xl font-bold text-white">{analysisData.score}%</span>
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-2xl">
                        {analysisData.score >= 70 ? '🎯' : analysisData.score >= 40 ? '📈' : '🎓'}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-3">
                    {analysisData.score >= 70 ? 'Excellent Performance' : 
                     analysisData.score >= 40 ? 'Room for Growth' : 
                     'Learning Journey Begins'}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 font-medium text-lg max-w-2xl mx-auto">{analysisData.overallFeedback}</p>
                </div>

                {/* Score Breakdown - Vibrant Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                  <div className={`text-center p-6 rounded-3xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                    analysisData.technicalAccuracy >= 50 
                      ? 'bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 border-indigo-300 dark:border-indigo-600 shadow-lg' 
                      : 'bg-gradient-to-br from-rose-50 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 border-rose-300 dark:border-rose-600 shadow-lg'
                  }`}>
                    <div className={`text-3xl font-bold mb-2 ${
                      analysisData.technicalAccuracy >= 50 
                        ? 'text-indigo-600 dark:text-indigo-400' 
                        : 'text-rose-600 dark:text-rose-400'
                    }`}>{analysisData.technicalAccuracy}%</div>
                    <div className="text-sm text-slate-700 dark:text-slate-300 font-semibold">Technical Skills</div>
                  </div>
                  <div className={`text-center p-6 rounded-3xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                    analysisData.communicationClarity >= 50 
                      ? 'bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 border-teal-300 dark:border-teal-600 shadow-lg' 
                      : 'bg-gradient-to-br from-rose-50 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 border-rose-300 dark:border-rose-600 shadow-lg'
                  }`}>
                    <div className={`text-3xl font-bold mb-2 ${
                      analysisData.communicationClarity >= 50 
                        ? 'text-teal-600 dark:text-teal-400' 
                        : 'text-rose-600 dark:text-rose-400'
                    }`}>{analysisData.communicationClarity}%</div>
                    <div className="text-sm text-slate-700 dark:text-slate-300 font-semibold">Communication</div>
                  </div>
                  <div className={`text-center p-6 rounded-3xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                    analysisData.completeness >= 50 
                      ? 'bg-gradient-to-br from-violet-50 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 border-violet-300 dark:border-violet-600 shadow-lg' 
                      : 'bg-gradient-to-br from-rose-50 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 border-rose-300 dark:border-rose-600 shadow-lg'
                  }`}>
                    <div className={`text-3xl font-bold mb-2 ${
                      analysisData.completeness >= 50 
                        ? 'text-violet-600 dark:text-violet-400' 
                        : 'text-rose-600 dark:text-rose-400'
                    }`}>{analysisData.completeness}%</div>
                    <div className="text-sm text-slate-700 dark:text-slate-300 font-semibold">Completeness</div>
                  </div>
                  <div className={`text-center p-6 rounded-3xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                    analysisData.problemSolving >= 50 
                      ? 'bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 border-amber-300 dark:border-amber-600 shadow-lg' 
                      : 'bg-gradient-to-br from-rose-50 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 border-rose-300 dark:border-rose-600 shadow-lg'
                  }`}>
                    <div className={`text-3xl font-bold mb-2 ${
                      analysisData.problemSolving >= 50 
                        ? 'text-amber-600 dark:text-amber-400' 
                        : 'text-rose-600 dark:text-rose-400'
                    }`}>{analysisData.problemSolving}%</div>
                    <div className="text-sm text-slate-700 dark:text-slate-300 font-semibold">Problem Solving</div>
                  </div>
                </div>

                {/* No Responses Warning - Coral Theme */}
                {!analysisData.hasResponses && (
                  <div className="mb-10 p-6 bg-gradient-to-br from-coral-50 to-orange-50 dark:from-coral-900/20 dark:to-orange-900/20 border-2 border-coral-300 dark:border-coral-600 rounded-3xl shadow-lg">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-coral-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                        <span className="text-white font-bold text-lg">!</span>
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-coral-800 dark:text-coral-200 mb-3">No Responses Detected</h4>
                        <p className="text-coral-700 dark:text-coral-300 text-base leading-relaxed mb-4">
                          The system didn't detect any verbal responses during your interview. This could be due to:
                        </p>
                        <ul className="text-coral-700 dark:text-coral-300 text-base space-y-2 mb-4">
                          <li className="flex items-start gap-2">
                            <span className="text-coral-500 font-bold">•</span>
                            <span>Microphone permissions not granted</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-coral-500 font-bold">•</span>
                            <span>Speaking too quietly or microphone issues</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-coral-500 font-bold">•</span>
                            <span>Not using the recording feature</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-coral-500 font-bold">•</span>
                            <span>Technical difficulties with speech recognition</span>
                          </li>
                        </ul>
                        <p className="text-coral-700 dark:text-coral-300 text-base">
                          <strong>💡 Tip:</strong> Make sure to click the microphone button and speak clearly during future interviews.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Motivational Quote - Teal Theme */}
                <div className="text-center mb-10 p-8 bg-gradient-to-r from-teal-50 via-cyan-50 to-blue-50 dark:from-teal-900/20 dark:via-cyan-900/20 dark:to-blue-900/20 rounded-3xl border-2 border-teal-200 dark:border-teal-700 shadow-lg">
                  <div className="text-4xl mb-4">✨</div>
                  <p className="text-xl font-semibold text-teal-800 dark:text-teal-200 mb-3">
                    "Every master was once a beginner. Every expert was once an amateur."
                  </p>
                  <p className="text-base text-teal-600 dark:text-teal-400 font-medium">
                    Your journey to excellence starts with practice! 🚀
                  </p>
                </div>

                {/* Strengths and Improvements - Dual Color Theme */}
                <div className="grid md:grid-cols-2 gap-8 mb-10">
                  <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-cyan-900/20 p-8 rounded-3xl border-2 border-emerald-200 dark:border-emerald-700 shadow-lg">
                    <h4 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mb-6 flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      Your Strengths
                    </h4>
                    <div className="space-y-4">
                      {analysisData.strengths.map((strength: string, index: number) => (
                        <div key={index} className="flex items-start gap-3 p-4 bg-emerald-100/70 dark:bg-emerald-900/40 rounded-2xl border border-emerald-200 dark:border-emerald-700 shadow-sm hover:shadow-md transition-shadow">
                          <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white font-bold text-xs">✓</span>
                          </div>
                          <span className="text-emerald-800 dark:text-emerald-200 font-medium text-base">{strength}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-coral-50 via-orange-50 to-amber-50 dark:from-coral-900/20 dark:via-orange-900/20 dark:to-amber-900/20 p-8 rounded-3xl border-2 border-coral-200 dark:border-coral-700 shadow-lg">
                    <h4 className="text-2xl font-bold text-coral-700 dark:text-coral-400 mb-6 flex items-center gap-3">
                      <div className="w-8 h-8 bg-coral-500 rounded-full flex items-center justify-center">
                        <Target className="h-5 w-5 text-white" />
                      </div>
                      Growth Areas
                    </h4>
                    <div className="space-y-4">
                      {analysisData.improvements.map((improvement: string, index: number) => (
                        <div key={index} className="flex items-start gap-3 p-4 bg-coral-100/70 dark:bg-coral-900/40 rounded-2xl border border-coral-200 dark:border-coral-700 shadow-sm hover:shadow-md transition-shadow">
                          <div className="w-6 h-6 bg-coral-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white font-bold text-xs">↗</span>
                          </div>
                          <span className="text-coral-800 dark:text-coral-200 font-medium text-base">{improvement}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Next Steps - Gradient Theme */}
                <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 p-8 rounded-3xl border-2 border-indigo-200 dark:border-indigo-700 shadow-lg">
                  <h4 className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    Your Next Steps
                  </h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-4 p-4 bg-indigo-100/70 dark:bg-indigo-900/40 rounded-2xl border border-indigo-200 dark:border-indigo-700 shadow-sm">
                        <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white font-bold text-xs">1</span>
                        </div>
                        <span className="text-indigo-800 dark:text-indigo-200 font-medium text-base">Keep practicing technical questions and review your responses for improvement.</span>
                      </div>
                      <div className="flex items-start gap-4 p-4 bg-purple-100/70 dark:bg-purple-900/40 rounded-2xl border border-purple-200 dark:border-purple-700 shadow-sm">
                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white font-bold text-xs">2</span>
                        </div>
                        <span className="text-purple-800 dark:text-purple-200 font-medium text-base">Schedule another mock interview to track your progress.</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4 p-4 bg-pink-100/70 dark:bg-pink-900/40 rounded-2xl border border-pink-200 dark:border-pink-700 shadow-sm">
                        <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white font-bold text-xs">3</span>
                        </div>
                        <span className="text-pink-800 dark:text-pink-200 font-medium text-base">Focus on areas for improvement highlighted above.</span>
                      </div>
                      <div className="flex items-start gap-4 p-4 bg-violet-100/70 dark:bg-violet-900/40 rounded-2xl border border-violet-200 dark:border-violet-700 shadow-sm">
                        <div className="w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white font-bold text-xs">4</span>
                        </div>
                        <span className="text-violet-800 dark:text-violet-200 font-medium text-base">Practice clear and concise communication during answers.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer - Elegant Dark Theme */}
              <div className="flex-shrink-0 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-8 border-t border-slate-600 dark:border-slate-700">
<<<<<<< HEAD
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      // End the session and navigate to dashboard
                      // The interview is already complete, so we properly end it
                      handleEndInterviewAndExit('/dashboard')
                    }}
                    className="px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl border border-teal-400 flex items-center gap-3"
                  >
                    <Target className="h-5 w-5" />
                    View Dashboard
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => window.location.reload()}
                    className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl border border-emerald-400 flex items-center gap-3"
                  >
                    <RefreshCw className="h-5 w-5" />
                    Take Another Interview
=======
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleEndInterviewAndExit('/dashboard')}
                      className="px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl border border-teal-400 flex items-center gap-3"
                    >
                      <Target className="h-5 w-5" />
                      View Dashboard
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => window.location.reload()}
                      className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl border border-emerald-400 flex items-center gap-3"
                    >
                      <RefreshCw className="h-5 w-5" />
                      Take Another Interview
                    </motion.button>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleEndInterviewAndExit('/')}
                    className="px-8 py-4 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl border border-slate-500 flex items-center gap-3"
                  >
                    <ArrowLeft className="h-5 w-5" />
                    Back to Home
>>>>>>> c538edd751c2e8f7c7773b287e3f6c83f630f35e
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}