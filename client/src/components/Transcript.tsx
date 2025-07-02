import { useRef, useEffect } from 'react'
import { useSpeechStore } from '../stores/speechStore'
import { Download, Copy, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface TranscriptProps {
  className?: string
}

export default function Transcript({ className = '' }: TranscriptProps) {
  const { transcript, clearTranscript } = useSpeechStore()
  const transcriptRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new content is added
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
    }
  }, [transcript])

  const copyTranscript = async () => {
    try {
      await navigator.clipboard.writeText(transcript)
      toast.success('Transcript copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy transcript')
    }
  }

  const downloadTranscript = () => {
    const blob = new Blob([transcript], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `interview-transcript-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Transcript downloaded!')
  }

  const handleClearTranscript = () => {
    clearTranscript()
    toast.success('Transcript cleared')
  }

  return (
    <div className={`card ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Interview Transcript
        </h3>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={copyTranscript}
            disabled={!transcript}
            className="btn btn-outline p-2 disabled:opacity-50"
            title="Copy transcript"
          >
            <Copy className="h-4 w-4" />
          </button>
          
          <button
            onClick={downloadTranscript}
            disabled={!transcript}
            className="btn btn-outline p-2 disabled:opacity-50"
            title="Download transcript"
          >
            <Download className="h-4 w-4" />
          </button>
          
          <button
            onClick={handleClearTranscript}
            disabled={!transcript}
            className="btn btn-outline p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
            title="Clear transcript"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div 
        ref={transcriptRef}
        className="transcript-container"
      >
        {transcript ? (
          <div className="space-y-2">
            {transcript.split('\n').filter(line => line.trim()).map((line, index) => {
              const isUserMessage = line.includes('You:')
              const isAIMessage = line.includes('AI Interviewer:')
              
              return (
                <div
                  key={index}
                  className={`p-2 rounded ${
                    isUserMessage 
                      ? 'bg-blue-50 border-l-4 border-blue-500 dark:bg-blue-900/20 dark:border-blue-400' 
                      : isAIMessage
                      ? 'bg-green-50 border-l-4 border-green-500 dark:bg-green-900/20 dark:border-green-400'
                      : 'bg-gray-50 dark:bg-gray-800'
                  }`}
                >
                  <span className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {line}
                  </span>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <p>No transcript available yet.</p>
            <p className="text-sm mt-1">Start speaking to see the conversation transcript here.</p>
          </div>
        )}
      </div>
    </div>
  )
}
