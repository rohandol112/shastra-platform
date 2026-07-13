"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Navbar } from "@/components/ui/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { StaffGuard } from "@/components/admin-guard"
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Loader2,
  Eye,
  Globe,
  EyeOff,
  Pencil,
  X,
  Check,
  Wand2,
  Download,
} from "lucide-react"
import {
  adminApi,
  ApiError,
  type AdminProblemDetail,
  type AdminTestCase,
  type Difficulty,
  type InputSpecField,
} from "@/lib/api"
import { useAuthStore, canGenerateTestCases } from "@/lib/stores/auth-store"
import { LANGUAGES } from "@/lib/stores/workspace-store"

export default function EditProblemPageWrapper() {
  return (
    <StaffGuard>
      <EditProblemPage />
    </StaffGuard>
  )
}

function EditProblemPage() {
  const params = useParams()
  const problemId = params.id as string

  const [problem, setProblem] = useState<AdminProblemDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Editable fields
  const [form, setForm] = useState({
    title: "",
    slug: "",
    difficulty: "MEDIUM" as Difficulty,
    statement: "",
    inputFormat: "",
    outputFormat: "",
    constraints: "",
    hints: "",
    tags: [] as string[],
    timeLimit: 1000,
    memoryLimit: 262144,
    isPublic: false,
  })
  const [newTag, setNewTag] = useState("")

  // Test cases
  const [testCases, setTestCases] = useState<AdminTestCase[]>([])
  const [tcLoading, setTcLoading] = useState(true)

  useEffect(() => {
    Promise.all([adminApi.problem(problemId), adminApi.testCases(problemId)])
      .then(([p, tcs]) => {
        setProblem(p)
        setForm({
          title: p.title,
          slug: p.slug,
          difficulty: p.difficulty,
          statement: p.statement ?? "",
          inputFormat: p.inputFormat ?? "",
          outputFormat: p.outputFormat ?? "",
          constraints: p.constraints ?? "",
          hints: p.hints ?? "",
          tags: p.tags ?? [],
          timeLimit: p.timeLimit,
          memoryLimit: p.memoryLimit,
          isPublic: p.isPublic,
        })
        setTestCases(tcs.testCases)
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Failed to load problem"))
      .finally(() => {
        setLoading(false)
        setTcLoading(false)
      })
  }, [problemId])

  const handleSave = async () => {
    setSaving(true)
    try {
      await adminApi.updateProblem(problemId, {
        title: form.title,
        slug: form.slug,
        difficulty: form.difficulty,
        statement: form.statement,
        inputFormat: form.inputFormat || null,
        outputFormat: form.outputFormat || null,
        constraints: form.constraints || null,
        hints: form.hints || null,
        tags: form.tags,
        timeLimit: form.timeLimit,
        memoryLimit: form.memoryLimit,
        isPublic: form.isPublic,
      })
      toast.success("Problem saved — changes are live immediately")
    } catch (err) {
      if (err instanceof ApiError && err.errors?.length) {
        toast.error(`${err.message}: ${err.errors.map((e) => `${e.field} — ${e.message}`).join(", ")}`)
      } else {
        toast.error(err instanceof ApiError ? err.message : "Save failed")
      }
    } finally {
      setSaving(false)
    }
  }

  const addTag = () => {
    const tag = newTag.trim().toLowerCase()
    if (tag && !form.tags.includes(tag)) {
      setForm({ ...form, tags: [...form.tags, tag] })
      setNewTag("")
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!problem) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <h1 className="text-xl font-bold text-foreground">Problem not found</h1>
        <Link href="/admin/problems" className="mt-4">
          <Button variant="outline">Back to Problems</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-16">
        <div className="mx-auto max-w-5xl px-4 py-8 lg:px-6">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link href="/admin/problems" className="mb-2 inline-block">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Problems
                </Button>
              </Link>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">Edit Problem</h1>
                <Badge
                  variant="outline"
                  className={
                    form.isPublic
                      ? "border-success/30 bg-success/10 text-success"
                      : "border-warning/30 bg-warning/10 text-warning"
                  }
                >
                  {form.isPublic ? "Published — edits go live instantly" : "Draft"}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/problems/${form.slug}`} target="_blank">
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
            {/* Basic info */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Basic Information</CardTitle>
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
                      pattern="[a-z0-9-]+"
                      className="border-input bg-background font-mono text-foreground"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label className="text-foreground">Difficulty</Label>
                    <Select
                      value={form.difficulty}
                      onValueChange={(v) => setForm({ ...form, difficulty: v as Difficulty })}
                    >
                      <SelectTrigger className="border-input bg-background text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EASY">Easy</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HARD">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Time Limit (ms)</Label>
                    <Input
                      type="number"
                      min={100}
                      max={15000}
                      value={form.timeLimit}
                      onChange={(e) => setForm({ ...form, timeLimit: Number(e.target.value) })}
                      className="border-input bg-background text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Memory Limit (KB)</Label>
                    <Input
                      type="number"
                      min={16384}
                      value={form.memoryLimit}
                      onChange={(e) => setForm({ ...form, memoryLimit: Number(e.target.value) })}
                      className="border-input bg-background text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {form.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, tags: form.tags.filter((t) => t !== tag) })}
                          className="ml-1 hover:text-destructive"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                    <div className="flex items-center gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add tag"
                        className="w-32 border-input bg-background text-foreground"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            addTag()
                          }
                        }}
                      />
                      <Button type="button" variant="outline" size="sm" onClick={addTag}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-4">
                  <Switch
                    checked={form.isPublic}
                    onCheckedChange={(checked) => setForm({ ...form, isPublic: checked })}
                  />
                  <div>
                    <Label className="text-foreground">Published</Label>
                    <p className="text-xs text-muted-foreground">
                      {form.isPublic ? "Visible to all students." : "Hidden from students until published."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statement */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Statement & Formats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={form.statement}
                  onChange={(e) => setForm({ ...form, statement: e.target.value })}
                  rows={10}
                  className="border-input bg-background text-foreground"
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Input Format</Label>
                    <Textarea
                      value={form.inputFormat}
                      onChange={(e) => setForm({ ...form, inputFormat: e.target.value })}
                      rows={3}
                      className="border-input bg-background text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Output Format</Label>
                    <Textarea
                      value={form.outputFormat}
                      onChange={(e) => setForm({ ...form, outputFormat: e.target.value })}
                      rows={3}
                      className="border-input bg-background text-foreground"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Constraints (one per line)</Label>
                  <Textarea
                    value={form.constraints}
                    onChange={(e) => setForm({ ...form, constraints: e.target.value })}
                    rows={3}
                    className="border-input bg-background font-mono text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Hints (one per line)</Label>
                  <Textarea
                    value={form.hints}
                    onChange={(e) => setForm({ ...form, hints: e.target.value })}
                    rows={2}
                    className="border-input bg-background text-foreground"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Stress-test generator — random inputs from a generator program,
                correct outputs from a reference solution, both via Judge0. */}
            <TestCaseGenerator problemId={problemId} onGenerated={(created) => setTestCases((prev) => [...prev, ...created])} />

            {/* Test cases — live editing, saved per row immediately */}
            <TestCaseManager
              problemId={problemId}
              testCases={testCases}
              setTestCases={setTestCases}
              loading={tcLoading}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

// ---------------------------------------------------------------------------

const ALPHA_LOWER = "abcdefghijklmnopqrstuvwxyz"

function emptyField(kind: InputSpecField["kind"]): InputSpecField {
  if (kind === "int") return { kind: "int", name: "", min: "1", max: "100" }
  if (kind === "ints") return { kind: "ints", count: "N", min: "1", max: "1000000000", layout: "lines" }
  return { kind: "string", minLen: "1", maxLen: "100", alphabet: ALPHA_LOWER }
}

const TEMPLATE_ARRAY: InputSpecField[] = [
  { kind: "int", name: "N", min: "1", max: "100000" },
  { kind: "int", name: "K", min: "1", max: "N" },
  { kind: "int", name: "X", min: "1", max: "1000000000000000000" },
  { kind: "ints", count: "N", min: "1", max: "1000000000", layout: "lines" },
]
const TEMPLATE_STRING: InputSpecField[] = [
  { kind: "string", minLen: "1", maxLen: "2000", alphabet: ALPHA_LOWER },
  { kind: "string", minLen: "1", maxLen: "2000", alphabet: ALPHA_LOWER },
  { kind: "int", min: "0", max: "100000" },
]

function TestCaseGenerator({
  problemId,
  onGenerated,
}: {
  problemId: string
  onGenerated: (created: AdminTestCase[]) => void
}) {
  const user = useAuthStore((s) => s.user)
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [previewing, setPreviewing] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [solutionLanguage, setSolutionLanguage] = useState("python")
  const [solutionCode, setSolutionCode] = useState("")
  const [count, setCount] = useState(10)
  const [points, setPoints] = useState(10)
  const [isHidden, setIsHidden] = useState(true)
  const [fields, setFields] = useState<InputSpecField[]>(TEMPLATE_ARRAY)

  // Scoped to super admins, college admins, and teachers (no moderators).
  if (!canGenerateTestCases(user)) return null

  const updateField = (i: number, patch: Record<string, string>) =>
    setFields((prev) => prev.map((f, idx) => (idx === i ? ({ ...f, ...patch } as InputSpecField) : f)))
  const changeKind = (i: number, kind: InputSpecField["kind"]) =>
    setFields((prev) => prev.map((f, idx) => (idx === i ? emptyField(kind) : f)))
  const addField = () => setFields((prev) => [...prev, emptyField("int")])
  const removeField = (i: number) => setFields((prev) => prev.filter((_, idx) => idx !== i))

  // Drop blank names so an int without a name never creates a "" variable.
  const payloadFields = (): InputSpecField[] =>
    fields.map((f) => (f.kind === "int" && !f.name?.trim() ? { ...f, name: undefined } : f))

  const handlePreview = async () => {
    setPreviewing(true)
    setPreview(null)
    try {
      const res = await adminApi.previewInputSpec({ fields: payloadFields() })
      setPreview(res.input)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not build a sample input from this spec")
    } finally {
      setPreviewing(false)
    }
  }

  const handleGenerate = async () => {
    if (!solutionCode.trim()) {
      toast.error("Paste your reference solution first")
      return
    }
    if (fields.length === 0) {
      toast.error("Describe the input with at least one field")
      return
    }
    setBusy(true)
    setProgress(null)
    try {
      const started = await adminApi.generateFromSolution(problemId, {
        solutionCode,
        solutionLanguage,
        spec: { fields: payloadFields() },
        count,
        isHidden,
        points,
      })
      // Bounded poll — the backend job may outlive this, in which case cases
      // still appear on refresh.
      const deadline = Date.now() + 15 * 60_000
      let job = await adminApi.pollGenerateTestCases(started.jobId)
      while (job.status === "PENDING") {
        if (Date.now() > deadline) {
          toast.error("Generation is taking longer than expected — check back in a moment and refresh.")
          return
        }
        if (job.progress) setProgress(job.progress)
        await new Promise((r) => setTimeout(r, 1500))
        job = await adminApi.pollGenerateTestCases(started.jobId)
      }
      if (job.status === "COMPLETED" && job.testCases) {
        onGenerated(job.testCases)
        const n = job.testCases.length
        toast.success(`Generated ${n} test case${n === 1 ? "" : "s"} — added below`)
        setOpen(false)
        setSolutionCode("")
      } else {
        toast.error(job.error || "Generation failed")
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Generation failed")
    } finally {
      setBusy(false)
      setProgress(null)
    }
  }

  const opInput = (value: string, onChange: (v: string) => void, placeholder: string, width = "w-28") => (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`h-8 ${width} border-input bg-card font-mono text-xs text-foreground`}
    />
  )

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-foreground">Generate Test Cases from a Solution</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Paste your correct solution and describe the input shape below — we create random inputs, run your
            solution to get the answers, and add the cases. No generator code needed.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen((v) => !v)}>
          <Wand2 className="mr-2 h-4 w-4" />
          {open ? "Close" : "Generate"}
        </Button>
      </CardHeader>
      {open && (
        <CardContent className="space-y-5">
          {/* Reference solution */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Label className="text-foreground">Reference Solution</Label>
              <Select value={solutionLanguage} onValueChange={setSolutionLanguage}>
                <SelectTrigger className="h-8 w-40 border-input bg-background text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Textarea
              value={solutionCode}
              onChange={(e) => setSolutionCode(e.target.value)}
              placeholder="Reads input from stdin, prints the correct answer to stdout. Its output becomes the expected output for each generated case — so it must be correct and fast."
              rows={8}
              className="border-input bg-background font-mono text-xs text-foreground"
            />
          </div>

          {/* Input spec builder */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label className="text-foreground">Input Format</Label>
              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setFields(TEMPLATE_ARRAY)}>
                  Array template
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setFields(TEMPLATE_STRING)}>
                  String template
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Fields are printed in order, each on its own line. A count/min/max can be a number, a big number
              like <code className="font-mono">1000000000000000000</code>, or the <em>name</em> of an integer
              field above it (e.g. an array of length <code className="font-mono">N</code>).
            </p>

            <div className="space-y-2">
              {fields.map((f, i) => (
                <div key={i} className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-background p-3">
                  <Select value={f.kind} onValueChange={(v) => changeKind(i, v as InputSpecField["kind"])}>
                    <SelectTrigger className="h-8 w-36 border-input bg-card text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="int">Integer</SelectItem>
                      <SelectItem value="ints">Integer list</SelectItem>
                      <SelectItem value="string">String</SelectItem>
                    </SelectContent>
                  </Select>

                  {f.kind === "int" && (
                    <>
                      {opInput(f.name ?? "", (v) => updateField(i, { name: v }), "name (opt)", "w-28")}
                      <span className="text-xs text-muted-foreground">min</span>
                      {opInput(f.min, (v) => updateField(i, { min: v }), "1")}
                      <span className="text-xs text-muted-foreground">max</span>
                      {opInput(f.max, (v) => updateField(i, { max: v }), "100")}
                    </>
                  )}

                  {f.kind === "ints" && (
                    <>
                      <span className="text-xs text-muted-foreground">count</span>
                      {opInput(f.count, (v) => updateField(i, { count: v }), "N", "w-20")}
                      <span className="text-xs text-muted-foreground">min</span>
                      {opInput(f.min, (v) => updateField(i, { min: v }), "1")}
                      <span className="text-xs text-muted-foreground">max</span>
                      {opInput(f.max, (v) => updateField(i, { max: v }), "1e9")}
                      <Select value={f.layout} onValueChange={(v) => updateField(i, { layout: v })}>
                        <SelectTrigger className="h-8 w-32 border-input bg-card text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lines">one per line</SelectItem>
                          <SelectItem value="spaced">space-separated</SelectItem>
                        </SelectContent>
                      </Select>
                    </>
                  )}

                  {f.kind === "string" && (
                    <>
                      <span className="text-xs text-muted-foreground">len</span>
                      {opInput(f.minLen, (v) => updateField(i, { minLen: v }), "1", "w-20")}
                      <span className="text-xs text-muted-foreground">to</span>
                      {opInput(f.maxLen, (v) => updateField(i, { maxLen: v }), "2000", "w-20")}
                      <span className="text-xs text-muted-foreground">alphabet</span>
                      {opInput(f.alphabet, (v) => updateField(i, { alphabet: v }), "abc…", "w-44")}
                    </>
                  )}

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="ml-auto h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => removeField(i)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button type="button" variant="outline" size="sm" onClick={addField}>
              <Plus className="mr-2 h-4 w-4" />
              Add field
            </Button>
          </div>

          {/* Sample-input preview */}
          <div className="space-y-2">
            <Button type="button" variant="outline" size="sm" onClick={handlePreview} disabled={previewing}>
              {previewing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4" />}
              Preview a sample input
            </Button>
            {preview !== null && (
              <pre className="max-h-40 overflow-auto rounded-md bg-[#0d1117] p-3 font-mono text-xs text-foreground ring-1 ring-border/40">
                {preview}
              </pre>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-6 rounded-lg border border-border bg-background p-4">
            <label className="flex items-center gap-2 text-sm text-foreground">
              How many
              <Input
                type="number"
                min={1}
                max={50}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="h-8 w-20 border-input bg-card text-foreground"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              Points each
              <Input
                type="number"
                min={0}
                max={100}
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                className="h-8 w-20 border-input bg-card text-foreground"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <Switch checked={isHidden} onCheckedChange={setIsHidden} />
              Hidden
            </label>
          </div>

          <div className="flex items-center justify-end gap-3">
            {busy && progress && (
              <span className="text-sm text-muted-foreground">
                Generating {progress.done}/{progress.total}…
              </span>
            )}
            <Button onClick={handleGenerate} disabled={busy}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              {busy ? "Generating…" : "Generate Test Cases"}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// ---------------------------------------------------------------------------

function TestCaseManager({
  problemId,
  testCases,
  setTestCases,
  loading,
}: {
  problemId: string
  testCases: AdminTestCase[]
  setTestCases: React.Dispatch<React.SetStateAction<AdminTestCase[]>>
  loading: boolean
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<{ input: string; expectedOutput: string; isHidden: boolean; points: number }>({
    input: "",
    expectedOutput: "",
    isHidden: true,
    points: 10,
  })
  const [busy, setBusy] = useState(false)
  const [adding, setAdding] = useState(false)
  const [newTc, setNewTc] = useState({ input: "", expectedOutput: "", isHidden: true, points: 10 })

  const startEdit = (tc: AdminTestCase) => {
    setEditingId(tc.id)
    setDraft({ input: tc.input, expectedOutput: tc.expectedOutput, isHidden: tc.isHidden, points: tc.points })
  }

  const saveEdit = async () => {
    if (!editingId) return
    setBusy(true)
    try {
      const updated = await adminApi.updateTestCase(editingId, draft)
      setTestCases((prev) => prev.map((tc) => (tc.id === editingId ? { ...tc, ...updated } : tc)))
      setEditingId(null)
      toast.success("Test case updated — live immediately")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Update failed")
    } finally {
      setBusy(false)
    }
  }

  const deleteTc = async (id: string) => {
    if (!confirm("Delete this test case?")) return
    setBusy(true)
    try {
      await adminApi.deleteTestCase(id)
      setTestCases((prev) => prev.filter((tc) => tc.id !== id))
      toast.success("Test case deleted")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Delete failed")
    } finally {
      setBusy(false)
    }
  }

  const addNew = async () => {
    if (!newTc.input.trim() || !newTc.expectedOutput.trim()) {
      toast.error("Input and expected output are required")
      return
    }
    setBusy(true)
    try {
      const created = await adminApi.addTestCase(problemId, {
        ...newTc,
        orderIndex: testCases.length,
      })
      setTestCases((prev) => [...prev, created])
      setNewTc({ input: "", expectedOutput: "", isHidden: true, points: 10 })
      setAdding(false)
      toast.success("Test case added — live immediately")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Add failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-foreground">
          Test Cases <span className="text-sm font-normal text-muted-foreground">({testCases.length})</span>
        </CardTitle>
        <div className="flex items-center gap-2">
          {testCases.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                adminApi
                  .exportTestCasesZip(problemId)
                  .catch((err) => toast.error(err instanceof Error ? err.message : "Export failed"))
              }
            >
              <Download className="mr-2 h-4 w-4" />
              Export ZIP
            </Button>
          )}
          <Button type="button" variant="outline" size="sm" onClick={() => setAdding(true)} disabled={adding}>
            <Plus className="mr-2 h-4 w-4" />
            Add Test Case
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {adding && (
              <div className="rounded-lg border border-primary/30 bg-background p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-medium text-foreground">New Test Case</span>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Switch checked={newTc.isHidden} onCheckedChange={(v) => setNewTc({ ...newTc, isHidden: v })} />
                      Hidden
                    </label>
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      Points
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={newTc.points}
                        onChange={(e) => setNewTc({ ...newTc, points: Number(e.target.value) })}
                        className="h-8 w-20 border-input bg-card text-foreground"
                      />
                    </label>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Textarea
                    value={newTc.input}
                    onChange={(e) => setNewTc({ ...newTc, input: e.target.value })}
                    placeholder="Input"
                    rows={3}
                    className="border-input bg-card font-mono text-foreground"
                  />
                  <Textarea
                    value={newTc.expectedOutput}
                    onChange={(e) => setNewTc({ ...newTc, expectedOutput: e.target.value })}
                    placeholder="Expected output"
                    rows={3}
                    className="border-input bg-card font-mono text-foreground"
                  />
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setAdding(false)} disabled={busy}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={addNew} disabled={busy}>
                    {busy && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                    Add
                  </Button>
                </div>
              </div>
            )}

            {testCases.length === 0 && !adding ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No test cases yet — submissions will fail until you add at least one.
              </p>
            ) : (
              testCases.map((tc, index) => (
                <div key={tc.id} className="rounded-lg border border-border bg-background p-4">
                  {editingId === tc.id ? (
                    <>
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium text-foreground">Test Case {index + 1}</span>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Switch
                              checked={draft.isHidden}
                              onCheckedChange={(v) => setDraft({ ...draft, isHidden: v })}
                            />
                            Hidden
                          </label>
                          <label className="flex items-center gap-2 text-xs text-muted-foreground">
                            Points
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              value={draft.points}
                              onChange={(e) => setDraft({ ...draft, points: Number(e.target.value) })}
                              className="h-8 w-20 border-input bg-card text-foreground"
                            />
                          </label>
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Textarea
                          value={draft.input}
                          onChange={(e) => setDraft({ ...draft, input: e.target.value })}
                          rows={3}
                          className="border-input bg-card font-mono text-foreground"
                        />
                        <Textarea
                          value={draft.expectedOutput}
                          onChange={(e) => setDraft({ ...draft, expectedOutput: e.target.value })}
                          rows={3}
                          className="border-input bg-card font-mono text-foreground"
                        />
                      </div>
                      <div className="mt-3 flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditingId(null)} disabled={busy}>
                          <X className="mr-1 h-3 w-3" />
                          Cancel
                        </Button>
                        <Button size="sm" onClick={saveEdit} disabled={busy}>
                          {busy ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Check className="mr-1 h-3 w-3" />}
                          Save
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">Test Case {index + 1}</span>
                          <Badge
                            variant="outline"
                            className={
                              tc.isHidden
                                ? "border-warning/30 bg-warning/10 text-warning"
                                : "border-success/30 bg-success/10 text-success"
                            }
                          >
                            {tc.isHidden ? (
                              <>
                                <EyeOff className="mr-1 h-3 w-3" /> Hidden
                              </>
                            ) : (
                              <>
                                <Globe className="mr-1 h-3 w-3" /> Sample
                              </>
                            )}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{tc.points} pts</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(tc)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => deleteTc(tc.id)}
                            disabled={busy}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <pre className="max-h-28 overflow-auto rounded-md bg-[#0d1117] p-2.5 font-mono text-xs text-foreground">
                          {tc.input}
                        </pre>
                        <pre className="max-h-28 overflow-auto rounded-md bg-[#0d1117] p-2.5 font-mono text-xs text-foreground">
                          {tc.expectedOutput}
                        </pre>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
