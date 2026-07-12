"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Navbar } from "@/components/ui/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StaffGuard } from "@/components/admin-guard"
import {
  Search,
  Eye,
  Trash2,
  RotateCcw,
  Loader2,
  Check,
  X,
  Clock,
  AlertTriangle,
  Target,
  FileCode2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  adminApi,
  ApiError,
  formatRuntime,
  formatMemory,
  displayName,
  type AdminSubmissionListItem,
  type SubmissionStatus,
} from "@/lib/api"

const statusConfig: Record<string, { icon: any; label: string; className: string }> = {
  ACCEPTED: { icon: Check, label: "Accepted", className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" },
  WRONG_ANSWER: { icon: X, label: "Wrong Answer", className: "border-red-500/30 bg-red-500/10 text-red-400" },
  TIME_LIMIT_EXCEEDED: { icon: Clock, label: "Time Limit", className: "border-amber-500/30 bg-amber-500/10 text-amber-400" },
  MEMORY_LIMIT_EXCEEDED: { icon: Clock, label: "Memory Limit", className: "border-amber-500/30 bg-amber-500/10 text-amber-400" },
  RUNTIME_ERROR: { icon: AlertTriangle, label: "Runtime Error", className: "border-red-500/30 bg-red-500/10 text-red-400" },
  COMPILE_ERROR: { icon: AlertTriangle, label: "Compile Error", className: "border-red-500/30 bg-red-500/10 text-red-400" },
  PARTIAL: { icon: Target, label: "Partial", className: "border-amber-500/30 bg-amber-500/10 text-amber-400" },
  FAILED: { icon: AlertTriangle, label: "Failed", className: "border-red-500/30 bg-red-500/10 text-red-400" },
  QUEUED: { icon: Clock, label: "Queued", className: "border-sky-500/30 bg-sky-500/10 text-sky-400" },
  RUNNING: { icon: Loader2, label: "Running", className: "border-sky-500/30 bg-sky-500/10 text-sky-400" },
}

const STATUS_OPTIONS: SubmissionStatus[] = [
  "QUEUED",
  "RUNNING",
  "ACCEPTED",
  "WRONG_ANSWER",
  "TIME_LIMIT_EXCEEDED",
  "MEMORY_LIMIT_EXCEEDED",
  "RUNTIME_ERROR",
  "COMPILE_ERROR",
  "PARTIAL",
  "FAILED",
]

export default function AdminSubmissionsPageWrapper() {
  return (
    <StaffGuard>
      <AdminSubmissionsPage />
    </StaffGuard>
  )
}

function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<AdminSubmissionListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<SubmissionStatus | "ALL">("ALL")
  const [busyId, setBusyId] = useState<string | null>(null)

  const loadSubmissions = async () => {
    setLoading(true)
    try {
      const data = await adminApi.submissions({
        page,
        limit: 30,
        status: status === "ALL" ? undefined : status,
      })
      setSubmissions(data.submissions)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load submissions")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSubmissions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status])

  const filtered = submissions.filter((s) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      s.user.username.toLowerCase().includes(q) ||
      s.problem.title.toLowerCase().includes(q) ||
      (s.user.email ?? "").toLowerCase().includes(q)
    )
  })

  const handleRejudge = async (id: string) => {
    setBusyId(id)
    try {
      await adminApi.rejudgeSubmission(id)
      setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, status: "QUEUED" } : s)))
      toast.success("Submission queued for rejudging")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Rejudge failed")
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this submission permanently?")) return
    setBusyId(id)
    try {
      await adminApi.deleteSubmission(id)
      setSubmissions((prev) => prev.filter((s) => s.id !== id))
      setTotal((t) => Math.max(0, t - 1))
      toast.success("Submission deleted")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Delete failed")
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-16">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
          {/* Header */}
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <FileCode2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Submissions</h1>
              <p className="text-muted-foreground">{total} total submissions</p>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by student or problem..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 border-border/50 bg-card/50 pl-10 text-foreground"
              />
            </div>
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v as SubmissionStatus | "ALL")
                setPage(1)
              }}
            >
              <SelectTrigger className="h-11 w-[200px] border-border/50 bg-card/50 text-foreground">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {statusConfig[s]?.label ?? s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <Card className="border-border bg-card">
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground">No submissions found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-background">
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Student</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Problem</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Language</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Runtime</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Submitted</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filtered.map((s) => {
                        const config = statusConfig[s.status] ?? statusConfig.FAILED
                        const Icon = config.icon
                        const isBusy = busyId === s.id
                        return (
                          <tr key={s.id} className="hover:bg-background/50">
                            <td className="px-4 py-4">
                              <p className="font-medium text-foreground">{displayName(s.user)}</p>
                              <p className="text-sm text-muted-foreground">@{s.user.username}</p>
                            </td>
                            <td className="px-4 py-4">
                              <Link href={`/problems/${s.problem.slug}`} className="text-foreground hover:text-primary hover:underline">
                                {s.problem.title}
                              </Link>
                            </td>
                            <td className="px-4 py-4">
                              <Badge className={cn("border font-medium", config.className)}>
                                <Icon className={cn("mr-1 h-3 w-3", s.status === "RUNNING" && "animate-spin")} />
                                {config.label}
                              </Badge>
                            </td>
                            <td className="px-4 py-4">
                              <span className="text-sm text-muted-foreground">{s.language}</span>
                            </td>
                            <td className="px-4 py-4">
                              <span className="text-sm text-muted-foreground">
                                {formatRuntime(s.time)} · {formatMemory(s.memory)}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <span className="text-sm text-muted-foreground">
                                {new Date(s.createdAt).toLocaleString()}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center justify-end gap-1">
                                <Link href={`/admin/submissions/${s.id}`}>
                                  <Button variant="ghost" size="icon" className="h-8 w-8" title="View">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  title="Rejudge"
                                  disabled={isBusy}
                                  onClick={() => handleRejudge(s.id)}
                                >
                                  {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  title="Delete"
                                  disabled={isBusy}
                                  onClick={() => handleDelete(s.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
