import React from "react"
import { CheckCircle, AlertTriangle, X } from "lucide-react"

interface StatusMessageProps {
  message: string | null
  type: "success" | "error" | undefined
  onClear: () => void
}

export const StatusMessage: React.FC<StatusMessageProps> = ({ message, type, onClear }) => {
  if (!message) return null

  const isSuccess = type === "success"
  const containerClasses = `flex items-center justify-between p-3 rounded-lg text-sm animate-in fade-in slide-in-from-bottom-4 duration-300 ${
    isSuccess ? "bg-green-500/10 border border-green-500/20 text-green-700" : "bg-red-500/10 border border-red-500/20 text-red-700"
  }`
  const Icon = isSuccess ? CheckCircle : AlertTriangle

  return (
    <div className={containerClasses}>
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5" />
        <span className="font-medium">{message}</span>
      </div>
      <button onClick={onClear} className="p-1 rounded-full hover:bg-white/20 transition-colors">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
