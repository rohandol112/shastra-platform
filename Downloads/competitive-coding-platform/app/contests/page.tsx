"use client"

import { useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/ui/navbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CountdownTimer } from "@/components/contest/countdown-timer"
import { mockUser, mockContests, type Contest } from "@/lib/mock-data"
import { Calendar, Clock, Users, Trophy, ArrowRight, Lock, Globe, UserCheck, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ContestsPage() {
  const [registeredContests, setRegisteredContests] = useState<Set<string>>(
    new Set(mockContests.filter((c) => c.isRegistered).map((c) => c.id)),
  )

  const upcomingContests = mockContests.filter((c) => c.status === "UPCOMING")
  const liveContests = mockContests.filter((c) => c.status === "RUNNING")
  const pastContests = mockContests.filter((c) => c.status === "ENDED")

  const handleRegister = (contestId: string) => {
    setRegisteredContests((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(contestId)) {
        newSet.delete(contestId)
      } else {
        newSet.add(contestId)
      }
      return newSet
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={mockUser} />

      <main className="mx-auto max-w-7xl px-4 pb-12 pt-24 lg:px-6 lg:pt-28">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Contests</h1>
          <p className="mt-2 text-muted-foreground">
            Compete in real-time coding competitions and climb the leaderboard
          </p>
        </div>

        {/* Live Contests Banner */}
        {liveContests.length > 0 && (
          <div className="mb-8 space-y-4">
            {liveContests.map((contest) => (
              <div
                key={contest.id}
                className="relative overflow-hidden rounded-2xl border border-success/30 bg-gradient-to-r from-success/10 via-success/5 to-transparent p-6"
              >
                {/* Pulsing glow effect */}
                <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-success/20 blur-3xl animate-pulse" />

                <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success/20">
                      <Zap className="h-7 w-7 text-success" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-xl font-bold text-foreground">{contest.title}</h2>
                        <Badge className="animate-pulse bg-success text-success-foreground">LIVE NOW</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {contest.participantCount.toLocaleString()} participants competing right now
                      </p>
                    </div>
                  </div>
                  <Link href={`/contests/${contest.slug}/arena`}>
                    <Button size="lg" className="bg-success hover:bg-success/90 text-success-foreground glow-success">
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
              <div className="flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-card/50 py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                  <Trophy className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">The arena is quiet</h3>
                <p className="mt-1 text-sm text-muted-foreground">Check back later for new competitions</p>
              </div>
            ) : (
              upcomingContests.map((contest) => (
                <ContestCard
                  key={contest.id}
                  contest={contest}
                  isRegistered={registeredContests.has(contest.id)}
                  onRegister={() => handleRegister(contest.id)}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastContests.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-card/50 py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                  <Trophy className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">No past contests</h3>
                <p className="mt-1 text-sm text-muted-foreground">Contest history will appear here</p>
              </div>
            ) : (
              pastContests.map((contest) => (
                <ContestCard
                  key={contest.id}
                  contest={contest}
                  isRegistered={registeredContests.has(contest.id)}
                  onRegister={() => {}}
                  isPast
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function ContestCard({
  contest,
  isRegistered,
  onRegister,
  isPast = false,
}: {
  contest: Contest
  isRegistered: boolean
  onRegister: () => void
  isPast?: boolean
}) {
  const startDate = new Date(contest.startTime)
  const endDate = new Date(contest.endTime)
  const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60))

  return (
    <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-6 transition-all hover:border-border hover:bg-card">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-semibold text-foreground">{contest.title}</h3>
            <Badge
              variant="outline"
              className={cn(
                "border",
                contest.visibility === "PUBLIC"
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-warning/30 bg-warning/10 text-warning",
              )}
            >
              {contest.visibility === "PUBLIC" ? <Globe className="mr-1 h-3 w-3" /> : <Lock className="mr-1 h-3 w-3" />}
              {contest.visibility}
            </Badge>
            <Badge variant="secondary" className="bg-secondary/50 text-secondary-foreground">
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
              {duration} min
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
              <Button variant="ghost" size="sm" onClick={onRegister} className="text-muted-foreground">
                Unregister
              </Button>
            </div>
          ) : (
            <Button onClick={onRegister} className="glow-primary">
              Register Now
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
