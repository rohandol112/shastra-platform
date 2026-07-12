"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Navbar } from "@/components/ui/navbar"
import { Button } from "@/components/ui/button"
import { ProblemPanel } from "@/components/workspace/problem-panel"
import { CodeEditor } from "@/components/workspace/code-editor"
import { ResultDrawer } from "@/components/workspace/result-drawer"
import { ArrowLeft, Maximize2, Minimize2, Layout, Loader2 } from "lucide-react"
import { useProblemStore } from "@/lib/stores/problem-store"
import { useWorkspaceStore } from "@/lib/stores/workspace-store"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useIsMobile } from "@/hooks/use-mobile"
import { submissionsApi, type SubmissionSummary } from "@/lib/api"

export default function ProblemWorkspace() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const { detail: problem, detailLoading, detailError, fetchProblem } = useProblemStore()
  const token = useAuthStore((s) => s.token)
  const hydrated = useAuthStore((s) => s.hydrated)

  const {
    language,
    isRunning,
    isSubmitting,
    result,
    resultOpen,
    setLanguage,
    getCode,
    setCode,
    resetCode,
    runCode,
    submitCode,
    closeResult,
  } = useWorkspaceStore()

  const [splitPosition, setSplitPosition] = useState(45)
  const isMobile = useIsMobile()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [mySubmissions, setMySubmissions] = useState<SubmissionSummary[]>([])
  const [submissionsLoading, setSubmissionsLoading] = useState(false)

  // subscribing to drafts keeps `getCode` output fresh across edits
  const drafts = useWorkspaceStore((s) => s.drafts)
  const code = getCode(slug)
  void drafts

  useEffect(() => {
    if (hydrated) fetchProblem(slug)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, hydrated])

  const loadSubmissions = useCallback(async () => {
    if (!token || !problem) return
    setSubmissionsLoading(true)
    try {
      const data = await submissionsApi.my({ problemId: problem.id, limit: 20 })
      setMySubmissions(data.submissions)
    } catch {
      // non-critical
    } finally {
      setSubmissionsLoading(false)
    }
  }, [token, problem])

  useEffect(() => {
    loadSubmissions()
  }, [loadSubmissions])

  const requireAuth = (): boolean => {
    if (!token) {
      toast.error("Please sign in to run or submit code")
      router.push(`/login?redirect=/problems/${slug}`)
      return false
    }
    return true
  }

  const handleRun = async (customStdin?: string) => {
    if (!requireAuth() || !problem) return
    // Custom input wins; otherwise use the first visible sample test case
    const stdin = customStdin ?? problem.sampleTestCases[0]?.input ?? ""
    await runCode(slug, stdin)
  }

  const handleSubmit = async () => {
    if (!requireAuth() || !problem) return
    const verdict = await submitCode(slug, problem.id)
    if (verdict) {
      if (verdict.status === "ACCEPTED") {
        toast.success("Accepted! Great job 🎉")
      }
      loadSubmissions()
    }
  }

  if (!hydrated || detailLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (detailError || !problem) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 text-6xl">404</div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">Problem not found</h1>
          <p className="mb-6 text-muted-foreground">
            {detailError || "This problem seems to have vanished into the void."}
          </p>
          <Link href="/problems">
            <Button>Back to Problems</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {!isFullscreen && <Navbar />}
      {!isFullscreen && <div className="h-20" />}

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

      {/* Split Workspace — side-by-side on desktop, stacked on mobile */}
      <div className="relative flex flex-1 flex-col overflow-hidden md:flex-row">
        {/* Problem Panel */}
        <div
          className="h-[45%] shrink-0 overflow-hidden border-b border-border/50 md:h-auto md:shrink md:border-b-0"
          style={isMobile ? undefined : { width: `${splitPosition}%` }}
        >
          <ProblemPanel
            problem={problem}
            submissions={mySubmissions}
            submissionsLoading={submissionsLoading}
            isLoggedIn={!!token}
          />
        </div>

        {/* Resize Handle (desktop only) */}
        <div
          className="group relative hidden w-1 cursor-col-resize bg-border/30 transition-colors hover:bg-primary md:block"
          onMouseDown={(e) => {
            e.preventDefault()
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
        <div
          className="relative flex-1 overflow-hidden"
          style={isMobile ? undefined : { width: `${100 - splitPosition}%` }}
        >
          <CodeEditor
            code={code}
            language={language}
            onCodeChange={(next) => setCode(slug, next)}
            onLanguageChange={setLanguage}
            onReset={() => resetCode(slug)}
            onRun={handleRun}
            onSubmit={handleSubmit}
            isRunning={isRunning}
            isSubmitting={isSubmitting}
          />

          {/* Result Drawer */}
          <ResultDrawer isOpen={resultOpen} onClose={closeResult} result={result} />
        </div>
      </div>
    </div>
  )
}
