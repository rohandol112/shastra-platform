"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Navbar } from "@/components/ui/navbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StaffGuard } from "@/components/admin-guard"
import {
  ArrowLeft,
  Check,
  X,
  Clock,
  AlertTriangle,
  Target,
  Loader2,
  RotateCcw,
  Trash2,
  User,
  Copy,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  adminApi,
  ApiError,
  formatRuntime,
  formatMemory,
  displayName,
  type AdminSubmissionDetail,
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

export default function AdminSubmissionDetailPageWrapper() {
  return (
    <StaffGuard>
      <AdminSubmissionDetailPage />
    </StaffGuard>
  )
}

function AdminSubmissionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [submission, setSubmission] = useState<AdminSubmissionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const data = await adminApi.submission(id)
      setSubmission(data)
      setError(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load submission")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleRejudge = async () => {
    setBusy(true)
    try {
      await adminApi.rejudgeSubmission(id)
      toast.success("Submission queued for rejudging")
      load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Rejudge failed")
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Delete this submission permanently?")) return
    setBusy(true)
    try {
      await adminApi.deleteSubmission(id)
      toast.success("Submission deleted")
      router.push("/admin/submissions")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Delete failed")
      setBusy(false)
    }
  }

  const copyCode = () => {
    if (!submission) return
    navigator.clipboard.writeText(submission.code)
    toast.success("Code copied")
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !submission) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <h1 className="text-xl font-bold text-foreground">{error || "Submission not found"}</h1>
        <Link href="/admin/submissions" className="mt-4">
          <Button variant="outline">Back to Submissions</Button>
        </Link>
      </div>
    )
  }

  const config = statusConfig[submission.status] ?? statusConfig.FAILED
  const Icon = config.icon
  const isPending = submission.status === "QUEUED" || submission.status === "RUNNING"

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-16">
        <div className="mx-auto max-w-5xl px-4 py-8 lg:px-6">
          <Link href="/admin/submissions" className="mb-6 inline-block">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Submissions
            </Button>
          </Link>

          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl ring-1 ring-inset", config.className)}>
                <Icon className={cn("h-6 w-6", submission.status === "RUNNING" && "animate-spin")} />
              </div>
              <div>
                <Badge className={cn("border font-semibold", config.className)}>{config.label}</Badge>
                <h1 className="mt-1 text-xl font-bold text-foreground">{submission.problem.title}</h1>
                <p className="text-sm text-muted-foreground">
                  {submission.language} · Submitted {new Date(submission.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleRejudge} disabled={busy}>
                {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
                Rejudge
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={busy}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>

          {/* Student + stats */}
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <Card className="border-border bg-card">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{displayName(submission.user)}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    @{submission.user.username}
                    {submission.user.email ? ` · ${submission.user.email}` : ""}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Runtime / Memory</p>
                <p className="mt-1 font-medium text-foreground">
                  {formatRuntime(submission.time)} · {formatMemory(submission.memory)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Score</p>
                <p className="mt-1 font-medium text-foreground">
                  {submission.score ?? (isPending ? "Pending…" : "—")}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Code */}
          <Card className="mb-6 border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-foreground">Submitted Code</CardTitle>
              <Button variant="ghost" size="sm" onClick={copyCode}>
                <Copy className="mr-2 h-3.5 w-3.5" />
                Copy
              </Button>
            </CardHeader>
            <CardContent>
              <pre className="max-h-[500px] overflow-auto rounded-lg bg-[#0d1117] p-4 font-mono text-sm text-foreground">
                {submission.code}
              </pre>
            </CardContent>
          </Card>

          {/* Test case results */}
          {submission.testCaseResults && submission.testCaseResults.length > 0 && (
            <Card className="mb-6 border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Test Case Results</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-background">
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">#</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Status</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Time</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Memory</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {submission.testCaseResults.map((tc, i) => {
                        const tcConfig = statusConfig[tc.status] ?? statusConfig.FAILED
                        return (
                          <tr key={tc.testCaseId}>
                            <td className="px-4 py-2 text-sm text-muted-foreground">{i + 1}</td>
                            <td className="px-4 py-2">
                              <Badge className={cn("border text-xs", tcConfig.className)}>{tcConfig.label}</Badge>
                            </td>
                            <td className="px-4 py-2 text-sm text-muted-foreground">{formatRuntime(tc.time)}</td>
                            <td className="px-4 py-2 text-sm text-muted-foreground">{formatMemory(tc.memory)}</td>
                            <td className="px-4 py-2 text-sm text-muted-foreground">{tc.points}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Output panels */}
          <div className="grid gap-6 sm:grid-cols-2">
            {submission.compileOutput && (
              <Card className="border-border bg-card sm:col-span-2">
                <CardHeader>
                  <CardTitle className="text-sm text-foreground">Compiler Output</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="max-h-64 overflow-auto rounded-lg bg-[#0d1117] p-4 font-mono text-sm text-red-400 ring-1 ring-red-500/20">
                    {submission.compileOutput}
                  </pre>
                </CardContent>
              </Card>
            )}
            {submission.stdout && (
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-sm text-foreground">stdout</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="max-h-64 overflow-auto rounded-lg bg-[#0d1117] p-4 font-mono text-sm text-foreground">
                    {submission.stdout}
                  </pre>
                </CardContent>
              </Card>
            )}
            {submission.stderr && (
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-sm text-foreground">stderr</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="max-h-64 overflow-auto rounded-lg bg-[#0d1117] p-4 font-mono text-sm text-red-400 ring-1 ring-red-500/20">
                    {submission.stderr}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>

          {isPending && (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              This submission is still being judged — refresh in a moment.
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
