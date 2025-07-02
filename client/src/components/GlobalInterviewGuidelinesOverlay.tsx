import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '../stores/uiStore'
import InterviewGuidelinesOverlay from './InterviewGuidelinesOverlay'

export default function GlobalInterviewGuidelinesOverlay() {
  const navigate = useNavigate()
  const { 
    showGuidelinesOverlay, 
    selectedTechStack, 
    selectedLevel,
    hideGuidelinesOverlay
  } = useUIStore()

  const [showCountdown, setShowCountdown] = useState(false)
  const [countdown, setCountdown] = useState(3)

  const handleProceed = () => {
    hideGuidelinesOverlay()
    setShowCountdown(true)
    setCountdown(3)
  }

  useEffect(() => {
    if (showCountdown && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (showCountdown && countdown === 0) {
      // Countdown finished, navigate to interview
      const timer = setTimeout(() => {
        setShowCountdown(false)
        navigate(`/technical-interview?techStack=${selectedTechStack}&level=${selectedLevel}`)
      }, 1000) // Wait 1 second after showing "START!"
      return () => clearTimeout(timer)
    }
  }, [showCountdown, countdown, navigate, selectedTechStack, selectedLevel])

  return (
    <>
      <InterviewGuidelinesOverlay
        isOpen={showGuidelinesOverlay}
        onClose={hideGuidelinesOverlay}
        onProceed={handleProceed}
        techStack={selectedTechStack}
        level={selectedLevel}
      />
      
      {/* Countdown Overlay */}
      <AnimatePresence>
        {showCountdown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="text-center"
            >
              {countdown > 0 ? (
                <motion.div
                  key={countdown}
                  initial={{ scale: 0.5, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  transition={{ type: "spring", duration: 0.8 }}
                  className="text-white"
                >
                  <div className="text-9xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
                    {countdown}
                  </div>
                  <p className="text-2xl font-semibold text-gray-300">
                    Interview starting in...
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0.5, y: 50 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="text-white"
                >
                  <div className="text-8xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                    START!
                  </div>
                  <p className="text-2xl font-semibold text-gray-300">
                    Good luck! 🚀
                  </p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
