"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DifficultyBadge } from "@/components/ui/difficulty-badge"
import { Copy, Check, Lock, Lightbulb, FileText, History, Sparkles } from "lucide-react"
import type { Problem, Submission } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface ProblemPanelProps {
  problem: Problem
  submissions: Submission[]
}

export function ProblemPanel({ problem, submissions }: ProblemPanelProps) {
  const [showHints, setShowHints] = useState(false)

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      <Tabs defaultValue="description" className="flex h-full flex-col">
        {/* Tab Navigation */}
        <div className="border-b border-border/50 bg-card/30 px-2">
          <TabsList className="h-12 w-full justify-start gap-1 bg-transparent p-0">
            <TabsTrigger
              value="description"
              className="gap-2 rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <FileText className="h-4 w-4" />
              Description
            </TabsTrigger>
            <TabsTrigger
              value="submissions"
              className="gap-2 rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <History className="h-4 w-4" />
              Submissions
              <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-xs">{submissions.length}</span>
            </TabsTrigger>
            <TabsTrigger
              value="hints"
              className="gap-2 rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <Sparkles className="h-4 w-4" />
              Hints
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Description Tab */}
        <TabsContent value="description" className="mt-0 flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Title & Meta */}
            <div className="mb-6">
              <h1 className="mb-3 text-2xl font-bold tracking-tight text-foreground">{problem.title}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <DifficultyBadge difficulty={problem.difficulty} />
                {problem.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="border border-border/50 bg-card/50 text-muted-foreground"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-wrap leading-relaxed text-foreground/90">{problem.description}</div>
            </div>

            {/* Examples */}
            {problem.examples && problem.examples.length > 0 && (
              <div className="mt-8">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                  <span className="flex h-6 w-6 items-center justify-center rounded bg-primary/20 text-xs text-primary">
                    Ex
                  </span>
                  Examples
                </h3>
                <div className="space-y-4">
                  {problem.examples.map((example, index) => (
                    <div
                      key={index}
                      className="overflow-hidden rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm"
                    >
                      <div className="border-b border-border/50 bg-card/50 px-4 py-2">
                        <span className="text-sm font-medium text-muted-foreground">Example {index + 1}</span>
                      </div>
                      <div className="p-4">
                        <CodeBlock label="Input" code={example.input} />
                        <CodeBlock label="Output" code={example.output} />
                        {example.explanation && (
                          <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                            <span className="text-sm font-medium text-amber-400">Explanation: </span>
                            <span className="text-sm text-foreground/80">{example.explanation}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Constraints */}
            {problem.constraints && problem.constraints.length > 0 && (
              <div className="mt-8">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                  <span className="flex h-6 w-6 items-center justify-center rounded bg-red-500/20 text-xs text-red-400">
                    !
                  </span>
                  Constraints
                </h3>
                <ul className="space-y-2">
                  {problem.constraints.map((constraint, index) => (
                    <li key={index} className="flex items-start gap-2 text-muted-foreground">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                      <code className="rounded bg-card px-2 py-1 font-mono text-sm text-foreground">{constraint}</code>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Submissions Tab */}
        <TabsContent value="submissions" className="mt-0 flex-1 overflow-y-auto">
          <div className="p-6">
            {submissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-card">
                  <History className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium text-foreground">No submissions yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Be the first to solve this problem!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="flex items-center justify-between rounded-xl border border-border/50 bg-card/30 p-4 transition-colors hover:bg-card/50"
                  >
                    <div>
                      <Badge
                        className={cn(
                          "border font-medium",
                          submission.status === "ACCEPTED"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                            : "border-red-500/30 bg-red-500/10 text-red-400",
                        )}
                      >
                        {submission.status.replace("_", " ")}
                      </Badge>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {submission.language} • {new Date(submission.submittedAt).toLocaleString()}
                      </p>
                    </div>
                    {submission.status === "ACCEPTED" && (
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">{submission.runtime}</p>
                        <p className="text-xs text-muted-foreground">{submission.memory}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Hints Tab */}
        <TabsContent value="hints" className="mt-0 flex-1 overflow-y-auto">
          <div className="p-6">
            {!showHints ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5">
                  <Lightbulb className="h-8 w-8 text-amber-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">Need a hint?</h3>
                <p className="mb-6 max-w-sm text-sm text-muted-foreground">
                  Hints can help guide you towards the solution, but try solving it yourself first for the best learning
                  experience.
                </p>
                <Button onClick={() => setShowHints(true)} className="gap-2">
                  <Lock className="h-4 w-4" />
                  Reveal Hints
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {problem.hints && problem.hints.length > 0 ? (
                  problem.hints.map((hint, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent p-4"
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-amber-400" />
                        <span className="text-sm font-semibold text-amber-400">Hint {index + 1}</span>
                      </div>
                      <p className="text-sm leading-relaxed text-foreground/90">{hint}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No hints available for this problem.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function CodeBlock({ label, code }: { label: string; code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mt-3 first:mt-0">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              Copy
            </>
          )}
        </Button>
      </div>
      <pre className="mt-1.5 overflow-x-auto rounded-lg bg-[#0d1117] p-3 font-mono text-sm text-foreground">{code}</pre>
    </div>
  )
}
