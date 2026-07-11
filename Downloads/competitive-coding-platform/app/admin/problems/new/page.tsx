"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Navbar } from "@/components/ui/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { AdminGuard } from "@/components/admin-guard"
import { ArrowLeft, Plus, Trash2, Save, Loader2, Upload } from "lucide-react"
import Link from "next/link"
import { adminApi, ApiError, type Difficulty } from "@/lib/api"
import JSZip from "jszip"

export default function CreateProblemPageWrapper() {
  return (
    <AdminGuard>
      <CreateProblemPage />
    </AdminGuard>
  )
}

function CreateProblemPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
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
    examples: [{ input: "", output: "", explanation: "" }],
    testCases: [{ input: "", expectedOutput: "", isHidden: true, points: 10 }],
  })
  const [newTag, setNewTag] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const generateSlug = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")

  const handleTitleChange = (title: string) => {
    setFormData({ ...formData, title, slug: generateSlug(title) })
  }

  const addTag = () => {
    const tag = newTag.trim().toLowerCase()
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] })
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) })
  }

  const addExample = () =>
    setFormData({ ...formData, examples: [...formData.examples, { input: "", output: "", explanation: "" }] })

  const removeExample = (index: number) =>
    setFormData({ ...formData, examples: formData.examples.filter((_, i) => i !== index) })

  const updateExample = (index: number, field: string, value: string) =>
    setFormData({
      ...formData,
      examples: formData.examples.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex)),
    })

  const addTestCase = () =>
    setFormData({
      ...formData,
      testCases: [...formData.testCases, { input: "", expectedOutput: "", isHidden: true, points: 10 }],
    })

  const removeTestCase = (index: number) =>
    setFormData({ ...formData, testCases: formData.testCases.filter((_, i) => i !== index) })

  const updateTestCase = (index: number, field: string, value: string | boolean | number) =>
    setFormData({
      ...formData,
      testCases: formData.testCases.map((tc, i) => (i === index ? { ...tc, [field]: value } : tc)),
    })

  const handleMdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      if (!text) return

      const newFormData = { ...formData }

      const titleMatch = text.match(/^#\s+(.+)$/m)
      if (titleMatch) newFormData.title = titleMatch[1].trim()

      const timeLimitMatch = text.match(/\*\*Time limit:\*\*\s+([\d.]+)\s*s/i)
      if (timeLimitMatch) newFormData.timeLimit = Math.round(parseFloat(timeLimitMatch[1]) * 1000)

      const memoryLimitMatch = text.match(/\*\*Memory limit:\*\*\s+(\d+)\s*MB/i)
      if (memoryLimitMatch) newFormData.memoryLimit = parseInt(memoryLimitMatch[1]) * 1024

      const statementMatch = text.match(/## Statement\s*([\s\S]*?)(?=### |## |$)/i)
      if (statementMatch) newFormData.statement = statementMatch[1].trim()

      const inputFormatMatch = text.match(/### Input Format\s*([\s\S]*?)(?=### |## |$)/i)
      if (inputFormatMatch) newFormData.inputFormat = inputFormatMatch[1].trim()

      const outputFormatMatch = text.match(/### Output Format\s*([\s\S]*?)(?=### |## |$)/i)
      if (outputFormatMatch) newFormData.outputFormat = outputFormatMatch[1].trim()

      const constraintsMatch = text.match(/### Constraints\s*([\s\S]*?)(?=### |## |$)/i)
      if (constraintsMatch) newFormData.constraints = constraintsMatch[1].trim()

      setFormData(newFormData)
      toast.success("Problem details imported from Markdown")
    }
    reader.readAsText(file)
  }

  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const zip = new JSZip()
      const contents = await zip.loadAsync(file)

      const testCaseMap = new Map<string, { input?: string; output?: string }>()

      for (const [relativePath, zipEntry] of Object.entries(contents.files)) {
        if (zipEntry.dir) continue

        const content = await zipEntry.async("text")
        
        if (relativePath.startsWith("input/") || relativePath.match(/in.*\.txt$/i)) {
          const id = relativePath.replace(/[^0-9]/g, "") || relativePath
          const existing = testCaseMap.get(id) || {}
          testCaseMap.set(id, { ...existing, input: content.trim() })
        } else if (relativePath.startsWith("output/") || relativePath.match(/out.*\.txt$/i)) {
          const id = relativePath.replace(/[^0-9]/g, "") || relativePath
          const existing = testCaseMap.get(id) || {}
          testCaseMap.set(id, { ...existing, output: content.trim() })
        }
      }

      const newTestCases = Array.from(testCaseMap.values())
        .filter((tc) => tc.input && tc.output)
        .map((tc) => ({
          input: tc.input!,
          expectedOutput: tc.output!,
          isHidden: true,
          points: 10,
        }))

      if (newTestCases.length > 0) {
        setFormData({
          ...formData,
          testCases: [...formData.testCases.filter(tc => tc.input.trim() || tc.expectedOutput.trim()), ...newTestCases],
        })
        toast.success(`Imported ${newTestCases.length} test cases from ZIP`)
      } else {
        toast.error("No valid input/output pairs found in ZIP")
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to parse ZIP file")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validTestCases = formData.testCases.filter((tc) => tc.input.trim() && tc.expectedOutput.trim())
    if (validTestCases.length === 0) {
      toast.error("Add at least one test case with input and expected output")
      return
    }

    setIsSubmitting(true)
    try {
      // 1. Create the problem
      const problem = await adminApi.createProblem({
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        difficulty: formData.difficulty,
        tags: formData.tags,
        statement: formData.statement,
        inputFormat: formData.inputFormat || undefined,
        outputFormat: formData.outputFormat || undefined,
        constraints: formData.constraints || undefined,
        hints: formData.hints || undefined,
        examples: formData.examples
          .filter((ex) => ex.input.trim() && ex.output.trim())
          .map((ex) => ({ input: ex.input, output: ex.output, explanation: ex.explanation || undefined })),
        timeLimit: formData.timeLimit,
        memoryLimit: formData.memoryLimit,
        isPublic: formData.isPublic,
      })

      // 2. Add test cases in bulk
      await adminApi.bulkAddTestCases(
        problem.id,
        validTestCases.map((tc, index) => ({
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isHidden: tc.isHidden,
          points: tc.points,
          orderIndex: index,
        }))
      )

      toast.success(`Problem created with ${validTestCases.length} test cases`)
      router.push("/admin/problems")
    } catch (err) {
      setIsSubmitting(false)
      if (err instanceof ApiError && err.errors?.length) {
        toast.error(`${err.message}: ${err.errors.map((e) => e.message).join(", ")}`)
      } else {
        toast.error(err instanceof ApiError ? err.message : "Failed to create problem")
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-16">
        <div className="mx-auto max-w-4xl px-4 py-8 lg:px-6">
          {/* Back Link */}
          <Link href="/admin/problems" className="mb-6 inline-block">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Problems
            </Button>
          </Link>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-foreground">Basic Information</CardTitle>
                <div className="flex items-center gap-2">
                  <Label htmlFor="md-upload" className="cursor-pointer">
                    <div className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3">
                      <Upload className="mr-2 h-4 w-4" />
                      Import .md
                    </div>
                  </Label>
                  <input
                    id="md-upload"
                    type="file"
                    accept=".md"
                    className="hidden"
                    onChange={handleMdUpload}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-foreground">
                      Title
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="Two Sum"
                      required
                      className="border-input bg-background text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug" className="text-foreground">
                      Slug (auto-generated)
                    </Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="two-sum"
                      required
                      pattern="[a-z0-9-]+"
                      title="Lowercase letters, numbers and hyphens only"
                      className="border-input bg-background text-foreground"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="difficulty" className="text-foreground">
                      Difficulty
                    </Label>
                    <Select
                      value={formData.difficulty}
                      onValueChange={(v) => setFormData({ ...formData, difficulty: v as Difficulty })}
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
                    <Label htmlFor="timeLimit" className="text-foreground">
                      Time Limit (ms)
                    </Label>
                    <Input
                      id="timeLimit"
                      type="number"
                      min={100}
                      max={15000}
                      value={formData.timeLimit}
                      onChange={(e) => setFormData({ ...formData, timeLimit: Number(e.target.value) })}
                      className="border-input bg-background text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="memoryLimit" className="text-foreground">
                      Memory Limit (KB)
                    </Label>
                    <Input
                      id="memoryLimit"
                      type="number"
                      min={16384}
                      value={formData.memoryLimit}
                      onChange={(e) => setFormData({ ...formData, memoryLimit: Number(e.target.value) })}
                      className="border-input bg-background text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground"
                      >
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
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
                    id="isPublic"
                    checked={formData.isPublic}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
                  />
                  <div>
                    <Label htmlFor="isPublic" className="text-foreground">
                      Publish immediately
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Published problems are visible to all users. Drafts stay hidden.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statement */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Problem Statement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={formData.statement}
                  onChange={(e) => setFormData({ ...formData, statement: e.target.value })}
                  placeholder="Write the full problem statement here."
                  rows={8}
                  required
                  className="border-input bg-background text-foreground placeholder:text-muted-foreground"
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Input Format</Label>
                    <Textarea
                      value={formData.inputFormat}
                      onChange={(e) => setFormData({ ...formData, inputFormat: e.target.value })}
                      placeholder="First line contains n..."
                      rows={3}
                      className="border-input bg-background text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Output Format</Label>
                    <Textarea
                      value={formData.outputFormat}
                      onChange={(e) => setFormData({ ...formData, outputFormat: e.target.value })}
                      placeholder="Print a single integer..."
                      rows={3}
                      className="border-input bg-background text-foreground"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Constraints (one per line)</Label>
                  <Textarea
                    value={formData.constraints}
                    onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
                    placeholder={"1 <= n <= 10^5\n-10^9 <= a[i] <= 10^9"}
                    rows={3}
                    className="border-input bg-background font-mono text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Hints (one per line, optional)</Label>
                  <Textarea
                    value={formData.hints}
                    onChange={(e) => setFormData({ ...formData, hints: e.target.value })}
                    placeholder={"Try using a hash map.\nThink about the two-pointer technique."}
                    rows={2}
                    className="border-input bg-background text-foreground"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Examples */}
            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-foreground">Examples (shown to users)</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addExample}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Example
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.examples.map((example, index) => (
                  <div key={index} className="relative rounded-lg border border-border bg-background p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="font-medium text-foreground">Example {index + 1}</span>
                      {formData.examples.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeExample(index)}
                          className="h-8 w-8 text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">Input</Label>
                        <Textarea
                          value={example.input}
                          onChange={(e) => updateExample(index, "input", e.target.value)}
                          placeholder={"2 7 11 15\n9"}
                          rows={2}
                          className="border-input bg-card font-mono text-foreground max-h-40 overflow-y-auto"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">Output</Label>
                        <Textarea
                          value={example.output}
                          onChange={(e) => updateExample(index, "output", e.target.value)}
                          placeholder="0 1"
                          rows={2}
                          className="border-input bg-card font-mono text-foreground max-h-40 overflow-y-auto"
                        />
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <Label className="text-muted-foreground">Explanation (optional)</Label>
                      <Textarea
                        value={example.explanation}
                        onChange={(e) => updateExample(index, "explanation", e.target.value)}
                        placeholder="Because nums[0] + nums[1] == 9, we return [0, 1]."
                        rows={2}
                        className="border-input bg-card text-foreground"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Test Cases */}
            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-foreground">Test Cases (used for judging)</CardTitle>
                <div className="flex items-center gap-2">
                  <Label htmlFor="zip-upload" className="cursor-pointer">
                    <div className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3">
                      <Upload className="mr-2 h-4 w-4" />
                      Import .zip
                    </div>
                  </Label>
                  <input
                    id="zip-upload"
                    type="file"
                    accept=".zip"
                    className="hidden"
                    onChange={handleZipUpload}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addTestCase}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Test Case
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.testCases.map((testCase, index) => (
                  <div key={index} className="relative rounded-lg border border-border bg-background p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="font-medium text-foreground">Test Case {index + 1}</span>
                        <label className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Switch
                            checked={testCase.isHidden}
                            onCheckedChange={(checked) => updateTestCase(index, "isHidden", checked)}
                          />
                          Hidden
                        </label>
                        <label className="flex items-center gap-2 text-xs text-muted-foreground">
                          Points
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={testCase.points}
                            onChange={(e) => updateTestCase(index, "points", Number(e.target.value))}
                            className="h-8 w-20 border-input bg-card text-foreground"
                          />
                        </label>
                      </div>
                      {formData.testCases.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeTestCase(index)}
                          className="h-8 w-8 text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">Input</Label>
                        <Textarea
                          value={testCase.input}
                          onChange={(e) => updateTestCase(index, "input", e.target.value)}
                          rows={2}
                          className="border-input bg-card font-mono text-foreground max-h-40 overflow-y-auto"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">Expected Output</Label>
                        <Textarea
                          value={testCase.expectedOutput}
                          onChange={(e) => updateTestCase(index, "expectedOutput", e.target.value)}
                          rows={2}
                          className="border-input bg-card font-mono text-foreground max-h-40 overflow-y-auto"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Link href="/admin/problems">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {isSubmitting ? "Creating..." : "Create Problem"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
