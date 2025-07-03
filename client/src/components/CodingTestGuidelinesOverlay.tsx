import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, XCircle, Code, Clock, Target, AlertTriangle, Camera, Mic, Video, Eye, Monitor, Zap, FileCode, TestTube } from 'lucide-react'
import { useState, useEffect } from 'react'

interface CodingTestGuidelinesOverlayProps {
  isOpen: boolean
  onClose: () => void
  onProceed: () => void
  techStack?: string
  level?: string
}

export default function CodingTestGuidelinesOverlay({ 
  isOpen, 
  onClose, 
  onProceed, 
  techStack = 'JavaScript',
  level = 'Basic'
}: CodingTestGuidelinesOverlayProps) {
  const [cameraReady, setCameraReady] = useState(false)
  const [micReady, setMicReady] = useState(false)
  const [checkingDevices, setCheckingDevices] = useState(false)

  // Check camera and microphone permissions
  const checkDevices = async () => {
    setCheckingDevices(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      })
      
      // Check video tracks
      const videoTracks = stream.getVideoTracks()
      setCameraReady(videoTracks.length > 0)
      
      // Check audio tracks
      const audioTracks = stream.getAudioTracks()
      setMicReady(audioTracks.length > 0)
      
      // Stop the stream after checking
      stream.getTracks().forEach(track => track.stop())
    } catch (error) {
      console.error('Device check failed:', error)
      setCameraReady(false)
      setMicReady(false)
    } finally {
      setCheckingDevices(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      checkDevices()
    }
  }, [isOpen])

  const guidelines = [
    {
      icon: Clock,
      title: "Time Management",
      description: "You have 30 minutes to complete the coding challenge. Plan your approach before coding.",
      color: "text-blue-500"
    },
    {
      icon: Code,
      title: "Write Clean Code",
      description: "Focus on readable, well-structured code with proper variable names and comments when needed.",
      color: "text-green-500"
    },
    {
      icon: TestTube,
      title: "Test Your Solution",
      description: "Run test cases frequently to validate your solution. Edge cases are important!",
      color: "text-purple-500"
    },
    {
      icon: Target,
      title: "Focus on the Problem",
      description: "Read the problem statement carefully and understand the requirements before coding.",
      color: "text-orange-500"
    },
    {
      icon: FileCode,
      title: "Use Built-in Functions",
      description: "Leverage language-specific built-in functions and libraries when appropriate.",
      color: "text-indigo-500"
    },
    {
      icon: Zap,
      title: "Optimize When Possible",
      description: "Consider time and space complexity, but prioritize a working solution first.",
      color: "text-yellow-500"
    }
  ]

  const restrictions = [
    {
      icon: XCircle,
      title: "No External Resources",
      description: "Don't use external websites, documentation, or AI assistants during the test.",
      color: "text-red-500"
    },
    {
      icon: Monitor,
      title: "Stay in the Test Window",
      description: "Avoid switching to other applications or tabs during the coding test.",
      color: "text-red-500"
    },
    {
      icon: Eye,
      title: "Camera Must Stay On",
      description: "Keep your camera enabled throughout the entire test for proctoring purposes.",
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border-4 border-gradient-to-r from-blue-400 via-purple-500 to-green-400 max-w-5xl w-full h-[90vh] flex flex-col relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated gradient border effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-green-400 opacity-20 animate-pulse"></div>
            <div className="absolute inset-1 bg-white dark:bg-gray-800 rounded-2xl"></div>
            
            {/* Content */}
            <div className="relative z-10 flex flex-col h-full">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 p-6 text-white relative overflow-hidden">
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
                      <Code className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold">Coding Test Guidelines</h2>
                      <p className="text-blue-100 text-lg">Best practices for your {techStack} coding challenge</p>
                      <p className="text-blue-200 text-sm mt-1">Level: {level} • Duration: 30 minutes • Proctored Assessment</p>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                    <p className="text-sm text-blue-100 leading-relaxed">
                      🎯 <strong>Objective:</strong> Solve a real-world coding problem that tests your programming skills, problem-solving ability, and code quality. 
                      Follow these guidelines for the best performance!
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
                  <span className="text-sm text-gray-600 dark:text-gray-400">(Required for proctored test)</span>
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
                  <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-amber-800 dark:text-amber-200">Device Access Required</h4>
                        <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                          Please allow camera and microphone access to proceed with the proctored coding test. 
                          Click "Check Devices" to try again.
                        </p>
                        <button
                          onClick={checkDevices}
                          disabled={checkingDevices}
                          className="mt-2 px-3 py-1 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors"
                        >
                          {checkingDevices ? 'Checking...' : 'Check Devices'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Guidelines Content */}
              <div className="flex-1 min-h-0 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Best Practices */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                      <CheckCircle className="h-6 w-6 text-green-500" />
                      Best Practices
                    </h3>
                    <div className="space-y-4">
                      {guidelines.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white dark:bg-gray-700/50 p-4 rounded-2xl border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-10 h-10 ${item.color.replace('text-', 'bg-').replace('500', '100')} dark:bg-opacity-20 rounded-xl flex items-center justify-center flex-shrink-0`}>
                              <item.icon className={`h-5 w-5 ${item.color}`} />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 dark:text-white mb-1">{item.title}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{item.description}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Restrictions */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                      <XCircle className="h-6 w-6 text-red-500" />
                      Test Restrictions
                    </h3>
                    <div className="space-y-4">
                      {restrictions.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl border border-red-200 dark:border-red-700 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
                              <item.icon className="h-5 w-5 text-red-500" />
                            </div>
                            <div>
                              <h4 className="font-bold text-red-900 dark:text-red-100 mb-1">{item.title}</h4>
                              <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">{item.description}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Additional Info */}
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-2xl">
                      <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Important Notes
                      </h4>
                      <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                        <li>• Your screen activity and camera feed will be monitored</li>
                        <li>• Violations may result in test termination</li>
                        <li>• Focus on problem-solving and code quality</li>
                        <li>• Use the format button to reset your code if needed</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 dark:bg-gray-800/50 p-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Make sure you understand all guidelines before proceeding
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Time limit: 30 minutes • Test will auto-submit when time expires
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onClose}
                      className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onProceed}
                      disabled={checkingDevices || !cameraReady || !micReady}
                      className={`px-8 py-3 rounded-xl font-bold text-white transition-all duration-200 ${
                        checkingDevices || !cameraReady || !micReady
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {checkingDevices ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Checking Devices...
                        </div>
                      ) : cameraReady && micReady ? (
                        'Start Coding Test'
                      ) : (
                        'Enable Devices First'
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
