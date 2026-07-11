"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Navbar } from "@/components/ui/navbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminGuard } from "@/components/admin-guard"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  MoreVertical,
  Eye,
  Users,
  Activity,
  StopCircle,
  Clock,
  Calendar,
  Trophy,
  PlayCircle,
  CalendarCheck,
  Trash2,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { adminApi, ApiError, type ContestListItem, type ContestStatus } from "@/lib/api"

type AdminContest = ContestListItem & { isPublic?: boolean }

export default function AdminContestsPageWrapper() {
  return (
    <AdminGuard>
      <AdminContestsPage />
    </AdminGuard>
  )
}

function AdminContestsPage() {
  const [contests, setContests] = useState<AdminContest[]>([])
  const [loading, setLoading] = useState(true)

  const loadContests = async () => {
    setLoading(true)
    try {
      const data = await adminApi.contests({ limit: 100 })
      setContests(data.contests)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load contests")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadContests()
  }, [])

  const draftContests = contests.filter((c) => c.status === "DRAFT")
  const upcomingContests = contests.filter((c) => c.status === "SCHEDULED")
  const liveContests = contests.filter((c) => c.status === "RUNNING")
  const pastContests = contests.filter((c) => c.status === "ENDED" || c.status === "CANCELLED")

  const changeStatus = async (contest: AdminContest, status: ContestStatus) => {
    try {
      await adminApi.updateContestStatus(contest.id, status)
      setContests((prev) => prev.map((c) => (c.id === contest.id ? { ...c, status } : c)))
      toast.success(`"${contest.title}" is now ${status}`)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Status update failed")
    }
  }

  const deleteContest = async (contest: AdminContest) => {
    if (!confirm(`Delete "${contest.title}"? This cannot be undone.`)) return
    try {
      await adminApi.deleteContest(contest.id)
      setContests((prev) => prev.filter((c) => c.id !== contest.id))
      toast.success("Contest deleted")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Delete failed")
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-16">
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

          {loading ? (
            <div className="flex items-center justify-center rounded-2xl border border-border/50 bg-card/50 py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Live Contests Alert */}
              {liveContests.length > 0 && (
                <div className="mb-6 space-y-3">
                  {liveContests.map((contest) => (
                    <Card key={contest.id} className="border-success/50 bg-success/5">
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/20">
                            <Activity className="h-5 w-5 animate-pulse text-success" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{contest.title} is LIVE</p>
                            <p className="text-sm text-muted-foreground">
                              {contest.participantCount} registered participants
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/contests/${contest.slug}/results`}>
                            <Button variant="outline" size="sm">
                              <Activity className="mr-2 h-4 w-4" />
                              Leaderboard
                            </Button>
                          </Link>
                          <Button variant="destructive" size="sm" onClick={() => changeStatus(contest, "ENDED")}>
                            <StopCircle className="mr-2 h-4 w-4" />
                            End Contest
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Tabs */}
              <Tabs defaultValue="upcoming" className="space-y-6">
                <TabsList className="bg-card">
                  <TabsTrigger value="draft">Drafts ({draftContests.length})</TabsTrigger>
                  <TabsTrigger value="upcoming">Scheduled ({upcomingContests.length})</TabsTrigger>
                  <TabsTrigger value="live">Live ({liveContests.length})</TabsTrigger>
                  <TabsTrigger value="past">Past ({pastContests.length})</TabsTrigger>
                </TabsList>

                {(
                  [
                    ["draft", draftContests],
                    ["upcoming", upcomingContests],
                    ["live", liveContests],
                    ["past", pastContests],
                  ] as const
                ).map(([key, list]) => (
                  <TabsContent key={key} value={key} className="space-y-4">
                    {list.length === 0 ? (
                      <div className="rounded-xl border border-border/50 bg-card/30 py-12 text-center text-muted-foreground">
                        No contests here.
                      </div>
                    ) : (
                      list.map((contest) => (
                        <ContestRow
                          key={contest.id}
                          contest={contest}
                          onChangeStatus={changeStatus}
                          onDelete={deleteContest}
                        />
                      ))
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

const statusStyles: Record<string, string> = {
  DRAFT: "border-slate-500/30 bg-slate-500/10 text-slate-400",
  SCHEDULED: "border-primary/30 bg-primary/10 text-primary",
  RUNNING: "border-success/30 bg-success/10 text-success",
  ENDED: "border-border/50 bg-muted/20 text-muted-foreground",
  CANCELLED: "border-destructive/30 bg-destructive/10 text-destructive",
}

function ContestRow({
  contest,
  onChangeStatus,
  onDelete,
}: {
  contest: AdminContest
  onChangeStatus: (contest: AdminContest, status: ContestStatus) => void
  onDelete: (contest: AdminContest) => void
}) {
  const startDate = new Date(contest.startTime)

  return (
    <Card className="border-border bg-card">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-semibold text-foreground">{contest.title}</h3>
            <Badge variant="outline" className={cn("border", statusStyles[contest.status])}>
              {contest.status}
            </Badge>
            <Badge variant="secondary" className="bg-secondary/50 text-xs">
              {contest.type}
            </Badge>
          </div>
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {startDate.toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {contest.duration} min
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {contest.participantCount}
            </span>
            <span className="flex items-center gap-1.5">
              <Trophy className="h-4 w-4" />
              {contest.problemCount} problems
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {contest.status === "DRAFT" && (
            <Button size="sm" variant="outline" onClick={() => onChangeStatus(contest, "SCHEDULED")}>
              <CalendarCheck className="mr-2 h-4 w-4" />
              Schedule
            </Button>
          )}
          {contest.status === "SCHEDULED" && (
            <Button size="sm" onClick={() => onChangeStatus(contest, "RUNNING")}>
              <PlayCircle className="mr-2 h-4 w-4" />
              Start Now
            </Button>
          )}
          {contest.status === "RUNNING" && (
            <Button size="sm" variant="destructive" onClick={() => onChangeStatus(contest, "ENDED")}>
              <StopCircle className="mr-2 h-4 w-4" />
              End
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/contests/${contest.slug}/results`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Leaderboard
                </Link>
              </DropdownMenuItem>
              {contest.status !== "ENDED" && contest.status !== "CANCELLED" && (
                <DropdownMenuItem onClick={() => onChangeStatus(contest, "CANCELLED")}>
                  <StopCircle className="mr-2 h-4 w-4" />
                  Cancel Contest
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(contest)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}
