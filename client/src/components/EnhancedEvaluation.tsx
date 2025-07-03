import React from 'react';

interface Evaluation {
  overallScore?: number;
  strengths?: string[];
  weaknesses?: string[];
  improvements?: string[]; // New field for improvements
  recommendations?: string[];
  technicalAccuracy?: number;
  communicationClarity?: number;
  problemSolvingApproach?: number;
  codeQuality?: number;
  timeManagement?: number;
  detailedFeedback?: string;
  
  // Additional coding test specific fields
  passedTests?: number;
  totalTests?: number;
  passRate?: number;
  duration?: string;
  timeUsed?: number;
  timeLimit?: number;
  timeEfficiency?: number;
  challenge?: string;
  difficulty?: string;
  techStack?: string;
  avgExecutionTime?: number;
  maxMemoryUsage?: number;
  codeLength?: number;
  hasComments?: boolean;
  hasProperStructure?: boolean;
  testResults?: any[];
}

interface EnhancedEvaluationProps {
  evaluation: Evaluation | null;
  onClose: () => void;
}

const EnhancedEvaluation: React.FC<EnhancedEvaluationProps> = ({ evaluation, onClose }) => {
  if (!evaluation) {
    return (
      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl max-w-4xl w-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Interview Evaluation
          </h2>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <p className="text-yellow-800 dark:text-yellow-200 mb-4">
              <strong>No Analysis Available</strong>
            </p>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              The evaluation data could not be generated. This might be due to:
            </p>
            <ul className="text-gray-600 dark:text-gray-300 text-sm mt-2 text-left list-disc list-inside">
              <li>Test was ended too early</li>
              <li>No code was submitted</li>
              <li>Technical issues during analysis</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-300 text-sm mt-3">
              Check the browser console for detailed error messages.
            </p>
          </div>
          <div className="flex justify-center mt-6">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const {
    overallScore = 0,
    strengths = [],
    weaknesses = [],
    improvements = [], // Use improvements instead of weaknesses
    recommendations = [],
    technicalAccuracy = 0,
    communicationClarity = 0,
    problemSolvingApproach = 0,
    codeQuality = 0,
    timeManagement = 0,
    detailedFeedback = '',
    
    // Coding test specific data
    passedTests = 0,
    totalTests = 0,
    passRate = 0,
    duration = '',
    timeEfficiency = 0,
    challenge = '',
    difficulty = '',
    techStack = '',
    avgExecutionTime = 0,
    maxMemoryUsage = 0,
    codeLength = 0,
    hasComments = false,
    hasProperStructure = false
  } = evaluation;

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 dark:text-green-400';
    if (score >= 6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 8) return 'bg-green-100 dark:bg-green-900';
    if (score >= 6) return 'bg-yellow-100 dark:bg-yellow-900';
    return 'bg-red-100 dark:bg-red-900';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Interview Evaluation
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Overall Score */}
          <div className={`p-6 rounded-lg mb-6 ${getScoreBackground(overallScore)}`}>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Overall Score
              </h3>
              <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
                {overallScore}/100
              </div>
              {challenge && (
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">{challenge}</span>
                  {difficulty && techStack && (
                    <span> • {difficulty} Level • {techStack}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Test Results Summary */}
          {totalTests > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Test Results
                </h4>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {passedTests}/{totalTests}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  {passRate}% Success Rate
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                <h4 className="font-medium text-green-900 dark:text-green-100 mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  Duration
                </h4>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {duration}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  {timeEfficiency}% Efficiency
                </div>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                  Code Quality
                </h4>
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {codeQuality}/100
                </div>
                <div className="text-sm text-purple-600 dark:text-purple-400 space-y-1">
                  <div>{codeLength} characters</div>
                  <div className="flex gap-2">
                    {hasComments && <span className="text-xs bg-purple-100 dark:bg-purple-800 px-1 py-0.5 rounded">Comments</span>}
                    {hasProperStructure && <span className="text-xs bg-purple-100 dark:bg-purple-800 px-1 py-0.5 rounded">Structured</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Performance Metrics */}
          {avgExecutionTime > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Performance Metrics</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Avg Execution Time:</span>
                  <span className="ml-2 font-mono font-medium">{avgExecutionTime}ms</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Memory Usage:</span>
                  <span className="ml-2 font-mono font-medium">{maxMemoryUsage}KB</span>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {[
              { name: 'Technical Accuracy', score: technicalAccuracy },
              { name: 'Communication', score: communicationClarity },
              { name: 'Problem Solving', score: problemSolvingApproach },
              { name: 'Code Quality', score: codeQuality },
              { name: 'Time Management', score: timeManagement }
            ].filter(item => item.score > 0).map((item) => (
              <div key={item.name} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  {item.name}
                </h4>
                <div className={`text-2xl font-bold ${getScoreColor(item.score)}`}>
                  {item.score}/100
                </div>
              </div>
            ))}
          </div>

          {/* Strengths */}
          {strengths.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Strengths
              </h3>
              <ul className="list-disc list-inside space-y-2">
                {strengths.map((strength, index) => (
                  <li key={index} className="text-gray-700 dark:text-gray-300">
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Areas for Improvement */}
          {(improvements.length > 0 || weaknesses.length > 0) && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <svg className="w-5 h-5 text-orange-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Areas for Improvement
              </h3>
              <ul className="list-disc list-inside space-y-2">
                {[...improvements, ...weaknesses].map((item, index) => (
                  <li key={index} className="text-gray-700 dark:text-gray-300">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <svg className="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Recommendations
              </h3>
              <ul className="list-disc list-inside space-y-2">
                {recommendations.map((recommendation, index) => (
                  <li key={index} className="text-gray-700 dark:text-gray-300">
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Detailed Feedback */}
          {detailedFeedback && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Detailed Feedback
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {detailedFeedback}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => window.print()}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Print Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedEvaluation;
