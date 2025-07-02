import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number // in milliseconds, 0 = permanent
  action?: {
    label: string
    onClick: () => void
  }
}

interface NotificationSystemProps {
  notifications: Notification[]
  onRemove: (id: string) => void
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center'
}

export default function NotificationSystem({ 
  notifications, 
  onRemove, 
  position = 'top-right' 
}: NotificationSystemProps) {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2'
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-50 space-y-2 max-w-sm w-full`}>
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onRemove={onRemove}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

function NotificationCard({ 
  notification, 
  onRemove 
}: { 
  notification: Notification
  onRemove: (id: string) => void 
}) {
  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        onRemove(notification.id)
      }, notification.duration)

      return () => clearTimeout(timer)
    }
  }, [notification.duration, notification.id, onRemove])

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  }

  const colors = {
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      icon: 'text-green-600 dark:text-green-400',
      text: 'text-green-800 dark:text-green-200'
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      icon: 'text-red-600 dark:text-red-400',
      text: 'text-red-800 dark:text-red-200'
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      icon: 'text-yellow-600 dark:text-yellow-400',
      text: 'text-yellow-800 dark:text-yellow-200'
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      icon: 'text-blue-600 dark:text-blue-400',
      text: 'text-blue-800 dark:text-blue-200'
    }
  }

  const Icon = icons[notification.type]
  const colorScheme = colors[notification.type]

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      layout
      className={`
        ${colorScheme.bg} ${colorScheme.border} ${colorScheme.text}
        border rounded-2xl p-4 shadow-lg backdrop-blur-sm
        max-w-sm w-full
      `}
    >
      <div className="flex items-start space-x-3">
        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${colorScheme.icon}`} />
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm">{notification.title}</h4>
          {notification.message && (
            <p className="text-sm opacity-90 mt-1">{notification.message}</p>
          )}
          
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className={`
                text-sm font-medium underline mt-2 hover:no-underline
                ${colorScheme.icon}
              `}
            >
              {notification.action.label}
            </button>
          )}
        </div>

        <button
          onClick={() => onRemove(notification.id)}
          className={`
            p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 
            transition-colors flex-shrink-0 ${colorScheme.icon}
          `}
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification: Notification = {
      id,
      duration: 5000, // default 5 seconds
      ...notification
    }
    setNotifications(prev => [...prev, newNotification])
    return id
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  // Convenience methods
  const success = (title: string, message?: string, options?: Partial<Notification>) =>
    addNotification({ ...options, type: 'success', title, message })

  const error = (title: string, message?: string, options?: Partial<Notification>) =>
    addNotification({ ...options, type: 'error', title, message })

  const warning = (title: string, message?: string, options?: Partial<Notification>) =>
    addNotification({ ...options, type: 'warning', title, message })

  const info = (title: string, message?: string, options?: Partial<Notification>) =>
    addNotification({ ...options, type: 'info', title, message })

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info
  }
}
