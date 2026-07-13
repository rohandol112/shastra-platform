"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { LiveTimer } from "@/components/contest/live-timer"
import { MiniLeaderboard } from "@/components/contest/mini-leaderboard"
import { ProblemPanel } from "@/components/workspace/problem-panel"
import { CodeEditor } from "@/components/workspace/code-editor"
import { ResultDrawer } from "@/components/workspace/result-drawer"
import { ArrowLeft, AlertTriangle, Check, Trophy, Clock, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useContestStore } from "@/lib/stores/contest-store"
import { useWorkspaceStore } from "@/lib/stores/workspace-store"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useIsMobile } from "@/hooks/use-mobile"
import { problemsApi, submissionsApi, type ProblemDetail, type SubmissionSummary } from "@/lib/api"

export default function ContestArena() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const { detail: contest, detailLoading, detailError, fetchContest, leaderboard, fetchLeaderboard } =
    useContestStore()
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
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
    runSamples,
    submitCode,
    closeResult,
  } = useWorkspaceStore()

  const [activeSlug, setActiveSlug] = useState<string | null>(null)
  const [problemCache, setProblemCache] = useState<Record<string, ProblemDetail>>({})
  const [problemLoading, setProblemLoading] = useState(false)
  const [solvedProblems, setSolvedProblems] = useState<Set<string>>(new Set())
  const [mySubmissions, setMySubmissions] = useState<SubmissionSummary[]>([])
  const [splitPosition, setSplitPosition] = useState(45)
  const isMobile = useIsMobile()

  const drafts = useWorkspaceStore((s) => s.drafts)
  void drafts

  // Load contest
  useEffect(() => {
    if (hydrated) fetchContest(slug)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, hydrated, token])

  const contestProblems = useMemo(
    () => (contest?.problems ?? []).slice().sort((a, b) => a.orderIndex - b.orderIndex),
    [contest]
  )

  // Pick the first problem once the contest arrives
  useEffect(() => {
    if (!activeSlug && contestProblems.length > 0) {
      setActiveSlug(contestProblems[0].slug)
    }
  }, [contestProblems, activeSlug])

  // Fetch active problem details (cached)
  useEffect(() => {
    if (!activeSlug || problemCache[activeSlug]) return
    setProblemLoading(true)
    problemsApi
      .bySlug(activeSlug)
      .then((detail) => setProblemCache((prev) => ({ ...prev, [activeSlug]: detail })))
      .catch(() => toast.error("Failed to load problem"))
      .finally(() => setProblemLoading(false))
  }, [activeSlug, problemCache])

  // Poll leaderboard while the contest is running
  useEffect(() => {
    if (!contest?.id || contest.status !== "RUNNING") return
    fetchLeaderboard(contest.id)
    const interval = setInterval(() => fetchLeaderboard(contest.id), 30_000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contest?.id, contest?.status])

  // Load my contest submissions (to mark solved problems)
  const loadMySubmissions = useCallback(async () => {
    if (!token || !contest?.id) return
    try {
      const data = await submissionsApi.my({ contestId: contest.id, limit: 100 })
      setMySubmissions(data.submissions)
      const solved = new Set<string>()
      data.submissions.forEach((s) => {
        if (s.status === "ACCEPTED" && s.problem?.slug) solved.add(s.problem.slug)
      })
      setSolvedProblems(solved)
    } catch {
      // non-critical
    }
  }, [token, contest?.id])

  useEffect(() => {
    loadMySubmissions()
  }, [loadMySubmissions])

  const activeProblem = activeSlug ? problemCache[activeSlug] : null
  const activeContestProblem = contestProblems.find((p) => p.slug === activeSlug)

  const handleRun = async (customStdin?: string) => {
    if (!token) {
      toast.error("Please sign in first")
      router.push(`/login?redirect=/contests/${slug}/arena`)
      return
    }
    if (!activeProblem || !activeSlug) return
    // No custom input → run all visible sample cases with pass/fail; custom
    // input → single run against that stdin. Hidden cases are never involved.
    if (customStdin === undefined) {
      await runSamples(activeSlug, activeProblem.id)
    } else {
      await runCode(activeSlug, customStdin)
    }
  }

  const handleSubmit = async () => {
    if (!token) {
      toast.error("Please sign in first")
      router.push(`/login?redirect=/contests/${slug}/arena`)
      return
    }
    if (!activeProblem || !activeSlug || !contest) return
    const verdict = await submitCode(activeSlug, activeProblem.id, contest.id)
    if (verdict) {
      if (verdict.status === "ACCEPTED") {
        setSolvedProblems((prev) => new Set(prev).add(activeSlug))
        toast.success(`${activeContestProblem?.title ?? "Problem"} accepted! 🎉`)
        fetchLeaderboard(contest.id)
      }
      loadMySubmissions()
    }
  }

  if (!hydrated || detailLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (detailError || !contest) {
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

  // The arena is never shown to logged-out visitors — a live contest's problems
  // must not leak. Send them to sign in, then back to the contest page.
  if (!token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mx-auto">
            <Trophy className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Sign in to enter this contest</h1>
          <p className="mt-2 text-muted-foreground">You need an account to view and solve contest problems.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href={`/contests/${slug}`}>
              <Button variant="outline" className="bg-transparent">
                Contest details
              </Button>
            </Link>
            <Link href={`/login?redirect=/contests/${slug}`}>
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (contest.status !== "RUNNING") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-warning/10 mx-auto">
            <AlertTriangle className="h-10 w-10 text-warning" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Contest Not Active</h1>
          <p className="mt-2 text-muted-foreground">
            {contest.status === "ENDED"
              ? "This contest has ended."
              : `This contest is scheduled to start ${new Date(contest.startTime).toLocaleString()}`}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/contests">
              <Button variant="outline" className="bg-transparent">
                Back to Contests
              </Button>
            </Link>
            {contest.status === "ENDED" && (
              <Link href={`/contests/${slug}/results`}>
                <Button>View Results</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (contest.isFinished) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10 mx-auto">
            <Trophy className="h-10 w-10 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">You've finished this contest!</h1>
          <p className="mt-2 text-muted-foreground">Your attempt has been submitted. You can check the leaderboard or head back.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/contests">
              <Button variant="outline" className="bg-transparent">
                Back to Contests
              </Button>
            </Link>
            <Link href={`/contests/${slug}/results`}>
              <Button>
                View Leaderboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!contest.isRegistered) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-warning/10 mx-auto">
            <Trophy className="h-10 w-10 text-warning" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">You're not registered</h1>
          <p className="mt-2 text-muted-foreground">Register for this contest to enter the arena.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/contests">
              <Button variant="outline" className="bg-transparent">
                Back to Contests
              </Button>
            </Link>
            <Button
              onClick={async () => {
                try {
                  await useContestStore.getState().register(contest.id)
                  // Refetch so the now-registered user gets the problems the
                  // backend withholds from non-participants.
                  await fetchContest(slug)
                  toast.success("Registered! Good luck 🍀")
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Registration failed")
                }
              }}
            >
              Register Now
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const currentLeaderboardEntries = leaderboard.map((entry) => ({
    rank: entry.rank,
    userId: entry.user.id,
    username: entry.user.username,
    score: entry.score,
    problemsSolved: entry.problemsSolved,
    totalTime: "",
  }))

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Contest Header */}
      <header className="flex items-center justify-between border-b border-border/50 bg-card/50 px-4 py-2">
        <div className="flex items-center gap-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Exit</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to exit?</AlertDialogTitle>
                <AlertDialogDescription>
                  You only get 1 attempt for this contest. If you exit now, your current progress will be submitted and you won't be able to resume later.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive hover:bg-destructive/90 text-destructive-foreground" onClick={() => { useContestStore.getState().finishContest(contest.id); router.push('/contests'); }}>
                    Exit & Submit
                  </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
          {contestProblems.map((problem, index) => {
            const isSolved = solvedProblems.has(problem.slug)
            const isActive = activeSlug === problem.slug
            const label = String.fromCharCode(65 + index)

            return (
              <button
                key={problem.problemId}
                onClick={() => setActiveSlug(problem.slug)}
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
                  {label}
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

      {/* Split Workspace — side-by-side on desktop, stacked on mobile */}
      <div className="relative flex flex-1 flex-col overflow-hidden md:flex-row">
        {/* Problem Panel */}
        <div
          className="h-[45%] shrink-0 overflow-hidden border-b border-border/50 md:h-auto md:shrink md:border-b-0"
          style={isMobile ? undefined : { width: `${splitPosition}%` }}
        >
          {problemLoading || !activeProblem ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ProblemPanel
              problem={activeProblem}
              submissions={mySubmissions.filter((s) => s.problem?.slug === activeSlug)}
              isLoggedIn={!!token}
            />
          )}
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
        />

        {/* Code Editor */}
        <div
          className="relative flex-1 overflow-hidden"
          style={isMobile ? undefined : { width: `${100 - splitPosition}%` }}
        >
          <CodeEditor
            code={activeSlug ? getCode(activeSlug) : ""}
            language={language}
            onCodeChange={(next) => activeSlug && setCode(activeSlug, next)}
            onLanguageChange={setLanguage}
            onReset={() => activeSlug && resetCode(activeSlug)}
            onRun={handleRun}
            onSubmit={handleSubmit}
            isRunning={isRunning}
            isSubmitting={isSubmitting}
          />

          <ResultDrawer isOpen={resultOpen} onClose={closeResult} result={result} />
        </div>

        {/* Mini Leaderboard (desktop only — takes too much space on phones) */}
        {!isMobile && currentLeaderboardEntries.length > 0 && (
          <MiniLeaderboard entries={currentLeaderboardEntries} currentUserId={user?.id} />
        )}
      </div>
    </div>
  )
}
