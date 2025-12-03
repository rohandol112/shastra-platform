import Link from "next/link"
import { Navbar } from "@/components/ui/navbar"
import { Button } from "@/components/ui/button"
import { mockUser, mockContests, mockLeaderboard } from "@/lib/mock-data"
import { Trophy, Medal, ArrowLeft, Clock, Users, Crown, Star, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ContestResults({
  params,
}: {
  params: { slug: string }
}) {
  const contest = mockContests.find((c) => c.slug === params.slug)

  if (!contest) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <h1 className="text-2xl font-bold text-foreground">Contest not found</h1>
        <Link href="/contests" className="mt-4">
          <Button>Back to Contests</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar user={mockUser} />

      <main className="flex-1">
        {/* Hero Header */}
        <div className="relative overflow-hidden border-b border-border/50 bg-gradient-to-br from-amber-500/10 via-transparent to-primary/5">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
          <div className="relative mx-auto max-w-5xl px-4 py-12 lg:px-6">
            <Link href="/contests" className="mb-6 inline-block">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Contests
              </Button>
            </Link>

            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-xl shadow-amber-500/30">
                <Trophy className="h-10 w-10 text-white" />
              </div>
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-400" />
                  <span className="text-sm font-medium text-amber-400">Contest Ended</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">{contest.title}</h1>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    {contest.participantCount.toLocaleString()} participants
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {new Date(contest.startTime).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 py-10 lg:px-6">
          {/* Podium */}
          <div className="mb-12">
            <h2 className="mb-6 text-center text-lg font-semibold text-muted-foreground">Top Performers</h2>
            <div className="flex items-end justify-center gap-4">
              {/* 2nd Place */}
              {mockLeaderboard[1] && (
                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-400 to-slate-500 shadow-xl shadow-slate-500/20">
                      <span className="text-3xl font-bold text-white">2</span>
                    </div>
                    <Medal className="absolute -right-2 -top-2 h-8 w-8 text-slate-400" />
                  </div>
                  <div className="w-40 rounded-t-2xl border border-b-0 border-border/50 bg-gradient-to-b from-card to-card/50 p-4 text-center">
                    <p className="truncate font-semibold text-foreground">{mockLeaderboard[1].username}</p>
                    <p className="mt-1 text-2xl font-bold text-slate-400">{mockLeaderboard[1].score}</p>
                    <p className="text-xs text-muted-foreground">{mockLeaderboard[1].problemsSolved} solved</p>
                  </div>
                  <div className="h-24 w-40 rounded-b-xl bg-gradient-to-b from-slate-500/20 to-slate-500/5" />
                </div>
              )}

              {/* 1st Place */}
              {mockLeaderboard[0] && (
                <div className="relative flex flex-col items-center">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                    <Crown className="h-10 w-10 text-amber-400 drop-shadow-lg" />
                  </div>
                  <div className="relative mb-4 mt-4">
                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-2xl shadow-amber-500/30 ring-4 ring-amber-500/30">
                      <span className="text-4xl font-bold text-white">1</span>
                    </div>
                    <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 shadow-lg">
                      <Star className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="w-48 rounded-t-2xl border border-b-0 border-amber-500/30 bg-gradient-to-b from-amber-500/10 to-card p-5 text-center">
                    <p className="truncate text-lg font-bold text-foreground">{mockLeaderboard[0].username}</p>
                    <p className="mt-1 text-3xl font-bold text-amber-400">{mockLeaderboard[0].score}</p>
                    <p className="text-sm text-muted-foreground">{mockLeaderboard[0].problemsSolved} solved</p>
                  </div>
                  <div className="h-32 w-48 rounded-b-xl bg-gradient-to-b from-amber-500/20 to-amber-500/5" />
                </div>
              )}

              {/* 3rd Place */}
              {mockLeaderboard[2] && (
                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-700 to-amber-800 shadow-xl shadow-amber-800/20">
                      <span className="text-3xl font-bold text-white">3</span>
                    </div>
                    <Medal className="absolute -right-2 -top-2 h-8 w-8 text-amber-700" />
                  </div>
                  <div className="w-40 rounded-t-2xl border border-b-0 border-border/50 bg-gradient-to-b from-card to-card/50 p-4 text-center">
                    <p className="truncate font-semibold text-foreground">{mockLeaderboard[2].username}</p>
                    <p className="mt-1 text-2xl font-bold text-amber-700">{mockLeaderboard[2].score}</p>
                    <p className="text-xs text-muted-foreground">{mockLeaderboard[2].problemsSolved} solved</p>
                  </div>
                  <div className="h-16 w-40 rounded-b-xl bg-gradient-to-b from-amber-700/20 to-amber-700/5" />
                </div>
              )}
            </div>
          </div>

          {/* Full Standings */}
          <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm">
            <div className="border-b border-border/50 bg-card/50 px-6 py-4">
              <h3 className="text-lg font-semibold text-foreground">Full Standings</h3>
              <p className="text-sm text-muted-foreground">{mockLeaderboard.length} participants ranked</p>
            </div>

            {/* Header */}
            <div className="grid grid-cols-[80px_1fr_100px_100px_120px] gap-4 border-b border-border/30 bg-card/30 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Rank</span>
              <span>Participant</span>
              <span className="text-center">Score</span>
              <span className="text-center">Solved</span>
              <span className="text-right">Total Time</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-border/20">
              {mockLeaderboard.map((entry) => (
                <div
                  key={entry.userId}
                  className={cn(
                    "grid grid-cols-[80px_1fr_100px_100px_120px] items-center gap-4 px-6 py-4 transition-colors hover:bg-card/50",
                    entry.rank <= 3 && "bg-gradient-to-r from-amber-500/5 to-transparent",
                  )}
                >
                  <div className="flex items-center">
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold",
                        entry.rank === 1 && "bg-amber-500/20 text-amber-400",
                        entry.rank === 2 && "bg-slate-400/20 text-slate-300",
                        entry.rank === 3 && "bg-amber-700/20 text-amber-600",
                        entry.rank > 3 && "text-muted-foreground",
                      )}
                    >
                      {entry.rank <= 3 ? (
                        entry.rank === 1 ? (
                          <Crown className="h-4 w-4" />
                        ) : (
                          <Medal className="h-4 w-4" />
                        )
                      ) : (
                        `#${entry.rank}`
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-sm font-semibold text-primary-foreground">
                      {entry.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-foreground">{entry.username}</span>
                  </div>
                  <span
                    className={cn("text-center text-lg font-bold", entry.rank <= 3 ? "text-amber-400" : "text-primary")}
                  >
                    {entry.score}
                  </span>
                  <span className="text-center text-muted-foreground">{entry.problemsSolved}</span>
                  <span className="text-right font-mono text-sm text-muted-foreground">{entry.totalTime}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
