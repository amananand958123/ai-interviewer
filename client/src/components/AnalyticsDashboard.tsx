import React, { useEffect, useState } from 'react'
import { useInterviewStore } from '../stores/interviewStore'
import type { SessionAnalytics, LearningRecommendations } from '../stores/interviewStore'

interface AnalyticsDashboardProps {
  sessionId: string
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ sessionId }) => {
  const { currentSession, loadAnalytics, loadRecommendations } = useInterviewStore()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        await Promise.all([
          loadAnalytics(sessionId),
          loadRecommendations(sessionId)
        ])
      } catch (error) {
        console.error('Error loading analytics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [sessionId, loadAnalytics, loadRecommendations])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading analytics...</span>
      </div>
    )
  }

  const analytics = currentSession?.analytics
  const recommendations = currentSession?.recommendations

  if (!analytics && !recommendations) {
    return (
      <div className="text-center p-8 text-gray-500 dark:text-gray-400">
        No analytics data available
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {analytics && (
        <PerformanceOverview analytics={analytics} />
      )}
      
      {recommendations && (
        <LearningRecommendationsSection recommendations={recommendations} />
      )}
      
      {analytics && (
        <DetailedMetrics analytics={analytics} />
      )}
    </div>
  )
}

const PerformanceOverview: React.FC<{ analytics: SessionAnalytics }> = ({ analytics }) => {
  const { sessionSummary, skillAssessment } = analytics

  return (
    <div className="glass-card p-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Performance Overview
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {sessionSummary.totalQuestions}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Questions Answered</div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {Math.round(sessionSummary.averageScore)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Average Score</div>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {Math.round(sessionSummary.sessionDuration / 60000)}m
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Session Duration</div>
        </div>
        
        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {sessionSummary.totalResponses}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Responses Given</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">Strong Areas</h4>
          <ul className="space-y-1">
            {skillAssessment.strongAreas.map((area, index) => (
              <li key={index} className="flex items-center text-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                {area}
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold text-orange-600 dark:text-orange-400 mb-2">Areas for Improvement</h4>
          <ul className="space-y-1">
            {skillAssessment.improvementAreas.map((area, index) => (
              <li key={index} className="flex items-center text-sm">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                {area}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

const LearningRecommendationsSection: React.FC<{ recommendations: LearningRecommendations }> = ({ recommendations }) => {
  return (
    <div className="glass-card p-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Personalized Learning Path
      </h3>
      
      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-gray-700 dark:text-gray-300">{recommendations.overallAssessment}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">Immediate Focus</h4>
          <ul className="space-y-1">
            {recommendations.learningPath.immediate.map((item, index) => (
              <li key={index} className="text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded">
                {item}
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold text-yellow-600 dark:text-yellow-400 mb-2">Short Term</h4>
          <ul className="space-y-1">
            {recommendations.learningPath.shortTerm.map((item, index) => (
              <li key={index} className="text-sm p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                {item}
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">Long Term</h4>
          <ul className="space-y-1">
            {recommendations.learningPath.longTerm.map((item, index) => (
              <li key={index} className="text-sm p-2 bg-green-50 dark:bg-green-900/20 rounded">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg">
        <h4 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">Motivational Message</h4>
        <p className="text-gray-700 dark:text-gray-300 italic">{recommendations.motivationalMessage}</p>
      </div>
    </div>
  )
}

const DetailedMetrics: React.FC<{ analytics: SessionAnalytics }> = ({ analytics }) => {
  const { performanceTrends } = analytics

  return (
    <div className="glass-card p-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Performance Trends
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TrendChart 
          title="Response Quality" 
          data={performanceTrends.responseQuality} 
          color="blue"
        />
        <TrendChart 
          title="Technical Depth" 
          data={performanceTrends.technicalDepth} 
          color="green"
        />
        <TrendChart 
          title="Communication Clarity" 
          data={performanceTrends.communicationClarity} 
          color="purple"
        />
      </div>
    </div>
  )
}

const TrendChart: React.FC<{ title: string; data: number[]; color: string }> = ({ title, data, color }) => {
  const maxValue = Math.max(...data, 100)
  const average = data.length > 0 ? data.reduce((sum, val) => sum + val, 0) / data.length : 0

  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
      <h4 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">{title}</h4>
      
      <div className="mb-2">
        <span className={`text-2xl font-bold text-${color}-600 dark:text-${color}-400`}>
          {Math.round(average)}%
        </span>
        <span className="text-sm text-gray-500 ml-1">avg</span>
      </div>
      
      <div className="flex items-end space-x-1 h-20">
        {data.map((value, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div 
              className={`w-full bg-${color}-500 rounded-t transition-all duration-300`}
              style={{ height: `${(value / maxValue) * 100}%` }}
            />
            <span className="text-xs text-gray-400 mt-1">{index + 1}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AnalyticsDashboard
