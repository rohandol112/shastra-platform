"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/ui/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockUser } from "@/lib/mock-data"
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react"
import Link from "next/link"

export default function CreateProblemPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    difficulty: "MEDIUM" as "EASY" | "MEDIUM" | "HARD",
    description: "",
    tags: [] as string[],
    examples: [{ input: "", output: "", explanation: "" }],
    constraints: [""],
    hints: [""],
    testCases: [{ input: "", expectedOutput: "", isHidden: false }],
  })
  const [newTag, setNewTag] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
  }

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    })
  }

  const addTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData({ ...formData, tags: [...formData.tags, newTag] })
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    })
  }

  const addExample = () => {
    setFormData({
      ...formData,
      examples: [...formData.examples, { input: "", output: "", explanation: "" }],
    })
  }

  const removeExample = (index: number) => {
    setFormData({
      ...formData,
      examples: formData.examples.filter((_, i) => i !== index),
    })
  }

  const updateExample = (index: number, field: string, value: string) => {
    setFormData({
      ...formData,
      examples: formData.examples.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex)),
    })
  }

  const addTestCase = () => {
    setFormData({
      ...formData,
      testCases: [...formData.testCases, { input: "", expectedOutput: "", isHidden: true }],
    })
  }

  const removeTestCase = (index: number) => {
    setFormData({
      ...formData,
      testCases: formData.testCases.filter((_, i) => i !== index),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    router.push("/admin/problems")
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar user={mockUser} />

      <main className="flex-1">
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
              <CardHeader>
                <CardTitle className="text-foreground">Basic Information</CardTitle>
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
                      className="border-input bg-background text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty" className="text-foreground">
                    Difficulty
                  </Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(v) =>
                      setFormData({
                        ...formData,
                        difficulty: v as "EASY" | "MEDIUM" | "HARD",
                      })
                    }
                  >
                    <SelectTrigger className="w-[200px] border-input bg-background text-foreground">
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
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                      />
                      <Button type="button" variant="outline" size="sm" onClick={addTag}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Problem Description</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Write the problem description here. Supports Markdown."
                  rows={8}
                  className="border-input bg-background text-foreground placeholder:text-muted-foreground"
                />
              </CardContent>
            </Card>

            {/* Examples */}
            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-foreground">Examples</CardTitle>
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
                          placeholder="nums = [2,7,11,15], target = 9"
                          rows={2}
                          className="border-input bg-card font-mono text-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">Output</Label>
                        <Textarea
                          value={example.output}
                          onChange={(e) => updateExample(index, "output", e.target.value)}
                          placeholder="[0,1]"
                          rows={2}
                          className="border-input bg-card font-mono text-foreground"
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
                <CardTitle className="text-foreground">Test Cases</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addTestCase}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Test Case
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.testCases.map((testCase, index) => (
                  <div key={index} className="relative rounded-lg border border-border bg-background p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="font-medium text-foreground">
                        Test Case {index + 1}
                        {testCase.isHidden && <span className="ml-2 text-xs text-muted-foreground">(Hidden)</span>}
                      </span>
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
                          onChange={(e) => {
                            const newTestCases = [...formData.testCases]
                            newTestCases[index].input = e.target.value
                            setFormData({ ...formData, testCases: newTestCases })
                          }}
                          rows={2}
                          className="border-input bg-card font-mono text-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">Expected Output</Label>
                        <Textarea
                          value={testCase.expectedOutput}
                          onChange={(e) => {
                            const newTestCases = [...formData.testCases]
                            newTestCases[index].expectedOutput = e.target.value
                            setFormData({ ...formData, testCases: newTestCases })
                          }}
                          rows={2}
                          className="border-input bg-card font-mono text-foreground"
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
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? "Creating..." : "Create Problem"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
