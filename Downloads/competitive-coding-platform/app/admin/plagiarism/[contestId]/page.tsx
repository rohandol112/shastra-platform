"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Navbar } from "@/components/ui/navbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StaffGuard } from "@/components/admin-guard"
import { Shield, Search, AlertTriangle, CheckCircle, XCircle, Eye, ArrowLeft, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { adminApi, ApiError, type PlagiarismReportRow } from "@/lib/api"

export default function ContestReportsWrapper() {
  return (
    <StaffGuard>
      <ContestReportsPage />
    </StaffGuard>
  )
}

function ContestReportsPage() {
  const contestId = useParams().contestId as string
  const [reports, setReports] = useState<PlagiarismReportRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")

  useEffect(() => {
    setLoading(true)
    adminApi
      .plagiarismReports(contestId, { status: statusFilter === "ALL" ? undefined : statusFilter })
      .then((d) => setReports(d.reports))
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Failed to load reports"))
      .finally(() => setLoading(false))
  }, [contestId, statusFilter])

  const filtered = reports.filter(
    (r) =>
      search === "" ||
      r.userA.toLowerCase().includes(search.toLowerCase()) ||
      r.userB.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-12 pt-24 lg:px-6 lg:pt-28">
        <Link
          href="/admin/plagiarism"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          All contests
        </Link>

        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
            <Shield className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Flagged Pairs</h1>
            <p className="text-muted-foreground">Similar submissions from different users, highest similarity first.</p>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-border/50 bg-card/50 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 border-border/50 bg-background/50 pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 w-[150px] border-border/50 bg-background/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="DISMISSED">Dismissed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border/50">
          <div className="hidden grid-cols-[1fr_1fr_110px_1fr_110px_100px] items-center gap-4 border-b border-border/50 bg-card/80 px-6 py-4 text-sm font-medium text-muted-foreground lg:grid">
            <span>Suspect (later)</span>
            <span>Source (earlier)</span>
            <span className="text-center">Similarity</span>
            <span>Problem</span>
            <span className="text-center">Status</span>
            <span className="text-center">Action</span>
          </div>

          <div className="divide-y divide-border/50">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Shield className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-lg font-medium text-foreground">No reports</p>
                <p className="text-sm text-muted-foreground">Nothing matched your filters.</p>
              </div>
            ) : (
              filtered.map((r) => (
                <div
                  key={r.id}
                  className={cn(
                    "grid grid-cols-1 gap-4 bg-card/30 px-6 py-4 transition-colors hover:bg-card/60 lg:grid-cols-[1fr_1fr_110px_1fr_110px_100px] lg:items-center",
                    r.similarity >= 85 && r.status === "PENDING" && "bg-destructive/5"
                  )}
                >
                  <div className="font-medium text-foreground">{r.userA}</div>
                  <div className="font-medium text-foreground">{r.userB}</div>
                  <div className="flex items-center gap-2 lg:justify-center">
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-mono",
                        r.similarity >= 90
                          ? "border-destructive/50 bg-destructive/10 text-destructive"
                          : r.similarity >= 75
                            ? "border-warning/50 bg-warning/10 text-warning"
                            : "border-border"
                      )}
                    >
                      {r.similarity}%
                    </Badge>
                  </div>
                  <div className="truncate text-sm text-muted-foreground">{r.problemTitle}</div>
                  <div className="flex items-center gap-2 lg:justify-center">
                    <Badge
                      variant="outline"
                      className={cn(
                        r.status === "PENDING" && "border-warning/50 bg-warning/10 text-warning",
                        r.status === "CONFIRMED" && "border-destructive/50 bg-destructive/10 text-destructive",
                        r.status === "DISMISSED" && "border-muted-foreground/50 bg-muted/10 text-muted-foreground"
                      )}
                    >
                      {r.status === "PENDING" && <AlertTriangle className="mr-1 h-3 w-3" />}
                      {r.status === "CONFIRMED" && <XCircle className="mr-1 h-3 w-3" />}
                      {r.status === "DISMISSED" && <CheckCircle className="mr-1 h-3 w-3" />}
                      {r.status}
                    </Badge>
                  </div>
                  <div className="flex lg:justify-center">
                    <Link href={`/admin/plagiarism/${contestId}/${r.id}`}>
                      <Button size="sm" variant="outline" className="border-border/50 bg-transparent">
                        <Eye className="mr-2 h-4 w-4" />
                        Review
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
