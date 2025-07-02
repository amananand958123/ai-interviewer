import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import { Camera, CameraOff, Video, Play, Pause } from 'lucide-react'

interface CameraPreviewProps {
  isVisible?: boolean
  onToggle?: (enabled: boolean) => void
  className?: string
  showBackgroundImage?: boolean
  isDraggable?: boolean // New prop to enable dragging
}

export interface CameraPreviewHandle {
  stopCamera: () => void
}

const CameraPreview = forwardRef<CameraPreviewHandle, CameraPreviewProps>(({ 
  isVisible = false, // Default to false for home page  
  onToggle,
  className = '',
  showBackgroundImage = false,
  isDraggable = false // New prop
}, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isEnabled, setIsEnabled] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isVideoReady, setIsVideoReady] = useState(false)
  const [videoKey, setVideoKey] = useState(0) // Key to force video re-render

  const startCamera = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Stop any existing stream first - more thorough cleanup
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
        setStream(null)
      }
      
      // Also clean up any stream in video element
      if (videoRef.current && videoRef.current.srcObject) {
        const existingStream = videoRef.current.srcObject as MediaStream
        if (existingStream && existingStream.getTracks) {
          existingStream.getTracks().forEach(track => track.stop())
        }
        videoRef.current.srcObject = null
      }
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser')
      }

      // Request camera permissions
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
          facingMode: 'user'
        },
        audio: false
      })
      
      // Set the new stream
      setStream(mediaStream)
      setIsVideoReady(false)
      setVideoKey(prev => prev + 1) // Force video element refresh
      
      if (videoRef.current) {
        // Assign the stream to video element
        videoRef.current.srcObject = mediaStream
        
        // Wait for the video to be ready and play it
        try {
          await videoRef.current.play()
          setIsVideoReady(true)
        } catch (playError) {
          console.warn('Autoplay failed, video will play when user interacts:', playError)
          setIsVideoReady(true)
        }
      }
      
      setIsEnabled(true)
      setIsPaused(false)
      onToggle?.(true)
    } catch (err: any) {
      console.error('Error accessing camera:', err)
      let errorMessage = 'Unable to access camera. '
      
      if (err.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera permissions and try again.'
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'No camera found on this device.'
      } else if (err.name === 'NotReadableError') {
        errorMessage += 'Camera is being used by another application.'
      } else {
        errorMessage += err.message || 'Unknown error occurred.'
      }
      
      setError(errorMessage)
      setIsEnabled(false)
      setIsPaused(false)
      onToggle?.(false)
    } finally {
      setIsLoading(false)
    }
  }

  const pauseCamera = () => {
    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause()
      setIsPaused(true)
    }
  }

  const resumeCamera = () => {
    if (videoRef.current && videoRef.current.paused) {
      videoRef.current.play()
      setIsPaused(false)
    }
  }

  const stopCamera = () => {
    console.log('🛑 stopCamera() called - aggressively stopping all camera streams')
    
    // Stop all tracks in the current stream state
    if (stream) {
      console.log('🔴 Stopping stream tracks:', stream.getTracks().length)
      stream.getTracks().forEach((track) => {
        console.log('Stopping track:', track.kind, track.readyState)
        track.stop()
      })
      setStream(null)
    }
    
    // Also check if video element has a stream and stop it
    if (videoRef.current && videoRef.current.srcObject) {
      const videoStream = videoRef.current.srcObject as MediaStream
      if (videoStream && videoStream.getTracks) {
        console.log('🔴 Stopping video element tracks:', videoStream.getTracks().length)
        videoStream.getTracks().forEach((track) => {
          console.log('Stopping video track:', track.kind, track.readyState)
          track.stop()
        })
      }
      videoRef.current.pause()
      videoRef.current.srcObject = null
      videoRef.current.load() // Force reload to clear any cached stream
    }
    
    // Global attempt to stop any remaining camera streams
    try {
      console.log('🔴 Attempting global camera cleanup')
      // Force garbage collection of any remaining streams
      if (window.navigator && window.navigator.mediaDevices) {
        // This will help identify if there are any remaining active streams
        window.navigator.mediaDevices.enumerateDevices().then(devices => {
          console.log('� Available devices after stop:', devices.filter(d => d.kind === 'videoinput').length)
        }).catch(console.warn)
      }
    } catch (e) {
      console.log('Could not perform global cleanup:', e)
    }
    
    // Reset all states
    setIsEnabled(false)
    setIsPaused(false)
    setError(null)
    setIsVideoReady(false)
    onToggle?.(false)
    
    console.log('✅ stopCamera() completed - all states reset')
  }

  // Expose stopCamera function to parent components
  useImperativeHandle(ref, () => ({
    stopCamera
  }))

  const toggleCamera = () => {
    if (!isEnabled) {
      // Camera is off, start it
      startCamera()
    } else if (isPaused) {
      // Camera is paused, resume it
      resumeCamera()
    } else {
      // Camera is running, pause it
      pauseCamera()
    }
  }

  useEffect(() => {
    console.log('🎥 CameraPreview useEffect triggered:', { isVisible, isEnabled, error: !!error, showBackgroundImage })
    
    // Auto-start camera when component becomes visible (for coding test monitoring)
    // But NOT when showBackgroundImage is true (home page)
    if (isVisible && !isEnabled && !error && !showBackgroundImage) {
      console.log('Camera component became visible - auto-starting camera for monitoring')
      startCamera()
    }
    // Stop camera when component becomes invisible - IMMEDIATELY AND AGGRESSIVELY
    else if (!isVisible) {
      console.log('🛑 Camera component became invisible - stopping camera IMMEDIATELY')
      
      // Immediate, aggressive stop
      if (stream) {
        console.log('🔴 IMMEDIATE: stopping stream tracks:', stream.getTracks().length)
        stream.getTracks().forEach((track) => {
          console.log('IMMEDIATE stopping track:', track.kind, track.readyState)
          track.stop()
        })
        setStream(null)
      }
      
      if (videoRef.current && videoRef.current.srcObject) {
        const videoStream = videoRef.current.srcObject as MediaStream
        if (videoStream && videoStream.getTracks) {
          console.log('🔴 IMMEDIATE: stopping video element tracks:', videoStream.getTracks().length)
          videoStream.getTracks().forEach((track) => {
            console.log('IMMEDIATE stopping video track:', track.kind, track.readyState)
            track.stop()
          })
        }
        videoRef.current.pause()
        videoRef.current.srcObject = null
        videoRef.current.load() // Force reload to clear any cached stream
      }
      
      // Reset all states immediately
      setIsEnabled(false)
      setIsPaused(false)
      setError(null)
      setIsVideoReady(false)
      onToggle?.(false)
      
      console.log('✅ IMMEDIATE camera stop completed')
    }
    
    return () => {
      // Cleanup on unmount - ensure all streams are stopped
      console.log('🧹 CameraPreview cleanup function called')
      
      if (stream) {
        console.log('🔴 Cleanup: stopping stream tracks')
        stream.getTracks().forEach(track => {
          console.log('Cleanup stopping track:', track.kind, track.readyState)
          track.stop()
        })
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const videoStream = videoRef.current.srcObject as MediaStream
        if (videoStream && videoStream.getTracks) {
          console.log('🔴 Cleanup: stopping video element tracks')
          videoStream.getTracks().forEach(track => {
            console.log('Cleanup stopping video track:', track.kind, track.readyState)
            track.stop()
          })
        }
        videoRef.current.srcObject = null
      }
      
      console.log('✅ CameraPreview cleanup completed')
    }
  }, [isVisible, isEnabled, error, showBackgroundImage])

  // Effect to handle stream changes
  useEffect(() => {
    if (videoRef.current && stream && isEnabled) {
      const video = videoRef.current
      
      // Only set srcObject if it's different from current
      if (video.srcObject !== stream) {
        video.srcObject = stream
        setIsVideoReady(false)
        
        // Try to play the video
        video.play().catch((error) => {
          console.warn('Video play failed:', error)
          // Don't set error state for autoplay failures
        })
      }
    } else if (videoRef.current && !stream) {
      // Clear the video when no stream
      videoRef.current.srcObject = null
      setIsVideoReady(false)
    }
  }, [stream, isEnabled])

  // Always return null when not visible, except on home page with background image
  if (!isVisible) {
    // If we're not showing background image, return null (this will unmount and cleanup)
    if (!showBackgroundImage) {
      // Force stop camera before unmounting
      if (stream || (videoRef.current && videoRef.current.srcObject)) {
        console.log('🔴 Forcing camera stop before unmount')
        // Stop any active streams immediately
        if (stream) {
          stream.getTracks().forEach(track => track.stop())
        }
        if (videoRef.current && videoRef.current.srcObject) {
          const videoStream = videoRef.current.srcObject as MediaStream
          if (videoStream && videoStream.getTracks) {
            videoStream.getTracks().forEach(track => track.stop())
          }
          videoRef.current.srcObject = null
        }
      }
      return null
    }
    // If showing background image (home page), continue to render
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Camera Preview Container */}
      <div className={`relative w-full h-full bg-gray-900 overflow-hidden rounded-lg ${isDraggable ? 'cursor-move' : ''}`}>
        {isEnabled && !error ? (
          <>
            <video
              key={videoKey}
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }} // Mirror effect for selfie view
              onLoadedMetadata={() => {
                setIsVideoReady(true)
                // Ensure video plays when metadata is loaded
                if (videoRef.current && !isPaused) {
                  videoRef.current.play().catch(console.error)
                }
              }}
              onError={(e) => {
                console.error('Video element error:', e)
                setError('Video playback error')
                setIsVideoReady(false)
              }}
            />
            {!isVideoReady && !isPaused && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="text-center text-white">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-1"></div>
                  <p className="text-xs">Loading video...</p>
                </div>
              </div>
            )}
            {isPaused && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
                <div className="text-center text-white">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Video className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-sm font-semibold mb-1">Paused</p>
                  <p className="text-xs opacity-80">Click play to resume</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-900 min-h-[240px] relative overflow-hidden rounded-lg">
            {/* Background Image - only show on home page */}
            {showBackgroundImage && (
              <>
                <img 
                  src="/bk.jpeg" 
                  alt="Camera off background"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ filter: 'brightness(0.6) contrast(1.1)' }}
                />
                
                {/* Dark overlay for better text readability */}
                <div className="absolute inset-0 bg-black bg-opacity-30"></div>
              </>
            )}
            
            {/* Overlay content */}
            <div className="relative z-10">
              {isLoading ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-1"></div>
                  <p className="text-xs text-white font-semibold drop-shadow-md">Starting Camera...</p>
                </div>
              ) : error ? (
                <div className="text-center p-2">
                  <CameraOff className="h-6 w-6 text-white mx-auto mb-1 drop-shadow-md" />
                  <p className="text-xs text-white max-w-[120px] leading-tight font-semibold drop-shadow-md">{error}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      startCamera()
                    }}
                    className="mt-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md font-semibold shadow-lg transition-colors duration-200"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <div className="text-center p-2">
                  <Camera className="h-6 w-6 text-white mx-auto mb-1 drop-shadow-md" />
                  <p className="text-xs text-white mb-2 font-semibold drop-shadow-md">Camera Off</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      startCamera()
                    }}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-md font-semibold shadow-lg transition-colors duration-200"
                  >
                    Start Camera
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Camera Controls Overlay */}
        <div className="absolute bottom-1 left-1 right-1 flex justify-between items-center z-20">
          <div className="flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleCamera()
              }}
              disabled={isLoading}
              className={`
                p-1.5 rounded-full transition-all duration-200 shadow-md text-xs
                ${!isEnabled 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : isPaused
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                }
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
              `}
              aria-label={
                !isEnabled 
                  ? 'Turn on camera' 
                  : isPaused 
                  ? 'Resume camera' 
                  : 'Pause camera'
              }
            >
              {!isEnabled ? (
                <Camera className="h-3 w-3" />
              ) : isPaused ? (
                <Play className="h-3 w-3" />
              ) : (
                <Pause className="h-3 w-3" />
              )}
            </button>
            
            {isEnabled && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  stopCamera()
                }}
                disabled={isLoading}
                className="p-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all duration-200 shadow-md hover:scale-105"
                aria-label="Stop camera"
              >
                <CameraOff className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Removed Camera Status text */}
    </div>
  )
})

CameraPreview.displayName = 'CameraPreview'

export default CameraPreview
