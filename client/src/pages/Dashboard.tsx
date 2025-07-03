import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useUIStore } from '../stores/uiStore'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Calendar, Clock, Award, TrendingUp, Download, BarChart3, Brain, Loader2, AlertCircle, RefreshCw, Home, Eye, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { StatCardSkeleton } from '../components/Skeleton'

interface DashboardData {
  sessions: number
  totalTime: number
  averageScore: number
  skillsAssessed: string[]
  recentPerformance: Array<{
    date: string
    score: number
    type: string
  }>
  skillBreakdown: Array<{
    skill: string
    score: number
    color: string
  }>
  recentSessions: Array<{
    id: string
    sessionId: string
    mode: string
    techStack: string
    level: string
    startTime: string
    endTime?: string
    duration: number
    overallScore?: number
    questionsCount: number
  }>
}

export default function Dashboard() {
  const { isAuthenticated } = useAuthStore()
  const { showInterviewGuidelines } = useUIStore()
  const navigate = useNavigate()
  
  // Analysis modal state
  const [showAnalysisModal, setShowAnalysisModal] = useState(false)
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [sessionAnalysis, setSessionAnalysis] = useState<any>(null)
  const [loadingAnalysis, setLoadingAnalysis] = useState(false)
  
  const handleStartInterview = () => {
    showInterviewGuidelines('React', 'Intermediate', '/technical-interview')
  }

  const handleCodingTest = () => {
    navigate('/coding-test?techStack=React&level=Intermediate')
  }

  // Function to fetch detailed session analysis
  const fetchSessionAnalysis = async (sessionId: string) => {
    setLoadingAnalysis(true)
    setSessionAnalysis(null) // Clear previous analysis
    
    try {
      console.log('Fetching analysis for session:', sessionId)
      const response = await fetch(`http://localhost:3001/api/sessions/${sessionId}/analysis`, {
        credentials: 'include'
      })
      
      console.log('Analysis response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Analysis data received:', data)
        setSessionAnalysis(data.analysis)
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Failed to fetch session analysis:', response.status, errorData)
        
        // Show user-friendly error message
        if (response.status === 404) {
          setSessionAnalysis('NOT_FOUND')
        } else {
          setSessionAnalysis('ERROR')
        }
      }
    } catch (error) {
      console.error('Error fetching session analysis:', error)
      setSessionAnalysis('ERROR')
    } finally {
      setLoadingAnalysis(false)
    }
  }

  // Function to handle viewing session details
  const viewSessionDetails = async (session: any) => {
    setSelectedSession(session)
    setShowAnalysisModal(true)
    await fetchSessionAnalysis(session.sessionId)
  }

  const [dashboardData, setDashboardData] = useState<DashboardData>({
    sessions: 0,
    totalTime: 0,
    averageScore: 0,
    skillsAssessed: [],
    recentPerformance: [],
    skillBreakdown: [],
    recentSessions: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('http://localhost:3001/api/dashboard', {
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }
      
      const data = await response.json()
      setDashboardData(data)
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      setDashboardData({
        sessions: 0,
        totalTime: 0,
        averageScore: 0,
        skillsAssessed: [],
        recentPerformance: [],
        skillBreakdown: [],
        recentSessions: []
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData()
      
      // Check for refresh flag from coding test completion
      const needsRefresh = localStorage.getItem('dashboard-refresh-needed')
      if (needsRefresh === 'true') {
        console.log('🔄 Dashboard refresh triggered by test completion')
        localStorage.removeItem('dashboard-refresh-needed')
        // Add a small delay to ensure backend has processed the session
        setTimeout(() => {
          fetchDashboardData()
        }, 2000) // Increased delay to 2 seconds
      }
    }
  }, [isAuthenticated, fetchDashboardData])

  // Check for refresh flag when component gains focus (e.g., returning from test)
  useEffect(() => {
    if (!isAuthenticated) return

    const checkRefreshFlag = () => {
      const needsRefresh = localStorage.getItem('dashboard-refresh-needed')
      if (needsRefresh === 'true') {
        console.log('🔄 Dashboard refresh triggered on focus')
        localStorage.removeItem('dashboard-refresh-needed')
        fetchDashboardData()
      }
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkRefreshFlag()
        fetchDashboardData()
      }
    }

    const refreshInterval = setInterval(() => {
      if (!document.hidden) {
        fetchDashboardData()
      }
    }, 30000) // Refresh every 30 seconds

    const handleFocus = () => {
      checkRefreshFlag()
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(refreshInterval)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isAuthenticated, fetchDashboardData])

  // Manual refresh function
  const handleRefresh = () => {
    fetchDashboardData()
  }

  const stats = [
    {
      label: 'Total Sessions',
      value: dashboardData.sessions,
      icon: Calendar,
      color: 'bg-blue-500',
      change: dashboardData.sessions > 0 ? '+12%' : '0%',
      changeType: 'positive'
    },
    {
      label: 'Practice Time',
      value: `${Math.round(dashboardData.totalTime)}m`,
      icon: Clock,
      color: 'bg-green-500',
      change: dashboardData.totalTime > 0 ? '+5%' : '0%',
      changeType: 'positive'
    },
    {
      label: 'Average Score',
      value: `${dashboardData.averageScore}%`,
      icon: Award,
      color: 'bg-purple-500',
      change: dashboardData.averageScore > 0 ? '+8%' : '0%',
      changeType: 'positive'
    },
    {
      label: 'Skills Practiced',
      value: dashboardData.skillsAssessed.length,
      icon: TrendingUp,
      color: 'bg-orange-500',
      change: dashboardData.skillsAssessed.length > 0 ? '+2' : '0',
      changeType: 'positive'
    },
  ]

  const exportData = () => {
    const data = {
      dashboardData,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `interview-analytics-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-8 p-8"
        >
          <div className="relative">
            <div className="w-24 h-24 mx-auto bg-gradient-to-r from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-2xl">
              <Loader2 className="h-12 w-12 text-white animate-spin" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full animate-pulse flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Loading Dashboard
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
              Gathering your interview analytics and performance data...
            </p>
          </div>
          
          <div className="flex justify-center">
            <div className="flex space-x-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 bg-purple-500 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                />
              ))}
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 max-w-md mx-auto"
            >
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                <h3 className="font-bold text-red-800 dark:text-red-200">Loading Error</h3>
              </div>
              <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
              <button
                onClick={fetchDashboardData}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors duration-200"
              >
                <RefreshCw className="h-4 w-4" />
                Retry Loading
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Please Sign In
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You need to be signed in to view your dashboard and analytics.
          </p>
          <a 
            href="/login" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Performance Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track your interview progress and identify areas for improvement
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              title="Refresh Dashboard"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center w-10 h-10 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              title="Go to Home"
            >
              <Home className="w-5 h-5" />
            </button>
            <button
              onClick={exportData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {loading ? (
          Array.from({ length: 4 }, (_, index) => (
            <StatCardSkeleton key={index} />
          ))
        ) : (
          stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                    <div className="flex items-center mt-2">
                      <span className={`text-sm font-medium ${
                        stat.changeType === 'positive' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {stat.change}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">vs last period</span>
                    </div>
                  </div>
                  <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Show message when no data */}
      {dashboardData.sessions === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center py-12 bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700"
        >
          <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            No Interview Data Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start practicing with technical interviews or coding challenges to see your analytics here.
          </p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={handleStartInterview}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Start Technical Interview
            </button>
            <button 
              onClick={handleCodingTest}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Take Coding Test
            </button>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Performance Trend Chart */}
          {dashboardData.recentPerformance.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Performance Trend
                </h3>
              </div>
              
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboardData.recentPerformance}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value: number) => [`${value}%`, 'Score']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Skills Breakdown */}
          {dashboardData.skillBreakdown.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 mb-8"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Skills Assessment
              </h3>
              
              <div className="space-y-4">
                {dashboardData.skillBreakdown.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: skill.color }}
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {skill.skill}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{ 
                            width: `${skill.score}%`,
                            backgroundColor: skill.color 
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white w-8">
                        {skill.score}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Recent Sessions */}
          {dashboardData.recentSessions.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Sessions
              </h3>
              
              <div className="space-y-3">
                {dashboardData.recentSessions.map((session, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer group"
                    onClick={() => viewSessionDetails(session)}
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: session.mode === 'technical' ? '#3b82f6' : '#10b981' }}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {session.techStack} ({session.level})
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {new Date(session.startTime).toLocaleDateString()} • {session.questionsCount} questions
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {session.endTime ? (session.overallScore ? `${session.overallScore}%` : 'Completed') : 'In Progress'}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {session.duration}m
                    </p>
                  </div>
                      <Eye className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* Detailed Analysis Modal */}
      <AnimatePresence>
        {showAnalysisModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          >
            <motion.div
              initial={{ y: "-30%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-30%", opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg w-full max-w-3xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Session Analysis
                </h3>
                <button
                  onClick={() => setShowAnalysisModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {loadingAnalysis ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Loading analysis...</span>
                </div>
              ) : sessionAnalysis === 'NOT_FOUND' ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No Analysis Available
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    This session doesn't have detailed analysis data yet. Analysis is generated when you complete an interview or coding test.
                  </p>
                  <p className="text-xs text-gray-400">
                    Try completing more questions in your next session to get detailed insights.
                  </p>
                </div>
              ) : sessionAnalysis === 'ERROR' ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Analysis Error
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Unable to load analysis for this session. Please try again later.
                  </p>
                  <button
                    onClick={() => fetchSessionAnalysis(selectedSession?.sessionId)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                  >
                    Retry
                  </button>
                </div>
              ) : sessionAnalysis && Array.isArray(sessionAnalysis) && sessionAnalysis.length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Session Details
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Tech Stack
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedSession.techStack}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Level
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedSession.level}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Mode
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedSession.mode}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Duration
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedSession.duration} minutes
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Performance Insights
                    </h4>
                    <div className="space-y-2">
                      {sessionAnalysis.map((item: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {item.skill}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div
                                className="h-2 rounded-full"
                                style={{ 
                                  width: `${item.score}%`,
                                  backgroundColor: item.color 
                                }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white w-8">
                              {item.score}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No Analysis Data
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    This session doesn't have any analysis data available.
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}