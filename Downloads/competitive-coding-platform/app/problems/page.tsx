"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Navbar } from "@/components/ui/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusIcon } from "@/components/ui/status-icon"
import { DifficultyBadge } from "@/components/ui/difficulty-badge"
import { mockUser, mockProblems, type Problem } from "@/lib/mock-data"
import { Search, Shuffle, Code2, Filter, ChevronRight } from "lucide-react"

type DifficultyFilter = "ALL" | "EASY" | "MEDIUM" | "HARD"
type StatusFilter = "ALL" | "SOLVED" | "ATTEMPTED" | "TODO"

export default function ProblemsPage() {
  const [search, setSearch] = useState("")
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("ALL")
  const [status, setStatus] = useState<StatusFilter>("ALL")
  const [selectedTag, setSelectedTag] = useState<string>("ALL")

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    mockProblems.forEach((p) => p.tags.forEach((t) => tags.add(t)))
    return Array.from(tags).sort()
  }, [])

  const filteredProblems = useMemo(() => {
    return mockProblems.filter((problem) => {
      const matchesSearch =
        search === "" ||
        problem.title.toLowerCase().includes(search.toLowerCase()) ||
        problem.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      const matchesDifficulty = difficulty === "ALL" || problem.difficulty === difficulty
      const matchesStatus = status === "ALL" || problem.status === status
      const matchesTag = selectedTag === "ALL" || problem.tags.includes(selectedTag)
      return matchesSearch && matchesDifficulty && matchesStatus && matchesTag
    })
  }, [search, difficulty, status, selectedTag])

  const pickRandom = () => {
    const randomIndex = Math.floor(Math.random() * filteredProblems.length)
    const randomProblem = filteredProblems[randomIndex]
    if (randomProblem) {
      window.location.href = `/problems/${randomProblem.slug}`
    }
  }

  const solvedCount = mockProblems.filter((p) => p.status === "SOLVED").length
  const totalCount = mockProblems.length

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={mockUser} />

      <main className="mx-auto max-w-7xl px-4 pb-12 pt-24 lg:px-6 lg:pt-28">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Problems</h1>
            <p className="mt-2 text-muted-foreground">
              {solvedCount} of {totalCount} problems solved
            </p>
            {/* Progress bar */}
            <div className="mt-3 h-2 w-48 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-success transition-all"
                style={{ width: `${(solvedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>
          <Button
            onClick={pickRandom}
            variant="outline"
            className="border-border/50 bg-card/50"
            disabled={filteredProblems.length === 0}
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
              placeholder="Search problems or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 border-border/50 bg-background/50 pl-10 text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filters:</span>
            </div>

            <Select value={difficulty} onValueChange={(v) => setDifficulty(v as DifficultyFilter)}>
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

            <Select value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
              <SelectTrigger className="h-10 w-[130px] border-border/50 bg-background/50 text-foreground">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="SOLVED">Solved</SelectItem>
                <SelectItem value="ATTEMPTED">Attempted</SelectItem>
                <SelectItem value="TODO">Todo</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger className="h-10 w-[150px] border-border/50 bg-background/50 text-foreground">
                <SelectValue placeholder="Tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Tags</SelectItem>
                {allTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Problems List */}
        {filteredProblems.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-card/50 py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
              <Code2 className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No problems found</h3>
            <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters</p>
            <Button
              variant="outline"
              className="mt-4 bg-transparent"
              onClick={() => {
                setSearch("")
                setDifficulty("ALL")
                setStatus("ALL")
                setSelectedTag("ALL")
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border/50">
            {/* Table Header */}
            <div className="hidden grid-cols-[50px_1fr_120px_120px_50px] items-center gap-4 border-b border-border/50 bg-card/80 px-6 py-4 text-sm font-medium text-muted-foreground sm:grid">
              <span>Status</span>
              <span>Title</span>
              <span className="text-center">Acceptance</span>
              <span className="text-center">Difficulty</span>
              <span></span>
            </div>

            {/* Problem Rows */}
            <div className="divide-y divide-border/50">
              {filteredProblems.map((problem) => (
                <ProblemRow key={problem.id} problem={problem} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function ProblemRow({ problem }: { problem: Problem }) {
  return (
    <Link href={`/problems/${problem.slug}`}>
      <div className="grid grid-cols-1 items-center gap-4 bg-card/30 px-6 py-4 transition-colors hover:bg-card/60 sm:grid-cols-[50px_1fr_120px_120px_50px]">
        <div className="flex items-center gap-3 sm:block">
          <StatusIcon status={problem.status || "TODO"} />
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
          <span className="text-sm text-muted-foreground">{problem.acceptanceRate.toFixed(1)}%</span>
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
