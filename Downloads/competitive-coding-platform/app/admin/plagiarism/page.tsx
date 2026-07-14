"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Navbar } from "@/components/ui/navbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StaffGuard } from "@/components/admin-guard"
import { Shield, ScanLine, Loader2, ChevronRight, AlertTriangle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { adminApi, ApiError, type PlagiarismContestSummary } from "@/lib/api"

export default function PlagiarismPageWrapper() {
  return (
    <StaffGuard>
      <PlagiarismPage />
    </StaffGuard>
  )
}

function PlagiarismPage() {
  const [contests, setContests] = useState<PlagiarismContestSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState<string | null>(null)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)

  // Guards against setState after the user navigates away mid-scan.
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const load = () => {
    setLoading(true)
    adminApi
      .plagiarismContests()
      .then((d) => setContests(d.contests))
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Failed to load contests"))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const runScan = async (contest: PlagiarismContestSummary) => {
    setScanning(contest.id)
    setProgress(null)
    try {
      const started = await adminApi.scanContestPlagiarism(contest.id)
      const deadline = Date.now() + 10 * 60_000
      let job = await adminApi.pollPlagiarismScan(started.jobId)
      while (job.status === "PENDING") {
        if (!mounted.current) return
        if (Date.now() > deadline) {
          toast.error("Scan is taking longer than expected — refresh in a moment.")
          break
        }
        if (job.progress) setProgress({ done: job.progress.done, total: job.progress.total })
        await new Promise((r) => setTimeout(r, 1200))
        job = await adminApi.pollPlagiarismScan(started.jobId)
      }
      if (!mounted.current) return
      if (job.status === "COMPLETED") {
        toast.success(`Scan complete — ${job.reportsCreated ?? 0} report(s) across ${job.problemsScanned ?? 0} problem(s)`)
        load()
      } else if (job.status === "FAILED") {
        toast.error(job.error || "Scan failed")
      }
    } catch (err) {
      if (mounted.current) toast.error(err instanceof ApiError ? err.message : "Scan failed")
    } finally {
      if (mounted.current) {
        setScanning(null)
        setProgress(null)
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-12 pt-24 lg:px-6 lg:pt-28">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
            <Shield className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Plagiarism Center</h1>
            <p className="text-muted-foreground">
              Run a similarity scan per contest, then review flagged pairs. Scans are on-demand — run them after a
              contest to keep CPU free while it's live.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center rounded-2xl border border-border/50 bg-card/50 py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : contests.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-card/50 py-16 text-center">
            <Shield className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-lg font-medium text-foreground">No contests with problems yet</p>
            <p className="text-sm text-muted-foreground">Create a contest and add problems to scan for plagiarism.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {contests.map((c) => (
              <div
                key={c.id}
                className="flex flex-col gap-4 rounded-2xl border border-border/50 bg-card/40 p-5 transition-colors hover:bg-card/70 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="truncate text-lg font-semibold text-foreground">{c.title}</h3>
                    <Badge variant="outline" className="border-border/50 text-xs text-muted-foreground">
                      {c.status}
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
                    {c.reportCount > 0 ? (
                      <>
                        <span className="flex items-center gap-1.5 text-destructive">
                          <AlertTriangle className="h-4 w-4" />
                          {c.reportCount} flagged
                        </span>
                        {c.pendingCount > 0 && (
                          <span className="text-warning">{c.pendingCount} pending review</span>
                        )}
                        {c.confirmedCount > 0 && (
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <CheckCircle className="h-4 w-4" />
                            {c.confirmedCount} confirmed
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-muted-foreground">
                        {c.lastDetectedAt ? "No matches found" : "Not scanned yet"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => runScan(c)}
                    disabled={scanning !== null}
                    className="border-border/50"
                  >
                    {scanning === c.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {progress ? `Scanning ${progress.done}/${progress.total}…` : "Scanning…"}
                      </>
                    ) : (
                      <>
                        <ScanLine className="mr-2 h-4 w-4" />
                        {c.lastDetectedAt ? "Re-scan" : "Run Scan"}
                      </>
                    )}
                  </Button>
                  {c.reportCount > 0 && (
                    <Link href={`/admin/plagiarism/${c.id}`}>
                      <Button className={cn(c.pendingCount > 0 && "bg-destructive hover:bg-destructive/90")}>
                        Review
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
