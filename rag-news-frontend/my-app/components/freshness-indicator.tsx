"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Clock, AlertCircle, CheckCircle } from "lucide-react"

export function FreshnessIndicator() {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [status, setStatus] = useState<"fresh" | "stale" | "unknown">("unknown")

  useEffect(() => {
    // Check for last rebuild timestamp in localStorage
    const lastRebuild = localStorage.getItem("last-index-rebuild")
    if (lastRebuild) {
      const date = new Date(lastRebuild)
      setLastUpdate(date)

      const hoursAgo = (Date.now() - date.getTime()) / (1000 * 60 * 60)
      setStatus(hoursAgo < 6 ? "fresh" : "stale")
    } else {
      // Mock initial state
      const mockDate = new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      setLastUpdate(mockDate)
      setStatus("fresh")
    }
  }, [])

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    }

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
      return `${diffInHours}h ago`
    }

    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  const getStatusIcon = () => {
    switch (status) {
      case "fresh":
        return <CheckCircle className="h-3 w-3 text-green-600" />
      case "stale":
        return <AlertCircle className="h-3 w-3 text-orange-600" />
      default:
        return <Clock className="h-3 w-3 text-muted-foreground" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case "fresh":
        return "bg-green-100 text-green-800 border-green-200"
      case "stale":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      {getStatusIcon()}
      <span className="hidden sm:inline">Index updated</span>
      <Badge variant="outline" className={getStatusColor()}>
        {lastUpdate ? formatTimeAgo(lastUpdate) : "Unknown"}
      </Badge>
    </div>
  )
}
