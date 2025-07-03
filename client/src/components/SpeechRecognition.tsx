import { useEffect, useRef, useState, useCallback } from 'react'
import { useSpeechStore } from '../stores/speechStore'
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react'

export default function SpeechRecognition() {
  const {
    isListening,
    isSupported,
    isSpeaking,
    audioLevel,
    startListening,
    stopListening,
    addToTranscript,
    stopSpeaking,
    setAudioLevel
  } = useSpeechStore()

  const recognitionRef = useRef<any>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyzerRef = useRef<AnalyserNode | null>(null)
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastTranscriptRef = useRef<string>('')
  const [recognitionActive, setRecognitionActive] = useState(false)

  // Cleanup function to stop all speech recognition activity
  const cleanupRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch (error) {
        console.warn('Error aborting recognition:', error)
      }
    }
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current)
      restartTimeoutRef.current = null
    }
    setRecognitionActive(false)
    stopAudioLevelMonitoring()
  }, [])

  // Initialize speech recognition once
  useEffect(() => {
    if (!isSupported) return

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = false // Only final results to reduce noise
      recognitionRef.current.lang = 'en-US'
      recognitionRef.current.maxAlternatives = 1

      recognitionRef.current.onresult = (event: any) => {
        // STRICT BLOCKING: Don't process ANY results if AI is speaking
        if (isSpeaking) {
          console.log('🔇 BLOCKING speech recognition - AI is speaking')
          return
        }
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            const transcript = event.results[i][0].transcript.trim()
            
            // Skip empty or very short transcripts
            if (transcript.length < 3) {
              console.log('🚫 Skipping short transcript:', transcript)
              continue
            }
            
            // Skip if identical to last transcript (prevent duplicates)
            if (transcript === lastTranscriptRef.current) {
              console.log('🚫 Skipping duplicate transcript:', transcript)
              continue
            }
            
            // Enhanced AI feedback filter
            const aiPhrases = [
              'here\'s question', 'question number', 'follow-up question',
              'let\'s talk about', 'can you walk me through', 'tell me about',
              'question 1', 'question 2', 'question 3', 'question 4', 'question 5',
              'here is', 'this is question', 'let me ask', 'i want to know',
              'can you explain', 'what is your', 'how would you',
              'describe', 'experience with', 'have you worked'
            ]
            
            const lowerTranscript = transcript.toLowerCase()
            const isLikelyAIFeedback = aiPhrases.some(phrase => 
              lowerTranscript.includes(phrase) || lowerTranscript.startsWith(phrase)
            )
            
            if (isLikelyAIFeedback) {
              console.log('🚫 Filtered out AI feedback:', transcript)
              continue
            }
            
            console.log('✅ Adding valid user transcript:', transcript)
            lastTranscriptRef.current = transcript
            addToTranscript(transcript, 'user')
          }
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setRecognitionActive(false)
        
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          console.error('Microphone permission denied')
          return
        }
        
        // Don't auto-restart on errors to prevent loops
        if (event.error !== 'aborted' && event.error !== 'no-speech') {
          console.log('Speech recognition error, will not auto-restart:', event.error)
        }
      }

      recognitionRef.current.onend = () => {
        console.log('Speech recognition ended')
        setRecognitionActive(false)
        
        // Only restart if we should be listening, AI is not speaking, and no pending restart
        if (isListening && !isSpeaking && !restartTimeoutRef.current) {
          restartTimeoutRef.current = setTimeout(() => {
            if (isListening && !isSpeaking && recognitionRef.current) {
              try {
                console.log('� Restarting speech recognition')
                recognitionRef.current.start()
                setRecognitionActive(true)
                startAudioLevelMonitoring()
              } catch (error) {
                console.error('Error restarting recognition:', error)
              }
            }
            restartTimeoutRef.current = null
          }, 1000) // 1 second delay between restarts
        }
      }

      recognitionRef.current.onstart = () => {
        console.log('🎤 Speech recognition started')
        setRecognitionActive(true)
      }
    }

    return cleanupRecognition
  }, [isSupported, addToTranscript, cleanupRecognition])

  // Main control effect - handles starting/stopping recognition
  useEffect(() => {
    if (!recognitionRef.current) return

    if (isListening && !isSpeaking && !recognitionActive) {
      try {
        console.log('🚀 Starting speech recognition')
        recognitionRef.current.start()
        startAudioLevelMonitoring()
      } catch (error) {
        if (error instanceof Error && !error.message.includes('already started')) {
          console.error('Error starting speech recognition:', error)
        }
      }
    } else if (!isListening || isSpeaking) {
      cleanupRecognition()
    }
  }, [isListening, isSpeaking, recognitionActive, cleanupRecognition])

  const startAudioLevelMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      })
      audioContextRef.current = new AudioContext()
      analyzerRef.current = audioContextRef.current.createAnalyser()
      analyzerRef.current.fftSize = 256
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyzerRef.current)

      const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount)
      
      const updateAudioLevel = () => {
        if (analyzerRef.current && isListening && !isSpeaking) {
          analyzerRef.current.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
          setAudioLevel(average / 255)
          requestAnimationFrame(updateAudioLevel)
        } else {
          setAudioLevel(0)
        }
      }
      
      updateAudioLevel()
    } catch (error) {
      console.error('Error accessing microphone:', error)
    }
  }

  const stopAudioLevelMonitoring = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    setAudioLevel(0)
  }

  const handleToggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const handleToggleSpeaking = () => {
    if (isSpeaking) {
      stopSpeaking()
    }
  }

  if (!isSupported) {
    return (
      <div className="card bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
        <div className="flex items-center space-x-3">
          <MicOff className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          <div>
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Speech recognition not supported
            </p>
            <p className="text-xs text-yellow-600 dark:text-yellow-400">
              Please use a modern browser like Chrome or Edge
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Voice Controls
        </h3>
        
        <div className="flex items-center space-x-2">
          {/* Audio Level Indicator */}
          <div className="flex items-center space-x-1">
            <div className="w-2 h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="w-full bg-green-500 transition-all duration-75 rounded-full"
                style={{ 
                  height: `${audioLevel * 100}%`,
                  marginTop: `${(1 - audioLevel) * 100}%`
                }}
              />
            </div>
          </div>
          
          {/* Microphone Control */}
          <button
            onClick={handleToggleListening}
            className={`btn p-3 ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'btn-primary'
            }`}
            title={isListening ? 'Stop listening' : 'Start listening'}
          >
            {isListening ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </button>
          
          {/* Speaker Control */}
          <button
            onClick={handleToggleSpeaking}
            disabled={!isSpeaking}
            className={`btn p-3 ${
              isSpeaking 
                ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                : 'btn-secondary opacity-50'
            }`}
            title={isSpeaking ? 'Stop speaking' : 'Not speaking'}
          >
            {isSpeaking ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${
            isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-600'
          }`} />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {isListening ? 'Listening for speech...' : 'Click microphone to start'}
          </span>
        </div>
        
        {isSpeaking && (
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              AI is speaking...
            </span>
          </div>
        )}
        
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p>• Speak clearly and at normal volume</p>
          <p>• Ensure you're in a quiet environment</p>
          <p>• Grant microphone permissions when prompted</p>
        </div>
      </div>
    </div>
  )
}
