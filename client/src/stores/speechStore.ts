import { create } from 'zustand'

// Extend window interface for voice testing functions
declare global {
  interface Window {
    testVoices?: () => void
    testVoice?: (text?: string) => void
  }
}

export interface SpeechState {
  isListening: boolean
  transcript: string
  isSupported: boolean
  isSpeaking: boolean
  audioLevel: number
  speechSynthesisEnabled: boolean
  preferredVoice: string | null
  voicesLoaded: boolean
}

interface SpeechStore extends SpeechState {
  startListening: () => void
  stopListening: () => void
  abortListening: () => void
  clearTranscript: () => void
  addToTranscript: (text: string, speaker?: 'user' | 'ai') => void
  speak: (text: string) => void
  stopSpeaking: () => void
  setAudioLevel: (level: number) => void
  enableSpeechSynthesis: () => void
  setPreferredVoice: (voiceName: string) => void
  loadVoices: () => void
}

export const useSpeechStore = create<SpeechStore>((set, get) => {
  // Ensure voices are loaded when the store is created
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    // Load voices immediately
    window.speechSynthesis.getVoices()
    
    // Set up voice loading event listener
    window.speechSynthesis.onvoiceschanged = () => {
      console.log('Voices loaded:', window.speechSynthesis.getVoices().length)
      
      // Load voices into store
      if (get) {
        get().loadVoices()
      }
      
      // Add a global function to test voices
      if (!window.testVoices) {
        window.testVoices = () => {
          const voices = window.speechSynthesis.getVoices()
          console.log('🎤 Available voices:')
          voices.forEach((voice, index) => {
            console.log(`${index + 1}. ${voice.name} (${voice.lang}) - ${voice.localService ? 'Local' : 'Remote'}`)
          })
          
          const rishiVoice = voices.find(v => v.name.toLowerCase().includes('rishi'))
          if (rishiVoice) {
            console.log('✅ Rishi voice found:', rishiVoice.name)
          } else {
            console.log('❌ Rishi voice not found')
          }
          
          console.log('💡 Run window.testVoice("Hello from AI Interviewer") to test current voice selection')
        }
        
        window.testVoice = (text = "Hello from AI Interviewer") => {
          if (get) {
            get().speak(text)
          }
        }
        
        console.log('🎙️ Voice testing functions added to window:')
        console.log('- window.testVoices() - List all available voices')
        console.log('- window.testVoice("text") - Test current voice selection')
      }
    }
  }

  return {
  isListening: false,
  transcript: '',
  isSupported: typeof window !== 'undefined' && 'webkitSpeechRecognition' in window,
  isSpeaking: false,
  audioLevel: 0,
  speechSynthesisEnabled: false,
  preferredVoice: null,
  voicesLoaded: false,

  startListening: () => {
    const { isSupported, isListening } = get()
    if (!isSupported || isListening) return
    
    console.log('Starting speech recognition')
    set({ isListening: true })
  },

  stopListening: () => {
    console.log('Stopping speech recognition')
    set({ isListening: false })
  },

  abortListening: () => {
    console.log('Aborting speech recognition aggressively')
    set({ isListening: false })
  },

  clearTranscript: () => {
    set({ transcript: '' })
  },

  addToTranscript: (text: string, speaker = 'user') => {
    console.log('Adding to transcript:', text, 'from:', speaker)
<<<<<<< HEAD
    
    // Filter out very short or likely duplicate text
    const cleanText = text.trim()
    if (cleanText.length < 3) {
      console.log('Skipping very short transcript addition:', cleanText)
      return
    }
    
    set((state) => {
      const timestamp = new Date().toLocaleTimeString()
      const speakerLabel = speaker === 'user' ? 'You' : 'AI Interviewer'
      const formattedMessage = `[${timestamp}] ${speakerLabel}: ${cleanText}`
      
      // Check if this exact message was just added (prevent duplicates)
      if (state.transcript.includes(formattedMessage)) {
        console.log('Preventing duplicate transcript entry:', formattedMessage)
        return state
      }
      
      const newTranscript = state.transcript 
        ? `${state.transcript}\n${formattedMessage}` 
        : formattedMessage
      
=======
    set((state) => {
      const newTranscript = state.transcript ? `${state.transcript} ${text}` : text
>>>>>>> c538edd751c2e8f7c7773b287e3f6c83f630f35e
      return { transcript: newTranscript }
    })
  },

  speak: (text: string) => {
<<<<<<< HEAD
    const state = get()
    
    // Prevent speaking if already speaking or if text is too short
    if (state.isSpeaking || !text.trim() || text.trim().length < 2) {
      console.log('Skipping speech - already speaking or text too short:', text)
      return
    }

=======
>>>>>>> c538edd751c2e8f7c7773b287e3f6c83f630f35e
    console.log('Attempting to speak:', text)
    
    if (!('speechSynthesis' in window)) {
      console.error('Speech synthesis not supported')
      return
    }

    // Auto-enable speech synthesis if not already enabled
<<<<<<< HEAD
    if (!state.speechSynthesisEnabled) {
=======
    if (!get().speechSynthesisEnabled) {
>>>>>>> c538edd751c2e8f7c7773b287e3f6c83f630f35e
      console.log('Enabling speech synthesis through user interaction')
      get().enableSpeechSynthesis()
    }

<<<<<<< HEAD
    // Cancel any ongoing speech first and wait for cancellation
    window.speechSynthesis.cancel()
    
    // Set speaking state immediately to prevent overlapping calls
    set({ isSpeaking: true })
    
    // Wait longer for cancellation to complete
    setTimeout(() => {
      try {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 0.9
        utterance.pitch = 1.0
        utterance.volume = 0.8
        
        // Get available voices
        const voices = window.speechSynthesis.getVoices()
        console.log('Available voices for speech:', voices.length)
        
        // Use consistent voice selection logic
        let selectedVoice = null
        const currentState = get()
        
        if (voices.length > 0) {
          // First priority: Use preferred voice if set and available
          if (currentState.preferredVoice) {
            selectedVoice = voices.find(voice => voice.name === currentState.preferredVoice)
=======
    // Cancel any ongoing speech first
    window.speechSynthesis.cancel()
    
    // Wait a bit for cancellation to complete
    setTimeout(() => {
      try {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 0.85
        utterance.pitch = 1.0
        utterance.volume = 0.9
        
        // Get available voices
        const voices = window.speechSynthesis.getVoices()
        console.log('Available voices:', voices.length, voices.map(v => v.name))
        
        // Use consistent voice selection logic
        let selectedVoice = null
        const state = get()
        
        if (voices.length > 0) {
          // First priority: Use preferred voice if set and available
          if (state.preferredVoice) {
            selectedVoice = voices.find(voice => voice.name === state.preferredVoice)
>>>>>>> c538edd751c2e8f7c7773b287e3f6c83f630f35e
            if (selectedVoice) {
              console.log('Using preferred voice:', selectedVoice.name)
            }
          }
          
          // Second priority: Look for "Rishi" voice specifically
          if (!selectedVoice) {
            selectedVoice = voices.find(voice => voice.name.toLowerCase().includes('rishi'))
            if (selectedVoice) {
              console.log('Found and using Rishi voice:', selectedVoice.name)
<<<<<<< HEAD
=======
              // Set as preferred for consistency
>>>>>>> c538edd751c2e8f7c7773b287e3f6c83f630f35e
              set({ preferredVoice: selectedVoice.name })
            }
          }
          
          // Third priority: Look for other quality English voices
          if (!selectedVoice) {
            const preferredVoices = [
              'Samantha', 'Alex', 'Daniel', 'Karen', 'Moira', 'Tessa',
              'Ava', 'Allison', 'Susan', 'Vicki', 'Victoria', 'Kate'
            ]
            
            for (const preferred of preferredVoices) {
              selectedVoice = voices.find(voice => 
                voice.name.toLowerCase().includes(preferred.toLowerCase()) && 
                voice.lang.startsWith('en')
              )
              if (selectedVoice) {
                console.log('Using quality voice:', selectedVoice.name)
<<<<<<< HEAD
=======
                // Set as preferred for consistency
>>>>>>> c538edd751c2e8f7c7773b287e3f6c83f630f35e
                set({ preferredVoice: selectedVoice.name })
                break
              }
            }
          }
          
          // Final fallback: Any English voice
          if (!selectedVoice) {
            selectedVoice = voices.find(voice => voice.lang.startsWith('en'))
            if (selectedVoice) {
              console.log('Using fallback English voice:', selectedVoice.name)
              set({ preferredVoice: selectedVoice.name })
            }
          }
          
          if (selectedVoice) {
            utterance.voice = selectedVoice
            console.log('Final voice selection:', selectedVoice.name, '- Language:', selectedVoice.lang)
<<<<<<< HEAD
          }
        }
        
        let speechStarted = false
        let speechTimeout: NodeJS.Timeout
        
        utterance.onstart = () => {
          console.log('✅ Speech started successfully with voice:', selectedVoice?.name || 'default')
          speechStarted = true
          // Add AI message to transcript
          get().addToTranscript(text, 'ai')
=======
          } else {
            console.log('No suitable voice found, using default')
          }
        }
        
        let hasStarted = false
        let speechTimeout: NodeJS.Timeout
        
        utterance.onstart = () => {
          console.log('Speech started successfully with voice:', selectedVoice?.name || 'default')
          hasStarted = true
          set({ isSpeaking: true })
>>>>>>> c538edd751c2e8f7c7773b287e3f6c83f630f35e
          if (speechTimeout) clearTimeout(speechTimeout)
        }
        
        utterance.onend = () => {
<<<<<<< HEAD
          console.log('✅ Speech ended normally')
=======
          console.log('Speech ended normally')
>>>>>>> c538edd751c2e8f7c7773b287e3f6c83f630f35e
          set({ isSpeaking: false })
          if (speechTimeout) clearTimeout(speechTimeout)
        }
        
        utterance.onerror = (event) => {
<<<<<<< HEAD
          console.error('❌ Speech error:', event.error)
          set({ isSpeaking: false })
          if (speechTimeout) clearTimeout(speechTimeout)
          
          if (event.error === 'canceled') {
            console.log('Speech was canceled - this is normal behavior')
=======
          console.error('Speech error:', event.error)
          set({ isSpeaking: false })
          if (speechTimeout) clearTimeout(speechTimeout)
          
          // Don't retry for now, just log the error
          if (event.error === 'canceled') {
            console.log('Speech was canceled - this is often normal browser behavior')
>>>>>>> c538edd751c2e8f7c7773b287e3f6c83f630f35e
          } else if (event.error === 'network') {
            console.log('Network error during speech - may need user interaction')
          }
        }
        
<<<<<<< HEAD
        // Start speech synthesis
        console.log('🗣️ Starting speech synthesis')
        window.speechSynthesis.speak(utterance)
        
        // Timeout to reset speaking state if speech never starts
        speechTimeout = setTimeout(() => {
          if (!speechStarted) {
            console.log('⏰ Speech timeout - resetting state')
            set({ isSpeaking: false })
          }
        }, 8000) // 8 second timeout
=======
        // Simple speak attempt
        console.log('Starting speech synthesis with consistent voice')
        window.speechSynthesis.speak(utterance)
        
        // Timeout to reset speaking state if it never starts
        speechTimeout = setTimeout(() => {
          if (!hasStarted && get().isSpeaking) {
            console.log('Speech timeout reached - resetting state')
            set({ isSpeaking: false })
          }
        }, 5000) // 5 second timeout for better reliability
>>>>>>> c538edd751c2e8f7c7773b287e3f6c83f630f35e
        
      } catch (error) {
        console.error('Error in speech synthesis:', error)
        set({ isSpeaking: false })
      }
<<<<<<< HEAD
    }, 200) // Wait 200ms for cancellation
=======
    }, 100)
>>>>>>> c538edd751c2e8f7c7773b287e3f6c83f630f35e
  },

  stopSpeaking: () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      set({ isSpeaking: false })
    }
  },

  setAudioLevel: (level: number) => {
    set({ audioLevel: level })
  },

  enableSpeechSynthesis: () => {
    // This function enables speech synthesis by triggering a user interaction
    if ('speechSynthesis' in window) {
      // Test utterance to activate speech synthesis
      const testUtterance = new SpeechSynthesisUtterance('')
      testUtterance.volume = 0 // Silent
      window.speechSynthesis.speak(testUtterance)
      set({ speechSynthesisEnabled: true })
      console.log('Speech synthesis enabled through user interaction')
    }
  },

  setPreferredVoice: (voiceName: string) => {
    set({ preferredVoice: voiceName })
    console.log('Preferred voice set to:', voiceName)
  },

  loadVoices: () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const voices = window.speechSynthesis.getVoices()
      if (voices.length > 0) {
        set({ voicesLoaded: true })
        console.log('Voices loaded:', voices.length)
        
        // Auto-select Rishi if available and no preference set
        const currentState = get()
        if (!currentState.preferredVoice) {
          const rishiVoice = voices.find(v => v.name.toLowerCase().includes('rishi'))
          if (rishiVoice) {
            console.log('Auto-selecting Rishi voice:', rishiVoice.name)
            set({ preferredVoice: rishiVoice.name })
          }
        }
      }
    }
  },
}
})