"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/ui/navbar"
import { ProblemStats } from "@/components/dashboard/problem-stats"
import { ActivityHeatmap } from "@/components/dashboard/activity-heatmap"
import { BadgesEarned } from "@/components/dashboard/badges-earned"
import { RecommendedProblems } from "@/components/dashboard/recommended-problems"
import { UpcomingContests } from "@/components/dashboard/upcoming-contests"
import { Settings, Loader2, Trophy, Target, CheckCircle2, BarChart3 } from "lucide-react"
import { useAuthStore } from "@/lib/stores/auth-store"
import {
  usersApi,
  problemsApi,
  contestsApi,
  type MyProfile,
  type ActivityDay,
  type UserRank,
  type ProblemListItem,
  type ContestListItem,
} from "@/lib/api"
import type { Badge as BadgeType } from "@/lib/mock-data"

export default function DashboardPage() {
  const router = useRouter()
  const token = useAuthStore((s) => s.token)
  const hydrated = useAuthStore((s) => s.hydrated)

  const [profile, setProfile] = useState<MyProfile | null>(null)
  const [activity, setActivity] = useState<ActivityDay[]>([])
  const [rank, setRank] = useState<UserRank | null>(null)
  const [problems, setProblems] = useState<ProblemListItem[]>([])
  const [contests, setContests] = useState<ContestListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!hydrated) return
    if (!token) {
      router.replace("/login?redirect=/dashboard")
      return
    }

    let cancelled = false
    ;(async () => {
      const [profileRes, activityRes, rankRes, problemsRes, contestsRes] = await Promise.allSettled([
        usersApi.me(),
        usersApi.myActivity(12),
        usersApi.myRank(),
        problemsApi.list({ limit: 100 }),
        contestsApi.list({ limit: 20, sortBy: "startTime", sortOrder: "asc" }),
      ])
      if (cancelled) return
      if (profileRes.status === "fulfilled") setProfile(profileRes.value)
      if (activityRes.status === "fulfilled") setActivity(activityRes.value)
      if (rankRes.status === "fulfilled") setRank(rankRes.value)
      if (problemsRes.status === "fulfilled") setProblems(problemsRes.value.problems)
      if (contestsRes.status === "fulfilled") setContests(contestsRes.value.contests)
      setLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [hydrated, token, router])

  if (!hydrated || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const baseName = profile?.firstName || profile?.username || "Coder"
  let firstName = baseName
  
  if (profile?.role === "COLLEGE_ADMIN") {
    firstName = profile?.collegeName || "College Admin"
  } else if (profile?.role === "TEACHER") {
    const title = profile?.gender === "FEMALE" ? "Ma'am" : "Sir"
    firstName = `${baseName} ${title}`
  }

  // Per-difficulty stats from the (first 100) problems + solved flags
  const byDifficulty = (difficulty: string) => {
    const all = problems.filter((p) => p.difficulty === difficulty)
    return { solved: all.filter((p) => p.isSolved).length, total: all.length }
  }
  const problemStats = {
    easy: byDifficulty("EASY"),
    medium: byDifficulty("MEDIUM"),
    hard: byDifficulty("HARD"),
  }

  const heatmapData = activity.map((d) => ({ date: d.date, count: d.submissions }))

  const recommendedProblems = problems.filter((p) => !p.isSolved).slice(0, 5)

  // Badges derived from real statistics
  const stats = profile?.statistics
  const badges: BadgeType[] = []
  if (stats) {
    if (stats.problemsSolved >= 1)
      badges.push({ id: "b1", name: "First Blood", description: "Solved your first problem", earnedAt: "", tier: "bronze" })
    if (stats.problemsSolved >= 10)
      badges.push({ id: "b2", name: "Problem Solver", description: "Solved 10+ problems", earnedAt: "", tier: "silver" })
    if (stats.problemsSolved >= 50)
      badges.push({ id: "b3", name: "Grinder", description: "Solved 50+ problems", earnedAt: "", tier: "gold" })
    if (stats.contestsParticipated >= 1)
      badges.push({ id: "b4", name: "Competitor", description: "Joined a contest", earnedAt: "", tier: "bronze" })
    if (stats.acceptanceRate >= 50 && stats.totalSubmissions >= 10)
      badges.push({ id: "b5", name: "Sharpshooter", description: "50%+ acceptance rate", earnedAt: "", tier: "gold" })
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-28 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Welcome back, {firstName}</h1>
            <p className="mt-1 text-sm text-muted-foreground">Track your progress and keep practicing</p>
          </div>
          <Link
            href="/profile"
            className="flex items-center gap-2 rounded-lg border border-border/50 bg-card/30 px-3 py-2 text-sm text-muted-foreground hover:bg-card/60 hover:text-foreground transition-colors"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </Link>
        </div>

        {/* Quick stats strip */}
        {stats && (
          <div className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border/60 bg-border/60 sm:grid-cols-4">
            <QuickStat icon={CheckCircle2} label="Solved" value={stats.problemsSolved} />
            <QuickStat icon={BarChart3} label="Submissions" value={stats.totalSubmissions} />
            <QuickStat icon={Target} label="Acceptance" value={`${stats.acceptanceRate}%`} />
            <QuickStat
              icon={Trophy}
              label="Global Rank"
              value={rank?.globalRank ? `#${rank.globalRank.toLocaleString()}` : "—"}
              highlight
            />
          </div>
        )}

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <ProblemStats easy={problemStats.easy} medium={problemStats.medium} hard={problemStats.hard} />
              <BadgesEarned badges={badges} />
            </div>

            {/* Activity Heatmap */}
            {heatmapData.length > 0 ? (
              <ActivityHeatmap data={heatmapData} />
            ) : (
              <div className="rounded-lg border border-border/50 bg-card/30 p-5">
                <h3 className="text-sm font-medium text-foreground">Activity</h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  Your submission activity will appear here once you start solving.
                </p>
              </div>
            )}

            {/* Recent submissions */}
            {profile && profile.recentSubmissions.length > 0 && (
              <div className="rounded-lg border border-border/50 bg-card/30">
                <div className="flex items-center justify-between border-b border-border/30 px-5 py-3">
                  <h3 className="text-sm font-medium text-foreground">Recent Submissions</h3>
                  <Link href="/profile" className="text-xs text-muted-foreground hover:text-foreground">
                    View all
                  </Link>
                </div>
                <div className="divide-y divide-border/20">
                  {profile.recentSubmissions.slice(0, 5).map((s) => (
                    <Link
                      key={s.id}
                      href={s.problem ? `/problems/${s.problem.slug}` : "/problems"}
                      className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-card/50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {s.problem?.title ?? "Problem"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {s.language} · {new Date(s.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <span
                        className={
                          s.status === "ACCEPTED"
                            ? "text-xs font-medium text-emerald-400"
                            : "text-xs font-medium text-red-400"
                        }
                      >
                        {s.status.replace(/_/g, " ")}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <UpcomingContests contests={contests} />
            {recommendedProblems.length > 0 && <RecommendedProblems problems={recommendedProblems} />}
          </div>
        </div>
      </main>
    </div>
  )
}

function QuickStat({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: any
  label: string
  value: string | number
  highlight?: boolean
}) {
  return (
    <div className="bg-card/80 px-5 py-4">
      <div className="flex items-center gap-2">
        <Icon className={highlight ? "h-4 w-4 text-primary" : "h-4 w-4 text-muted-foreground"} />
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      </div>
      <p
        className={
          highlight
            ? "mt-1 text-2xl font-semibold tabular-nums tracking-tight text-primary"
            : "mt-1 text-2xl font-semibold tabular-nums tracking-tight text-foreground"
        }
      >
        {value}
      </p>
    </div>
  )
}
