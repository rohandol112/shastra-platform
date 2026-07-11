"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface CountdownTimerProps {
  targetDate: string
  className?: string
  size?: "sm" | "md" | "lg"
  showLabels?: boolean
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function CountdownTimer({ targetDate, className, size = "md", showLabels = true }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    setIsExpired(false)
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const target = new Date(targetDate).getTime()
      const diff = target - now

      if (diff <= 0) {
        setIsExpired(true)
        return { days: 0, hours: 0, minutes: 0, seconds: 0 }
      }

      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      }
    }

    setTimeLeft(calculateTimeLeft())
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(interval)
  }, [targetDate])

  if (isExpired) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 font-semibold text-emerald-400",
          className,
        )}
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        Contest Started!
      </div>
    )
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <TimeUnit value={timeLeft.days} label="Days" size={size} showLabels={showLabels} />
      <Separator size={size} />
      <TimeUnit value={timeLeft.hours} label="Hours" size={size} showLabels={showLabels} />
      <Separator size={size} />
      <TimeUnit value={timeLeft.minutes} label="Mins" size={size} showLabels={showLabels} />
      <Separator size={size} />
      <TimeUnit value={timeLeft.seconds} label="Secs" size={size} showLabels={showLabels} isLast />
    </div>
  )
}

function Separator({ size }: { size: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  }

  return <span className={cn("font-bold text-muted-foreground/50", sizeClasses[size])}>:</span>
}

function TimeUnit({
  value,
  label,
  size,
  showLabels,
  isLast,
}: {
  value: number
  label: string
  size: "sm" | "md" | "lg"
  showLabels: boolean
  isLast?: boolean
}) {
  const containerClasses = {
    sm: "min-w-[3rem] p-2",
    md: "min-w-[4rem] p-3",
    lg: "min-w-[5rem] p-4",
  }

  const valueClasses = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-5xl",
  }

  const labelClasses = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-sm",
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-border/50 bg-gradient-to-b from-card to-card/50 text-center backdrop-blur-sm",
        containerClasses[size],
      )}
    >
      <div
        className={cn("font-mono font-bold tabular-nums text-foreground", valueClasses[size], isLast && "text-primary")}
      >
        {value.toString().padStart(2, "0")}
      </div>
      {showLabels && (
        <div className={cn("mt-1 font-medium uppercase tracking-wider text-muted-foreground", labelClasses[size])}>
          {label}
        </div>
      )}
    </div>
  )
}
