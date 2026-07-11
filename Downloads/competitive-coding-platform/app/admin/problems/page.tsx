"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Navbar } from "@/components/ui/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { DifficultyBadge } from "@/components/ui/difficulty-badge"
import { AdminGuard } from "@/components/admin-guard"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Search, Plus, MoreVertical, Trash2, Eye, Copy, Loader2, Globe, EyeOff } from "lucide-react"
import { adminApi, ApiError, type AdminProblem } from "@/lib/api"

export default function AdminProblemsPageWrapper() {
  return (
    <AdminGuard>
      <AdminProblemsPage />
    </AdminGuard>
  )
}

function AdminProblemsPage() {
  const [search, setSearch] = useState("")
  const [problems, setProblems] = useState<AdminProblem[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<AdminProblem | null>(null)
  const [busy, setBusy] = useState(false)

  const loadProblems = async (searchTerm = search) => {
    setLoading(true)
    try {
      const data = await adminApi.problems({ limit: 100, search: searchTerm || undefined })
      setProblems(data.problems)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load problems")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProblems("")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const t = setTimeout(() => loadProblems(search), 400)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setBusy(true)
    try {
      await adminApi.deleteProblem(deleteTarget.id)
      setProblems((prev) => prev.filter((p) => p.id !== deleteTarget.id))
      toast.success(`"${deleteTarget.title}" deleted`)
      setDeleteTarget(null)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Delete failed")
    } finally {
      setBusy(false)
    }
  }

  const togglePublish = async (problem: AdminProblem) => {
    try {
      await adminApi.updateProblem(problem.id, { isPublic: !problem.isPublic })
      setProblems((prev) => prev.map((p) => (p.id === problem.id ? { ...p, isPublic: !p.isPublic } : p)))
      toast.success(problem.isPublic ? "Problem unpublished" : "Problem published")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Update failed")
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
              <h1 className="text-2xl font-bold text-foreground">Problem Management</h1>
              <p className="mt-1 text-muted-foreground">{problems.length} problems in library</p>
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
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : problems.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-muted-foreground">No problems yet.</p>
                  <Link href="/admin/problems/new" className="mt-2 inline-block text-sm text-primary hover:underline">
                    Create your first problem
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-background">
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Problem</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Difficulty</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Visibility</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Submissions</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Created</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {problems.map((problem) => (
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
                            <Badge
                              variant="outline"
                              className={
                                problem.isPublic
                                  ? "border-success/30 bg-success/10 text-success"
                                  : "border-warning/30 bg-warning/10 text-warning"
                              }
                            >
                              {problem.isPublic ? "Published" : "Draft"}
                            </Badge>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-muted-foreground">{problem.submissionCount ?? 0}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-muted-foreground">
                              {new Date(problem.createdAt).toLocaleDateString()}
                            </span>
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
                                <DropdownMenuItem onClick={() => togglePublish(problem)}>
                                  {problem.isPublic ? (
                                    <>
                                      <EyeOff className="mr-2 h-4 w-4" />
                                      Unpublish
                                    </>
                                  ) : (
                                    <>
                                      <Globe className="mr-2 h-4 w-4" />
                                      Publish
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    navigator.clipboard.writeText(problem.slug)
                                    toast.success("Slug copied")
                                  }}
                                >
                                  <Copy className="mr-2 h-4 w-4" />
                                  Copy Slug
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => setDeleteTarget(problem)}
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
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="border-border/50 bg-card">
          <DialogHeader>
            <DialogTitle className="text-foreground">Delete Problem</DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to delete "{deleteTarget?.title}"? All submissions and test cases for this problem
              will be removed. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={busy}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={busy}>
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
