import { motion } from 'framer-motion'

interface ProgressBarProps {
  progress: number // 0-100
  label?: string
  color?: string
  size?: 'sm' | 'md' | 'lg'
  showPercentage?: boolean
  animated?: boolean
}

export default function ProgressBar({ 
  progress, 
  label, 
  color = 'blue', 
  size = 'md',
  showPercentage = true,
  animated = true
}: ProgressBarProps) {
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6'
  }

  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500'
  }

  const backgroundColorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/20',
    green: 'bg-green-100 dark:bg-green-900/20',
    purple: 'bg-purple-100 dark:bg-purple-900/20',
    orange: 'bg-orange-100 dark:bg-orange-900/20',
    red: 'bg-red-100 dark:bg-red-900/20'
  }

  return (
    <div className="space-y-2">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center">
          {label && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {Math.round(progress)}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full rounded-full overflow-hidden ${sizeClasses[size]} ${backgroundColorClasses[color as keyof typeof backgroundColorClasses]}`}>
        <motion.div
          className={`h-full rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          transition={{ 
            duration: animated ? 0.8 : 0,
            ease: "easeOut" 
          }}
        />
      </div>
    </div>
  )
}
