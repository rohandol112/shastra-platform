"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, Clock, AlertTriangle, ChevronDown, Zap, HardDrive, Loader2, Terminal } from "lucide-react"
import { cn } from "@/lib/utils"
import Confetti from "react-confetti"
import { useState, useEffect } from "react"
import type { WorkspaceResult } from "@/lib/stores/workspace-store"

interface ResultDrawerProps {
  isOpen: boolean
  onClose: () => void
  result: WorkspaceResult | null
}

const statusConfig: Record<
  string,
  { icon: any; label: string; color: string; bgColor: string; borderColor: string; gradient: string; spin?: boolean }
> = {
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
  TIME_LIMIT_EXCEEDED: {
    icon: Clock,
    label: "Time Limit Exceeded",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    gradient: "from-amber-500/20 to-amber-500/5",
  },
  MEMORY_LIMIT_EXCEEDED: {
    icon: HardDrive,
    label: "Memory Limit Exceeded",
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
  PARTIAL: {
    icon: Check,
    label: "Partially Accepted",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    gradient: "from-amber-500/20 to-amber-500/5",
  },
  FAILED: {
    icon: AlertTriangle,
    label: "Failed",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    gradient: "from-red-500/20 to-red-500/5",
  },
  QUEUED: {
    icon: Loader2,
    label: "Still Judging…",
    color: "text-sky-400",
    bgColor: "bg-sky-500/10",
    borderColor: "border-sky-500/30",
    gradient: "from-sky-500/20 to-sky-500/5",
    spin: true,
  },
  RUNNING: {
    icon: Loader2,
    label: "Running…",
    color: "text-sky-400",
    bgColor: "bg-sky-500/10",
    borderColor: "border-sky-500/30",
    gradient: "from-sky-500/20 to-sky-500/5",
    spin: true,
  },
}

const fallbackConfig = {
  icon: Terminal,
  label: "Result",
  color: "text-foreground",
  bgColor: "bg-muted/30",
  borderColor: "border-border/50",
  gradient: "from-muted/40 to-muted/10",
}

export function ResultDrawer({ isOpen, onClose, result }: ResultDrawerProps) {
  const [showConfetti, setShowConfetti] = useState(false)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  const status = result?.status ?? null
  const isAccepted = status === "ACCEPTED"

  useEffect(() => {
    // Confetti only for real submissions, not sample runs
    if (isAccepted && result?.kind === "submit" && isOpen) {
      setShowConfetti(true)
      const t = setTimeout(() => setShowConfetti(false), 4000)
      return () => clearTimeout(t)
    }
  }, [isAccepted, result?.kind, isOpen])

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight })
  }, [])

  if (!isOpen || !result || !status) return null

  const config = statusConfig[status] ?? { ...fallbackConfig, label: String(status).replace(/_/g, " ") }
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
              <Icon className={cn("h-6 w-6", config.color, config.spin && "animate-spin")} />
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
                {result.kind === "run" ? `Run: ${config.label}` : config.label}
              </Badge>
              {result.testCasesPassed !== undefined && result.totalTestCases !== undefined && (
                <p className="text-sm text-muted-foreground">
                  <span className={isAccepted ? "text-emerald-400" : "text-red-400"}>{result.testCasesPassed}</span>/
                  {result.totalTestCases} test cases passed
                </p>
              )}
              {result.score !== undefined && result.score !== null && result.kind === "submit" && (
                <p className="text-sm text-muted-foreground">Score: {result.score}</p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-9 w-9 rounded-lg">
            <ChevronDown className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="max-h-64 overflow-y-auto border-t border-border/30 px-6 py-4">
          {/* Runtime / memory row */}
          {(result.runtime || result.memory) && (
            <div className="mb-4 flex gap-8">
              {result.runtime && (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Runtime</p>
                    <p className="text-xl font-bold text-foreground">{result.runtime}</p>
                  </div>
                </div>
              )}
              {result.memory && (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                    <HardDrive className="h-5 w-5 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Memory</p>
                    <p className="text-xl font-bold text-foreground">{result.memory}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* stdout (mainly for Run) */}
          {result.stdout && (
            <div className="mb-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Output</p>
              <pre className="overflow-x-auto rounded-xl bg-[#0d1117] p-4 font-mono text-sm text-foreground ring-1 ring-border/40 whitespace-pre-wrap">
                {result.stdout}
              </pre>
            </div>
          )}

          {/* Compile errors */}
          {result.compileOutput && (
            <div className="mb-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Compiler Output
              </p>
              <pre className="overflow-x-auto rounded-xl bg-[#0d1117] p-4 font-mono text-sm text-red-400 ring-1 ring-red-500/20 whitespace-pre-wrap">
                {result.compileOutput}
              </pre>
            </div>
          )}

          {/* stderr */}
          {result.stderr && (
            <div className="mb-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Error Details
              </p>
              <pre className="overflow-x-auto rounded-xl bg-[#0d1117] p-4 font-mono text-sm text-red-400 ring-1 ring-red-500/20 whitespace-pre-wrap">
                {result.stderr}
              </pre>
            </div>
          )}

          {/* Nothing to show */}
          {!result.stdout && !result.stderr && !result.compileOutput && !result.runtime && !result.memory && (
            <p className="text-sm text-muted-foreground">
              {status === "QUEUED" || status === "RUNNING"
                ? "Your submission is in the judging queue. Check the Submissions tab in a moment."
                : "No output produced."}
            </p>
          )}
        </div>
      </div>
    </>
  )
}
