import { Navbar } from "@/components/ui/navbar"
import { ProblemStats } from "@/components/dashboard/problem-stats"
import { SkillTracks } from "@/components/dashboard/skill-tracks"
import { ActivityHeatmap } from "@/components/dashboard/activity-heatmap"
import { BadgesEarned } from "@/components/dashboard/badges-earned"
import { RecommendedProblems } from "@/components/dashboard/recommended-problems"
import { UpcomingContests } from "@/components/dashboard/upcoming-contests"
import {
  mockUser,
  mockProblems,
  mockContests,
  mockSkillTracks,
  mockBadges,
  generateActivityData,
} from "@/lib/mock-data"
import Link from "next/link"
import { Settings } from "lucide-react"

export default function DashboardPage() {
  const activityData = generateActivityData()
  const firstName = mockUser.fullName.split(" ")[0]

  const problemStats = {
    easy: { solved: 45, total: 120 },
    medium: { solved: 78, total: 200 },
    hard: { solved: 33, total: 80 },
  }

  const recommendedProblems = mockProblems.filter((p) => p.status !== "SOLVED").slice(0, 5)

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={mockUser} />

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

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Row */}
            <div className="grid gap-4 sm:grid-cols-2">
              <ProblemStats easy={problemStats.easy} medium={problemStats.medium} hard={problemStats.hard} />
              <BadgesEarned badges={mockBadges} />
            </div>

            {/* Activity Heatmap */}
            <ActivityHeatmap data={activityData} />

            {/* Skills */}
            <SkillTracks tracks={mockSkillTracks} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Contests */}
            <UpcomingContests contests={mockContests} />

            {/* Recommended Problems */}
            <RecommendedProblems problems={recommendedProblems} />
          </div>
        </div>
      </main>
    </div>
  )
}
