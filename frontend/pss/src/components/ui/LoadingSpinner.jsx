import clsx from 'clsx'

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
}

function LoadingSpinner({ size = 'md' }) {
  return (
    <div className="flex items-center justify-center">
      <div
        className={clsx(
          'animate-spin rounded-full border-4 border-brand-500 border-t-transparent',
          sizeClasses[size] || sizeClasses.md,
        )}
      />
    </div>
  )
}

export default LoadingSpinner
