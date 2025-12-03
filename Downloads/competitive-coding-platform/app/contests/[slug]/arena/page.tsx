"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LiveTimer } from "@/components/contest/live-timer"
import { MiniLeaderboard } from "@/components/contest/mini-leaderboard"
import { ProblemPanel } from "@/components/workspace/problem-panel"
import { CodeEditor } from "@/components/workspace/code-editor"
import { ResultDrawer, type ResultStatus } from "@/components/workspace/result-drawer"
import { mockProblems, mockContests, mockLeaderboard, mockSubmissions } from "@/lib/mock-data"
import { ArrowLeft, AlertTriangle, Check, Trophy, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

const contestProblems = mockProblems.slice(0, 4).map((p, index) => ({
  ...p,
  id: `contest-prob-${index}`,
  label: String.fromCharCode(65 + index),
  points: (index + 1) * 100,
  bonus: index === 0 ? 20 : 0,
}))

export default function ContestArena() {
  const params = useParams()
  const slug = params.slug as string

  const [activeProblem, setActiveProblem] = useState(contestProblems[0])
  const [isRunning, setIsRunning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resultOpen, setResultOpen] = useState(false)
  const [result, setResult] = useState<{
    status: ResultStatus
    runtime?: string
    memory?: string
    output?: string
    expected?: string
    error?: string
    testCasesPassed?: number
    totalTestCases?: number
  }>({ status: null })
  const [splitPosition, setSplitPosition] = useState(45)
  const [solvedProblems, setSolvedProblems] = useState<Set<string>>(new Set())

  const contest = mockContests.find((c) => c.slug === slug)
  const isContestRunning = contest?.status === "RUNNING"

  if (!contest) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 text-6xl font-bold text-muted-foreground/20">404</div>
          <h1 className="text-2xl font-bold text-foreground">Contest not found</h1>
          <Link href="/contests" className="mt-6 inline-block">
            <Button>Back to Contests</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!isContestRunning) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-warning/10 mx-auto">
            <AlertTriangle className="h-10 w-10 text-warning" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Contest Not Active</h1>
          <p className="mt-2 text-muted-foreground">This contest is not currently running</p>
          <Link href="/contests" className="mt-6 inline-block">
            <Button>Back to Contests</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleRun = async (code: string, language: string) => {
    setIsRunning(true)
    setResultOpen(false)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const outcomes: ResultStatus[] = ["ACCEPTED", "WRONG_ANSWER", "RUNTIME_ERROR"]
    const randomOutcome = outcomes[Math.floor(Math.random() * outcomes.length)] as ResultStatus

    setResult({
      status: randomOutcome,
      runtime: randomOutcome === "ACCEPTED" ? "52ms" : undefined,
      memory: randomOutcome === "ACCEPTED" ? "14.2 MB" : undefined,
      output: randomOutcome === "WRONG_ANSWER" ? "[0, 2]" : undefined,
      expected: randomOutcome === "WRONG_ANSWER" ? "[0, 1]" : undefined,
      error: randomOutcome === "RUNTIME_ERROR" ? "TypeError: Cannot read property 'length' of undefined" : undefined,
      testCasesPassed: randomOutcome === "ACCEPTED" ? 3 : 1,
      totalTestCases: 3,
    })
    setResultOpen(true)
    setIsRunning(false)
  }

  const handleSubmit = async (code: string, language: string) => {
    setIsSubmitting(true)
    setResultOpen(false)
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const isAccepted = Math.random() > 0.3

    if (isAccepted && activeProblem) {
      setSolvedProblems((prev) => new Set(prev).add(activeProblem.id))
    }

    setResult({
      status: isAccepted ? "ACCEPTED" : "WRONG_ANSWER",
      runtime: isAccepted ? "48ms" : undefined,
      memory: isAccepted ? "13.8 MB" : undefined,
      output: !isAccepted ? "[1, 3]" : undefined,
      expected: !isAccepted ? "[0, 1]" : undefined,
      testCasesPassed: isAccepted ? 52 : 45,
      totalTestCases: 52,
    })
    setResultOpen(true)
    setIsSubmitting(false)
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Contest Header */}
      <header className="flex items-center justify-between border-b border-border/50 bg-card/50 px-4 py-2">
        <div className="flex items-center gap-4">
          <Link href="/contests">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Exit</span>
            </Button>
          </Link>
          <div className="h-5 w-px bg-border/50" />
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-warning" />
            <span className="font-medium text-foreground">{contest.title}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-destructive/10 px-4 py-1.5">
          <Clock className="h-4 w-4 text-destructive" />
          <LiveTimer endTime={contest.endTime} />
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-success/30 bg-success/10 text-success">
            <Check className="mr-1 h-3 w-3" />
            {solvedProblems.size}/{contestProblems.length}
          </Badge>
        </div>
      </header>

      {/* Problem Tabs */}
      <div className="border-b border-border/50 bg-card/30 px-4">
        <div className="flex gap-1 overflow-x-auto py-2">
          {contestProblems.map((problem) => {
            const isSolved = solvedProblems.has(problem.id)
            const isActive = activeProblem?.id === problem.id

            return (
              <button
                key={problem.id}
                onClick={() => setActiveProblem(problem)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : isSolved
                      ? "bg-success/10 text-success hover:bg-success/20"
                      : "bg-secondary/50 text-secondary-foreground hover:bg-secondary",
                )}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-background/20 text-xs font-bold">
                  {problem.label}
                </span>
                <span className="hidden sm:inline">{problem.title}</span>
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs",
                    isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-background/50",
                  )}
                >
                  {problem.points}
                </Badge>
                {isSolved && !isActive && <Check className="h-4 w-4" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Split Workspace */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Problem Panel */}
        <div className="overflow-hidden" style={{ width: `${splitPosition}%` }}>
          {activeProblem && (
            <ProblemPanel
              problem={activeProblem}
              submissions={mockSubmissions.filter((s) => s.problemId === activeProblem.id)}
            />
          )}
        </div>

        {/* Resize Handle */}
        <div
          className="group relative w-1 cursor-col-resize bg-border/30 transition-colors hover:bg-primary"
          onMouseDown={(e) => {
            const startX = e.clientX
            const startPosition = splitPosition

            const handleMouseMove = (e: MouseEvent) => {
              const delta = e.clientX - startX
              const containerWidth = window.innerWidth
              const newPosition = startPosition + (delta / containerWidth) * 100
              setSplitPosition(Math.min(Math.max(newPosition, 20), 80))
            }

            const handleMouseUp = () => {
              document.removeEventListener("mousemove", handleMouseMove)
              document.removeEventListener("mouseup", handleMouseUp)
            }

            document.addEventListener("mousemove", handleMouseMove)
            document.addEventListener("mouseup", handleMouseUp)
          }}
        />

        {/* Code Editor */}
        <div className="relative overflow-hidden" style={{ width: `${100 - splitPosition}%` }}>
          <CodeEditor onRun={handleRun} onSubmit={handleSubmit} isRunning={isRunning} isSubmitting={isSubmitting} />

          <ResultDrawer
            isOpen={resultOpen}
            onClose={() => setResultOpen(false)}
            status={result.status}
            runtime={result.runtime}
            memory={result.memory}
            output={result.output}
            expected={result.expected}
            error={result.error}
            testCasesPassed={result.testCasesPassed}
            totalTestCases={result.totalTestCases}
          />
        </div>

        {/* Mini Leaderboard */}
        <MiniLeaderboard entries={mockLeaderboard} currentUserId="u5" />
      </div>
    </div>
  )
}
