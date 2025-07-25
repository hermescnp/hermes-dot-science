interface LoadingSpinnerProps {
  text?: string
  className?: string
}

export function LoadingSpinner({ text = "Loading...", className = "" }: LoadingSpinnerProps) {
  return (
    <div className={`min-h-screen flex items-center justify-center bg-[#0A1727] ${className}`}>
      <div className="flex items-center gap-3">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#68DBFF] mr-3"></div>
        <span className="text-[#68DBFF] text-lg">{text}</span>
      </div>
    </div>
  )
} 