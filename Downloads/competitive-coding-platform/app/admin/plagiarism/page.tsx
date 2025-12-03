"use client"

import { useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/ui/navbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockUser, mockPlagiarismReports, mockContests } from "@/lib/mock-data"
import { Shield, Search, AlertTriangle, CheckCircle, XCircle, Eye, ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

export default function PlagiarismPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [contestFilter, setContestFilter] = useState<string>("ALL")
  const [sortBy, setSortBy] = useState<"similarity" | "date">("similarity")

  const filteredReports = mockPlagiarismReports
    .filter((report) => {
      const matchesSearch =
        search === "" ||
        report.userA.toLowerCase().includes(search.toLowerCase()) ||
        report.userB.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === "ALL" || report.status === statusFilter
      const matchesContest = contestFilter === "ALL" || report.contestId === contestFilter
      return matchesSearch && matchesStatus && matchesContest
    })
    .sort((a, b) => {
      if (sortBy === "similarity") return b.similarity - a.similarity
      return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
    })

  const pendingCount = mockPlagiarismReports.filter((r) => r.status === "PENDING").length
  const confirmedCount = mockPlagiarismReports.filter((r) => r.status === "CONFIRMED").length
  const dismissedCount = mockPlagiarismReports.filter((r) => r.status === "DISMISSED").length

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={mockUser} />

      <main className="mx-auto max-w-7xl px-4 pb-12 pt-24 lg:px-6 lg:pt-28">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                <Shield className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Plagiarism Center</h1>
                <p className="text-muted-foreground">Review and resolve code similarity reports</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          <div className="rounded-2xl border border-warning/30 bg-warning/5 p-6 text-center">
            <p className="text-3xl font-bold text-warning">{pendingCount}</p>
            <p className="text-sm text-muted-foreground">Pending Review</p>
          </div>
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <p className="text-3xl font-bold text-destructive">{confirmedCount}</p>
            <p className="text-sm text-muted-foreground">Confirmed</p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card/50 p-6 text-center">
            <p className="text-3xl font-bold text-muted-foreground">{dismissedCount}</p>
            <p className="text-sm text-muted-foreground">Dismissed</p>
          </div>
        </div>

        {/* Filters */}
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

          <div className="flex flex-wrap items-center gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 w-[140px] border-border/50 bg-background/50">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="DISMISSED">Dismissed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={contestFilter} onValueChange={setContestFilter}>
              <SelectTrigger className="h-10 w-[180px] border-border/50 bg-background/50">
                <SelectValue placeholder="Contest" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Contests</SelectItem>
                {mockContests.map((contest) => (
                  <SelectItem key={contest.id} value={contest.id}>
                    {contest.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortBy(sortBy === "similarity" ? "date" : "similarity")}
              className="border-border/50"
            >
              <ArrowUpDown className="mr-2 h-4 w-4" />
              {sortBy === "similarity" ? "By Similarity" : "By Date"}
            </Button>
          </div>
        </div>

        {/* Reports Table */}
        <div className="overflow-hidden rounded-2xl border border-border/50">
          <div className="hidden grid-cols-[1fr_1fr_120px_120px_100px_100px] items-center gap-4 border-b border-border/50 bg-card/80 px-6 py-4 text-sm font-medium text-muted-foreground lg:grid">
            <span>User A (Suspect)</span>
            <span>User B (Source)</span>
            <span className="text-center">Similarity</span>
            <span className="text-center">Problem</span>
            <span className="text-center">Status</span>
            <span className="text-center">Action</span>
          </div>

          <div className="divide-y divide-border/50">
            {filteredReports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Shield className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-lg font-medium text-foreground">No reports found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
              </div>
            ) : (
              filteredReports.map((report) => (
                <div
                  key={report.id}
                  className={cn(
                    "grid grid-cols-1 gap-4 bg-card/30 px-6 py-4 transition-colors hover:bg-card/60 lg:grid-cols-[1fr_1fr_120px_120px_100px_100px] lg:items-center",
                    report.similarity >= 80 && report.status === "PENDING" && "bg-destructive/5",
                  )}
                >
                  {/* User A */}
                  <div>
                    <span className="text-xs text-muted-foreground lg:hidden">Suspect: </span>
                    <span className="font-medium text-foreground">{report.userA}</span>
                  </div>

                  {/* User B */}
                  <div>
                    <span className="text-xs text-muted-foreground lg:hidden">Source: </span>
                    <span className="font-medium text-foreground">{report.userB}</span>
                  </div>

                  {/* Similarity */}
                  <div className="flex items-center gap-2 lg:justify-center">
                    <span className="text-xs text-muted-foreground lg:hidden">Similarity: </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-mono",
                        report.similarity >= 90
                          ? "border-destructive/50 bg-destructive/10 text-destructive"
                          : report.similarity >= 70
                            ? "border-warning/50 bg-warning/10 text-warning"
                            : "border-border",
                      )}
                    >
                      {report.similarity}%
                    </Badge>
                  </div>

                  {/* Problem */}
                  <div className="text-center">
                    <span className="text-xs text-muted-foreground lg:hidden">Problem: </span>
                    <span className="text-sm text-muted-foreground">{report.problemTitle}</span>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2 lg:justify-center">
                    <span className="text-xs text-muted-foreground lg:hidden">Status: </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        report.status === "PENDING" && "border-warning/50 bg-warning/10 text-warning",
                        report.status === "CONFIRMED" && "border-destructive/50 bg-destructive/10 text-destructive",
                        report.status === "DISMISSED" && "border-muted-foreground/50 bg-muted/10 text-muted-foreground",
                      )}
                    >
                      {report.status === "PENDING" && <AlertTriangle className="mr-1 h-3 w-3" />}
                      {report.status === "CONFIRMED" && <XCircle className="mr-1 h-3 w-3" />}
                      {report.status === "DISMISSED" && <CheckCircle className="mr-1 h-3 w-3" />}
                      {report.status}
                    </Badge>
                  </div>

                  {/* Action */}
                  <div className="flex justify-center">
                    <Link href={`/admin/plagiarism/${report.id}`}>
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
