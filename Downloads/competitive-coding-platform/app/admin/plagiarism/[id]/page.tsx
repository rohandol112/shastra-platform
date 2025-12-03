"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/ui/navbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { mockUser, mockPlagiarismReports } from "@/lib/mock-data"
import { ArrowLeft, AlertTriangle, Check, X, User, Clock, Scale } from "lucide-react"
import { cn } from "@/lib/utils"

export default function PlagiarismReviewPage() {
  const params = useParams()
  const router = useRouter()
  const reportId = params.id as string

  const report = mockPlagiarismReports.find((r) => r.id === reportId)
  const [isProcessing, setIsProcessing] = useState(false)
  const [scrollSync, setScrollSync] = useState(true)

  if (!report) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <p className="text-lg text-foreground">Report not found</p>
        <Link href="/admin/plagiarism" className="mt-4">
          <Button>Back to Reports</Button>
        </Link>
      </div>
    )
  }

  const handleDismiss = async () => {
    setIsProcessing(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    router.push("/admin/plagiarism")
  }

  const handleConfirm = async () => {
    setIsProcessing(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    router.push("/admin/plagiarism")
  }

  // Sample code for demonstration
  const suspectCode = `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

# Driver code
nums = [2, 7, 11, 15]
target = 9
print(two_sum(nums, target))`

  const sourceCode = `def two_sum(nums, target):
    hash_map = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in hash_map:
            return [hash_map[diff], i]
        hash_map[num] = i
    return []

# Test
numbers = [2, 7, 11, 15]
t = 9
print(two_sum(numbers, t))`

  // Matched lines (for highlighting)
  const matchedLinesA = [1, 2, 3, 4, 5, 6, 7, 8]
  const matchedLinesB = [1, 2, 3, 4, 5, 6, 7, 8]

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={mockUser} />

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-24 lg:px-6 lg:pt-28">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/plagiarism"
            className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Reports
          </Link>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Plagiarism Review</h1>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-lg",
                    report.similarity >= 90
                      ? "border-destructive/50 bg-destructive/10 text-destructive"
                      : report.similarity >= 70
                        ? "border-warning/50 bg-warning/10 text-warning"
                        : "border-primary/50 bg-primary/10 text-primary",
                  )}
                >
                  {report.similarity}% Match
                </Badge>
              </div>
              <p className="mt-2 text-muted-foreground">
                Problem: <span className="text-foreground">{report.problemTitle}</span>
              </p>
            </div>

            <Badge
              variant="outline"
              className={cn(
                "px-4 py-2",
                report.status === "PENDING" && "border-warning/50 bg-warning/10 text-warning",
                report.status === "CONFIRMED" && "border-destructive/50 bg-destructive/10 text-destructive",
                report.status === "DISMISSED" && "border-muted-foreground/50",
              )}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              {report.status}
            </Badge>
          </div>
        </div>

        {/* Metadata Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-4 rounded-xl border border-border/50 bg-card/50 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <User className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Suspect</p>
              <p className="font-medium text-foreground">{report.userA}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-border/50 bg-card/50 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <User className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Source</p>
              <p className="font-medium text-foreground">{report.userB}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-border/50 bg-card/50 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Detected</p>
              <p className="font-medium text-foreground">{new Date(report.detectedAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-border/50 bg-card/50 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Scale className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Matched Lines</p>
              <p className="font-medium text-foreground">
                {report.matchedLines} / {report.totalLines}
              </p>
            </div>
          </div>
        </div>

        {/* Sync Toggle */}
        <div className="mb-4 flex items-center justify-end gap-2">
          <span className="text-sm text-muted-foreground">Sync scrolling</span>
          <button
            onClick={() => setScrollSync(!scrollSync)}
            className={cn("h-6 w-11 rounded-full transition-colors", scrollSync ? "bg-primary" : "bg-secondary")}
          >
            <div
              className={cn(
                "h-5 w-5 rounded-full bg-white shadow transition-transform",
                scrollSync ? "translate-x-5" : "translate-x-0.5",
              )}
            />
          </button>
        </div>

        {/* Code Comparison - Side by Side */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Suspect Code (Left) */}
          <div className="overflow-hidden rounded-2xl border border-destructive/30 bg-card/50">
            <div className="flex items-center justify-between border-b border-border/50 bg-destructive/5 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-destructive" />
                <span className="font-medium text-foreground">{report.userA}</span>
                <Badge variant="outline" className="text-xs">
                  Suspect
                </Badge>
              </div>
              <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive">
                {matchedLinesA.length} matched
              </Badge>
            </div>
            <div className="overflow-x-auto">
              <pre className="p-4 font-mono text-sm">
                {suspectCode.split("\n").map((line, index) => (
                  <div key={index} className={cn("flex", matchedLinesA.includes(index + 1) && "bg-destructive/10")}>
                    <span className="mr-4 w-8 select-none text-right text-muted-foreground/50">{index + 1}</span>
                    <code className="text-foreground">{line || " "}</code>
                  </div>
                ))}
              </pre>
            </div>
          </div>

          {/* Source Code (Right) */}
          <div className="overflow-hidden rounded-2xl border border-warning/30 bg-card/50">
            <div className="flex items-center justify-between border-b border-border/50 bg-warning/5 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-warning" />
                <span className="font-medium text-foreground">{report.userB}</span>
                <Badge variant="outline" className="text-xs">
                  Source
                </Badge>
              </div>
              <Badge variant="outline" className="border-warning/30 bg-warning/10 text-warning">
                {matchedLinesB.length} matched
              </Badge>
            </div>
            <div className="overflow-x-auto">
              <pre className="p-4 font-mono text-sm">
                {sourceCode.split("\n").map((line, index) => (
                  <div key={index} className={cn("flex", matchedLinesB.includes(index + 1) && "bg-warning/10")}>
                    <span className="mr-4 w-8 select-none text-right text-muted-foreground/50">{index + 1}</span>
                    <code className="text-foreground">{line || " "}</code>
                  </div>
                ))}
              </pre>
            </div>
          </div>
        </div>

        {/* Floating Action Bar */}
        {report.status === "PENDING" && (
          <div className="fixed bottom-0 left-0 right-0 border-t border-border/50 bg-background/95 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-6">
              <p className="text-sm text-muted-foreground">Review the code carefully before making a decision</p>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleDismiss}
                  disabled={isProcessing}
                  className="border-border/50 bg-transparent"
                >
                  <X className="mr-2 h-4 w-4" />
                  Dismiss
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirm}
                  disabled={isProcessing}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Confirm Plagiarism
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
