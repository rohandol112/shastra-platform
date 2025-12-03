"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/ui/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DifficultyBadge } from "@/components/ui/difficulty-badge"
import { mockUser, mockProblems, type Problem } from "@/lib/mock-data"
import { ArrowLeft, ArrowRight, Check, GripVertical, Plus, X, Save } from "lucide-react"
import { cn } from "@/lib/utils"

type Step = 1 | 2 | 3

interface SelectedProblem extends Problem {
  points: number
  bonus: number
}

export default function CreateContestPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Step 1: Logistics
  const [logistics, setLogistics] = useState({
    title: "",
    slug: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    visibility: "PUBLIC" as "PUBLIC" | "PRIVATE",
    type: "INDIVIDUAL" as "INDIVIDUAL" | "TEAM",
  })

  // Step 2: Problems
  const [selectedProblems, setSelectedProblems] = useState<SelectedProblem[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  // Step 3: Rules
  const [rules, setRules] = useState("")

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
  }

  const availableProblems = mockProblems.filter(
    (p) =>
      !selectedProblems.some((sp) => sp.id === p.id) &&
      (searchQuery === "" || p.title.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const addProblem = (problem: Problem) => {
    setSelectedProblems([...selectedProblems, { ...problem, points: 100, bonus: 0 }])
  }

  const removeProblem = (problemId: string) => {
    setSelectedProblems(selectedProblems.filter((p) => p.id !== problemId))
  }

  const updateProblemPoints = (problemId: string, field: "points" | "bonus", value: number) => {
    setSelectedProblems(selectedProblems.map((p) => (p.id === problemId ? { ...p, [field]: value } : p)))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    router.push("/admin/contests")
  }

  const steps = [
    { number: 1, label: "Logistics" },
    { number: 2, label: "Problems" },
    { number: 3, label: "Rules & Review" },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar user={mockUser} />

      <main className="flex-1">
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
                    <div className={cn("mx-4 h-0.5 flex-1", step > s.number ? "bg-primary" : "bg-border")} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          {step === 1 && (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Contest Logistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-foreground">
                      Contest Title
                    </Label>
                    <Input
                      id="title"
                      value={logistics.title}
                      onChange={(e) => {
                        setLogistics({
                          ...logistics,
                          title: e.target.value,
                          slug: generateSlug(e.target.value),
                        })
                      }}
                      placeholder="Weekly Contest 376"
                      className="border-input bg-background text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug" className="text-foreground">
                      Slug
                    </Label>
                    <Input
                      id="slug"
                      value={logistics.slug}
                      onChange={(e) => setLogistics({ ...logistics, slug: e.target.value })}
                      placeholder="weekly-contest-376"
                      className="border-input bg-background text-foreground"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-foreground">Start Date & Time</Label>
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
                    <Label className="text-foreground">End Date & Time</Label>
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

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-foreground">Visibility</Label>
                    <Select
                      value={logistics.visibility}
                      onValueChange={(v) =>
                        setLogistics({
                          ...logistics,
                          visibility: v as "PUBLIC" | "PRIVATE",
                        })
                      }
                    >
                      <SelectTrigger className="border-input bg-background text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PUBLIC">Public</SelectItem>
                        <SelectItem value="PRIVATE">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Type</Label>
                    <Select
                      value={logistics.type}
                      onValueChange={(v) =>
                        setLogistics({
                          ...logistics,
                          type: v as "INDIVIDUAL" | "TEAM",
                        })
                      }
                    >
                      <SelectTrigger className="border-input bg-background text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                        <SelectItem value="TEAM">Team</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Problem Library */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">Problem Library</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    placeholder="Search problems..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mb-4 border-input bg-background text-foreground"
                  />
                  <div className="max-h-96 space-y-2 overflow-y-auto">
                    {availableProblems.map((problem) => (
                      <div
                        key={problem.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-background p-3"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{problem.title}</p>
                          <DifficultyBadge difficulty={problem.difficulty} className="mt-1" />
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => addProblem(problem)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Selected Problems */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">Contest Problems ({selectedProblems.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedProblems.length === 0 ? (
                    <p className="py-8 text-center text-muted-foreground">Drag problems from the library to add them</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedProblems.map((problem, index) => (
                        <div key={problem.id} className="rounded-lg border border-border bg-background p-3">
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                              <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                                {String.fromCharCode(65 + index)}
                              </Badge>
                              <span className="font-medium text-foreground">{problem.title}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeProblem(problem.id)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                              <Label className="text-sm text-muted-foreground">Points:</Label>
                              <Input
                                type="number"
                                value={problem.points}
                                onChange={(e) =>
                                  updateProblemPoints(problem.id, "points", Number.parseInt(e.target.value) || 0)
                                }
                                className="h-8 w-20 border-input bg-card text-foreground"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <Label className="text-sm text-muted-foreground">Bonus:</Label>
                              <Input
                                type="number"
                                value={problem.bonus}
                                onChange={(e) =>
                                  updateProblemPoints(problem.id, "bonus", Number.parseInt(e.target.value) || 0)
                                }
                                className="h-8 w-20 border-input bg-card text-foreground"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">Contest Rules</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={rules}
                    onChange={(e) => setRules(e.target.value)}
                    placeholder="Enter contest rules and guidelines..."
                    rows={8}
                    className="border-input bg-background text-foreground"
                  />
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">Review</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Title</p>
                      <p className="font-medium text-foreground">{logistics.title || "Not set"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Visibility</p>
                      <p className="font-medium text-foreground">{logistics.visibility}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Start</p>
                      <p className="font-medium text-foreground">
                        {logistics.startDate} {logistics.startTime}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">End</p>
                      <p className="font-medium text-foreground">
                        {logistics.endDate} {logistics.endTime}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Problems</p>
                    <p className="font-medium text-foreground">{selectedProblems.length} problems selected</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={() => setStep((s) => (s - 1) as Step)} disabled={step === 1}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {step < 3 ? (
              <Button onClick={() => setStep((s) => (s + 1) as Step)}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleSubmit}>
                  Save as Draft
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Publishing..." : "Publish Contest"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
