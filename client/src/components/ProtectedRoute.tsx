import { ReactNode, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

interface ProtectedRouteProps {
  children: ReactNode
  requireAuth?: boolean
}

export default function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
  const { isAuthenticated, initializeAuth } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    // Initialize auth state from localStorage/cookies when component mounts
    initializeAuth()
  }, [initializeAuth])

  useEffect(() => {
    if (requireAuth && !isAuthenticated) {
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, requireAuth, navigate])

  // If auth is required and user is not authenticated, don't render anything
  // (navigation will happen in useEffect)
  if (requireAuth && !isAuthenticated) {
    return null
  }

  return <>{children}</>
}
