"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Navbar } from "@/components/ui/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { DifficultyBadge } from "@/components/ui/difficulty-badge"
import { StaffGuard } from "@/components/admin-guard"
import { ArrowLeft, Save, Plus, X, Search, Loader2, Eye } from "lucide-react"
import {
  adminApi,
  ApiError,
  type AdminProblem,
  type AdminContestDetail,
  type ContestType,
  type ContestStatus,
  type Difficulty,
} from "@/lib/api"

const STATUSES: ContestStatus[] = ["DRAFT", "SCHEDULED", "RUNNING", "ENDED", "CANCELLED"]

interface SelectedProblem {
  problemId: string
  title: string
  difficulty: Difficulty
  points: number
  bonus: number
}

const pad = (n: number) => String(n).padStart(2, "0")
const toDateInput = (iso: string) => {
  const d = new Date(iso)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
const toTimeInput = (iso: string) => {
  const d = new Date(iso)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function EditContestPageWrapper() {
  return (
    <StaffGuard>
      <EditContestPage />
    </StaffGuard>
  )
}

function EditContestPage() {
  const contestId = useParams().id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [slug, setSlug] = useState("")
  const [status, setStatus] = useState<ContestStatus>("DRAFT")
  const [originalProblemIds, setOriginalProblemIds] = useState<string[]>([])

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    type: "PUBLIC" as ContestType,
    isPublic: true,
    maxParticipants: "",
    rules: "",
    prizes: "",
  })

  const [selectedProblems, setSelectedProblems] = useState<SelectedProblem[]>([])
  const [allProblems, setAllProblems] = useState<AdminProblem[]>([])
  const [problemsLoading, setProblemsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    adminApi
      .contest(contestId)
      .then((c: AdminContestDetail) => {
        setSlug(c.slug)
        setStatus(c.status)
        setForm({
          title: c.title,
          slug: c.slug,
          description: c.description ?? "",
          startDate: toDateInput(c.startTime),
          startTime: toTimeInput(c.startTime),
          endDate: toDateInput(c.endTime),
          endTime: toTimeInput(c.endTime),
          type: c.type,
          isPublic: c.isPublic,
          maxParticipants: c.maxParticipants ? String(c.maxParticipants) : "",
          rules: c.rules ?? "",
          prizes: c.prizes ?? "",
        })
        const probs = (c.problems ?? [])
          .slice()
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((p) => ({
            problemId: p.problemId,
            title: p.problem.title,
            difficulty: p.problem.difficulty,
            points: p.points,
            bonus: p.bonusPoints,
          }))
        setSelectedProblems(probs)
        setOriginalProblemIds(probs.map((p) => p.problemId))
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Failed to load contest"))
      .finally(() => setLoading(false))

    adminApi
      .problems({ limit: 100 })
      .then((data) => setAllProblems(data.problems))
      .catch(() => {})
      .finally(() => setProblemsLoading(false))
  }, [contestId])

  const availableProblems = allProblems.filter(
    (p) =>
      !selectedProblems.some((sp) => sp.problemId === p.id) &&
      (searchQuery === "" || p.title.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const addProblem = (p: AdminProblem) =>
    setSelectedProblems((prev) => [...prev, { problemId: p.id, title: p.title, difficulty: p.difficulty, points: 100, bonus: 0 }])
  const removeProblem = (problemId: string) =>
    setSelectedProblems((prev) => prev.filter((p) => p.problemId !== problemId))
  const updatePoints = (problemId: string, field: "points" | "bonus", value: number) =>
    setSelectedProblems((prev) => prev.map((p) => (p.problemId === problemId ? { ...p, [field]: value } : p)))

  const changeStatus = async (next: ContestStatus) => {
    if ((next === "RUNNING" || next === "ENDED" || next === "CANCELLED") &&
        !confirm(`Change status to ${next}? Participants will be affected immediately.`)) {
      return
    }
    try {
      await adminApi.updateContestStatus(contestId, next)
      setStatus(next)
      toast.success(`Status changed to ${next}`)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to change status")
    }
  }

  const handleSave = async () => {
    const start = form.startDate && form.startTime ? new Date(`${form.startDate}T${form.startTime}`) : null
    const end = form.endDate && form.endTime ? new Date(`${form.endDate}T${form.endTime}`) : null
    if (!form.title.trim()) return toast.error("Title is required")
    if (!start || !end) return toast.error("Start and end date/time are required")
    if (end <= start) return toast.error("End time must be after start time")

    setSaving(true)
    try {
      await adminApi.updateContest(contestId, {
        title: form.title,
        slug: form.slug,
        description: form.description,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        duration: Math.round((end.getTime() - start.getTime()) / 60000),
        type: form.type,
        isPublic: form.isPublic,
        maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : null,
        rules: form.rules || null,
        prizes: form.prizes || null,
      })

      const selectedIds = selectedProblems.map((p) => p.problemId)
      const removed = originalProblemIds.filter((id) => !selectedIds.includes(id))
      for (const problemId of removed) {
        try {
          await adminApi.removeProblemFromContest(contestId, problemId)
        } catch {
          // continue
        }
      }
      for (const [index, p] of selectedProblems.entries()) {
        try {
          await adminApi.addProblemToContest(contestId, {
            problemId: p.problemId,
            points: p.points,
            bonusPoints: p.bonus,
            orderIndex: index,
          })
        } catch {
          // continue
        }
      }

      setOriginalProblemIds(selectedIds)
      setSlug(form.slug)
      toast.success("Contest saved — changes are live")
    } catch (err) {
      if (err instanceof ApiError && err.errors?.length) {
        toast.error(`${err.message}: ${err.errors.map((e) => e.message).join(", ")}`)
      } else {
        toast.error(err instanceof ApiError ? err.message : "Save failed")
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-16">
        <div className="mx-auto max-w-4xl px-4 py-8 lg:px-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link href="/admin/contests" className="mb-2 inline-block">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Contests
                </Button>
              </Link>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">Edit Contest</h1>
                <Badge variant="outline" className="border-border/50 text-muted-foreground">
                  {status}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/contests/${slug}`} target="_blank">
                <Button variant="outline">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
              </Link>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Status */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-3">
                  <Select value={status} onValueChange={(v) => changeStatus(v as ContestStatus)}>
                    <SelectTrigger className="w-[220px] border-input bg-background text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Set to RUNNING to open the arena, ENDED to close it. Changes apply instantly.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Details */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-foreground">Title</Label>
                    <Input
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="border-input bg-background text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Slug</Label>
                    <Input
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value })}
                      className="border-input bg-background font-mono text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    className="border-input bg-background text-foreground"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-foreground">Start Date &amp; Time</Label>
                    <div className="flex gap-2">
                      <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="border-input bg-background text-foreground" />
                      <Input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="border-input bg-background text-foreground" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">End Date &amp; Time</Label>
                    <div className="flex gap-2">
                      <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="border-input bg-background text-foreground" />
                      <Input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="border-input bg-background text-foreground" />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-foreground">Type</Label>
                    <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as ContestType })}>
                      <SelectTrigger className="border-input bg-background text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PUBLIC">Public</SelectItem>
                        <SelectItem value="PRIVATE">Private</SelectItem>
                        <SelectItem value="COLLEGE">College</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Max Participants (blank = unlimited)</Label>
                    <Input
                      type="number"
                      min={1}
                      value={form.maxParticipants}
                      onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })}
                      className="border-input bg-background text-foreground"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-4">
                  <Switch checked={form.isPublic} onCheckedChange={(v) => setForm({ ...form, isPublic: v })} />
                  <div>
                    <Label className="text-foreground">Public</Label>
                    <p className="text-xs text-muted-foreground">Listed and joinable by students.</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Rules</Label>
                    <Textarea value={form.rules} onChange={(e) => setForm({ ...form, rules: e.target.value })} rows={4} className="border-input bg-background text-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Prizes</Label>
                    <Textarea value={form.prizes} onChange={(e) => setForm({ ...form, prizes: e.target.value })} rows={4} className="border-input bg-background text-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Problems */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">
                  Problems <span className="text-sm font-normal text-muted-foreground">({selectedProblems.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedProblems.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">No problems yet — add from the library below.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedProblems.map((problem, index) => (
                      <div key={problem.problemId} className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-background p-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-sm font-bold text-primary">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-foreground">{problem.title}</p>
                        </div>
                        <DifficultyBadge difficulty={problem.difficulty} />
                        <label className="flex items-center gap-1 text-xs text-muted-foreground">
                          Points
                          <Input type="number" min={0} max={1000} value={problem.points} onChange={(e) => updatePoints(problem.problemId, "points", Number(e.target.value))} className="h-8 w-20 border-input bg-card text-foreground" />
                        </label>
                        <label className="flex items-center gap-1 text-xs text-muted-foreground">
                          Bonus
                          <Input type="number" min={0} max={500} value={problem.bonus} onChange={(e) => updatePoints(problem.problemId, "bonus", Number(e.target.value))} className="h-8 w-20 border-input bg-card text-foreground" />
                        </label>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeProblem(problem.problemId)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <div className="relative mb-3 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search problem library..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="border-input bg-background pl-9 text-foreground" />
                  </div>
                  {problemsLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : availableProblems.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      {allProblems.length === 0 ? "No problems in the library." : "No matching problems."}
                    </p>
                  ) : (
                    <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                      {availableProblems.map((problem) => (
                        <div key={problem.id} className="flex items-center justify-between rounded-lg border border-border bg-background p-3 transition-colors hover:bg-card">
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">{problem.title}</p>
                            <div className="mt-1 flex items-center gap-2">
                              <DifficultyBadge difficulty={problem.difficulty} />
                              {!problem.isPublic && (
                                <Badge variant="outline" className="border-warning/30 bg-warning/10 text-xs text-warning">Draft</Badge>
                              )}
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => addProblem(problem)}>
                            <Plus className="mr-1 h-4 w-4" />
                            Add
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
