import Link from "next/link"
import { cn } from "@/lib/utils"
import type { Problem } from "@/lib/mock-data"
import { ArrowRight } from "lucide-react"

interface RecommendedProblemsProps {
  problems: Problem[]
}

export function RecommendedProblems({ problems }: RecommendedProblemsProps) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-medium text-foreground">Recommended for you</h2>
        <Link href="/problems" className="text-xs text-muted-foreground hover:text-foreground">
          See more
        </Link>
      </div>

      <div className="space-y-2">
        {problems.slice(0, 5).map((problem) => (
          <Link
            key={problem.id}
            href={`/problems/${problem.slug}`}
            className="group flex items-center justify-between rounded-lg border border-border/50 bg-card/30 px-4 py-3 transition-colors hover:bg-card/60"
          >
            <div className="flex items-center gap-3">
              <DifficultyDot difficulty={problem.difficulty} />
              <div>
                <p className="text-sm font-medium text-foreground group-hover:text-primary">{problem.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{problem.tags.slice(0, 2).join(" · ")}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs tabular-nums text-muted-foreground">{problem.acceptanceRate}%</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function DifficultyDot({ difficulty }: { difficulty: "EASY" | "MEDIUM" | "HARD" }) {
  const colors = {
    EASY: "bg-emerald-500",
    MEDIUM: "bg-amber-500",
    HARD: "bg-red-500",
  }

  return <div className={cn("h-2 w-2 rounded-full", colors[difficulty])} />
}
