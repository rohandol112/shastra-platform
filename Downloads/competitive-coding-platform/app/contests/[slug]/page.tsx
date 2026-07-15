"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Navbar } from "@/components/ui/navbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DifficultyBadge } from "@/components/ui/difficulty-badge"
import { CountdownTimer } from "@/components/contest/countdown-timer"
import { LiveTimer } from "@/components/contest/live-timer"
import {
  Trophy,
  Users,
  Clock,
  Calendar,
  FileText,
  Gift,
  Lock,
  Globe,
  School,
  ArrowRight,
  UserCheck,
  Loader2,
  ListChecks,
  ArrowLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useContestStore } from "@/lib/stores/contest-store"
import { useAuthStore } from "@/lib/stores/auth-store"

const typeConfig = {
  PUBLIC: { icon: Globe, label: "Public", className: "border-primary/30 bg-primary/10 text-primary" },
  PRIVATE: { icon: Lock, label: "Private", className: "border-warning/30 bg-warning/10 text-warning" },
  COLLEGE: { icon: School, label: "College", className: "border-secondary/50 bg-secondary/20 text-secondary-foreground" },
}

export default function ContestLandingPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const { detail: contest, detailLoading, detailError, fetchContest, register, unregister, registering } =
    useContestStore()
  const token = useAuthStore((s) => s.token)
  const hydrated = useAuthStore((s) => s.hydrated)
  const [entering, setEntering] = useState(false)

  useEffect(() => {
    if (hydrated) fetchContest(slug)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, hydrated, token])

  // A registered user should drop straight into the arena the moment the
  // contest is live — no need to leave this page and come back. Users who
  // already finished stay here (so they aren't looped back into the arena).
  useEffect(() => {
    if (!contest || !token || !contest.isRegistered || contest.isFinished) return
    const live =
      contest.status === "RUNNING" &&
      new Date(contest.startTime).getTime() <= Date.now() &&
      new Date(contest.endTime).getTime() > Date.now()
    if (live) router.replace(`/contests/${contest.slug}/arena`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contest, token])

  // No polling: a registered user waiting for the start gets exactly ONE
  // refetch, fired by a single timer at the start time. That refresh picks up
  // the now-live contest and the effect above auto-enters the arena.
  useEffect(() => {
    if (!contest || !token || !contest.isRegistered) return
    const startMs = new Date(contest.startTime).getTime()
    const msToStart = startMs - Date.now()
    if (msToStart <= 0 || msToStart > 2_147_483_000) return
    const startTimer = setTimeout(() => fetchContest(slug), msToStart + 500)
    return () => clearTimeout(startTimer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contest, token, slug])

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
        <h1 className="text-2xl font-bold text-foreground">Contest not found</h1>
        <Link href="/contests" className="mt-4">
          <Button>Back to Contests</Button>
        </Link>
      </div>
    )
  }

  const now = Date.now()
  const startMs = new Date(contest.startTime).getTime()
  const endMs = new Date(contest.endTime).getTime()
  const isEnded = contest.status === "ENDED" || contest.status === "CANCELLED" || endMs <= now
  const isRunning = contest.status === "RUNNING" && startMs <= now && endMs > now
  const isUpcoming = !isEnded && !isRunning
  const durationMin = contest.duration || Math.round((endMs - startMs) / 60000)

  const type = typeConfig[contest.type] ?? typeConfig.PUBLIC
  const TypeIcon = type.icon

  const requireLogin = () => {
    toast.error("Please sign in first")
    router.push(`/login?redirect=/contests/${slug}`)
  }

  const handleRegister = async () => {
    if (!token) return requireLogin()
    try {
      if (contest.isRegistered) {
        await unregister(contest.id)
        toast.success("Unregistered")
      } else {
        await register(contest.id)
        toast.success("Registered! Good luck 🍀")
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    }
  }

  const handleEnter = async () => {
    if (!token) return requireLogin()
    setEntering(true)
    try {
      if (!contest.isRegistered) await register(contest.id)
      router.push(`/contests/${contest.slug}/arena`)
    } catch (err) {
      setEntering(false)
      toast.error(err instanceof Error ? err.message : "Could not enter the contest")
    }
  }

  const busy = registering === contest.id

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-16">
        {/* Hero */}
        <div className="relative overflow-hidden border-b border-border/50 bg-gradient-to-br from-primary/10 via-transparent to-warning/5">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative mx-auto max-w-5xl px-4 py-10 lg:px-6">
            <Link href="/contests" className="mb-6 inline-block">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                All Contests
              </Button>
            </Link>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="outline" className={cn("border", type.className)}>
                    <TypeIcon className="mr-1 h-3 w-3" />
                    {type.label}
                  </Badge>
                  {isRunning && <Badge className="animate-pulse bg-success text-success-foreground">LIVE NOW</Badge>}
                  {isUpcoming && (
                    <Badge variant="outline" className="border-warning/30 bg-warning/10 text-warning">
                      Upcoming
                    </Badge>
                  )}
                  {isEnded && (
                    <Badge variant="outline" className="border-border/50 text-muted-foreground">
                      Ended
                    </Badge>
                  )}
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-foreground lg:text-4xl">{contest.title}</h1>
                {contest.description && (
                  <p className="max-w-2xl text-muted-foreground">{contest.description}</p>
                )}

                <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1 text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(contest.startTime).toLocaleString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {durationMin} min
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {contest.participantCount.toLocaleString()} registered
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <ListChecks className="h-4 w-4" />
                    {contest.problemCount} problems
                  </span>
                </div>
              </div>

              {/* CTA card */}
              <div className="w-full shrink-0 rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur lg:w-80">
                {isEnded ? (
                  <div className="space-y-4 text-center">
                    <p className="text-sm text-muted-foreground">This contest has ended.</p>
                    <Link href={`/contests/${contest.slug}/results`} className="block">
                      <Button className="w-full">
                        <Trophy className="mr-2 h-4 w-4" />
                        View Results
                      </Button>
                    </Link>
                  </div>
                ) : isRunning ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Time remaining
                      </p>
                      <div className="flex items-center justify-center gap-2 text-lg font-bold text-destructive">
                        <Clock className="h-5 w-5" />
                        <LiveTimer endTime={contest.endTime} />
                      </div>
                    </div>
                    <Button className="w-full glow-primary" onClick={handleEnter} disabled={entering}>
                      {entering ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowRight className="mr-2 h-4 w-4" />
                      )}
                      {contest.isRegistered ? "Enter Arena" : "Register & Enter"}
                    </Button>
                    {contest.isRegistered && (
                      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-success">
                        <UserCheck className="h-3.5 w-3.5" />
                        You're registered
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Starts in
                      </p>
                      <CountdownTimer targetDate={contest.startTime} size="md" />
                    </div>
                    {contest.isRegistered ? (
                      <>
                        <div className="flex items-center justify-center gap-2 rounded-lg border border-success/30 bg-success/10 py-2.5 text-sm font-medium text-success">
                          <UserCheck className="h-4 w-4" />
                          You're registered
                        </div>
                        <Button
                          variant="ghost"
                          className="w-full text-muted-foreground"
                          onClick={handleRegister}
                          disabled={busy}
                        >
                          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Unregister
                        </Button>
                      </>
                    ) : (
                      <Button className="w-full glow-primary" onClick={handleRegister} disabled={busy}>
                        {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {token ? "Register Now" : "Sign in to Register"}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 lg:px-6">
          {/* Problems */}
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <ListChecks className="h-5 w-5 text-primary" />
              Problems
              {isEnded && (
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  — practice these anytime; upsolve submissions don't affect the standings
                </span>
              )}
            </h2>
            {contest.problems && contest.problems.length > 0 ? (
              <div className="space-y-2">
                {contest.problems
                  .slice()
                  .sort((a, b) => a.orderIndex - b.orderIndex)
                  .map((p, i) => {
                    const label = String.fromCharCode(65 + i)
                    const row = (
                      <div className="flex items-center justify-between rounded-xl border border-border/50 bg-card/40 px-4 py-3 transition-colors hover:border-border hover:bg-card">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-sm font-bold text-secondary-foreground">
                            {label}
                          </span>
                          <span className="font-medium text-foreground">{p.title}</span>
                          <DifficultyBadge difficulty={p.difficulty} />
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{p.solvedCount} solved</span>
                          <Badge variant="secondary" className="bg-background/50">
                            {p.points} pts
                          </Badge>
                          {isEnded && <span className="text-xs text-primary">Upsolve →</span>}
                        </div>
                      </div>
                    )
                    // Live → into the arena. Ended → the practice page for
                    // upsolving (marks don't count). Upcoming → not clickable.
                    if (isRunning) {
                      return (
                        <Link key={p.problemId} href={`/contests/${contest.slug}/arena`}>
                          {row}
                        </Link>
                      )
                    }
                    if (isEnded) {
                      return (
                        <Link key={p.problemId} href={`/problems/${p.slug}`}>
                          {row}
                        </Link>
                      )
                    }
                    return <div key={p.problemId}>{row}</div>
                  })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 bg-card/30 py-12 text-center">
                <Lock className="mb-3 h-8 w-8 text-muted-foreground" />
                <p className="font-medium text-foreground">
                  {contest.problemCount} problem{contest.problemCount === 1 ? "" : "s"} — hidden until the contest starts
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {contest.isRegistered
                    ? "You're registered. Problems unlock when the contest goes live."
                    : "Register to compete when it begins."}
                </p>
              </div>
            )}
          </section>

          {/* Rules */}
          {contest.rules && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
                <FileText className="h-5 w-5 text-primary" />
                Rules
              </h2>
              <div className="whitespace-pre-wrap rounded-2xl border border-border/50 bg-card/40 p-5 text-sm text-muted-foreground">
                {contest.rules}
              </div>
            </section>
          )}

          {/* Prizes */}
          {contest.prizes && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
                <Gift className="h-5 w-5 text-warning" />
                Prizes
              </h2>
              <div className="whitespace-pre-wrap rounded-2xl border border-warning/20 bg-warning/5 p-5 text-sm text-muted-foreground">
                {contest.prizes}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  )
}
