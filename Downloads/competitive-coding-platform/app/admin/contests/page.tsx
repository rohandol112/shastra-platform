"use client"

import { useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/ui/navbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { mockUser, mockContests, type Contest } from "@/lib/mock-data"
import { Plus, MoreVertical, Edit, Eye, Users, Activity, StopCircle, Clock, Calendar, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

export default function AdminContestsPage() {
  const [contests] = useState(mockContests)

  const upcomingContests = contests.filter((c) => c.status === "UPCOMING")
  const liveContests = contests.filter((c) => c.status === "RUNNING")
  const pastContests = contests.filter((c) => c.status === "ENDED")

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar user={mockUser} />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Contest Management</h1>
              <p className="mt-1 text-muted-foreground">Create and manage coding competitions</p>
            </div>
            <Link href="/admin/contests/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Contest
              </Button>
            </Link>
          </div>

          {/* Live Contests Alert */}
          {liveContests.length > 0 && (
            <div className="mb-6">
              {liveContests.map((contest) => (
                <Card key={contest.id} className="border-success/50 bg-success/5">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/20">
                        <Activity className="h-5 w-5 animate-pulse text-success" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{contest.title} is LIVE</p>
                        <p className="text-sm text-muted-foreground">{contest.participantCount} active participants</p>
                      </div>
                    </div>
                    <Link href={`/admin/contests/${contest.slug}/monitor`}>
                      <Button variant="outline" size="sm">
                        <Activity className="mr-2 h-4 w-4" />
                        Monitor
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="upcoming" className="space-y-6">
            <TabsList className="bg-card">
              <TabsTrigger value="upcoming">Upcoming ({upcomingContests.length})</TabsTrigger>
              <TabsTrigger value="live">Live ({liveContests.length})</TabsTrigger>
              <TabsTrigger value="past">Past ({pastContests.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {upcomingContests.map((contest) => (
                <ContestRow key={contest.id} contest={contest} />
              ))}
            </TabsContent>

            <TabsContent value="live" className="space-y-4">
              {liveContests.map((contest) => (
                <ContestRow key={contest.id} contest={contest} isLive />
              ))}
            </TabsContent>

            <TabsContent value="past" className="space-y-4">
              {pastContests.map((contest) => (
                <ContestRow key={contest.id} contest={contest} />
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

function ContestRow({ contest, isLive }: { contest: Contest; isLive?: boolean }) {
  const startDate = new Date(contest.startTime)

  return (
    <Card className="border-border bg-card">
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-lg",
              isLive ? "bg-success/20" : "bg-primary/20",
            )}
          >
            <Trophy className={cn("h-6 w-6", isLive ? "text-success" : "text-primary")} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{contest.title}</h3>
              <Badge
                variant="outline"
                className={cn(
                  "border",
                  contest.status === "RUNNING"
                    ? "border-success/30 bg-success/10 text-success"
                    : contest.status === "UPCOMING"
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-muted-foreground/30 bg-muted/10 text-muted-foreground",
                )}
              >
                {contest.status}
              </Badge>
            </div>
            <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {startDate.toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {startDate.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {contest.participantCount} registered
              </span>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/contests/${contest.slug}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Contest
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/contests/${contest.slug}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/contests/${contest.slug}/participants`}>
                <Users className="mr-2 h-4 w-4" />
                Participants
              </Link>
            </DropdownMenuItem>
            {isLive && (
              <>
                <DropdownMenuItem asChild>
                  <Link href={`/admin/contests/${contest.slug}/monitor`}>
                    <Activity className="mr-2 h-4 w-4" />
                    Live Monitor
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <StopCircle className="mr-2 h-4 w-4" />
                  Force Stop
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  )
}
