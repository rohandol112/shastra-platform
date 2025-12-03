"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface LiveTimerProps {
  endTime: string
  className?: string
}

export function LiveTimer({ endTime, className }: LiveTimerProps) {
  const [timeLeft, setTimeLeft] = useState("")
  const [isWarning, setIsWarning] = useState(false)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const end = new Date(endTime).getTime()
      const diff = end - now

      if (diff <= 0) {
        return "00:00:00"
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      // Warning when less than 10 minutes
      setIsWarning(diff <= 10 * 60 * 1000)

      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }

    setTimeLeft(calculateTimeLeft())
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(interval)
  }, [endTime])

  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-2 font-mono text-xl font-bold",
        isWarning
          ? "animate-pulse border-destructive/50 bg-destructive/10 text-destructive"
          : "border-border bg-card text-foreground",
        className,
      )}
    >
      {timeLeft} remaining
    </div>
  )
}
