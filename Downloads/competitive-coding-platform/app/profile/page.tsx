import { Navbar } from "@/components/ui/navbar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { ActivityHeatmap } from "@/components/dashboard/activity-heatmap"
import { mockUser, mockSubmissions, mockProblems, generateActivityData } from "@/lib/mock-data"
import { Calendar, Mail, Phone, Award, Check, X, Clock, AlertTriangle, Trophy, Target, Flame } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ProfilePage() {
  const activityData = generateActivityData()
  const joinDate = new Date(mockUser.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  const problemsByDifficulty = {
    EASY: mockProblems.filter((p) => p.difficulty === "EASY" && p.status === "SOLVED").length,
    MEDIUM: mockProblems.filter((p) => p.difficulty === "MEDIUM" && p.status === "SOLVED").length,
    HARD: mockProblems.filter((p) => p.difficulty === "HARD" && p.status === "SOLVED").length,
  }

  const statusConfig = {
    ACCEPTED: { icon: Check, label: "Accepted", className: "bg-emerald-500/20 text-emerald-400" },
    WRONG_ANSWER: { icon: X, label: "Wrong Answer", className: "bg-red-500/20 text-red-400" },
    TIME_LIMIT: { icon: Clock, label: "Time Limit", className: "bg-amber-500/20 text-amber-400" },
    RUNTIME_ERROR: { icon: AlertTriangle, label: "Runtime Error", className: "bg-red-500/20 text-red-400" },
    COMPILE_ERROR: { icon: AlertTriangle, label: "Compile Error", className: "bg-red-500/20 text-red-400" },
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar user={mockUser} />

      <main className="flex-1">
        {/* Profile Header with Gradient Background */}
        <div className="relative overflow-hidden border-b border-border/50 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
          <div className="relative mx-auto max-w-7xl px-4 py-10 lg:px-6">
            <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
              {/* Avatar */}
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-4xl font-bold text-primary-foreground shadow-2xl shadow-primary/30">
                  {mockUser.username.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-emerald-500">
                  <Check className="h-4 w-4 text-white" />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold text-foreground">{mockUser.fullName}</h1>
                  <Badge className="border-primary/30 bg-primary/10 text-primary">{mockUser.role}</Badge>
                </div>
                <p className="mt-1 text-lg text-muted-foreground">@{mockUser.username}</p>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4" />
                    {mockUser.email}
                  </span>
                  {mockUser.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-4 w-4" />
                      {mockUser.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    Joined {joinDate}
                  </span>
                </div>
              </div>

              {/* Rating Card */}
              <div className="flex items-center gap-6">
                <div className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent p-4 text-center">
                  <Award className="mx-auto h-6 w-6 text-amber-400" />
                  <p className="mt-1 text-2xl font-bold text-foreground">{mockUser.stats.rating}</p>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
                <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-4 text-center">
                  <Trophy className="mx-auto h-6 w-6 text-primary" />
                  <p className="mt-1 text-2xl font-bold text-foreground">#42</p>
                  <p className="text-xs text-muted-foreground">Global Rank</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
          {/* Stats */}
          <StatsCards stats={mockUser.stats} />

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
              <TabsTrigger value="solved" className="gap-2">
                <Trophy className="h-4 w-4" />
                Solved
              </TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="mt-6">
              <ActivityHeatmap data={activityData} />
            </TabsContent>

            <TabsContent value="submissions" className="mt-6">
              <div className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm">
                <div className="border-b border-border/50 px-6 py-4">
                  <h3 className="text-lg font-semibold text-foreground">All Submissions</h3>
                  <p className="text-sm text-muted-foreground">{mockSubmissions.length} total submissions</p>
                </div>
                <div className="divide-y divide-border/30">
                  {mockSubmissions.map((submission) => {
                    const config = statusConfig[submission.status]
                    const Icon = config.icon
                    return (
                      <div
                        key={submission.id}
                        className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-card/50"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={cn("flex h-10 w-10 items-center justify-center rounded-lg", config.className)}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{submission.problemTitle}</p>
                            <p className="text-sm text-muted-foreground">
                              {submission.language} • {new Date(submission.submittedAt).toLocaleDateString()}
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
                              {submission.runtime} • {submission.memory}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="solved" className="mt-6">
              <div className="rounded-xl border border-border/50 bg-card/30 p-6 backdrop-blur-sm">
                <h3 className="mb-6 text-lg font-semibold text-foreground">Problems Solved by Difficulty</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="group rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent p-6 text-center transition-all hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/10">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 transition-transform group-hover:scale-110">
                      <Check className="h-6 w-6 text-emerald-400" />
                    </div>
                    <p className="text-4xl font-bold text-emerald-400">{problemsByDifficulty.EASY}</p>
                    <p className="mt-1 text-sm text-muted-foreground">Easy Problems</p>
                  </div>
                  <div className="group rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent p-6 text-center transition-all hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/10">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 transition-transform group-hover:scale-110">
                      <Target className="h-6 w-6 text-amber-400" />
                    </div>
                    <p className="text-4xl font-bold text-amber-400">{problemsByDifficulty.MEDIUM}</p>
                    <p className="mt-1 text-sm text-muted-foreground">Medium Problems</p>
                  </div>
                  <div className="group rounded-xl border border-red-500/20 bg-gradient-to-br from-red-500/10 to-transparent p-6 text-center transition-all hover:border-red-500/40 hover:shadow-lg hover:shadow-red-500/10">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/20 transition-transform group-hover:scale-110">
                      <Flame className="h-6 w-6 text-red-400" />
                    </div>
                    <p className="text-4xl font-bold text-red-400">{problemsByDifficulty.HARD}</p>
                    <p className="mt-1 text-sm text-muted-foreground">Hard Problems</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
