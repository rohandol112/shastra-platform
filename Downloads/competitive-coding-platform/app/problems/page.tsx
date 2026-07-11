"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/ui/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusIcon } from "@/components/ui/status-icon"
import { DifficultyBadge } from "@/components/ui/difficulty-badge"
import { Search, Shuffle, Code2, Filter, ChevronRight, ChevronLeft, Loader2, AlertCircle } from "lucide-react"
import { useProblemStore } from "@/lib/stores/problem-store"
import { useAuthStore } from "@/lib/stores/auth-store"
import type { Difficulty, ProblemListItem } from "@/lib/api"

type DifficultyFilter = Difficulty | "ALL"
type StatusFilter = "ALL" | "SOLVED" | "TODO"

export default function ProblemsPage() {
  const {
    problems,
    pagination,
    tags,
    filters,
    loading,
    error,
    setFilters,
    fetchProblems,
    fetchTags,
  } = useProblemStore()
  const hydrated = useAuthStore((s) => s.hydrated)
  const token = useAuthStore((s) => s.token)

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL")
  const [searchInput, setSearchInput] = useState(filters.search)

  // Wait for auth hydration so the request carries the token (for solved status)
  useEffect(() => {
    if (!hydrated) return
    fetchProblems()
    fetchTags()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, token, filters.page, filters.difficulty, filters.tag, filters.search])

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput !== filters.search) setFilters({ search: searchInput })
    }, 400)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

  const visibleProblems = useMemo(() => {
    if (statusFilter === "ALL") return problems
    return problems.filter((p) => (statusFilter === "SOLVED" ? p.isSolved : !p.isSolved))
  }, [problems, statusFilter])

  const pickRandom = () => {
    if (visibleProblems.length === 0) return
    const randomProblem = visibleProblems[Math.floor(Math.random() * visibleProblems.length)]
    window.location.href = `/problems/${randomProblem.slug}`
  }

  const solvedCount = problems.filter((p) => p.isSolved).length
  const totalCount = pagination?.total ?? problems.length

  const clearFilters = () => {
    setSearchInput("")
    setStatusFilter("ALL")
    setFilters({ search: "", difficulty: "ALL", tag: "ALL", page: 1 })
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-12 pt-24 lg:px-6 lg:pt-28">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Problems</h1>
            <p className="mt-2 text-muted-foreground">
              {token
                ? `${solvedCount} solved on this page · ${totalCount} problems total`
                : `${totalCount} problems — sign in to track your progress`}
            </p>
            {token && problems.length > 0 && (
              <div className="mt-3 h-2 w-48 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-success transition-all"
                  style={{ width: `${(solvedCount / Math.max(problems.length, 1)) * 100}%` }}
                />
              </div>
            )}
          </div>
          <Button
            onClick={pickRandom}
            variant="outline"
            className="border-border/50 bg-card/50"
            disabled={visibleProblems.length === 0}
          >
            <Shuffle className="mr-2 h-4 w-4" />
            Pick Random
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-border/50 bg-card/50 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search problems..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-11 border-border/50 bg-background/50 pl-10 text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filters:</span>
            </div>

            <Select
              value={filters.difficulty}
              onValueChange={(v) => setFilters({ difficulty: v as DifficultyFilter })}
            >
              <SelectTrigger className="h-10 w-[130px] border-border/50 bg-background/50 text-foreground">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Levels</SelectItem>
                <SelectItem value="EASY">Easy</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HARD">Hard</SelectItem>
              </SelectContent>
            </Select>

            {token && (
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                <SelectTrigger className="h-10 w-[130px] border-border/50 bg-background/50 text-foreground">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="SOLVED">Solved</SelectItem>
                  <SelectItem value="TODO">Todo</SelectItem>
                </SelectContent>
              </Select>
            )}

            <Select value={filters.tag} onValueChange={(v) => setFilters({ tag: v })}>
              <SelectTrigger className="h-10 w-[150px] border-border/50 bg-background/50 text-foreground">
                <SelectValue placeholder="Tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Tags</SelectItem>
                {tags.map(({ tag, count }) => (
                  <SelectItem key={tag} value={tag}>
                    {tag} ({count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center rounded-2xl border border-border/50 bg-card/50 py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-3 text-muted-foreground">Loading problems...</span>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/5 py-16 text-center">
            <AlertCircle className="mb-3 h-8 w-8 text-destructive" />
            <h3 className="text-lg font-semibold text-foreground">Couldn't load problems</h3>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" className="mt-4 bg-transparent" onClick={() => fetchProblems()}>
              Try Again
            </Button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && visibleProblems.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-card/50 py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
              <Code2 className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No problems found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {problems.length === 0 && filters.search === "" && filters.difficulty === "ALL"
                ? "No problems have been published yet — check back soon"
                : "Try adjusting your search or filters"}
            </p>
            <Button variant="outline" className="mt-4 bg-transparent" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        )}

        {/* Problems List */}
        {!loading && !error && visibleProblems.length > 0 && (
          <>
            <div className="overflow-hidden rounded-2xl border border-border/50">
              <div className="hidden grid-cols-[50px_1fr_120px_120px_50px] items-center gap-4 border-b border-border/50 bg-card/80 px-6 py-4 text-sm font-medium text-muted-foreground sm:grid">
                <span>Status</span>
                <span>Title</span>
                <span className="text-center">Acceptance</span>
                <span className="text-center">Difficulty</span>
                <span></span>
              </div>

              <div className="divide-y divide-border/50">
                {visibleProblems.map((problem) => (
                  <ProblemRow key={problem.id} problem={problem} />
                ))}
              </div>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent"
                  disabled={filters.page <= 1}
                  onClick={() => setFilters({ page: filters.page - 1 })}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent"
                  disabled={filters.page >= pagination.totalPages}
                  onClick={() => setFilters({ page: filters.page + 1 })}
                >
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

function ProblemRow({ problem }: { problem: ProblemListItem }) {
  return (
    <Link href={`/problems/${problem.slug}`}>
      <div className="grid grid-cols-1 items-center gap-4 bg-card/30 px-6 py-4 transition-colors hover:bg-card/60 sm:grid-cols-[50px_1fr_120px_120px_50px]">
        <div className="flex items-center gap-3 sm:block">
          <StatusIcon status={problem.isSolved ? "SOLVED" : "TODO"} />
          <span className="font-medium text-foreground sm:hidden">{problem.title}</span>
        </div>

        <div className="hidden sm:block">
          <span className="font-medium text-foreground">{problem.title}</span>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {problem.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-secondary/50 text-xs text-secondary-foreground">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-center">
          <span className="text-sm text-muted-foreground sm:hidden">Acceptance</span>
          <span className="text-sm text-muted-foreground">
            {problem.totalSubmissions > 0 ? `${problem.acceptanceRate.toFixed(1)}%` : "—"}
          </span>
        </div>

        <div className="flex items-center justify-between sm:justify-center">
          <span className="text-sm text-muted-foreground sm:hidden">Difficulty</span>
          <DifficultyBadge difficulty={problem.difficulty} />
        </div>

        <div className="hidden items-center justify-center sm:flex">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>

        {/* Tags for mobile */}
        <div className="flex flex-wrap gap-1.5 sm:hidden">
          {problem.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="bg-secondary/50 text-xs text-secondary-foreground">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </Link>
  )
}
