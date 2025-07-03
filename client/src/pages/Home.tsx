import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MessageSquare, Code, BarChart3, Mic, Brain, Clock, Video, ChevronDown, Sparkles, Target } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import CameraPreview from '../components/CameraPreview'
import { useUIStore } from '../stores/uiStore'
import { useAuthStore } from '../stores/authStore'
import { techStacks } from '../data/questionBank'

export default function Home() {
  const { selectedTechStack, selectedLevel, setSelectedTechStack, setSelectedLevel } = useUIStore()
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [showTechStack, setShowTechStack] = useState(false)
  const [showLevel, setShowLevel] = useState(false)

  const levels = [
    { name: 'Basic', description: 'Fundamental concepts', icon: '🌱' },
    { name: 'Intermediate', description: 'Practical applications', icon: '🔧' },
    { name: 'Pro', description: 'Advanced topics', icon: '🚀' }
  ]

  const handleStartInterview = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to start an interview')
      navigate('/login')
      return
    }
    navigate(`/technical-interview?techStack=${selectedTechStack}&level=${selectedLevel}`)
  }

  const handleCodingTest = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to start a coding test')
      navigate('/login')
      return
    }
    navigate(`/coding-test?techStack=${selectedTechStack}`)
  }

  const features = [
    {
      icon: MessageSquare,
      title: 'Technical Interviews',
      description: 'Practice behavioral, system design, and technical questions with AI-powered feedback',
      onClick: handleStartInterview,
      color: 'from-blue-500 to-blue-600',
      accent: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      icon: Code,
      title: 'Coding Tests',
      description: 'Solve algorithmic challenges with real-time code execution and assessment',
      link: `/coding-test?techStack=${selectedTechStack}`,
      color: 'from-green-500 to-green-600',
      accent: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      icon: BarChart3,
      title: 'Performance Analytics',
      description: 'Track your progress and get detailed insights on your interview performance',
      link: '/dashboard',
      color: 'from-purple-500 to-purple-600',
      accent: 'bg-purple-50 dark:bg-purple-900/20',
    },
  ]

  const highlights = [
    {
      icon: Mic,
      title: 'Voice Recognition',
      description: 'Natural speech-to-text with real-time transcription',
      color: 'text-blue-600',
    },
    {
      icon: Brain,
      title: 'AI-Powered Feedback',
      description: 'Get intelligent assessments using advanced AI',
      color: 'text-purple-600',
    },
    {
      icon: Clock,
      title: 'Real-time Analysis',
      description: 'Instant evaluation and personalized recommendations',
      color: 'text-green-600',
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-6" style={{ overflow: 'visible' }}>
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-green-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-8 lg:py-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left side - Text content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-8"
            >
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="inline-block"
                >
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700">
                    <Sparkles className="w-4 h-4" />
                    AI-Powered Interview Preparation
                  </span>
                </motion.div>
                
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                  Master Your
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400">
                    Interview Skills
                  </span>
                  with AI
                </h1>
                
                <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                  Practice technical interviews and coding challenges with our intelligent platform. 
                  Get real-time feedback, track your progress, and ace your next interview.
                </p>
              </div>
              
              {/* Tech Stack and Level Selectors */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="space-y-4 relative z-50"
              >
                <label className="block text-lg font-bold text-gray-700 dark:text-gray-300">
                  Choose Your Tech Stack & Level
                </label>
                <div className="flex flex-col sm:flex-row gap-4 relative z-50">
                  {/* Tech Stack Selector */}
                  <div className="relative flex-1 z-50">
                    <button
                      onClick={() => {
                        setShowTechStack(!showTechStack)
                        setShowLevel(false)
                      }}
                      className="w-full flex items-center justify-between bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-600 rounded-2xl px-6 py-4 text-left hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 shadow-lg hover:shadow-xl group"
                    >
                      <span className="text-gray-900 dark:text-white font-bold text-lg">{selectedTechStack}</span>
                      <ChevronDown className={`h-6 w-6 text-gray-400 group-hover:text-blue-500 transition-all duration-300 ${showTechStack ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {showTechStack && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-2 border-gray-200 dark:border-gray-600 rounded-2xl shadow-2xl overflow-hidden max-h-[300px] overflow-y-auto"
                          style={{
                            zIndex: 99999,
                            position: 'absolute',
                          }}
                        >
                          {techStacks.map((stack, index) => (
                            <motion.button
                              key={stack}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2, delay: index * 0.05 }}
                              onClick={() => {
                                setSelectedTechStack(stack)
                                setShowTechStack(false)
                              }}
                              className="w-full text-left px-6 py-4 hover:bg-blue-50 dark:hover:bg-gray-700/50 text-gray-900 dark:text-white transition-all duration-150 border-b border-gray-100 dark:border-gray-700 last:border-b-0 font-semibold hover:pl-8"
                            >
                              {stack}
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Level Selector */}
                  <div className="relative flex-1 sm:max-w-[200px] z-50">
                    <button
                      onClick={() => {
                        setShowLevel(!showLevel)
                        setShowTechStack(false)
                      }}
                      className="w-full flex items-center justify-between bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-600 rounded-2xl px-6 py-4 text-left hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-300 shadow-lg hover:shadow-xl group"
                    >
                      <span className="text-gray-900 dark:text-white font-bold text-lg flex items-center gap-2">
                        <span className="text-xl">{levels.find(l => l.name === selectedLevel)?.icon || '🌱'}</span>
                        {selectedLevel}
                      </span>
                      <ChevronDown className={`h-6 w-6 text-gray-400 group-hover:text-purple-500 transition-all duration-300 ${showLevel ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {showLevel && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-2 border-gray-200 dark:border-gray-600 rounded-2xl shadow-2xl overflow-hidden max-h-[300px] overflow-y-auto"
                          style={{
                            zIndex: 99999,
                            position: 'absolute',
                          }}
                        >
                          {levels.map((level, index) => (
                            <motion.button
                              key={level.name}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2, delay: index * 0.05 }}
                              onClick={() => {
                                setSelectedLevel(level.name)
                                setShowLevel(false)
                              }}
                              className="w-full text-left px-6 py-4 hover:bg-purple-50 dark:hover:bg-gray-700/50 text-gray-900 dark:text-white transition-all duration-150 border-b border-gray-100 dark:border-gray-700 last:border-b-0 font-semibold hover:pl-8"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-xl">{level.icon}</span>
                                <div>
                                  <div className="font-bold">{level.name}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">{level.description}</div>
                                </div>
                              </div>
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
              
              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <button
                  onClick={handleStartInterview}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  Start Interview
                </button>
                <Link
                  to={`/coding-test?techStack=${selectedTechStack}&level=${selectedLevel}`}
                  className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-400 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Code className="w-5 h-5" />
                  Take Coding Test
                </Link>
              </motion.div>
            </motion.div>

            {/* Right side - Camera Preview */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="relative bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 dark:border-gray-700/20 shadow-2xl">
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-green-500 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-blue-500 rounded-full animate-bounce"></div>
                
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Camera Preview
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Real-time monitoring for authentic practice
                    </p>
                  </div>
                  
                  <div className="rounded-2xl overflow-hidden shadow-lg w-full max-w-md mx-auto h-64">
                    <CameraPreview showBackgroundImage={true} isVisible={true} />
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Video className="w-4 h-4" />
                    <span>Camera ready for interview simulation</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Navigation Section */}
      <section className="py-16 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm border-y border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Quick Navigation
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Jump to any section of the AI Interview platform
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.button
              onClick={handleStartInterview}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="group flex flex-col items-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-3xl border border-blue-200/50 dark:border-blue-700/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-[200px] justify-center"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 text-center">Technical Interview</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center flex-grow flex items-center">Practice behavioral and technical questions</p>
            </motion.button>

            <motion.button
              onClick={handleCodingTest}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="group flex flex-col items-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-3xl border border-green-200/50 dark:border-green-700/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-[200px] justify-center w-full"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <Code className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 text-center">Coding Test</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center flex-grow flex items-center">Solve algorithmic challenges</p>
            </motion.button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="h-[200px]"
            >
              <Link
                to="/dashboard"
                className="group flex flex-col items-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-3xl border border-purple-200/50 dark:border-purple-700/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full justify-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 text-center">Dashboard</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 text-center flex-grow flex items-center">View progress and analytics</p>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="h-[200px]"
            >
              <Link
                to="/settings"
                className="group flex flex-col items-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-700/30 rounded-3xl border border-gray-200/50 dark:border-gray-600/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full justify-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 text-center">Settings</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 text-center flex-grow flex items-center">Customize your experience</p>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Everything You Need to 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Succeed</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Comprehensive tools and features designed to help you excel in technical interviews
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group h-full flex"
                >
                  {feature.onClick ? (
                    <button
                      onClick={feature.onClick}
                      className="w-full h-full text-left bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700 flex flex-col min-h-[320px]"
                    >
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex-shrink-0">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 flex-grow">
                        {feature.description}
                      </p>
                      <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-2 transition-transform duration-300 flex-shrink-0">
                        Get Started →
                      </div>
                    </button>
                  ) : (
                    <Link
                      to={feature.link!}
                      className="w-full h-full bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700 flex flex-col min-h-[320px]"
                    >
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex-shrink-0">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 flex-grow">
                        {feature.description}
                      </p>
                      <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-2 transition-transform duration-300 flex-shrink-0">
                        Get Started →
                      </div>
                    </Link>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Powered by Advanced Technology
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Cutting-edge AI and real-time processing for the best experience
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {highlights.map((highlight, index) => {
              const Icon = highlight.icon
              return (
                <motion.div
                  key={highlight.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center group"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Icon className={`h-10 w-10 ${highlight.color}`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      {highlight.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {highlight.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white">
              Ready to Ace Your Next Interview?
            </h2>
            <p className="text-xl text-blue-100">
              Join thousands of developers who have improved their interview skills with our AI-powered platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleStartInterview}
                className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Target className="w-5 h-5" />
                Start Practicing Now
              </button>
              <Link
                to="/dashboard"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <BarChart3 className="w-5 h-5" />
                View Analytics
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
