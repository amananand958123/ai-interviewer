import { motion } from 'framer-motion'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  animation?: boolean
  count?: number
}

export default function Skeleton({ 
  className = '', 
  variant = 'rectangular',
  animation = true,
  count = 1 
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700'
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  }

  const shimmerVariants = {
    hidden: { opacity: 0.6 },
    visible: {
      opacity: 1,
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatType: "reverse" as const,
        ease: "easeInOut"
      }
    }
  }

  const SkeletonElement = ({ index }: { index: number }) => (
    <motion.div
      key={index}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      variants={animation ? shimmerVariants : undefined}
      initial={animation ? "hidden" : undefined}
      animate={animation ? "visible" : undefined}
      style={{
        animationDelay: animation ? `${index * 0.1}s` : undefined
      }}
    />
  )

  if (count === 1) {
    return <SkeletonElement index={0} />
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }, (_, index) => (
        <SkeletonElement key={index} index={index} />
      ))}
    </div>
  )
}

// Pre-built skeleton components for common use cases
export function CardSkeleton() {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4">
      <Skeleton variant="circular" className="w-12 h-12" />
      <Skeleton variant="text" className="w-3/4" />
      <Skeleton variant="text" className="w-full" count={2} />
      <Skeleton variant="rectangular" className="w-1/2 h-8" />
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton variant="text" className="w-1/2" />
        <Skeleton variant="circular" className="w-8 h-8" />
      </div>
      <Skeleton variant="text" className="w-1/3 h-8" />
      <Skeleton variant="text" className="w-1/4" />
    </div>
  )
}

export function ListItemSkeleton() {
  return (
    <div className="flex items-center space-x-4 p-4">
      <Skeleton variant="circular" className="w-10 h-10" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" className="w-3/4" />
        <Skeleton variant="text" className="w-1/2" />
      </div>
      <Skeleton variant="rectangular" className="w-16 h-8" />
    </div>
  )
}
