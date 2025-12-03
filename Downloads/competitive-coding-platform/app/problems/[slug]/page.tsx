"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/ui/navbar"
import { Button } from "@/components/ui/button"
import { ProblemPanel } from "@/components/workspace/problem-panel"
import { CodeEditor } from "@/components/workspace/code-editor"
import { ResultDrawer, type ResultStatus } from "@/components/workspace/result-drawer"
import { mockUser, mockProblems, mockSubmissions } from "@/lib/mock-data"
import { ArrowLeft, Maximize2, Minimize2, Layout } from "lucide-react"

export default function ProblemWorkspace() {
  const params = useParams()
  const slug = params.slug as string

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
  const [isFullscreen, setIsFullscreen] = useState(false)

  const problem = mockProblems.find((p) => p.slug === slug)
  const problemSubmissions = mockSubmissions.filter((s) => s.problemId === problem?.id)

  if (!problem) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 text-6xl">404</div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">Problem not found</h1>
          <p className="mb-6 text-muted-foreground">This problem seems to have vanished into the void.</p>
          <Link href="/problems">
            <Button>Back to Problems</Button>
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
      error:
        randomOutcome === "RUNTIME_ERROR"
          ? "TypeError: Cannot read property 'length' of undefined\n    at solution (line 5)"
          : undefined,
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
      {!isFullscreen && <Navbar user={mockUser} />}

      {/* Workspace Header */}
      <div className="flex items-center justify-between border-b border-border/50 bg-card/30 px-4 py-2">
        <div className="flex items-center gap-4">
          <Link href="/problems">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Problems</span>
            </Button>
          </Link>

          <div className="h-5 w-px bg-border/50" />

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{problem.title}</span>
            <span
              className={`rounded px-2 py-0.5 text-xs font-medium ${
                problem.difficulty === "EASY"
                  ? "bg-success/10 text-success"
                  : problem.difficulty === "MEDIUM"
                    ? "bg-warning/10 text-warning"
                    : "bg-destructive/10 text-destructive"
              }`}
            >
              {problem.difficulty}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSplitPosition(50)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            aria-label="Reset layout"
          >
            <Layout className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Split Workspace */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Problem Panel */}
        <div className="overflow-hidden" style={{ width: `${splitPosition}%` }}>
          <ProblemPanel problem={problem} submissions={problemSubmissions} />
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
        >
          <div className="absolute inset-y-0 -left-1 -right-1" />
        </div>

        {/* Code Editor */}
        <div className="relative overflow-hidden" style={{ width: `${100 - splitPosition}%` }}>
          <CodeEditor onRun={handleRun} onSubmit={handleSubmit} isRunning={isRunning} isSubmitting={isSubmitting} />

          {/* Result Drawer */}
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
      </div>
    </div>
  )
}
