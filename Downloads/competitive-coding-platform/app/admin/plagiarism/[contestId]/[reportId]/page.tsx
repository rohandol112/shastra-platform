"use client"

import { memo, useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Navbar } from "@/components/ui/navbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StaffGuard } from "@/components/admin-guard"
import { ArrowLeft, AlertTriangle, Check, X, User, Scale, Loader2, Fingerprint, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { adminApi, ApiError, type PlagiarismReportDetail } from "@/lib/api"

export default function ReviewWrapper() {
  return (
    <StaffGuard>
      <PlagiarismReviewPage />
    </StaffGuard>
  )
}

function PlagiarismReviewPage() {
  const params = useParams()
  const router = useRouter()
  const contestId = params.contestId as string
  const reportId = params.reportId as string

  const [report, setReport] = useState<PlagiarismReportDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    setLoading(true)
    adminApi
      .plagiarismReport(reportId)
      .then(setReport)
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Failed to load report"))
      .finally(() => setLoading(false))
  }, [reportId])

  const resolve = async (status: "CONFIRMED" | "DISMISSED") => {
    setProcessing(true)
    try {
      await adminApi.resolvePlagiarism(reportId, status)
      toast.success(status === "CONFIRMED" ? "Marked as plagiarism" : "Dismissed")
      router.push(`/admin/plagiarism/${contestId}`)
    } catch (err) {
      setProcessing(false)
      toast.error(err instanceof ApiError ? err.message : "Failed to update report")
    }
  }

  // Stable across unrelated re-renders (e.g. while resolving) so memoized
  // CodePanes don't re-render the whole code block.
  const linesA = useMemo(() => new Set(report?.matchedLinesA ?? []), [report])
  const linesB = useMemo(() => new Set(report?.matchedLinesB ?? []), [report])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!report) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <p className="text-lg text-foreground">Report not found</p>
        <Link href={`/admin/plagiarism/${contestId}`} className="mt-4">
          <Button>Back to Reports</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-24 lg:px-6 lg:pt-28">
        <Link
          href={`/admin/plagiarism/${contestId}`}
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Reports
        </Link>

        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Plagiarism Review</h1>
              <Badge
                variant="outline"
                className={cn(
                  "text-lg",
                  report.similarity >= 90
                    ? "border-destructive/50 bg-destructive/10 text-destructive"
                    : report.similarity >= 75
                      ? "border-warning/50 bg-warning/10 text-warning"
                      : "border-primary/50 bg-primary/10 text-primary"
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
              report.status === "DISMISSED" && "border-muted-foreground/50"
            )}
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            {report.status}
          </Badge>
        </div>

        {/* Metadata */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetaCard icon={<User className="h-5 w-5 text-destructive" />} label="Suspect" value={report.userA} iconBg="bg-destructive/10" />
          <MetaCard icon={<User className="h-5 w-5 text-warning" />} label="Source" value={report.userB} iconBg="bg-warning/10" />
          <MetaCard
            icon={<Fingerprint className="h-5 w-5 text-primary" />}
            label="Structural"
            value={`${report.fingerprintScore}%`}
            iconBg="bg-primary/10"
          />
          <MetaCard
            icon={<Sparkles className="h-5 w-5 text-success" />}
            label="Semantic"
            value={report.embeddingScore != null ? `${report.embeddingScore}%` : "—"}
            iconBg="bg-success/10"
          />
        </div>

        {/* Side-by-side code with matched-line highlighting */}
        <div className="grid gap-4 lg:grid-cols-2">
          <CodePane
            title={report.userA}
            tag="Suspect"
            language={report.languageA}
            code={report.codeA}
            matched={linesA}
            tone="destructive"
          />
          <CodePane
            title={report.userB}
            tag="Source"
            language={report.languageB}
            code={report.codeB}
            matched={linesB}
            tone="warning"
          />
        </div>

        {report.status === "PENDING" && (
          <div className="fixed bottom-0 left-0 right-0 border-t border-border/50 bg-background/95 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-6">
              <p className="hidden text-sm text-muted-foreground sm:block">
                Highlighted lines share the same structure across both submissions.
              </p>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => resolve("DISMISSED")} disabled={processing} className="border-border/50 bg-transparent">
                  <X className="mr-2 h-4 w-4" />
                  Dismiss
                </Button>
                <Button variant="destructive" onClick={() => resolve("CONFIRMED")} disabled={processing} className="bg-destructive hover:bg-destructive/90">
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

function MetaCard({ icon, label, value, iconBg }: { icon: React.ReactNode; label: string; value: string; iconBg: string }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border/50 bg-card/50 p-4">
      <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", iconBg)}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate font-medium text-foreground">{value}</p>
      </div>
    </div>
  )
}

const CodePane = memo(function CodePane({
  title,
  tag,
  language,
  code,
  matched,
  tone,
}: {
  title: string
  tag: string
  language: string
  code: string
  matched: Set<number>
  tone: "destructive" | "warning"
}) {
  const lines = code.split("\n")
  return (
    <div className={cn("overflow-hidden rounded-2xl border bg-card/50", tone === "destructive" ? "border-destructive/30" : "border-warning/30")}>
      <div className={cn("flex items-center justify-between border-b border-border/50 px-4 py-3", tone === "destructive" ? "bg-destructive/5" : "bg-warning/5")}>
        <div className="flex items-center gap-2">
          <div className={cn("h-3 w-3 rounded-full", tone === "destructive" ? "bg-destructive" : "bg-warning")} />
          <span className="font-medium text-foreground">{title}</span>
          <Badge variant="outline" className="text-xs">{tag}</Badge>
          <span className="text-xs text-muted-foreground">{language}</span>
        </div>
        <Badge variant="outline" className={cn("text-xs", tone === "destructive" ? "border-destructive/30 bg-destructive/10 text-destructive" : "border-warning/30 bg-warning/10 text-warning")}>
          {matched.size} matched
        </Badge>
      </div>
      <div className="max-h-[70vh] overflow-auto">
        <pre className="p-4 font-mono text-sm leading-relaxed">
          {lines.map((line, i) => {
            const lineNo = i + 1
            const hit = matched.has(lineNo)
            return (
              <div key={i} className={cn("flex", hit && (tone === "destructive" ? "bg-destructive/10" : "bg-warning/10"))}>
                <span className="mr-4 w-10 shrink-0 select-none text-right text-muted-foreground/50">{lineNo}</span>
                <code className="whitespace-pre text-foreground">{line || " "}</code>
              </div>
            )
          })}
        </pre>
      </div>
    </div>
  )
})
