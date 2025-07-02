import { useEffect, useRef, useState } from 'react'
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
  const [blockRecognition, setBlockRecognition] = useState(false) // Flag to completely block recognition

  useEffect(() => {
    if (!isSupported) return

    // Initialize speech recognition
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event: any) => {
        // AGGRESSIVE BLOCKING: Don't process ANY results if AI is speaking or we're blocking
        if (isSpeaking || blockRecognition) {
          console.log('🔇 BLOCKING speech recognition result - AI speaking or blocked:', { isSpeaking, blockRecognition })
          return
        }
        
        let finalTranscript = ''
        let interimTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          
          // Enhanced filter for AI-related phrases that might be picked up
          const aiPhrases = [
            'here\'s question',
            'question number',
            'follow-up question',
            'let\'s talk about',
            'can you walk me through',
            'i\'m curious about',
            'so tell me about',
            'i\'d like to discuss',
            'question 1',
            'question 2',
            'question 3',
            'question 4',
            'question 5',
            'of 5',
            'of 10',
            'here is',
            'this is question',
            'here\'s',
            'this is',
            'question',
            'let me ask',
            'i want to',
            'can you tell'
          ]
          
          const lowerTranscript = transcript.toLowerCase().trim()
          
          // Skip very short transcripts that are likely noise
          if (lowerTranscript.length < 3) {
            console.log('🚫 Filtered out very short transcript:', transcript)
            return
          }
          
          // Filter out AI-related content with more aggressive matching
          const isLikelyAIFeedback = aiPhrases.some(phrase => 
            lowerTranscript.includes(phrase) || 
            lowerTranscript.startsWith(phrase)
          )
          
          if (isLikelyAIFeedback) {
            console.log('🚫 AGGRESSIVELY filtered out likely AI feedback:', transcript)
            return
          }
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' '
          } else {
            interimTranscript += transcript
          }
        }
        
        if (finalTranscript.trim()) {
          console.log('🎤 Adding user transcript:', finalTranscript.trim())
          addToTranscript(finalTranscript.trim(), 'user')
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          console.error('Microphone permission denied')
          return
        }
        if (event.error === 'no-speech') {
          console.log('No speech detected, will retry automatically')
          return
        }
        // Only auto-restart on network errors or other recoverable issues
        if (isListening && (event.error === 'network' || event.error === 'audio-capture')) {
          setTimeout(() => {
            if (recognitionRef.current && isListening) {
              try {
                recognitionRef.current.start()
              } catch (error) {
                console.error('Error restarting recognition:', error)
              }
            }
          }, 1000)
        }
      }

      recognitionRef.current.onend = () => {
        console.log('Speech recognition ended')
        // Only auto-restart if still supposed to be listening AND not blocked
        if (isListening && !blockRecognition && !isSpeaking) {
          setTimeout(() => {
            try {
              if (recognitionRef.current && isListening && !blockRecognition && !isSpeaking) {
                console.log('Restarting speech recognition')
                recognitionRef.current.start()
              }
            } catch (error) {
              if (error instanceof Error && error.message.includes('already started')) {
                console.log('Recognition already running, skipping restart')
              } else {
                console.error('Error restarting recognition:', error)
              }
            }
          }, 300)
        }
      }

      recognitionRef.current.onstart = () => {
        console.log('Speech recognition started')
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [isSupported, addToTranscript, isSpeaking, blockRecognition])

  // Effect to control blocking flag based on AI speaking state
  useEffect(() => {
    if (isSpeaking) {
      console.log('🛑 AI is speaking - BLOCKING recognition for extra safety')
      setBlockRecognition(true)
      
      // Also force abort when AI starts speaking
      if (recognitionRef.current) {
        try {
          console.log('🚨 Force aborting recognition because AI started speaking')
          recognitionRef.current.abort()
          stopAudioLevelMonitoring()
        } catch (error) {
          console.error('Error aborting recognition:', error)
        }
      }
    } else {
      // Wait a bit after AI stops speaking before unblocking
      const timeout = setTimeout(() => {
        console.log('✅ AI stopped speaking - UNBLOCKING recognition')
        setBlockRecognition(false)
      }, 3000) // 3 second safety buffer
      
      return () => clearTimeout(timeout)
    }
  }, [isSpeaking])

  useEffect(() => {
    if (isListening && recognitionRef.current && !blockRecognition && !isSpeaking) {
      try {
        // Check if recognition is already running
        if (recognitionRef.current.continuous !== undefined) {
          try {
            recognitionRef.current.stop()
          } catch (e) {
            // Ignore errors when stopping
          }
        }
        
        // Wait a moment then start fresh
        setTimeout(() => {
          try {
            if (recognitionRef.current && isListening && !blockRecognition && !isSpeaking) {
              console.log('Starting speech recognition (not blocked)')
              recognitionRef.current.start()
              startAudioLevelMonitoring()
            }
          } catch (error) {
            console.error('Error starting speech recognition:', error)
          }
        }, 100)
      } catch (error) {
        console.error('Error with speech recognition setup:', error)
      }
    } else if (!isListening && recognitionRef.current) {
      try {
        console.log('Stopping speech recognition')
        recognitionRef.current.stop()
        stopAudioLevelMonitoring()
      } catch (error) {
        console.error('Error stopping speech recognition:', error)
      }
    } else if (blockRecognition || isSpeaking) {
      // Force stop if we're blocked or AI is speaking
      try {
        if (recognitionRef.current) {
          console.log('Force stopping speech recognition - blocked or AI speaking')
          recognitionRef.current.stop()
          stopAudioLevelMonitoring()
        }
      } catch (error) {
        console.error('Error force stopping speech recognition:', error)
      }
    }
  }, [isListening, blockRecognition, isSpeaking])

  // Stop recognition when AI is speaking to prevent feedback
  useEffect(() => {
    if (isSpeaking && recognitionRef.current) {
      console.log('🔇 Stopping speech recognition while AI is speaking')
      try {
        recognitionRef.current.stop()
        stopAudioLevelMonitoring()
      } catch (error) {
        console.warn('Error stopping recognition while AI speaks:', error)
      }
    } else if (!isSpeaking && isListening && recognitionRef.current) {
      // Restart recognition after AI finishes speaking
      console.log('🎤 Restarting speech recognition after AI finished speaking')
      setTimeout(() => {
        try {
          if (recognitionRef.current && isListening && !isSpeaking) {
            recognitionRef.current.start()
            startAudioLevelMonitoring()
          }
        } catch (error) {
          if (error instanceof Error && error.message.includes('already started')) {
            console.log('Recognition already running, skipping restart')
          } else {
            console.warn('Error restarting recognition after AI speech:', error)
          }
        }
      }, 1000) // Wait 1 second after AI stops speaking to avoid audio feedback
    }
  }, [isSpeaking, isListening])

  const startAudioLevelMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioContextRef.current = new AudioContext()
      analyzerRef.current = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyzerRef.current)

      const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount)
      
      const updateAudioLevel = () => {
        if (analyzerRef.current && isListening) {
          analyzerRef.current.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
          setAudioLevel(average / 255) // Normalize to 0-1
          requestAnimationFrame(updateAudioLevel)
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
