"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Navbar } from "@/components/ui/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DifficultyBadge } from "@/components/ui/difficulty-badge"
import { AdminGuard } from "@/components/admin-guard"
import { ArrowLeft, ArrowRight, Check, Plus, X, Save, Search, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { adminApi, ApiError, type AdminProblem, type ContestType } from "@/lib/api"

type Step = 1 | 2 | 3

interface SelectedProblem extends AdminProblem {
  points: number
  bonus: number
}

export default function CreateContestPageWrapper() {
  return (
    <AdminGuard>
      <CreateContestPage />
    </AdminGuard>
  )
}

function CreateContestPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Step 1: Logistics
  const [logistics, setLogistics] = useState({
    title: "",
    slug: "",
    description: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    type: "PUBLIC" as ContestType,
    isPublic: true,
  })

  // Step 2: Problems
  const [allProblems, setAllProblems] = useState<AdminProblem[]>([])
  const [problemsLoading, setProblemsLoading] = useState(true)
  const [selectedProblems, setSelectedProblems] = useState<SelectedProblem[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  // Step 3: Rules
  const [rules, setRules] = useState("")

  useEffect(() => {
    adminApi
      .problems({ limit: 100 })
      .then((data) => setAllProblems(data.problems))
      .catch(() => toast.error("Failed to load problems"))
      .finally(() => setProblemsLoading(false))
  }, [])

  const generateSlug = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")

  const availableProblems = allProblems.filter(
    (p) =>
      !selectedProblems.some((sp) => sp.id === p.id) &&
      (searchQuery === "" || p.title.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const addProblem = (problem: AdminProblem) => {
    setSelectedProblems([...selectedProblems, { ...problem, points: 100, bonus: 0 }])
  }

  const removeProblem = (problemId: string) => {
    setSelectedProblems(selectedProblems.filter((p) => p.id !== problemId))
  }

  const updateProblemPoints = (problemId: string, field: "points" | "bonus", value: number) => {
    setSelectedProblems(selectedProblems.map((p) => (p.id === problemId ? { ...p, [field]: value } : p)))
  }

  const getDates = () => {
    const start = logistics.startDate && logistics.startTime ? new Date(`${logistics.startDate}T${logistics.startTime}`) : null
    const end = logistics.endDate && logistics.endTime ? new Date(`${logistics.endDate}T${logistics.endTime}`) : null
    return { start, end }
  }

  const validateStep1 = () => {
    const { start, end } = getDates()
    if (!logistics.title.trim()) return "Title is required"
    if (!logistics.description.trim()) return "Description is required"
    if (!start || !end) return "Start and end date/time are required"
    if (end <= start) return "End time must be after start time"
    return null
  }

  const handleNext = () => {
    if (step === 1) {
      const err = validateStep1()
      if (err) {
        toast.error(err)
        return
      }
    }
    if (step === 2 && selectedProblems.length === 0) {
      toast.error("Select at least one problem")
      return
    }
    setStep((s) => Math.min(3, s + 1) as Step)
  }

  const handleSubmit = async () => {
    const err = validateStep1()
    if (err) {
      toast.error(err)
      setStep(1)
      return
    }
    if (selectedProblems.length === 0) {
      toast.error("Select at least one problem")
      setStep(2)
      return
    }

    const { start, end } = getDates()
    const durationMin = Math.round((end!.getTime() - start!.getTime()) / 60000)

    setIsSubmitting(true)
    try {
      const contest = await adminApi.createContest({
        title: logistics.title,
        slug: logistics.slug || generateSlug(logistics.title),
        description: logistics.description,
        startTime: start!.toISOString(),
        endTime: end!.toISOString(),
        duration: durationMin,
        type: logistics.type,
        rules: rules || undefined,
        isPublic: logistics.isPublic,
      })

      let added = 0
      for (const [index, p] of selectedProblems.entries()) {
        try {
          await adminApi.addProblemToContest(contest.id, {
            problemId: p.id,
            points: p.points,
            bonusPoints: p.bonus,
            orderIndex: index,
          })
          added++
        } catch {
          // keep adding the rest
        }
      }

      toast.success(`Contest created with ${added}/${selectedProblems.length} problems (status: DRAFT)`)
      router.push("/admin/contests")
    } catch (error) {
      setIsSubmitting(false)
      if (error instanceof ApiError && error.errors?.length) {
        toast.error(`${error.message}: ${error.errors.map((e) => e.message).join(", ")}`)
      } else {
        toast.error(error instanceof ApiError ? error.message : "Failed to create contest")
      }
    }
  }

  const steps = [
    { number: 1, label: "Logistics" },
    { number: 2, label: "Problems" },
    { number: 3, label: "Rules & Review" },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-16">
        <div className="mx-auto max-w-4xl px-4 py-8 lg:px-6">
          {/* Back Link */}
          <Link href="/admin/contests" className="mb-6 inline-block">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Contests
            </Button>
          </Link>

          <h1 className="mb-8 text-2xl font-bold text-foreground">Create Contest</h1>

          {/* Stepper */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((s, index) => (
                <div key={s.number} className="flex flex-1 items-center">
                  <div className="flex items-center">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full border-2 font-medium",
                        step >= s.number
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground",
                      )}
                    >
                      {step > s.number ? <Check className="h-5 w-5" /> : s.number}
                    </div>
                    <span
                      className={cn(
                        "ml-3 hidden text-sm font-medium sm:block",
                        step >= s.number ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {s.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={cn("mx-4 h-px flex-1", step > s.number ? "bg-primary" : "bg-border")} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Logistics */}
          {step === 1 && (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Contest Logistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-foreground">Title</Label>
                    <Input
                      value={logistics.title}
                      onChange={(e) =>
                        setLogistics({ ...logistics, title: e.target.value, slug: generateSlug(e.target.value) })
                      }
                      placeholder="Weekly Contest 1"
                      className="border-input bg-background text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Slug</Label>
                    <Input
                      value={logistics.slug}
                      onChange={(e) => setLogistics({ ...logistics, slug: e.target.value })}
                      placeholder="weekly-contest-1"
                      className="border-input bg-background text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Description</Label>
                  <Textarea
                    value={logistics.description}
                    onChange={(e) => setLogistics({ ...logistics, description: e.target.value })}
                    placeholder="Test your coding skills in this exciting competition..."
                    rows={3}
                    className="border-input bg-background text-foreground"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-foreground">Start Date &amp; Time</Label>
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        value={logistics.startDate}
                        onChange={(e) => setLogistics({ ...logistics, startDate: e.target.value })}
                        className="border-input bg-background text-foreground"
                      />
                      <Input
                        type="time"
                        value={logistics.startTime}
                        onChange={(e) => setLogistics({ ...logistics, startTime: e.target.value })}
                        className="border-input bg-background text-foreground"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">End Date &amp; Time</Label>
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        value={logistics.endDate}
                        onChange={(e) => setLogistics({ ...logistics, endDate: e.target.value })}
                        className="border-input bg-background text-foreground"
                      />
                      <Input
                        type="time"
                        value={logistics.endTime}
                        onChange={(e) => setLogistics({ ...logistics, endTime: e.target.value })}
                        className="border-input bg-background text-foreground"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Contest Type</Label>
                  <Select
                    value={logistics.type}
                    onValueChange={(v) => setLogistics({ ...logistics, type: v as ContestType })}
                  >
                    <SelectTrigger className="w-[220px] border-input bg-background text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PUBLIC">Public — open to everyone</SelectItem>
                      <SelectItem value="PRIVATE">Private — invite only</SelectItem>
                      <SelectItem value="COLLEGE">College</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Problems */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Selected problems */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">
                    Selected Problems ({selectedProblems.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedProblems.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      No problems selected yet — pick from the library below.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {selectedProblems.map((problem, index) => (
                        <div
                          key={problem.id}
                          className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-background p-3"
                        >
                          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-sm font-bold text-primary">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-foreground">{problem.title}</p>
                          </div>
                          <DifficultyBadge difficulty={problem.difficulty} />
                          <label className="flex items-center gap-1 text-xs text-muted-foreground">
                            Points
                            <Input
                              type="number"
                              min={0}
                              max={1000}
                              value={problem.points}
                              onChange={(e) => updateProblemPoints(problem.id, "points", Number(e.target.value))}
                              className="h-8 w-20 border-input bg-card text-foreground"
                            />
                          </label>
                          <label className="flex items-center gap-1 text-xs text-muted-foreground">
                            Bonus
                            <Input
                              type="number"
                              min={0}
                              max={500}
                              value={problem.bonus}
                              onChange={(e) => updateProblemPoints(problem.id, "bonus", Number(e.target.value))}
                              className="h-8 w-20 border-input bg-card text-foreground"
                            />
                          </label>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => removeProblem(problem.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Problem library */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">Problem Library</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative mb-4 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search problems..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="border-input bg-background pl-9 text-foreground"
                    />
                  </div>

                  {problemsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : availableProblems.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      {allProblems.length === 0 ? "No problems in the library yet." : "No matching problems."}
                    </p>
                  ) : (
                    <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                      {availableProblems.map((problem) => (
                        <div
                          key={problem.id}
                          className="flex items-center justify-between rounded-lg border border-border bg-background p-3 transition-colors hover:bg-card"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-medium text-foreground">{problem.title}</p>
                              <div className="mt-1 flex items-center gap-2">
                                <DifficultyBadge difficulty={problem.difficulty} />
                                {!problem.isPublic && (
                                  <Badge variant="outline" className="border-warning/30 bg-warning/10 text-warning text-xs">
                                    Draft
                                  </Badge>
                                )}
                              </div>
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
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Rules & Review */}
          {step === 3 && (
            <div className="space-y-6">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">Rules (optional)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={rules}
                    onChange={(e) => setRules(e.target.value)}
                    placeholder={"1. No plagiarism\n2. Individual participation only"}
                    rows={5}
                    className="border-input bg-background text-foreground"
                  />
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">Review</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <ReviewRow label="Title" value={logistics.title || "—"} />
                  <ReviewRow label="Slug" value={logistics.slug || "—"} />
                  <ReviewRow
                    label="Starts"
                    value={
                      logistics.startDate && logistics.startTime
                        ? new Date(`${logistics.startDate}T${logistics.startTime}`).toLocaleString()
                        : "—"
                    }
                  />
                  <ReviewRow
                    label="Ends"
                    value={
                      logistics.endDate && logistics.endTime
                        ? new Date(`${logistics.endDate}T${logistics.endTime}`).toLocaleString()
                        : "—"
                    }
                  />
                  <ReviewRow label="Type" value={logistics.type} />
                  <ReviewRow
                    label="Problems"
                    value={
                      selectedProblems.length > 0
                        ? selectedProblems.map((p, i) => `${String.fromCharCode(65 + i)}. ${p.title} (${p.points}pts)`).join(", ")
                        : "—"
                    }
                  />
                  <p className="pt-2 text-xs text-muted-foreground">
                    The contest is created as a DRAFT — schedule it from the contests page when you're ready.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex justify-between">
            <Button
              variant="outline"
              onClick={() => setStep((s) => Math.max(1, s - 1) as Step)}
              disabled={step === 1 || isSubmitting}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            {step < 3 ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {isSubmitting ? "Creating..." : "Create Contest"}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="w-24 shrink-0 text-muted-foreground">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  )
}
