"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, Clock, AlertTriangle, ChevronDown, Zap, HardDrive } from "lucide-react"
import { cn } from "@/lib/utils"
import Confetti from "react-confetti"
import { useState, useEffect } from "react"

export type ResultStatus = "ACCEPTED" | "WRONG_ANSWER" | "TIME_LIMIT" | "RUNTIME_ERROR" | "COMPILE_ERROR" | null

interface ResultDrawerProps {
  isOpen: boolean
  onClose: () => void
  status: ResultStatus
  runtime?: string
  memory?: string
  output?: string
  expected?: string
  error?: string
  testCasesPassed?: number
  totalTestCases?: number
}

const statusConfig = {
  ACCEPTED: {
    icon: Check,
    label: "Accepted",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    gradient: "from-emerald-500/20 to-emerald-500/5",
  },
  WRONG_ANSWER: {
    icon: X,
    label: "Wrong Answer",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    gradient: "from-red-500/20 to-red-500/5",
  },
  TIME_LIMIT: {
    icon: Clock,
    label: "Time Limit Exceeded",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    gradient: "from-amber-500/20 to-amber-500/5",
  },
  RUNTIME_ERROR: {
    icon: AlertTriangle,
    label: "Runtime Error",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    gradient: "from-red-500/20 to-red-500/5",
  },
  COMPILE_ERROR: {
    icon: AlertTriangle,
    label: "Compile Error",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    gradient: "from-red-500/20 to-red-500/5",
  },
}

export function ResultDrawer({
  isOpen,
  onClose,
  status,
  runtime,
  memory,
  output,
  expected,
  error,
  testCasesPassed,
  totalTestCases,
}: ResultDrawerProps) {
  const [showConfetti, setShowConfetti] = useState(false)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (status === "ACCEPTED" && isOpen) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 4000)
    }
  }, [status, isOpen])

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight })
  }, [])

  if (!isOpen || !status) return null

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <>
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={300}
          gravity={0.2}
          colors={["#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#d1fae5"]}
        />
      )}

      <div className="absolute inset-x-0 bottom-0 z-50 overflow-hidden rounded-t-2xl border-t border-border/50 bg-card/95 shadow-2xl backdrop-blur-xl">
        {/* Gradient top border */}
        <div className={cn("h-1 w-full bg-gradient-to-r", config.gradient)} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl",
                config.bgColor,
                "ring-1 ring-inset",
                config.borderColor,
              )}
            >
              <Icon className={cn("h-6 w-6", config.color)} />
            </div>
            <div>
              <Badge
                className={cn(
                  "mb-1 border font-semibold text-sm px-3 py-1",
                  config.borderColor,
                  config.bgColor,
                  config.color,
                )}
              >
                {config.label}
              </Badge>
              {testCasesPassed !== undefined && totalTestCases !== undefined && (
                <p className="text-sm text-muted-foreground">
                  <span className={status === "ACCEPTED" ? "text-emerald-400" : "text-red-400"}>{testCasesPassed}</span>
                  /{totalTestCases} test cases passed
                </p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-9 w-9 rounded-lg">
            <ChevronDown className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="max-h-64 overflow-y-auto border-t border-border/30 px-6 py-4">
          {status === "ACCEPTED" && (
            <div className="flex gap-8">
              {runtime && (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Runtime</p>
                    <p className="text-xl font-bold text-foreground">{runtime}</p>
                  </div>
                </div>
              )}
              {memory && (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                    <HardDrive className="h-5 w-5 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Memory</p>
                    <p className="text-xl font-bold text-foreground">{memory}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {status === "WRONG_ANSWER" && (
            <div className="grid gap-4 md:grid-cols-2">
              {output && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Your Output
                  </p>
                  <pre className="overflow-x-auto rounded-xl bg-[#0d1117] p-4 font-mono text-sm text-red-400 ring-1 ring-red-500/20">
                    {output}
                  </pre>
                </div>
              )}
              {expected && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Expected</p>
                  <pre className="overflow-x-auto rounded-xl bg-[#0d1117] p-4 font-mono text-sm text-emerald-400 ring-1 ring-emerald-500/20">
                    {expected}
                  </pre>
                </div>
              )}
            </div>
          )}

          {(status === "COMPILE_ERROR" || status === "RUNTIME_ERROR") && error && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Error Details</p>
              <pre className="overflow-x-auto rounded-xl bg-[#0d1117] p-4 font-mono text-sm text-red-400 ring-1 ring-red-500/20">
                {error}
              </pre>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
