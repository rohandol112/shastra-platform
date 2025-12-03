"use client"

import { useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/ui/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { DifficultyBadge } from "@/components/ui/difficulty-badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { mockUser, mockProblems } from "@/lib/mock-data"
import { Search, Plus, MoreVertical, Edit, Trash2, Eye, Copy } from "lucide-react"

export default function AdminProblemsPage() {
  const [search, setSearch] = useState("")
  const [problems, setProblems] = useState(mockProblems)

  const filteredProblems = problems.filter(
    (problem) =>
      problem.title.toLowerCase().includes(search.toLowerCase()) ||
      problem.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())),
  )

  const handleDelete = (problemId: string) => {
    if (confirm("Are you sure you want to delete this problem?")) {
      setProblems((prev) => prev.filter((p) => p.id !== problemId))
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar user={mockUser} />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Problem Management</h1>
              <p className="mt-1 text-muted-foreground">{filteredProblems.length} problems in library</p>
            </div>
            <Link href="/admin/problems/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Problem
              </Button>
            </Link>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search problems..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-input bg-card pl-9 text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Problems Table */}
          <Card className="border-border bg-card">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-background">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Problem</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Difficulty</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Tags</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Acceptance</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredProblems.map((problem) => (
                      <tr key={problem.id} className="hover:bg-background/50">
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-foreground">{problem.title}</p>
                            <p className="text-sm text-muted-foreground">/{problem.slug}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <DifficultyBadge difficulty={problem.difficulty} />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1">
                            {problem.tags.slice(0, 2).map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="bg-secondary text-secondary-foreground text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {problem.tags.length > 2 && (
                              <Badge variant="secondary" className="bg-secondary text-secondary-foreground text-xs">
                                +{problem.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-muted-foreground">{problem.acceptanceRate.toFixed(1)}%</span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/problems/${problem.slug}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Preview
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/problems/${problem.slug}/edit`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(problem.slug)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Copy Slug
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDelete(problem.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
