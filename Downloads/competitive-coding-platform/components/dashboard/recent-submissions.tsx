import Link from "next/link"
import { Check, X, Clock, AlertTriangle, ChevronRight } from "lucide-react"
import type { Submission } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface RecentSubmissionsProps {
  submissions: Submission[]
}

const statusConfig = {
  ACCEPTED: { icon: Check, color: "text-emerald-400" },
  WRONG_ANSWER: { icon: X, color: "text-red-400" },
  TIME_LIMIT: { icon: Clock, color: "text-amber-400" },
  RUNTIME_ERROR: { icon: AlertTriangle, color: "text-red-400" },
  COMPILE_ERROR: { icon: AlertTriangle, color: "text-red-400" },
}

export function RecentSubmissions({ submissions }: RecentSubmissionsProps) {
  if (submissions.length === 0) {
    return (
      <div className="rounded-xl border border-border/60 bg-card/50 p-6 text-center">
        <p className="text-sm text-muted-foreground">No submissions yet</p>
        <Link href="/problems" className="mt-2 inline-block text-sm text-primary hover:underline">
          Start solving problems
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card/50">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 px-5 py-3">
        <h3 className="text-sm font-medium text-foreground">Recent Submissions</h3>
        <Link href="/profile" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
          View all
        </Link>
      </div>

      {/* Submissions List */}
      <div className="divide-y divide-border/30">
        {submissions.slice(0, 5).map((submission) => {
          const config = statusConfig[submission.status]
          const Icon = config.icon
          const timeAgo = getTimeAgo(submission.submittedAt)

          return (
            <Link
              key={submission.id}
              href={`/problems/${submission.problemId}`}
              className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-muted/30"
            >
              {/* Status Icon */}
              <div className={cn("shrink-0", config.color)}>
                <Icon className="h-4 w-4" />
              </div>

              {/* Problem Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-foreground">{submission.problemTitle}</p>
                <p className="text-xs text-muted-foreground">{submission.language}</p>
              </div>

              {/* Time */}
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{timeAgo}</span>

              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  return `${diffDays}d`
}
