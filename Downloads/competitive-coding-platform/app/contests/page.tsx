"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Navbar } from "@/components/ui/navbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CountdownTimer } from "@/components/contest/countdown-timer"
import { Calendar, Clock, Users, Trophy, ArrowRight, Lock, Globe, UserCheck, Zap, Loader2, AlertCircle, School } from "lucide-react"
import { cn } from "@/lib/utils"
import { useContestStore } from "@/lib/stores/contest-store"
import { useAuthStore } from "@/lib/stores/auth-store"
import { AuthGuard } from "@/components/admin-guard"
import { contestsApi, ApiError, type ContestListItem } from "@/lib/api"

export default function ContestsPageWrapper() {
  return (
    <AuthGuard>
      <ContestsPage />
    </AuthGuard>
  )
}

function ContestsPage() {
  const router = useRouter()
  const { contests, loading, error, fetchContests, register, unregister, registering } = useContestStore()
  const token = useAuthStore((s) => s.token)
  const hydrated = useAuthStore((s) => s.hydrated)

  // ids of contests the current user registered for
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!hydrated) return
    fetchContests()
    if (token) {
      contestsApi
        .my()
        .then((data) => setRegisteredIds(new Set(data.contests.map((c) => c.id))))
        .catch(() => {})
    } else {
      setRegisteredIds(new Set())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, token])

  const now = Date.now()
  const upcomingContests = contests.filter(
    (c) => c.status === "SCHEDULED" || (c.status === "DRAFT" && new Date(c.startTime).getTime() > now)
  )
  const liveContests = contests.filter((c) => c.status === "RUNNING")
  const pastContests = contests.filter((c) => c.status === "ENDED" || c.status === "CANCELLED")

  const handleRegister = async (contest: ContestListItem) => {
    if (!token) {
      toast.error("Please sign in to register for contests")
      router.push("/login?redirect=/contests")
      return
    }
    const isRegistered = registeredIds.has(contest.id)
    try {
      if (isRegistered) {
        await unregister(contest.id)
        setRegisteredIds((prev) => {
          const next = new Set(prev)
          next.delete(contest.id)
          return next
        })
        toast.success(`Unregistered from ${contest.title}`)
      } else {
        await register(contest.id)
        setRegisteredIds((prev) => new Set(prev).add(contest.id))
        toast.success(`Registered for ${contest.title}!`)
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Something went wrong")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-12 pt-24 lg:px-6 lg:pt-28">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Contests</h1>
          <p className="mt-2 text-muted-foreground">
            Compete in real-time coding competitions and climb the leaderboard
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center rounded-2xl border border-border/50 bg-card/50 py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-3 text-muted-foreground">Loading contests...</span>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/5 py-16 text-center">
            <AlertCircle className="mb-3 h-8 w-8 text-destructive" />
            <h3 className="text-lg font-semibold text-foreground">Couldn't load contests</h3>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" className="mt-4 bg-transparent" onClick={() => fetchContests()}>
              Try Again
            </Button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Live Contests Banner */}
            {liveContests.length > 0 && (
              <div className="mb-8 space-y-4">
                {liveContests.map((contest) => (
                  <div
                    key={contest.id}
                    className="relative overflow-hidden rounded-2xl border border-success/30 bg-gradient-to-r from-success/10 via-success/5 to-transparent p-6"
                  >
                    <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-success/20 blur-3xl animate-pulse" />

                    <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success/20">
                          <Zap className="h-7 w-7 text-success" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <Link href={`/contests/${contest.slug}`}>
                              <h2 className="text-xl font-bold text-foreground transition-colors hover:text-primary">
                                {contest.title}
                              </h2>
                            </Link>
                            <Badge className="animate-pulse bg-success text-success-foreground">LIVE NOW</Badge>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {contest.participantCount.toLocaleString()} participants competing right now
                          </p>
                        </div>
                      </div>
                      <Link href={`/contests/${contest.slug}/arena`}>
                        <Button
                          size="lg"
                          className="bg-success hover:bg-success/90 text-success-foreground glow-success"
                        >
                          Enter Arena
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tabs */}
            <Tabs defaultValue="upcoming" className="space-y-6">
              <TabsList className="bg-card/50 border border-border/50">
                <TabsTrigger
                  value="upcoming"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Upcoming ({upcomingContests.length})
                </TabsTrigger>
                <TabsTrigger
                  value="past"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Past ({pastContests.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="space-y-4">
                {upcomingContests.length === 0 ? (
                  <EmptyState title="The arena is quiet" subtitle="Check back later for new competitions" />
                ) : (
                  upcomingContests.map((contest) => (
                    <ContestCard
                      key={contest.id}
                      contest={contest}
                      isRegistered={registeredIds.has(contest.id)}
                      isBusy={registering === contest.id}
                      onRegister={() => handleRegister(contest)}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="past" className="space-y-4">
                {pastContests.length === 0 ? (
                  <EmptyState title="No past contests" subtitle="Contest history will appear here" />
                ) : (
                  pastContests.map((contest) => (
                    <ContestCard
                      key={contest.id}
                      contest={contest}
                      isRegistered={registeredIds.has(contest.id)}
                      isBusy={false}
                      onRegister={() => {}}
                      isPast
                    />
                  ))
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  )
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-card/50 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
        <Trophy className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  )
}

const typeConfig = {
  PUBLIC: { icon: Globe, className: "border-primary/30 bg-primary/10 text-primary" },
  PRIVATE: { icon: Lock, className: "border-warning/30 bg-warning/10 text-warning" },
  COLLEGE: { icon: School, className: "border-secondary/50 bg-secondary/20 text-secondary-foreground" },
}

function ContestCard({
  contest,
  isRegistered,
  isBusy,
  onRegister,
  isPast = false,
}: {
  contest: ContestListItem
  isRegistered: boolean
  isBusy: boolean
  onRegister: () => void
  isPast?: boolean
}) {
  const startDate = new Date(contest.startTime)
  const endDate = new Date(contest.endTime)
  // duration is stored in minutes; fall back to the time window
  const durationMin =
    contest.duration || Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60))

  const type = typeConfig[contest.type] ?? typeConfig.PUBLIC
  const TypeIcon = type.icon

  return (
    <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-6 transition-all hover:border-border hover:bg-card">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Link href={`/contests/${contest.slug}`}>
              <h3 className="text-xl font-semibold text-foreground transition-colors hover:text-primary">
                {contest.title}
              </h3>
            </Link>
            <Badge variant="outline" className={cn("border", type.className)}>
              <TypeIcon className="mr-1 h-3 w-3" />
              {contest.type}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground">{contest.description}</p>

          <div className="flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {startDate.toLocaleDateString("en-US", {
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
              {contest.participantCount.toLocaleString()}
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Trophy className="h-4 w-4" />
              {contest.problemCount} problems
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          {!isPast && <CountdownTimer targetDate={contest.startTime} size="md" showLabels={false} />}

          {isPast ? (
            <Link href={`/contests/${contest.slug}/results`}>
              <Button variant="outline" className="border-border/50 bg-transparent">
                View Results
              </Button>
            </Link>
          ) : isRegistered ? (
            <div className="flex flex-col items-center gap-2">
              <Badge variant="outline" className="border-success/30 bg-success/10 px-4 py-1.5 text-success">
                <UserCheck className="mr-1.5 h-4 w-4" />
                Registered
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRegister}
                disabled={isBusy}
                className="text-muted-foreground"
              >
                {isBusy ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
                Unregister
              </Button>
            </div>
          ) : (
            <Button onClick={onRegister} disabled={isBusy} className="glow-primary">
              {isBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Register Now
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
