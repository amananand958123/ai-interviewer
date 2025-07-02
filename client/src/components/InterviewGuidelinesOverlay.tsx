import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, XCircle, Brain, Mic, Camera, Clock, Target, Lightbulb, AlertTriangle, Video, Eye } from 'lucide-react'
import { useState, useEffect } from 'react'

interface InterviewGuidelinesOverlayProps {
  isOpen: boolean
  onClose: () => void
  onProceed: () => void
  techStack?: string
  level?: string
}

export default function InterviewGuidelinesOverlay({ 
  isOpen, 
  onClose, 
  onProceed, 
  techStack = 'JavaScript',
  level = 'Basic'
}: InterviewGuidelinesOverlayProps) {
  const [cameraReady, setCameraReady] = useState(false)
  const [micReady, setMicReady] = useState(false)
  const [checkingDevices, setCheckingDevices] = useState(false)

  // Check camera and microphone permissions
  const checkDevices = async () => {
    console.log('🎯 Guidelines Overlay: Starting device check...')
    setCheckingDevices(true)
    try {
      console.log('🎯 Guidelines Overlay: Requesting getUserMedia...')
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      })
      
      // Check video tracks
      const videoTracks = stream.getVideoTracks()
      const cameraSuccess = videoTracks.length > 0
      setCameraReady(cameraSuccess)
      console.log('📹 Guidelines Overlay: Video tracks:', videoTracks.length, 'Camera ready:', cameraSuccess)
      
      // Check audio tracks
      const audioTracks = stream.getAudioTracks()
      const micSuccess = audioTracks.length > 0
      setMicReady(micSuccess)
      console.log('🎤 Guidelines Overlay: Audio tracks:', audioTracks.length, 'Mic ready:', micSuccess)
      
      // Persist device readiness to sessionStorage for cross-component access
      if (cameraSuccess && micSuccess) {
        sessionStorage.setItem('devicesReady', 'true')
        sessionStorage.setItem('deviceCheckTimestamp', Date.now().toString())
        console.log('💾 Device readiness saved to sessionStorage')
      }
      
      // Stop the stream after checking
      stream.getTracks().forEach(track => track.stop())
      console.log('✅ Guidelines Overlay: Device check completed successfully')
    } catch (error) {
      console.error('❌ Guidelines Overlay: Device check failed:', error)
      setCameraReady(false)
      setMicReady(false)
      // Clear sessionStorage on failure
      sessionStorage.removeItem('devicesReady')
      sessionStorage.removeItem('deviceCheckTimestamp')
    } finally {
      setCheckingDevices(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      checkDevices()
    }
  }, [isOpen])

  const dos = [
    {
      icon: Brain,
      title: "Think Out Loud",
      description: "Verbalize your thought process while solving problems. This helps the interviewer understand your reasoning.",
      color: "text-blue-500"
    },
    {
      icon: Mic,
      title: "Speak Clearly",
      description: "Maintain clear and audible speech. Take your time to articulate your answers properly.",
      color: "text-green-500"
    },
    {
      icon: Eye,
      title: "Maintain Eye Contact",
      description: "Look directly at the camera when speaking to create a personal connection with the interviewer.",
      color: "text-purple-500"
    },
    {
      icon: Target,
      title: "Stay Focused",
      description: "Address the question directly and provide specific examples from your experience when possible.",
      color: "text-orange-500"
    },
    {
      icon: Clock,
      title: "Manage Your Time",
      description: "Be concise but thorough. Aim for 2-3 minutes per answer unless asked for more detail.",
      color: "text-indigo-500"
    },
    {
      icon: Lightbulb,
      title: "Ask Clarifying Questions",
      description: "If a question is unclear, don't hesitate to ask for clarification before answering.",
      color: "text-yellow-500"
    }
  ]

  const donts = [
    {
      icon: XCircle,
      title: "Don't Rush Your Answers",
      description: "Take a moment to think before responding. Rushed answers often lack depth and clarity.",
      color: "text-red-500"
    },
    {
      icon: AlertTriangle,
      title: "Don't Say 'I Don't Know' and Stop",
      description: "If unsure, explain your thought process and how you would approach finding the solution.",
      color: "text-red-500"
    },
    {
      icon: XCircle,
      title: "Don't Get Distracted",
      description: "Close unnecessary applications and notifications. Focus entirely on the interview.",
      color: "text-red-500"
    },
    {
      icon: AlertTriangle,
      title: "Don't Memorize Generic Answers",
      description: "Avoid rehearsed responses. Be authentic and adapt your answers to the specific questions.",
      color: "text-red-500"
    },
    {
      icon: XCircle,
      title: "Don't Ignore the Tech Stack",
      description: `Remember this interview focuses on ${techStack}. Tailor your examples accordingly.`,
      color: "text-red-500"
    },
    {
      icon: AlertTriangle,
      title: "Don't Panic if You Make a Mistake",
      description: "Stay calm, acknowledge the error, and correct yourself. It shows self-awareness.",
      color: "text-red-500"
    }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-hidden"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border-4 border-gradient-to-r from-blue-400 via-purple-500 to-indigo-400 max-w-4xl w-full h-[90vh] flex flex-col relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated gradient border effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-400 opacity-15 animate-pulse"></div>
            <div className="absolute inset-1 bg-white dark:bg-gray-800 rounded-2xl"></div>
            
            {/* Content wrapper */}
            <div className="relative z-10 flex flex-col h-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 p-6 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-grid-white/10"></div>
              <div className="relative">
                <button
                  onClick={onClose}
                  className="absolute top-0 right-0 p-2 hover:bg-white/20 rounded-xl transition-all duration-200"
                >
                  <X className="h-6 w-6" />
                </button>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Brain className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">Interview Guidelines</h2>
                    <p className="text-blue-100 text-lg">Best practices for your {techStack} technical interview</p>
                    <p className="text-blue-200 text-sm mt-1">Level: {level} • Focus on {level === 'Basic' ? 'fundamental concepts' : level === 'Intermediate' ? 'practical applications' : 'advanced topics'}</p>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <p className="text-sm text-blue-100 leading-relaxed">
                    📚 <strong>Tip:</strong> This AI-powered interview will assess your technical knowledge, problem-solving skills, and communication abilities. 
                    Follow these guidelines to showcase your best performance!
                  </p>
                </div>
              </div>
            </div>

            {/* Device Check Section */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 p-6 border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Camera className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Device Check</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                  cameraReady 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      cameraReady ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      <Video className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 dark:text-white">Camera</h4>
                      <p className={`text-sm ${
                        cameraReady 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {checkingDevices ? 'Checking...' : cameraReady ? 'Ready' : 'Permission needed'}
                      </p>
                    </div>
                    {cameraReady && <CheckCircle className="h-5 w-5 text-green-500" />}
                    {!cameraReady && !checkingDevices && <XCircle className="h-5 w-5 text-red-500" />}
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                  micReady 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      micReady ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      <Mic className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 dark:text-white">Microphone</h4>
                      <p className={`text-sm ${
                        micReady 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {checkingDevices ? 'Checking...' : micReady ? 'Ready' : 'Permission needed'}
                      </p>
                    </div>
                    {micReady && <CheckCircle className="h-5 w-5 text-green-500" />}
                    {!micReady && !checkingDevices && <XCircle className="h-5 w-5 text-red-500" />}
                  </div>
                </div>
              </div>

              {(!cameraReady || !micReady) && !checkingDevices && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-red-800 dark:text-red-200 mb-2">⚠️ Camera and Microphone Required</h4>
                      <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                        <strong>The interview cannot start without both camera and microphone access.</strong> This ensures proper recording and evaluation of your responses.
                      </p>
                      <ul className="text-sm text-red-700 dark:text-red-300 mb-4 space-y-1">
                        <li>• Click "Allow" when prompted for camera/microphone permissions</li>
                        <li>• Check your browser settings if permissions were previously denied</li>
                        <li>• Ensure no other apps are using your camera/microphone</li>
                      </ul>
                      <button
                        onClick={checkDevices}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-colors shadow-lg"
                      >
                        🔄 Check Devices Again
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
              <div className="grid md:grid-cols-2 gap-8">
                {/* DO's Section */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">DO's</h3>
                  </div>
                  <div className="space-y-4">
                    {dos.map((item, index) => {
                      const Icon = item.icon
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-2xl border border-green-200/50 dark:border-green-700/50 hover:shadow-lg transition-all duration-300"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0`}>
                              <Icon className={`h-4 w-4 ${item.color}`} />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 dark:text-white mb-1">{item.title}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{item.description}</p>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>

                {/* DON'T's Section */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center">
                      <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">DON'Ts</h3>
                  </div>
                  <div className="space-y-4">
                    {donts.map((item, index) => {
                      const Icon = item.icon
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 p-4 rounded-2xl border border-red-200/50 dark:border-red-700/50 hover:shadow-lg transition-all duration-300"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0`}>
                              <Icon className={`h-4 w-4 ${item.color}`} />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 dark:text-white mb-1">{item.title}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{item.description}</p>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Additional Tips */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-8 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border border-blue-200/50 dark:border-blue-700/50"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Lightbulb className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">Pro Tips</h4>
                </div>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>Practice common {techStack} concepts beforehand</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-500 font-bold">•</span>
                    <span>Have a glass of water nearby to stay hydrated</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-indigo-500 font-bold">•</span>
                    <span>Ensure good lighting for the camera</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 font-bold">•</span>
                    <span>Test your microphone and camera beforehand</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 bg-gray-50 dark:bg-gray-800/50 p-4 sm:p-6 border-t border-gray-200/50 dark:border-gray-700/50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span className="text-center sm:text-left">Estimated interview duration: 15-30 minutes</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="w-full sm:w-auto px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
                  >
                    Review Later
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: cameraReady && micReady ? 1.02 : 1 }}
                    whileTap={{ scale: cameraReady && micReady ? 0.98 : 1 }}
                    onClick={() => {
                      console.log('🎯 Guidelines button clicked! Device states:', { cameraReady, micReady, checkingDevices })
                      console.log('🎯 onProceed function:', typeof onProceed, onProceed)
                      if (cameraReady && micReady) {
                        console.log('✅ Devices ready, calling onProceed()')
                        try {
                          onProceed()
                          console.log('✅ onProceed() called successfully')
                        } catch (error) {
                          console.error('❌ Error calling onProceed():', error)
                        }
                      } else {
                        console.log('⚠️ Devices not ready, calling checkDevices()')
                        checkDevices()
                      }
                    }}
                    disabled={checkingDevices || (!cameraReady || !micReady)}
                    className={`w-full sm:w-auto px-8 py-3 rounded-2xl font-bold transition-all duration-300 shadow-lg ${
                      cameraReady && micReady 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-xl cursor-pointer' 
                        : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white cursor-not-allowed opacity-75'
                    } ${checkingDevices ? 'opacity-50 cursor-wait' : ''}`}
                  >
                    {checkingDevices ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Checking Devices...
                      </div>
                    ) : cameraReady && micReady ? (
                      'Start Interview'
                    ) : (
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Enable Camera & Mic
                      </div>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
