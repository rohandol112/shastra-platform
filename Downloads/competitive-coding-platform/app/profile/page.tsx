"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/ui/navbar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ActivityHeatmap } from "@/components/dashboard/activity-heatmap"
import {
  Calendar,
  Mail,
  Phone,
  Check,
  X,
  Clock,
  AlertTriangle,
  Trophy,
  Target,
  Flame,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/lib/stores/auth-store"
import {
  usersApi,
  submissionsApi,
  formatRuntime,
  formatMemory,
  displayName,
  type MyProfile,
  type ActivityDay,
  type UserRank,
  type SubmissionSummary,
  type Pagination,
} from "@/lib/api"

const statusConfig: Record<string, { icon: any; label: string; className: string }> = {
  ACCEPTED: { icon: Check, label: "Accepted", className: "bg-emerald-500/20 text-emerald-400" },
  WRONG_ANSWER: { icon: X, label: "Wrong Answer", className: "bg-red-500/20 text-red-400" },
  TIME_LIMIT_EXCEEDED: { icon: Clock, label: "Time Limit", className: "bg-amber-500/20 text-amber-400" },
  MEMORY_LIMIT_EXCEEDED: { icon: Clock, label: "Memory Limit", className: "bg-amber-500/20 text-amber-400" },
  RUNTIME_ERROR: { icon: AlertTriangle, label: "Runtime Error", className: "bg-red-500/20 text-red-400" },
  COMPILE_ERROR: { icon: AlertTriangle, label: "Compile Error", className: "bg-red-500/20 text-red-400" },
  PARTIAL: { icon: Target, label: "Partial", className: "bg-amber-500/20 text-amber-400" },
  FAILED: { icon: AlertTriangle, label: "Failed", className: "bg-red-500/20 text-red-400" },
  QUEUED: { icon: Clock, label: "Queued", className: "bg-sky-500/20 text-sky-400" },
  RUNNING: { icon: Loader2, label: "Running", className: "bg-sky-500/20 text-sky-400" },
}

export default function ProfilePage() {
  const router = useRouter()
  const token = useAuthStore((s) => s.token)
  const hydrated = useAuthStore((s) => s.hydrated)

  const [profile, setProfile] = useState<MyProfile | null>(null)
  const [activity, setActivity] = useState<ActivityDay[]>([])
  const [rank, setRank] = useState<UserRank | null>(null)
  const [loading, setLoading] = useState(true)

  const [submissions, setSubmissions] = useState<SubmissionSummary[]>([])
  const [subsPagination, setSubsPagination] = useState<Pagination | null>(null)
  const [subsPage, setSubsPage] = useState(1)
  const [subsLoading, setSubsLoading] = useState(false)

  useEffect(() => {
    if (!hydrated) return
    if (!token) {
      router.replace("/login?redirect=/profile")
      return
    }
    let cancelled = false
    ;(async () => {
      const [profileRes, activityRes, rankRes] = await Promise.allSettled([
        usersApi.me(),
        usersApi.myActivity(12),
        usersApi.myRank(),
      ])
      if (cancelled) return
      if (profileRes.status === "fulfilled") setProfile(profileRes.value)
      if (activityRes.status === "fulfilled") setActivity(activityRes.value)
      if (rankRes.status === "fulfilled") setRank(rankRes.value)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [hydrated, token, router])

  useEffect(() => {
    if (!token) return
    setSubsLoading(true)
    submissionsApi
      .my({ page: subsPage, limit: 20 })
      .then((data) => {
        setSubmissions(data.submissions)
        setSubsPagination(data.pagination)
      })
      .catch(() => {})
      .finally(() => setSubsLoading(false))
  }, [token, subsPage])

  if (!hydrated || loading || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const joinDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "—"
  const stats = profile.statistics
  const heatmapData = activity.map((d) => ({ date: d.date, count: d.submissions }))

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-16">
        {/* Profile Header */}
        <div className="relative overflow-hidden border-b border-border/50 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
          <div className="relative mx-auto max-w-7xl px-4 py-10 lg:px-6">
            <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
              {/* Avatar */}
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-4xl font-bold text-primary-foreground shadow-2xl shadow-primary/30">
                  {profile.username.charAt(0).toUpperCase()}
                </div>
                {profile.isVerified && (
                  <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-emerald-500">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold text-foreground">{displayName(profile)}</h1>
                  <Badge className="border-primary/30 bg-primary/10 text-primary">{profile.role}</Badge>
                </div>
                <p className="mt-1 text-lg text-muted-foreground">@{profile.username}</p>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {profile.email && (
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-4 w-4" />
                      {profile.email}
                    </span>
                  )}
                  {profile.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-4 w-4" />
                      {profile.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    Joined {joinDate}
                  </span>
                </div>
              </div>

              {/* Rank Cards */}
              <div className="flex items-center gap-6">
                <div className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent p-4 text-center">
                  <Target className="mx-auto h-6 w-6 text-amber-400" />
                  <p className="mt-1 text-2xl font-bold text-foreground">{rank?.score ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Score</p>
                </div>
                <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-4 text-center">
                  <Trophy className="mx-auto h-6 w-6 text-primary" />
                  <p className="mt-1 text-2xl font-bold text-foreground">
                    {rank?.globalRank ? `#${rank.globalRank}` : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">Global Rank</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border/60 bg-border/60 sm:grid-cols-4">
            <StatCell label="Solved" value={stats.problemsSolved} />
            <StatCell label="Submissions" value={stats.totalSubmissions} />
            <StatCell label="Contests" value={stats.contestsParticipated} />
            <StatCell label="Acceptance" value={`${stats.acceptanceRate}%`} highlight />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="activity" className="mt-8">
            <TabsList className="h-11 bg-card/50 p-1">
              <TabsTrigger value="activity" className="gap-2">
                <Flame className="h-4 w-4" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="submissions" className="gap-2">
                <Target className="h-4 w-4" />
                Submissions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="mt-6">
              {heatmapData.length > 0 ? (
                <ActivityHeatmap data={heatmapData} />
              ) : (
                <div className="rounded-xl border border-border/50 bg-card/30 p-8 text-center">
                  <p className="text-muted-foreground">No activity yet — start solving problems!</p>
                  <Link href="/problems" className="mt-2 inline-block text-sm text-primary hover:underline">
                    Browse problems
                  </Link>
                </div>
              )}
            </TabsContent>

            <TabsContent value="submissions" className="mt-6">
              <div className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm">
                <div className="border-b border-border/50 px-6 py-4">
                  <h3 className="text-lg font-semibold text-foreground">All Submissions</h3>
                  <p className="text-sm text-muted-foreground">
                    {subsPagination?.total ?? submissions.length} total submissions
                  </p>
                </div>

                {subsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <p className="text-muted-foreground">No submissions yet.</p>
                    <Link href="/problems" className="mt-2 inline-block text-sm text-primary hover:underline">
                      Start solving problems
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-border/30">
                    {submissions.map((submission) => {
                      const config = statusConfig[submission.status] ?? statusConfig.FAILED
                      const Icon = config.icon
                      return (
                        <Link
                          key={submission.id}
                          href={submission.problem ? `/problems/${submission.problem.slug}` : "#"}
                          className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-card/50"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={cn("flex h-10 w-10 items-center justify-center rounded-lg", config.className)}
                            >
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {submission.problem?.title ?? "Problem"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {submission.language} • {new Date(submission.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge
                              className={cn(
                                "border font-medium",
                                submission.status === "ACCEPTED"
                                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                                  : "border-red-500/30 bg-red-500/10 text-red-400",
                              )}
                            >
                              {config.label}
                            </Badge>
                            {submission.status === "ACCEPTED" && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                {formatRuntime(submission.time)} • {formatMemory(submission.memory)}
                              </p>
                            )}
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}

                {/* Pagination */}
                {subsPagination && subsPagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 border-t border-border/30 px-6 py-4">
                    <button
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-40"
                      disabled={subsPage <= 1}
                      onClick={() => setSubsPage((p) => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </button>
                    <span className="text-sm text-muted-foreground">
                      Page {subsPagination.page} of {subsPagination.totalPages}
                    </span>
                    <button
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-40"
                      disabled={subsPage >= subsPagination.totalPages}
                      onClick={() => setSubsPage((p) => p + 1)}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

function StatCell({
  label,
  value,
  highlight,
}: {
  label: string
  value: string | number
  highlight?: boolean
}) {
  return (
    <div className="bg-card/80 px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 text-2xl font-semibold tabular-nums tracking-tight",
          highlight ? "text-primary" : "text-foreground",
        )}
      >
        {value}
      </p>
    </div>
  )
}
