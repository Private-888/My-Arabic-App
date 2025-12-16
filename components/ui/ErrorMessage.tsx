interface ErrorMessageProps {
  message: string
  onRetry?: () => void
  className?: string
}

export function ErrorMessage({
  message,
  onRetry,
  className = '',
}: ErrorMessageProps) {
  return (
    <div
      className={`bg-red-900/50 border border-red-700 rounded-xl p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl">⚠️</div>
        <div className="flex-1">
          <p className="text-red-400 font-semibold mb-1">Error</p>
          <p className="text-red-300 text-sm">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 text-red-400 hover:text-red-300 text-sm font-medium underline"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

