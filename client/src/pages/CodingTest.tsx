import { useState, useEffect, useRef, MouseEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { 
  ArrowLeft, 
  Clock, 
  Award, 
  Square,
  Code,
  RefreshCw,
  AlertCircle,
  Loader2,
  Save
} from 'lucide-react'
import { geminiService } from '../services/geminiService'

import CodeEditor from '../components/CodeEditor'
import CameraPreview, { CameraPreviewHandle } from '../components/CameraPreview'
import CodingTestGuidelinesOverlay from '../components/CodingTestGuidelinesOverlay'
import EnhancedEvaluation from '../components/EnhancedEvaluation'
import ProgressBar from '../components/ProgressBar'
import { useInterviewStore } from '../stores/interviewStore'
import * as codingTestService from '../services/codingTestService'
import * as sessionService from '../services/sessionService'

interface CodeExecution {
  success: boolean
  output: string
  error?: string
  executionTime?: number
  memoryUsage?: number
  input?: string
  expectedOutput?: string
}

interface CodingChallenge {
  id: number
  title: string
  description: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  techStack: string
  starterCode: string
  testCases: Array<{
    input: any
    expectedOutput: any
    description: string
  }>
  hints?: string[]
  timeLimit?: number
  tags?: string[]
  examples?: Array<{
    input: string
    output: string
    explanation?: string
  }>
}

// Cache for generated boilerplate to avoid repeated API calls
const boilerplateCache: Record<string, string> = {};

// Dynamic boilerplate generation function that uses Gemini API
const generateLanguageSpecificBoilerplate = async (challenge: CodingChallenge, language: string): Promise<string> => {  
  if (!challenge) return '';
  
  // Create a cache key based on challenge ID and language
  const cacheKey = `${challenge.id || challenge.title}-${language}`;
  
  // Return cached boilerplate if available
  if (boilerplateCache[cacheKey]) {
    console.log('📄 Using cached boilerplate code for', language);
    return boilerplateCache[cacheKey];
  }
  
  try {
    // Use Gemini API to generate dynamic boilerplate
    console.log('🤖 Generating dynamic boilerplate via Gemini API for', language);
    const boilerplate = await geminiService.generateBoilerplateCode(challenge, language);
    
    // Cache the result
    boilerplateCache[cacheKey] = boilerplate;
    return boilerplate;
  } catch (error) {
    console.error('❌ Error generating boilerplate via Gemini:', error);
    
    // Fall back to local generation
    console.log('📄 Using fallback local boilerplate generator for', language);
    const fallbackCode = generateFallbackBoilerplate(challenge, language);
    
    // Cache the fallback result
    boilerplateCache[cacheKey] = fallbackCode;
    return fallbackCode;
  }
}

// Synchronous version for situations where async calls are not possible
const getBoilerplateSync = (challenge: CodingChallenge, language: string): string => {
  if (!challenge) return '';
  
  // Create a cache key based on challenge ID and language
  const cacheKey = `${challenge.id || challenge.title}-${language}`;
  
  // Return cached boilerplate if available
  if (boilerplateCache[cacheKey]) {
    return boilerplateCache[cacheKey];
  }
  
  // If not cached, use fallback generator
  return generateFallbackBoilerplate(challenge, language);
}

// Fallback boilerplate generator for when Gemini API is unavailable
const generateFallbackBoilerplate = (challenge: CodingChallenge, language: string): string => {
  if (!challenge) return '';
  
  // Dynamic boilerplate generation based on challenge analysis
  const challengeTitle = challenge.title.toLowerCase();
  
  // Extract function name from title
  const functionName = challengeTitle
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(' ')
    .map((word, index) => index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
    .replace(/\s/g, '') || 'solution';
  
  // Generate parameters based on test cases and challenge type
  let parameters: string[] = [];
  if (challenge.testCases && challenge.testCases.length > 0) {
    const firstTestCase = challenge.testCases[0];
    
    // Check if input is an array that should be passed as a single parameter
    if (Array.isArray(firstTestCase.input) && typeof firstTestCase.input[0] === 'number') {
      // This is likely an array of numbers passed as a single parameter (like calculateAverage([1,2,3]))
      if (challengeTitle.includes('average') || challengeTitle.includes('sum') || challengeTitle.includes('array')) {
        parameters = ['numbers']; // Use descriptive parameter name
      } else {
        parameters = ['arr']; // Generic array parameter name
      }
    } else if (Array.isArray(firstTestCase.input)) {
      // Multiple separate parameters
      firstTestCase.input.forEach((_, index) => {
        parameters.push(`param${index + 1}`);
      });
    } else if (typeof firstTestCase.input === 'object' && firstTestCase.input !== null) {
      // Object input - extract keys
      parameters = Object.keys(firstTestCase.input);
    } else {
      // Single primitive parameter
      parameters = ['input'];
    }
  } else {
    parameters = ['input'];
  }
  
  // Determine return type from expected output
  let returnType = 'any';
  let sampleReturn = 'null';
  
  if (challenge.testCases && challenge.testCases.length > 0) {
    const expectedOutput = challenge.testCases[0].expectedOutput;
    if (Array.isArray(expectedOutput)) {
      returnType = 'array';
      sampleReturn = '[]';
    } else if (typeof expectedOutput === 'string') {
      returnType = 'string';
      sampleReturn = '""';
    } else if (typeof expectedOutput === 'number') {
      returnType = 'number';
      sampleReturn = '0';
    } else if (typeof expectedOutput === 'boolean') {
      returnType = 'boolean';
      sampleReturn = 'false';
    }
  }
  
  // Generate language-specific boilerplate
  switch (language) {
    case 'javascript':
      return `/**
 * ${challenge.title}
 * ${challenge.description}
 */
function ${functionName}(${parameters.join(', ')}) {
    // TODO: Implement your solution here
    return ${sampleReturn};
}

// Example usage:
// console.log(${functionName}(${challenge.testCases?.[0]?.input ? JSON.stringify(challenge.testCases[0].input) : 'exampleInput'}));`;

    case 'python':
      const pythonReturnType = returnType === 'array' ? 'List' : returnType === 'string' ? 'str' : returnType === 'number' ? 'int' : returnType === 'boolean' ? 'bool' : 'Any';
      const pythonSampleReturn = returnType === 'array' ? '[]' : returnType === 'string' ? '""' : returnType === 'number' ? '0' : returnType === 'boolean' ? 'False' : 'None';
      
      return `"""
${challenge.title}
${challenge.description}
"""
def ${functionName}(${parameters.join(', ')}) -> ${pythonReturnType}:
    # TODO: Implement your solution here
    return ${pythonSampleReturn}

# Example usage:
# print(${functionName}(${challenge.testCases?.[0]?.input ? JSON.stringify(challenge.testCases[0].input) : 'example_input'}))`;

    case 'java':
      const javaReturnType = returnType === 'array' ? 'int[]' : returnType === 'string' ? 'String' : returnType === 'number' ? 'int' : returnType === 'boolean' ? 'boolean' : 'Object';
      const javaSampleReturn = returnType === 'array' ? 'new int[]{}' : returnType === 'string' ? '""' : returnType === 'number' ? '0' : returnType === 'boolean' ? 'false' : 'null';
      
      return `/**
 * ${challenge.title}
 * ${challenge.description}
 */
public class Solution {
    public ${javaReturnType} ${functionName}(${parameters.map(p => `int ${p}`).join(', ')}) {
        // TODO: Implement your solution here
        return ${javaSampleReturn};
    }
    
    public static void main(String[] args) {
        Solution solution = new Solution();
        // Example usage:
        // System.out.println(solution.${functionName}(${challenge.testCases?.[0]?.input ? JSON.stringify(challenge.testCases[0].input) : 'exampleInput'}));
    }
}`;

    case 'cpp':
      // Determine proper C++ return type based on expected output
      let cppReturnType = 'int';
      let cppSampleReturn = '0';
      
      if (challenge.testCases && challenge.testCases.length > 0) {
        const expectedOutput = challenge.testCases[0].expectedOutput;
        if (Array.isArray(expectedOutput)) {
          cppReturnType = 'vector<int>';
          cppSampleReturn = '{}';
        } else if (typeof expectedOutput === 'string') {
          cppReturnType = 'string';
          cppSampleReturn = '""';
        } else if (typeof expectedOutput === 'number') {
          if (Number.isInteger(expectedOutput)) {
            cppReturnType = 'int';
            cppSampleReturn = '0';
          } else {
            cppReturnType = 'double';
            cppSampleReturn = '0.0';
          }
        } else if (typeof expectedOutput === 'boolean') {
          cppReturnType = 'bool';
          cppSampleReturn = 'false';
        }
      }
      
      // Generate proper C++ parameter types based on test case inputs
      let cppParameters = 'int input';
      if (challenge.testCases && challenge.testCases.length > 0) {
        const firstInput = challenge.testCases[0].input;
        if (Array.isArray(firstInput)) {
          if (firstInput.length === 2 && typeof firstInput[0] === 'number' && typeof firstInput[1] === 'number') {
            // Two separate numeric parameters (like divide(10, 2))
            cppParameters = 'double a, double b';
          } else {
            // Single array parameter
            cppParameters = 'vector<int> nums';
          }
        } else if (typeof firstInput === 'number') {
          if (Number.isInteger(firstInput)) {
            cppParameters = 'int num';
          } else {
            cppParameters = 'double num';
          }
        } else if (typeof firstInput === 'string') {
          cppParameters = 'string str';
        }
      }
      
      return `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <climits>
using namespace std;

// ${challenge.title}
// ${challenge.description}

${cppReturnType} ${functionName}(${cppParameters}) {
    // TODO: Implement your solution here
    return ${cppSampleReturn};
}

// DO NOT MODIFY THE CODE BELOW - IT IS FOR TESTING PURPOSES ONLY
int main() {
    // Test cases will be run automatically
    // Your function will be called with the test inputs
    return 0;
}`;

    default:
      return `// ${challenge.title}
// ${challenge.description}

// TODO: Implement your solution here`;
  }
}

export default function CodingTest() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const selectedTechStack = searchParams.get('techStack') || 'JavaScript'
  const selectedLevel = searchParams.get('level') || 'Basic'
  
  // Map level to difficulty format for API
  const getDifficulty = (level: string): 'Easy' | 'Medium' | 'Hard' => {
    switch (level) {
      case 'Basic': return 'Easy'
      case 'Intermediate': return 'Medium'
      case 'Pro': return 'Hard'
      default: return 'Easy'
    }
  }
  
  const selectedDifficulty = getDifficulty(selectedLevel)
  
  const { saveResponse } = useInterviewStore()
  
  // Draggable camera state
  const [cameraPosition, setCameraPosition] = useState({ x: 20, y: 20 })
  const [isDragging, setIsDragging] = useState(false)
  const [isCameraMinimized, setIsCameraMinimized] = useState(false)
  const cameraRef = useRef<HTMLDivElement>(null)
  const cameraPreviewRef = useRef<CameraPreviewHandle>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  // Mouse event handlers for camera dragging
  const handleMouseDown = (e: MouseEvent) => {
    if (!cameraRef.current) return
    
    const rect = cameraRef.current.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
    setIsDragging(true)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return
    
    const x = Math.max(0, Math.min(window.innerWidth - 224, e.clientX - dragOffset.x))
    const y = Math.max(0, Math.min(window.innerHeight - 160, e.clientY - dragOffset.y))
    
    setCameraPosition({ x, y })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Add and remove event listeners for mouse movement
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove as any)
      window.addEventListener('mouseup', handleMouseUp)
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove as any)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  const [currentChallenge, setCurrentChallenge] = useState<CodingChallenge | null>(null)
  const [isLoadingChallenge, setIsLoadingChallenge] = useState(true)
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [isTestActive, setIsTestActive] = useState(false)
  const [testResults, setTestResults] = useState<CodeExecution[]>([])
  const [timeRemaining, setTimeRemaining] = useState(30 * 60)
  const [testStartTime, setTestStartTime] = useState<Date | null>(null)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [showGuidelinesOverlay, setShowGuidelinesOverlay] = useState(true)
  const [testCompleted, setTestCompleted] = useState(false) // Track if test is completed
  const [sessionId, setSessionId] = useState<string | null>(null) // Database session ID
  const [isTestResultsCollapsed, setIsTestResultsCollapsed] = useState(false) // Collapse test results
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null) // Track timer interval
  
  // Countdown timer states
  const [showCountdown, setShowCountdown] = useState(false)
  const [countdownValue, setCountdownValue] = useState(3)
  const [testReady, setTestReady] = useState(false)
  
  // Check for duplicate test access on mount
  useEffect(() => {
    // Remove the restrictive completion check to allow retaking tests
    // Users should be able to practice coding tests multiple times
    
    // Check for force bypass parameter
    const forceStart = searchParams.get('force') === 'true'
    if (forceStart) {
      console.log('🚀 Force start enabled - bypassing session check')
      // Clear any existing sessions when forcing start
      const sessionKey = `coding-test-active-${selectedTechStack}-${selectedLevel}`
      localStorage.removeItem(sessionKey)
      return
    }
    
    // Only check for active session in another tab to prevent conflicts
    const sessionKey = `coding-test-active-${selectedTechStack}-${selectedLevel}`
    const existingSession = localStorage.getItem(sessionKey)
    
    if (existingSession) {
      // Check if the session is recent (within last 15 minutes) to avoid blocking stale sessions
      try {
        const sessionData = JSON.parse(existingSession)
        const sessionTime = new Date(sessionData.timestamp || sessionData)
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000) // Reduced from 1 hour to 15 minutes
        
        if (sessionTime > fifteenMinutesAgo) {
          toast.error('A coding test is already in progress in another tab. Add ?force=true to bypass.')
          setTimeout(() => navigate('/'), 2000)
          return
        } else {
          // Clear stale session
          localStorage.removeItem(sessionKey)
          console.log('🧹 Cleared stale session data')
        }
      } catch (e) {
        // If we can't parse the session data, remove it
        localStorage.removeItem(sessionKey)
        console.log('🧹 Cleared invalid session data')
      }
    }
    
    // Mark this test session as started with timestamp
    localStorage.setItem(sessionKey, JSON.stringify({
      timestamp: new Date().toISOString(),
      techStack: selectedTechStack,
      level: selectedLevel
    }))
    
    // Clean up on unmount
    return () => {
      localStorage.removeItem(sessionKey)
    }
  }, [selectedTechStack, selectedLevel, navigate])
  
  // Handle automatic navigation when analysis is closed after test completion
  useEffect(() => {
    if (testCompleted && !showAnalysis && analysisData) {
      // Only navigate after the analysis modal has been explicitly closed by the user
      console.log('🏠 Test completed and analysis closed - ready for navigation')
      // Don't auto-navigate here - let user choose via buttons in the modal
    }
  }, [testCompleted, showAnalysis, analysisData, navigate])

  // Auto-proceed after 10 seconds if guidelines overlay is still showing
  useEffect(() => {
    if (showGuidelinesOverlay) {
      const timeout = setTimeout(() => {
        console.log('Auto-proceeding after 10 seconds')
        setShowGuidelinesOverlay(false)
      }, 10000) // 10 seconds
      
      return () => clearTimeout(timeout)
    }
  }, [showGuidelinesOverlay])

  // Timer countdown
  useEffect(() => {
    // Clear any existing timer first
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
    
    // Only start timer if test is active, time remaining, not completed, and not showing analysis
    if (isTestActive && timeRemaining > 0 && !testCompleted && !showAnalysis) {
      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Clear timer before calling endTest
            if (timerIntervalRef.current) {
              clearInterval(timerIntervalRef.current)
              timerIntervalRef.current = null
            }
            endTest()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
    }
  }, [isTestActive, timeRemaining, testCompleted, showAnalysis])

  const endTest = async () => {
    console.log('🔚 endTest() called - UI cleanup and analysis preparation')
    
    // Immediately stop the test and camera if not already done
    if (isTestActive) {
      setIsTestActive(false)
      console.log('🛑 Test state set to inactive')
    }
    
    // Ensure loading state is off since test is ending
    setIsLoadingChallenge(false)
    
    // Mark test as completed if not already done
    if (!testCompleted) {
      setTestCompleted(true)
      console.log('✅ Test marked as completed')
    }
    
    // Clear session data to prevent re-entry (if not already done)
    localStorage.removeItem('coding-session-id')
    localStorage.removeItem('coding-test-active')
    
    // Calculate analysis data for UI display (not for backend - that's handled in handleEndTest)
    if (testStartTime && currentChallenge) {
      const duration = new Date().getTime() - testStartTime.getTime()
      const durationMinutes = Math.floor(duration / 60000)
      const durationSeconds = Math.floor((duration % 60000) / 1000)
      const durationString = `${durationMinutes}m ${durationSeconds}s`
      
      // Use actual test results if we have them
      let finalTestResults = testResults
      if (testResults.length === 0 && code.trim()) {
        try {
          console.log('📊 Running final code analysis for UI display...')
          const data = await codingTestService.executeCode(code, language, currentChallenge.testCases)
          if (data.results && Array.isArray(data.results)) {
            finalTestResults = data.results.map((result: any, index: number) => ({
              success: result.success || false,
              output: result.output || '',
              error: result.error || null,
              executionTime: result.executionTime || 0,
              memoryUsage: result.memoryUsage || 0,
              input: currentChallenge.testCases[index]?.input || '',
              expectedOutput: currentChallenge.testCases[index]?.expectedOutput || ''
            }))
            setTestResults(finalTestResults)
          }
        } catch (error) {
          console.warn('Final execution failed:', error)
        }
      }
      
      const passedTests = finalTestResults.filter(r => r.success).length
      const totalTests = currentChallenge.testCases.length
      const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0
      
      // Calculate detailed metrics for UI display
      const avgExecutionTime = finalTestResults.length > 0 
        ? finalTestResults.reduce((sum, r) => sum + (r.executionTime || 0), 0) / finalTestResults.length 
        : 0
      const maxMemoryUsage = finalTestResults.length > 0
        ? Math.max(...finalTestResults.map(r => r.memoryUsage || 0))
        : 0
      const hasErrors = finalTestResults.some(r => r.error)
      
      // Performance analysis for UI
      const timeLimit = (currentChallenge.timeLimit || 30) * 60 * 1000
      const timeUsed = duration
      const timeEfficiencyPercentage = Math.max(0, 100 - ((timeUsed / timeLimit) * 100))
      
      // Code quality analysis for UI
      const codeLength = code.length
      const hasComments = code.includes('//') || code.includes('/*') || code.includes('#')
      const hasProperStructure = code.includes('function') || code.includes('def') || code.includes('class') || code.includes('public')
      const hasControlFlow = code.includes('if') || code.includes('for') || code.includes('while') || code.includes('switch')
      const hasErrorHandling = code.includes('try') || code.includes('catch') || code.includes('except')
      
      // Calculate component scores for UI
      const testScore = passRate
      const timeScore = Math.min(100, timeEfficiencyPercentage + 20)
      
      let codeQualityScore = 30
      if (codeLength > 50) codeQualityScore += 15
      if (hasComments) codeQualityScore += 15
      if (hasProperStructure) codeQualityScore += 20
      if (hasControlFlow) codeQualityScore += 10
      if (hasErrorHandling) codeQualityScore += 10
      codeQualityScore = Math.min(100, codeQualityScore)
      
      const performanceScore = avgExecutionTime < 1000 ? 90 : avgExecutionTime < 5000 ? 70 : 50
      
      // Overall score calculation for UI
      const overallScore = Math.round(
        (testScore * 0.5) +
        (codeQualityScore * 0.25) +
        (timeScore * 0.15) +
        (performanceScore * 0.1)
      )
      
      // Generate feedback for UI
      const strengths = []
      const improvements = []
      
      if (passRate >= 80) strengths.push("Excellent test case completion rate")
      else if (passRate >= 60) strengths.push("Good progress on test cases")
      else if (passRate > 0) improvements.push("Work on passing more test cases")
      else improvements.push("Focus on basic problem-solving approach")
      
      if (timeEfficiencyPercentage > 70) strengths.push("Efficient time management")
      else if (timeEfficiencyPercentage > 40) strengths.push("Reasonable time usage")
      else improvements.push("Practice working under time constraints")
      
      if (hasComments) strengths.push("Good code documentation")
      else improvements.push("Add comments to explain your logic")
      
      if (hasProperStructure) strengths.push("Well-structured code organization")
      else improvements.push("Focus on proper code structure and organization")
      
      if (!hasErrors && finalTestResults.length > 0) strengths.push("Clean code execution without errors")
      else if (hasErrors) improvements.push("Debug and fix code errors")
      
      if (avgExecutionTime < 1000) strengths.push("Efficient algorithm implementation")
      else if (avgExecutionTime > 5000) improvements.push("Optimize algorithm for better performance")
      
      // Difficulty-specific feedback
      let difficultyFeedback = ""
      if (currentChallenge.difficulty === 'Easy') {
        difficultyFeedback = passRate >= 80 
          ? "Great job on this fundamental problem! Ready for intermediate challenges."
          : "Keep practicing basic programming concepts and problem-solving patterns."
      } else if (currentChallenge.difficulty === 'Medium') {
        difficultyFeedback = passRate >= 70
          ? "Solid performance on this intermediate challenge! Shows good algorithmic thinking."
          : "This level requires more practice with data structures and algorithms."
      } else {
        difficultyFeedback = passRate >= 60
          ? "Impressive work on this advanced problem! Shows strong technical skills."
          : "Advanced problems require deep understanding of complex algorithms and optimization."
      }
      
      // Create analysis data for UI display
      const analysis = {
        overallScore,
        technicalAccuracy: testScore,
        codeQuality: codeQualityScore,
        timeManagement: Math.round(timeScore),
        problemSolvingApproach: Math.round((testScore + codeQualityScore) / 2),
        passedTests,
        totalTests,
        passRate,
        testResults: finalTestResults,
        duration: durationString,
        timeUsed: Math.round(timeUsed / 1000),
        timeLimit: Math.round(timeLimit / 1000),
        timeEfficiency: Math.round(timeEfficiencyPercentage),
        avgExecutionTime: Math.round(avgExecutionTime),
        maxMemoryUsage,
        codeLength,
        hasComments,
        hasProperStructure,
        hasControlFlow,
        hasErrorHandling,
        hasErrors,
        challenge: currentChallenge.title,
        difficulty: currentChallenge.difficulty,
        techStack: currentChallenge.techStack || selectedTechStack,
        strengths,
        improvements,
        overallFeedback: `You completed ${passedTests}/${totalTests} test cases in ${durationString}. ${difficultyFeedback}`,
        detailedFeedback: `Performance Summary:\n• Code Quality: ${codeQualityScore}/100\n• Test Success: ${passRate}%\n• Time Efficiency: ${Math.round(timeEfficiencyPercentage)}%\n• Avg Execution: ${Math.round(avgExecutionTime)}ms\n\nThis ${currentChallenge.difficulty} level ${selectedTechStack} challenge tested your ${selectedTechStack === 'Generic' ? 'algorithmic thinking' : selectedTechStack + ' programming'} skills.`
      }
      
      setAnalysisData(analysis)
      setTestCompleted(true)
      
      // Save for local storage
      const response = JSON.stringify({
        code,
        duration,
        testResults: finalTestResults,
        analysis,
        challenge: currentChallenge.title,
        timestamp: new Date().toISOString()
      })
      saveResponse(`coding-test-${currentChallenge.id}`, response)
      
      // Show analysis modal
      setShowAnalysis(true)
      
      console.log('🔍 Analysis modal should now be visible')
      
    } else {
      // If no valid challenge or start time, create minimal analysis for UI
      const minimumAnalysis = {
        overallScore: 0,
        technicalAccuracy: 0,
        codeQuality: 0,
        timeManagement: 0,
        problemSolvingApproach: 0,
        passedTests: 0,
        totalTests: 0,
        passRate: 0,
        testResults: [],
        duration: '0m 0s',
        timeUsed: 0,
        timeLimit: 1800,
        timeEfficiency: 0,
        avgExecutionTime: 0,
        maxMemoryUsage: 0,
        codeLength: code.length,
        hasComments: false,
        hasProperStructure: false,
        hasControlFlow: false,
        hasErrorHandling: false,
        hasErrors: false,
        challenge: 'Test Incomplete',
        difficulty: selectedDifficulty,
        techStack: selectedTechStack,
        strengths: [],
        improvements: ['Complete the coding test to get detailed feedback'],
        overallFeedback: 'Test was ended before completion.',
        detailedFeedback: 'The test was ended early. To get detailed analysis, complete the full coding challenge.'
      }
      
      setAnalysisData(minimumAnalysis)
      setTestCompleted(true)
      setShowAnalysis(true)
    }
    
    toast.success('Coding test completed!')
  }

  const handleEndTest = async () => {
    console.log('🔚 handleEndTest() called - ending test immediately');
    
    // Set flag to bypass validation for final code execution
    (window as any).__endingTest = true;
    
    // IMMEDIATELY stop all test timers and intervals
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
      console.log('⏰ Timer interval cleared');
    }
    
    // Immediately stop all test states and UI
    setIsTestActive(false);
    setTestCompleted(true);
    setIsLoadingChallenge(false);
    setTimeRemaining(0); // Force timer to 0
    
    console.log('🛑 All test states stopped');
    
    // Stop camera using the component's ref
    if (cameraPreviewRef.current) {
      console.log('🎥 Stopping camera via component ref');
      cameraPreviewRef.current.stopCamera();
    }
    
    // Also force comprehensive camera cleanup
    await cleanupCamera();
    
    // Clear all localStorage session markers immediately
    try {
      localStorage.removeItem('coding-session-id');
      localStorage.removeItem('coding-test-active');
      const activeSessionKey = `coding-test-active-${selectedTechStack}-${selectedLevel}`;
      localStorage.removeItem(activeSessionKey);
      console.log('🧹 Cleared all localStorage session markers');
    } catch (error) {
      console.warn('Failed to clear session markers:', error);
    }
    
    // End database session IMMEDIATELY with analysis data
    if (sessionId) {
      try {
        console.log('🔚 Ending database session immediately:', sessionId);
        
        // Calculate final analysis data
        const passedTests = testResults.filter(r => r.success).length;
        const totalTests = currentChallenge?.testCases.length || 0;
        const finalScore = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
        
        // Create analysis data for backend
        const analysisData = {
          codeQuality: {
            overall: Math.min(100, code.length > 50 ? 70 : 50),
            readability: code.includes('//') || code.includes('/*') ? 80 : 60,
            efficiency: 75,
            bestPractices: 70
          },
          performance: {
            timeComplexity: 'O(n)',
            spaceComplexity: 'O(1)',
            optimality: 75
          },
          testResults: testResults.map(result => ({
            input: String(result.input || ''),
            expected: String(result.expectedOutput || ''),
            actual: String(result.output || ''),
            passed: result.success,
            executionTime: result.executionTime || 0,
            memoryUsage: result.memoryUsage || 0
          })),
          feedback: {
            strengths: passedTests > 0 ? ["Successfully implemented solution"] : [],
            improvements: passedTests < totalTests ? ["Work on edge cases"] : [],
            suggestions: ["Continue practicing coding problems"]
          },
          breakdown: {
            correctness: finalScore,
            efficiency: 75,
            codeQuality: Math.min(100, code.length > 50 ? 70 : 50),
            problemSolving: finalScore
          }
        };
        
        // End session with proper data
        await sessionService.endSession(sessionId, finalScore, analysisData);
        console.log('✅ Database session ended successfully with analysis data');
        
        // Also update session with final code and challenge data
        if (currentChallenge) {
          await sessionService.updateSession(sessionId, {
            challenge: currentChallenge,
            response: JSON.stringify({ code, testResults }),
            evaluation: { 
              score: finalScore, 
              analysis: analysisData
            }
          });
          console.log('✅ Session updated with final analysis data');
        }
        
        // Force dashboard refresh
        localStorage.setItem('dashboard-refresh-needed', 'true');
        
      } catch (error) {
        console.error('⚠️ Failed to end database session:', error);
      }
    } else {
      console.warn('⚠️ No sessionId available to end');
    }
    
    // IMMEDIATELY call endTest to trigger analysis modal - don't wait
    await endTest();
    
    toast.success('Coding test ended! Session closed and camera stopped.');
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Calculate progress based on test completion
  const calculateProgress = () => {
    if (!currentChallenge) return 0
    const totalTime = (currentChallenge.timeLimit || 30) * 60
    const timeElapsed = totalTime - timeRemaining
    const timeProgress = Math.min((timeElapsed / totalTime) * 50, 50) // 50% for time
    
    const testProgress = testResults.length > 0 
      ? (testResults.filter(r => r.success).length / testResults.length) * 50 
      : 0 // 50% for test success
    
    return Math.min(Math.round(timeProgress + testProgress), 100)
  }

  const passedTests = testResults.filter(r => r.success).length
  const totalTests = testResults.length

  // Fetch coding challenge from API
  const fetchCodingChallenge = async () => {
    setIsLoadingChallenge(true)
    setLoadingError(null)
    try {
      const challenge = await codingTestService.generateChallenge(selectedTechStack, selectedDifficulty)
      setCurrentChallenge(challenge)
      
      // Set language first based on tech stack
      const langMap: Record<string, string> = {
        'JavaScript': 'javascript',
        'Python': 'python',
        'Java': 'java',
        'C++': 'cpp',
        'Generic': 'javascript', // Generic allows user to choose
      }
      const initialLanguage = langMap[selectedTechStack] || 'javascript'
      setLanguage(initialLanguage)
      
      // Generate dynamic boilerplate instead of using static starterCode
      try {
        // Use fallback first to show something quickly
        setCode(getBoilerplateSync(challenge, initialLanguage))
        
        // Then get the AI-generated version asynchronously
        const boilerplate = await generateLanguageSpecificBoilerplate(challenge, initialLanguage)
        setCode(boilerplate)
      } catch (error) {
        console.error('Error generating boilerplate:', error)
        // In case of error, fall back to sync version
        setCode(getBoilerplateSync(challenge, initialLanguage))
      }
      
      setIsLoadingChallenge(false) // Stop loading only on success
      
      // Start countdown after challenge is loaded
      setTimeout(() => {
        setShowCountdown(true)
        startCountdownSequence()
      }, 500)
    } catch (err) {
      setLoadingError(err instanceof Error ? err.message : 'Failed to load challenge')
      // On error, isLoadingChallenge remains true to show the error message
    }
  };

  // Load challenge only after guidelines are dismissed and test hasn't been completed
  useEffect(() => {
    if (!showGuidelinesOverlay && !testCompleted) {
      fetchCodingChallenge()
    }
  }, [selectedTechStack, selectedDifficulty, showGuidelinesOverlay, testCompleted])

  // Initialize code with starter code and start test when ready
  useEffect(() => {
    if (currentChallenge && !isTestActive) {
      // Set language based on tech stack - lock language for non-Generic stacks
      let initialLanguage = language
      
      if (selectedTechStack === 'Generic') {
        // For Generic tech stack, default to JavaScript but allow user to change
        initialLanguage = 'javascript'
        setLanguage('javascript')
      } else {
        // For specific tech stacks, lock to their language
        const langMap: Record<string, string> = {
          'JavaScript': 'javascript',
          'Python': 'python',
          'Java': 'java',
          'C++': 'cpp',
        }
        initialLanguage = langMap[selectedTechStack] || 'javascript'
        setLanguage(initialLanguage)
      }
      
      // Generate proper boilerplate code for the language and challenge
      try {
        // Use fallback first to show something quickly
        setCode(getBoilerplateSync(currentChallenge, initialLanguage))
        
        // Then get the AI-generated version asynchronously
        generateLanguageSpecificBoilerplate(currentChallenge, initialLanguage)
          .then(boilerplate => {
            setCode(boilerplate);
            console.log('📝 Updated code with AI-generated boilerplate');
          })
          .catch(error => {
            console.error('Error updating boilerplate:', error);
          });
      } catch (error) {
        console.error('Error setting initial boilerplate:', error);
      }
      
      // Auto-start the test immediately after challenge is loaded
      setTimeout(async () => {
        try {
          // Start database session
          const newSessionId = await sessionService.startSession('coding', selectedTechStack, selectedLevel)
          setSessionId(newSessionId)
          console.log('✅ Database session started:', newSessionId)
        } catch (error) {
          console.warn('⚠️ Failed to start database session:', error)
          // Continue without database session
        }
        
        setIsTestActive(true)
        setTestStartTime(new Date())
        setTimeRemaining((currentChallenge.timeLimit || 30) * 60)
        console.log('✅ Test started automatically with challenge:', currentChallenge.title)
      }, 1000)
    }
  }, [currentChallenge, isTestActive, language, selectedTechStack])

  // Handle language change for Generic tech stack
  const handleLanguageChange = (newLanguage: string) => {
    console.log('🔄 Language change requested:', newLanguage, 'Current language:', language, 'Tech stack:', selectedTechStack)
    
    // Always update language state first
    setLanguage(newLanguage)
    
    // Generate and set new boilerplate for any language change when challenge is available
    if (currentChallenge) {
      // Show quick feedback first
      toast.loading(`Generating ${newLanguage.charAt(0).toUpperCase() + newLanguage.slice(1)} template...`)
      
      // Use fallback immediately for better UX
      const fallbackCode = getBoilerplateSync(currentChallenge, newLanguage)
      setCode(fallbackCode)
      
      // Then get AI-generated version asynchronously
      generateLanguageSpecificBoilerplate(currentChallenge, newLanguage)
        .then(newBoilerplate => {
          console.log('📝 Generated new boilerplate for', newLanguage, ':', newBoilerplate.substring(0, 100) + '...')
          setCode(newBoilerplate)
          toast.dismiss()
          toast.success(`Switched to ${newLanguage.charAt(0).toUpperCase() + newLanguage.slice(1)}! Code template updated.`)
        })
        .catch(error => {
          console.error('Error generating boilerplate:', error)
          toast.dismiss()
          toast.success(`Switched to ${newLanguage.charAt(0).toUpperCase() + newLanguage.slice(1)}!`)
        })
    }
    
    // For non-Generic tech stacks during active test, show additional message
    if (selectedTechStack !== 'Generic' && isTestActive) {
      toast(`Note: Language changed but test was originally for ${selectedTechStack}`)
    }
  }

  // Removed auto-update useEffect to prevent conflicts - language changes are handled directly in handleLanguageChange

  const handleRunCode = async (userCode: string) => {
    if (!currentChallenge) return
    
    // Validate code before execution
    const trimmedCode = userCode.trim()
    const currentBoilerplate = getBoilerplateSync(currentChallenge, language).trim()
    if (!trimmedCode || trimmedCode === currentBoilerplate) {
      toast.error('Please write some code before running tests!')
      
      // Set all tests as failed for empty/boilerplate code
      const failedResults: CodeExecution[] = currentChallenge.testCases.map((testCase) => ({
        success: false,
        output: 'No output - code is empty or unchanged',
        error: 'Code is empty or contains only boilerplate code',
        executionTime: 0,
        memoryUsage: 0,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput
      }))
      
      setTestResults(failedResults)
      return
    }
    
    // Enhanced code validation - much stricter
    const validateCode = () => {
      // Basic structure validation
      if (language === 'javascript') {
        const hasFunction = trimmedCode.includes('function') || trimmedCode.includes('=>') || trimmedCode.includes('const') || trimmedCode.includes('let') || trimmedCode.includes('class')
        const hasReturn = trimmedCode.includes('return')
        const hasLogic = trimmedCode.includes('if') || trimmedCode.includes('for') || trimmedCode.includes('while') || trimmedCode.includes('switch') || 
                         trimmedCode.includes('*') || trimmedCode.includes('+') || trimmedCode.includes('-') || trimmedCode.includes('/') ||
                         trimmedCode.includes('.filter') || trimmedCode.includes('.map') || trimmedCode.includes('.reduce') || 
                         trimmedCode.includes('.match') || trimmedCode.includes('.split') || trimmedCode.includes('.join') ||
                         trimmedCode.includes('.includes') || trimmedCode.includes('.indexOf') || trimmedCode.includes('.charAt') ||
                         trimmedCode.includes('===') || trimmedCode.includes('!==') || trimmedCode.includes('&&') || trimmedCode.includes('||')
        
        if (!hasFunction) {
          return { valid: false, error: 'Code must contain a function, class, or method definition' }
        }
        if (!hasReturn && !trimmedCode.includes('console.log')) {
          return { valid: false, error: 'Code must contain a return statement or output' }
        }
        // More flexible logic check - accept string methods, array methods, and simple operations
        if (!hasLogic && trimmedCode.length < 40) {
          return { valid: false, error: 'Solution appears too simple. Please implement the required functionality.' }
        }
      } else if (language === 'python') {
        const hasFunction = trimmedCode.includes('def ') || trimmedCode.includes('class ')
        const hasReturn = trimmedCode.includes('return')
        const hasLogic = trimmedCode.includes('if') || trimmedCode.includes('for') || trimmedCode.includes('while') || 
                         trimmedCode.includes('*') || trimmedCode.includes('+') || trimmedCode.includes('-') || trimmedCode.includes('/') ||
                         trimmedCode.includes('.filter') || trimmedCode.includes('.map') || trimmedCode.includes('sum(') || 
                         trimmedCode.includes('.join') || trimmedCode.includes('.split') || trimmedCode.includes('in ') ||
                         trimmedCode.includes('==') || trimmedCode.includes('!=') || trimmedCode.includes(' and ') || trimmedCode.includes(' or ')
        
        if (!hasFunction) {
          return { valid: false, error: 'Code must contain a function or class definition' }
        }
        if (!hasReturn && !trimmedCode.includes('print')) {
          return { valid: false, error: 'Code must contain a return statement or output' }
        }
        if (!hasLogic && trimmedCode.length < 35) {
          return { valid: false, error: 'Solution appears too simple. Please implement the required functionality.' }
        }
      } else if (language === 'java') {
        const hasClass = trimmedCode.includes('class') 
        const hasMethod = trimmedCode.includes('public') && (trimmedCode.includes('return') || trimmedCode.includes('System.out'))
        const hasLogic = trimmedCode.includes('if') || trimmedCode.includes('for') || trimmedCode.includes('while') || trimmedCode.includes('*') || trimmedCode.includes('+') || trimmedCode.includes('-') || trimmedCode.includes('/')
        
        if (!hasClass || !hasMethod) {
          return { valid: false, error: 'Code must contain a class with a public method that returns a value or prints output' }
        }
        if (!hasLogic && trimmedCode.length < 100) {
          return { valid: false, error: 'Solution appears too simple. Please implement the required functionality.' }
        }
      } else if (language === 'cpp') {
        const hasInclude = trimmedCode.includes('#include')
        const hasFunctionImpl = trimmedCode.includes('{') && !trimmedCode.includes('// TODO: Implement your solution here')
        const hasLogic = trimmedCode.includes('if') || trimmedCode.includes('for') || trimmedCode.includes('while') || 
                         trimmedCode.includes('*') || trimmedCode.includes('+') || trimmedCode.includes('-') || trimmedCode.includes('/') ||
                         trimmedCode.includes('return') || trimmedCode.includes('==') || trimmedCode.includes('!=')
        
        if (!hasInclude) {
          return { valid: false, error: 'Code must contain proper C++ structure with includes' }
        }
        if (!hasFunctionImpl) {
          return { valid: false, error: 'Please implement the function - replace the TODO comment with your solution' }
        }
        if (!hasLogic && trimmedCode.length < 100) {
          return { valid: false, error: 'Solution appears too simple. Please implement the required functionality.' }
        }
        
        // Check if user modified the main function (they shouldn't)
        const originalTemplate = getBoilerplateSync(currentChallenge, language)
        const mainFunctionMatch = originalTemplate.match(/int main\(\) \{[\s\S]*?\}/);
        if (mainFunctionMatch) {
          const originalMain = mainFunctionMatch[0]
          if (trimmedCode.includes('int main()') && !trimmedCode.includes(originalMain)) {
            return { valid: false, error: 'Please do not modify the main() function. Only implement your solution in the designated function.' }
          }
        }
      }
      
      // Check for hardcoded solutions
      const suspiciousPatterns = [
        /return\s*\[\s*\d+\s*(,\s*\d+)*\s*\]/gi, // return [1, 2, 3]
        /return\s*\d+$/gm, // return 42
        /return\s*"[^"]*"$/gm, // return "hello"
        /return\s*true|false$/gm // return true
      ]
      
      const hasOnlyHardcodedReturns = suspiciousPatterns.some(pattern => {
        const matches = trimmedCode.match(pattern)
        return matches && matches.length > 0 && trimmedCode.split('\n').filter(line => line.trim() && !line.trim().startsWith('//')).length < 4
      })
      
      if (hasOnlyHardcodedReturns) {
        return { valid: false, error: 'Solution appears to return hardcoded values. Please implement proper algorithmic logic.' }
      }
      
      return { valid: true, error: null }
    }
    
    // Check if this was triggered from the "End Test" button (will be set by handleEndTest)
    const isEndingTest = (window as any).__endingTest === true;
    
    // Only validate if not in "ending test" mode
    if (!isEndingTest) {
      const validation = validateCode()
      if (!validation.valid) {
        toast.error(validation.error!)
        
        const failedResults: CodeExecution[] = currentChallenge.testCases.map((testCase) => ({
          success: false,
          output: 'Code validation failed',
          error: validation.error || 'Validation failed',
          executionTime: 0,
          memoryUsage: 0,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput
        }))
        
        setTestResults(failedResults)
        return
      }
    } else {
      console.log('⏭️ Skipping validation checks because test is ending');
      // Reset the flag
      (window as any).__endingTest = false;
    }
    
    toast.loading('Running code...')
    
    try {
      console.log('Executing code with test cases:', currentChallenge.testCases?.length || 0)
      console.log('User code being executed:', userCode.substring(0, 200) + '...')
      
      const data = await codingTestService.executeCode(userCode, language, currentChallenge.testCases)
      console.log('Backend response:', data)

      // Handle the backend response format
      let results: CodeExecution[] = []
      
      if (data && data.results && Array.isArray(data.results)) {
        results = data.results.map((result: any, index: number) => ({
          success: result.success || false,
          output: result.output || '',
          error: result.error || null,
          executionTime: result.executionTime || 0,
          memoryUsage: result.memoryUsage || 0,
          input: currentChallenge.testCases[index]?.input || '',
          expectedOutput: currentChallenge.testCases[index]?.expectedOutput || ''
        }))
      } else if (data && data.success === false) {
        // Handle API error response
        const errorMessage = data.error || 'Code execution failed'
        results = currentChallenge.testCases.map((testCase) => ({
          success: false,
          output: 'Execution failed',
          error: errorMessage,
          executionTime: 0,
          memoryUsage: 0,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput
        }))
      } else {
        // Fallback: create failed results for each test case
        results = currentChallenge.testCases.map((testCase) => ({
          success: false,
          output: 'Execution failed',
          error: 'Unable to execute code - server error or invalid response',
          executionTime: 0,
          memoryUsage: 0,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput
        }))
      }
      
      setTestResults(results)
      
      const passedTests = results.filter(r => r.success).length
      const totalTests = results.length
      
      toast.dismiss()
      
      if (passedTests === totalTests && passedTests > 0) {
        toast.success(`All ${totalTests} test cases passed! 🎉`)
      } else if (passedTests > 0) {
        toast.success(`${passedTests}/${totalTests} test cases passed`)
      } else {
        toast.error(`${passedTests}/${totalTests} test cases passed - Check your code!`)
      }
    } catch (err) {
      console.error('Code execution error:', err)
      toast.dismiss()
      
      // Provide more specific error messages based on the actual error
      let errorMessage = 'Failed to execute code. Please check your syntax and try again.'
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch') || err.message.includes('network') || err.message.includes('ERR_CONNECTION_REFUSED')) {
          errorMessage = 'Connection error: Unable to reach the code execution server. Please check your internet connection and try again.'
          console.error('🔌 Backend connection failed - server may be down or network issue')
        } else if (err.message.includes('timeout')) {
          errorMessage = 'Code execution timed out. Your code may have an infinite loop.'
        } else if (err.message.includes('syntax')) {
          errorMessage = 'Syntax error in your code. Please check for typos and missing brackets.'
        } else if (err.message.includes('CORS')) {
          errorMessage = 'Cross-origin request blocked. Please refresh the page and try again.'
        } else {
          errorMessage = `Execution failed: ${err.message}`
        }
      }
      
      toast.error(errorMessage)
      
      // Set all tests as failed on execution error with more descriptive messages
      const failedResults: CodeExecution[] = currentChallenge.testCases.map((testCase, index) => ({
        success: false,
        output: 'Execution failed',
        error: `Test case ${index + 1}: ${err instanceof Error ? err.message : 'Code execution failed'}`,
        executionTime: 0,
        memoryUsage: 0,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput
      }))
      
      setTestResults(failedResults)
    }
  }

  // Function to handle solution submission
  const handleSubmitSolution = async () => {
    if (!currentChallenge || !code.trim()) {
      toast.error('Please write some code before submitting.')
      return
    }

    try {
      // Save the current solution
      const submission = {
        challengeId: currentChallenge.id,
        code: code,
        language: language,
        timestamp: new Date().toISOString(),
        testResults: testResults,
        timeElapsed: testStartTime ? Math.floor((new Date().getTime() - testStartTime.getTime()) / 1000) : 0
      }

      // Save to interview store
      saveResponse(`coding-test-submission-${currentChallenge.id}`, JSON.stringify(submission))
      
      // Optional: Also run the code to get latest test results
      if (currentChallenge.testCases && currentChallenge.testCases.length > 0) {
        await handleRunCode(code)
      }

      toast.success('Solution submitted successfully! You can continue working or end the test.')
      console.log('Solution submitted:', submission)
      
    } catch (error) {
      console.error('Error submitting solution:', error)
      toast.error('Failed to submit solution. Please try again.')
    }
  }

  // Countdown sequence function
  const startCountdownSequence = () => {
    let count = 3
    setCountdownValue(count)
    
    const countdownInterval = setInterval(() => {
      count--
      if (count > 0) {
        setCountdownValue(count)
      } else {
        clearInterval(countdownInterval)
        setCountdownValue(0)
        // Show "Start - Good Luck!" message
        setTimeout(() => {
          setShowCountdown(false)
          setTestReady(true)
        }, 1000)
      }
    }, 1000)
  }

  // Camera cleanup function
  const cleanupCamera = async () => {
    try {
      console.log('🧹 Starting comprehensive camera cleanup...')
      
      // Method 1: Use camera component ref to stop camera properly
      if (cameraPreviewRef.current) {
        console.log('🎥 Stopping camera via component ref')
        cameraPreviewRef.current.stopCamera()
      }
      
      // Method 2: Stop any existing streams from video elements
      const videoElements = document.querySelectorAll('video')
      videoElements.forEach(video => {
        if (video.srcObject) {
          const videoStream = video.srcObject as MediaStream
          if (videoStream && videoStream.getTracks) {
            videoStream.getTracks().forEach(track => {
              console.log('🛑 Stopping video track:', track.label, track.readyState)
              track.stop()
            })
          }
          video.srcObject = null
          video.load() // Force reload to clear the stream
          console.log('🧹 Cleared video srcObject and reloaded')
        }
      })
      
      // Method 3: Stop all media devices globally
      try {
        // Get all existing media tracks from navigator
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter(device => device.kind === 'videoinput')
        console.log(`📹 Found ${videoDevices.length} video devices - forcing stop`)
        
        // Force stop any active streams by requesting new ones and stopping them
        for (let i = 0; i < 3; i++) {
          try {
            const tempStream = await navigator.mediaDevices.getUserMedia({ 
              video: true, 
              audio: false 
            })
            tempStream.getTracks().forEach(track => {
              console.log('🛑 Stopping temp track:', track.label)
              track.stop()
            })
          } catch (e) {
            // Expected if no camera or already stopped
            break
          }
        }
      } catch (error) {
        console.log('ℹ️ No active media stream to stop:', error)
      }
      
      // Method 4: Clear any global stream references
      if ((window as any).activeMediaStreams) {
        const activeStreams = (window as any).activeMediaStreams || []
        activeStreams.forEach((stream: MediaStream) => {
          if (stream && stream.getTracks) {
            stream.getTracks().forEach((track: MediaStreamTrack) => {
              if (track.readyState === 'live') {
                console.log('🛑 Stopping global active track:', track.label)
                track.stop()
              }
            })
          }
        })
        delete (window as any).activeMediaStreams
      }
      
      // Method 5: Clear any CameraPreview component state
      const cameraPreviewElements = document.querySelectorAll('[data-camera-preview]')
      cameraPreviewElements.forEach(element => {
        (element as any).cleanup?.()
      })
      
      console.log('✅ Comprehensive camera cleanup completed - camera light should be off')
    } catch (error) {
      console.log('ℹ️ Camera cleanup completed with minor issues:', error)
    }
    
    // Add a small delay to ensure cleanup is processed
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  // Handle navigation away from coding test
  const handleBackToHome = async () => {
    console.log('🏠 Navigating back to home - ending coding test...')
    
    try {
      // Clean up camera and audio
      await cleanupCamera()
      
      // Clear any stored session data
      localStorage.removeItem('coding-session-id')
      localStorage.removeItem('coding-test-active')
      
      // Stop any running test timers
      setIsTestActive(false)
      
      console.log('🧹 Cleanup completed, navigating to home')
      navigate('/')
      
    } catch (error) {
      console.error('❌ Error during coding test cleanup:', error)
      // Even if cleanup fails, still navigate away
      navigate('/')
    }
  }

  // Cleanup effect for component unmount
  useEffect(() => {
    return () => {
      console.log('🧹 CodingTest component unmounting - cleaning up...')
      
      // Clear timer interval
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
        console.log('⏰ Timer interval cleared on unmount')
      }
      
      // Stop test timer
      setIsTestActive(false)
      // Force camera cleanup
      cleanupCamera()
      // Clear any stored session data
      localStorage.removeItem('coding-session-id')
      localStorage.removeItem('coding-test-active')
    }
  }, [])

  // Test backend connectivity
  const testBackendConnection = async () => {
    try {
      console.log('🔍 Testing backend connection...')
      const response = await fetch('http://localhost:3001/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Backend connection successful:', data)
        return true
      } else {
        console.error('❌ Backend health check failed:', response.status, response.statusText)
        return false
      }
    } catch (error) {
      console.error('❌ Backend connection test failed:', error)
      return false
    }
  }

  // Test connection on component mount
  useEffect(() => {
    testBackendConnection().then(isConnected => {
      if (!isConnected) {
        console.warn('⚠️ Backend connection test failed - code execution may not work')
      }
    })
  }, [])

  // Debug analysis modal state
  useEffect(() => {
    console.log('🔍 Analysis Modal state changed:', { 
      showAnalysis, 
      hasAnalysisData: !!analysisData, 
      testCompleted,
      isTestActive
    })
  }, [showAnalysis, analysisData, testCompleted, isTestActive])

  // Only show loading screen if actually loading AND test hasn't been completed yet
  if (isLoadingChallenge && !testCompleted && !showAnalysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-8 p-8"
        >
          <div className="relative">
            <div className="w-24 h-24 mx-auto bg-gradient-to-r from-green-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-2xl">
              <Loader2 className="h-12 w-12 text-white animate-spin" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full animate-pulse flex items-center justify-center">
              <Code className="h-4 w-4 text-white" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Preparing Your Coding Test
            </h2>
            <div className="space-y-2">
              <p className="text-xl text-green-600 dark:text-green-400 font-bold">
                {selectedTechStack === 'Generic' ? 'Data Structures & Algorithms Test' : `${selectedTechStack} Programming Test`}
              </p>
              <p className="text-lg text-blue-600 dark:text-blue-400 font-semibold">
                Difficulty: {selectedLevel}
              </p>
              <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                {selectedTechStack === 'Generic' ? 
                  'Generating a language-agnostic DSA challenge and starting the test automatically...' :
                  'Generating your challenge and starting the test automatically...'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                ⏱️ This typically takes 5-15 seconds
              </p>
            </div>
          </div>
          
          <div className="flex justify-center">
            <div className="flex space-x-2">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 bg-green-500 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </div>
          
          {loadingError && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 max-w-md mx-auto"
            >
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                <h3 className="font-bold text-red-800 dark:text-red-200">Loading Error</h3>
              </div>
              <p className="text-red-700 dark:text-red-300 mb-4">{loadingError}</p>
              <button
                onClick={() => {
                  setLoadingError(null)
                  fetchCodingChallenge()
                }}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors duration-200"
              >
                <RefreshCw className="h-4 w-4" />
                Retry Loading
              </button>
            </motion.div>
          )}
          
          <p className="text-sm text-gray-500 dark:text-gray-400">
            🤖 AI-generated coding challenges
          </p>
        </motion.div>
      </div>
    )
  }

  // Countdown Screen - only show if test is not completed
  if (showCountdown && !testCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.2 }}
          className="text-center space-y-12 p-8"
        >
          <div className="relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="w-48 h-48 mx-auto bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-2xl"
            >
              {countdownValue > 0 ? (
                <motion.span
                  key={countdownValue}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-8xl font-bold text-white"
                >
                  {countdownValue}
                </motion.span>
              ) : (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold text-white mb-2">START</div>
                  <div className="text-xl text-white/80">Good Luck!</div>
                </motion.div>
              )}
            </motion.div>
          </div>
          
          <div className="space-y-4">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-bold text-gray-900 dark:text-white"
            >
              {countdownValue > 0 ? 'Get Ready!' : 'Starting Coding Test'}
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-2"
            >
              <p className="text-xl text-green-600 dark:text-green-400 font-bold">
                {selectedTechStack === 'Generic' ? 'Data Structures & Algorithms' : selectedTechStack} • {selectedLevel} Level
              </p>
              <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                {countdownValue > 0 
                  ? 'Your coding challenge is ready and waiting!'
                  : 'Your coding test is beginning now...'
                }
              </p>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex justify-center space-x-4"
          >
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="w-4 h-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    )
  }

  // Don't show main test until countdown is complete, but always show after test completion or when analysis modal should appear
  if (!testReady && !testCompleted && !showAnalysis) {
    return null
  }

  // If analysis modal is showing and test is completed, only show the modal (hide main UI)
  if (showAnalysis && analysisData && testCompleted) {
    return (
      <>
        {/* Analysis Modal Only - Main UI Hidden */}
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
            style={{ zIndex: 9999 }}
            onClick={() => {
              console.log('🎯 Background clicked - closing analysis modal')
              setShowAnalysis(false)
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200/50 dark:border-gray-700/50"
              onClick={(e) => e.stopPropagation()}
            >
              <EnhancedEvaluation
                evaluation={analysisData}
                onClose={() => {
                  console.log('🔒 Analysis modal closed - navigating home')
                  setShowAnalysis(false)
                  navigate('/')
                }}
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900">
        {/* Header */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-xl border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <button 
                  onClick={handleBackToHome}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-all duration-200 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  aria-label="Return to home page"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="font-semibold">Back to Home</span>
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Coding Test
                  </h1>
                  <p className="text-lg text-green-600 dark:text-green-400 font-semibold">
                    {selectedTechStack === 'Generic' ? 'DSA Challenge' : `${selectedTechStack} Challenge`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                {/* Connection Test Button - only show if needed */}
                {!isTestActive && (
                  <button
                    onClick={async () => {
                      toast.loading('Testing connection...')
                      const isConnected = await testBackendConnection()
                      toast.dismiss()
                      if (isConnected) {
                        toast.success('✅ Backend connection successful!')
                      } else {
                        toast.error('❌ Backend connection failed. Please check if the server is running.')
                      }
                    }}
                    className="inline-flex items-center space-x-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/50 rounded-xl transition-all duration-200 text-blue-700 dark:text-blue-300 text-sm"
                    title="Test backend connectivity"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Test Connection</span>
                  </button>
                )}
                
                {isTestActive && (
                  <div className="flex items-center space-x-4 bg-white/50 dark:bg-gray-700/50 px-4 py-2 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-gray-500" />
                      <span className="font-bold text-orange-600 dark:text-orange-400">
                        {formatTime(timeRemaining)}
                      </span>
                    </div>
                    {testResults.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <Award className="h-5 w-5 text-green-500" />
                        <span className="font-bold text-green-600 dark:text-green-400">
                          {passedTests}/{totalTests}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        {isTestActive && currentChallenge && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Test Progress</h3>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {calculateProgress()}% Complete
                </span>
              </div>
              <ProgressBar 
                progress={calculateProgress()} 
                color="green"
                size="md"
                animated={true}
                showPercentage={false}
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                <span>Time: {Math.round(((currentChallenge.timeLimit || 30) * 60 - timeRemaining) / ((currentChallenge.timeLimit || 30) * 60) * 100)}%</span>
                <span>Tests: {testResults.length > 0 ? Math.round((passedTests / testResults.length) * 100) : 0}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Debug info when test is completed but modal not showing */}
          {testCompleted && !showAnalysis && (
            <div className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg p-4 mb-4">
              <h3 className="font-bold text-red-800 dark:text-red-200">Debug: Test Completed but Modal Not Showing</h3>
              <div className="text-sm text-red-700 dark:text-red-300 mt-2">
                <div>Test Completed: {String(testCompleted)}</div>
                <div>Show Analysis: {String(showAnalysis)}</div>
                <div>Has Analysis Data: {String(!!analysisData)}</div>
                <div>Is Test Active: {String(isTestActive)}</div>
                <button 
                  onClick={() => {
                    console.log('🔧 Debug: Forcing analysis modal to show')
                    setShowAnalysis(true)
                  }}
                  className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm"
                >
                  Force Show Modal
                </button>
              </div>
            </div>
          )}
          
          {currentChallenge && (
            <div>
              {isTestActive ? (
                /* Active Test */
                <div className="grid lg:grid-cols-2 gap-6 min-h-[600px]">
                  {/* Left Panel - Question Details */}
                  <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-y-auto min-h-[400px] max-h-[85vh]">
                    <div className="space-y-6">
                      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          {currentChallenge.title}
                        </h2>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                          currentChallenge.difficulty === 'Easy' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            : currentChallenge.difficulty === 'Medium'
                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {currentChallenge.difficulty}
                        </span>
                        <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
                          {selectedTechStack}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Problem Description</h3>
                        <div 
                          className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-2"
                          style={{ whiteSpace: 'pre-wrap' }}
                        >
                          {currentChallenge.description}
                        </div>
                      </div>

                      {currentChallenge.examples && currentChallenge.examples.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Examples</h3>
                          <div className="space-y-3">
                            {currentChallenge.examples.map((example, index) => (
                              <div key={index} className="bg-white/80 dark:bg-gray-700/80 rounded-lg p-3 border-l-4 border-blue-500">
                                <div className="space-y-2">
                                  <div>
                                    <span className="text-blue-700 dark:text-blue-300 font-medium">Input:</span>
                                    <code className="ml-2 font-mono text-sm bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                                      {example.input}
                                    </code>
                                  </div>
                                  <div>
                                    <span className="text-green-700 dark:text-green-300 font-medium">Output:</span>
                                    <code className="ml-2 font-mono text-sm bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                                      {example.output}
                                    </code>
                                  </div>
                                  {example.explanation && (
                                    <div>
                                      <span className="text-purple-700 dark:text-purple-300 font-medium">Explanation:</span>
                                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                        {example.explanation}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Hints Section */}
                      {currentChallenge.hints && currentChallenge.hints.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">💡 Hints</h3>
                          <div className="space-y-2">
                            {currentChallenge.hints.map((hint, index) => (
                              <div key={index} className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                                <div className="flex items-start space-x-2">
                                  <span className="text-yellow-600 dark:text-yellow-400 font-bold text-sm">
                                    Hint {index + 1}:
                                  </span>
                                  <span className="text-yellow-800 dark:text-yellow-200 text-sm">
                                    {hint}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Test Cases Display */}
                      {currentChallenge.testCases && currentChallenge.testCases.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Test Cases</h3>
                          <div className="space-y-3">
                            {currentChallenge.testCases.slice(0, 3).map((testCase, index) => (
                              <div key={index} className="bg-white/80 dark:bg-gray-700/80 rounded-lg p-3 border-l-4 border-purple-500">
                                <div className="space-y-2">
                                  <div className="font-medium text-purple-700 dark:text-purple-300">
                                    Test Case {index + 1}
                                  </div>
                                  {testCase.description && (
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                      {testCase.description}
                                    </div>
                                  )}
                                  <div>
                                    <span className="text-blue-700 dark:text-blue-300 font-medium">Input:</span>
                                    <code className="ml-2 font-mono text-sm bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                                      {typeof testCase.input === 'object' ? JSON.stringify(testCase.input) : String(testCase.input)}
                                    </code>
                                  </div>
                                  <div>
                                    <span className="text-green-700 dark:text-green-300 font-medium">Expected:</span>
                                    <code className="ml-2 font-mono text-sm bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                                      {typeof testCase.expectedOutput === 'object' ? JSON.stringify(testCase.expectedOutput) : String(testCase.expectedOutput)}
                                    </code>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {currentChallenge.testCases.length > 3 && (
                              <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
                                + {currentChallenge.testCases.length - 3} more test cases (hidden during test)
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Panel - Code Editor */}
                  <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden flex flex-col min-h-[400px] max-h-[85vh]">
                    
                    {/* Header Section with Language Selector */}
                    <div className="bg-gray-50/80 dark:bg-gray-700/80 border-b border-gray-200/50 dark:border-gray-600/50 p-3 flex-shrink-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {selectedTechStack === 'Generic' ? (
                            <select
                              value={language}
                              onChange={(e) => handleLanguageChange(e.target.value)}
                              className="px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-sm"
                            >
                              <option value="javascript">JavaScript</option>
                              <option value="python">Python</option>
                              <option value="java">Java</option>
                              <option value="cpp">C++</option>
                            </select>
                          ) : (
                            <div className="px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-lg text-sm font-medium border border-blue-200 dark:border-blue-800">
                              {selectedTechStack === 'C++' ? 'C++' : selectedTechStack}
                            </div>
                          )}
                        </div>
                        
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {code.length} characters
                        </div>
                      </div>
                    </div>

                    {/* Code Editor - Takes most of the space */}
                    <div className="flex-1 min-h-0 overflow-hidden">
                      <CodeEditor
                        value={code}
                        language={language}
                        onChange={setCode}
                        onExecute={() => handleRunCode(code)}
                        boilerplateCode={getBoilerplateSync(currentChallenge, language)}
                        hideLanguageDisplay={true}
                        className="h-full"
                      />
                    </div>



                    {/* Test Results Section - Below Code Editor */}
                    {testResults.length > 0 && (
                      <div className="bg-gray-50/80 dark:bg-gray-700/80 border-t border-gray-200/50 dark:border-gray-600/50 flex-shrink-0">
                        <div 
                          className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-600/50 transition-colors"
                          onClick={() => setIsTestResultsCollapsed(!isTestResultsCollapsed)}
                        >
                          <div className="flex items-center space-x-2">
                            <svg 
                              className={`w-4 h-4 transition-transform ${isTestResultsCollapsed ? 'rotate-0' : 'rotate-90'}`}
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Test Results ({passedTests}/{totalTests} passed)
                            </h3>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            passedTests === totalTests 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                              : passedTests > 0
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                          }`}>
                            {Math.round((passedTests / totalTests) * 100)}%
                          </span>
                        </div>
                        
                        {!isTestResultsCollapsed && (
                          <div className="px-3 pb-3 max-h-48 overflow-y-auto">
                            <div className="space-y-2">
                              {testResults.map((result, index) => (
                                <div
                                  key={index}
                                  className={`p-2 rounded border-l-4 text-xs ${
                                    result.success
                                      ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                                      : 'bg-red-50 dark:bg-red-900/20 border-red-500'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                      Test Case {index + 1}
                                    </span>
                                    <span className={`font-bold ${
                                      result.success ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                      {result.success ? 'PASSED' : 'FAILED'}
                                    </span>
                                  </div>
                                  
                                  <div className="space-y-1">
                                    <div>
                                      <span className="font-medium text-gray-600 dark:text-gray-400">Input:</span>
                                      <code className="ml-1 px-1 bg-gray-100 dark:bg-gray-700 rounded">
                                        {typeof result.input === 'object' ? JSON.stringify(result.input) : String(result.input || '')}
                                      </code>
                                    </div>
                                    <div>
                                      <span className="font-medium text-gray-600 dark:text-gray-400">Expected:</span>
                                      <code className="ml-1 px-1 bg-gray-100 dark:bg-gray-700 rounded">
                                        {typeof result.expectedOutput === 'object' ? JSON.stringify(result.expectedOutput) : String(result.expectedOutput || '')}
                                      </code>
                                    </div>
                                    <div>
                                      <span className="font-medium text-gray-600 dark:text-gray-400">Output:</span>
                                      <code className={`ml-1 px-1 rounded ${
                                        result.success 
                                          ? 'bg-green-100 dark:bg-green-900/30' 
                                          : 'bg-red-100 dark:bg-red-900/30'
                                      }`}>
                                        {result.output || 'No output'}
                                      </code>
                                    </div>
                                    {result.error && (
                                      <div>
                                        <span className="font-medium text-red-600 dark:text-red-400">Error:</span>
                                        <code className="ml-1 px-1 bg-red-100 dark:bg-red-900/30 rounded text-red-700 dark:text-red-300">
                                          {result.error}
                                        </code>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Submit and End Test Buttons - Always visible at bottom */}
                    <div className="bg-gray-50/80 dark:bg-gray-700/80 border-t border-gray-200/50 dark:border-gray-600/50 p-4 flex-shrink-0">
                      <div className="flex justify-center space-x-4">
                        <button
                          onClick={handleSubmitSolution}
                          className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium shadow-md hover:shadow-lg"
                        >
                          <Save className="h-4 w-4" />
                          <span>Submit Solution</span>
                        </button>
                        <button
                          onClick={handleEndTest}
                          className="inline-flex items-center space-x-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium shadow-md hover:shadow-lg"
                        >
                          <Square className="h-4 w-4" />
                          <span>End Test</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Draggable Camera Preview - only when test is active */}
          {isTestActive && (
            <div
              ref={cameraRef}
              className={`fixed z-40 ${
                isCameraMinimized 
                  ? 'w-20 h-16' 
                  : 'w-56 h-40'
              } bg-black rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 cursor-move transition-all duration-300`}
              style={{
                left: `${cameraPosition.x}px`,
                top: `${cameraPosition.y}px`,
              }}
              onMouseDown={handleMouseDown}
            >
              {/* Camera controls */}
              <div className="absolute top-1 right-1 z-50 flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsCameraMinimized(!isCameraMinimized)
                  }}
                  className="w-6 h-6 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white text-xs"
                  title={isCameraMinimized ? "Maximize camera" : "Minimize camera"}
                >
                  {isCameraMinimized ? '□' : '_'}
                </button>
              </div>
              
              {/* Camera preview */}
              {!isCameraMinimized && (
                <CameraPreview
                  ref={cameraPreviewRef}
                  isVisible={true}
                  onToggle={() => {}}
                  className="w-full h-full"
                  isDraggable={true}
                />
              )}
              
              {/* Minimized state indicator */}
              {isCameraMinimized && (
                <div className="w-full h-full flex items-center justify-center text-white text-xs">
                  📹
                </div>
              )}
              
              {/* Recording indicator */}
              <div className="absolute top-1 left-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>

        {/* Analysis Modal */}
        <AnimatePresence mode="wait">
          {(() => {
            const shouldShow = showAnalysis && analysisData && testCompleted
            console.log('🔍 Analysis Modal render check:', {
              showAnalysis,
              hasAnalysisData: !!analysisData,
              testCompleted,
              shouldShow
            })
            return shouldShow
          })() && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
              style={{ zIndex: 9999 }}
              onClick={() => {
                console.log('🎯 Background clicked - closing analysis modal')
                setShowAnalysis(false)
              }}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 50 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative z-[10000]"
                style={{ zIndex: 10000 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col gap-6">
                  {/* Analysis Content */}
                  <div className="p-6">
                    <div className="text-center mb-6">
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        🎯 Test Complete!
                      </h2>
                      <p className="text-lg text-gray-600 dark:text-gray-400">
                        Here's your coding test analysis
                      </p>
                    </div>
                    
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {analysisData?.overallScore || 0}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Overall Score</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {analysisData?.passedTests || 0}/{analysisData?.totalTests || 0}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Tests Passed</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {analysisData?.duration || '0m 0s'}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Time Taken</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {analysisData?.codeQuality || 0}/100
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Code Quality</div>
                      </div>
                    </div>
                    
                    {/* Feedback */}
                    <div className="space-y-4">
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Overall Feedback</h3>
                        <p className="text-gray-700 dark:text-gray-300">
                          {analysisData.overallFeedback || 'Test completed successfully!'}
                        </p>
                      </div>
                      
                      {analysisData.strengths && analysisData.strengths.length > 0 && (
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                          <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">✅ Strengths</h3>
                          <ul className="list-disc list-inside space-y-1 text-green-700 dark:text-green-300">
                            {analysisData.strengths.map((strength: string, index: number) => (
                              <li key={index}>{strength}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {analysisData.improvements && analysisData.improvements.length > 0 && (
                        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
                          <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">🎯 Areas for Improvement</h3>
                          <ul className="list-disc list-inside space-y-1 text-orange-700 dark:text-orange-300">
                            {analysisData.improvements.map((improvement: string, index: number) => (
                              <li key={index}>{improvement}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Footer Buttons */}
                  <div className="flex justify-between items-center gap-4 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>🎉 Coding test completed successfully!</span>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setShowAnalysis(false)
                          navigate('/')
                        }}
                        className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Return Home
                      </button>
                      <button
                        onClick={() => {
                          setShowAnalysis(false)
                          navigate('/dashboard')
                        }}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 shadow-lg"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2v-4a2 2 0 00-2-2h-2a2 2 0 00-2 2v4a2 2 0 002 2m-6 0h6" />
                        </svg>
                        Go to Dashboard
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <CodingTestGuidelinesOverlay
          isOpen={showGuidelinesOverlay}
          onClose={() => setShowGuidelinesOverlay(false)}
          onProceed={() => setShowGuidelinesOverlay(false)}
          techStack={selectedTechStack}
          level={selectedLevel}
        />
      </div>
    </>
  )
}