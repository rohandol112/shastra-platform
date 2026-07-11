import { cn } from "@/lib/utils"

interface ProblemStatsProps {
  easy: { solved: number; total: number }
  medium: { solved: number; total: number }
  hard: { solved: number; total: number }
}

export function ProblemStats({ easy, medium, hard }: ProblemStatsProps) {
  const total = easy.solved + medium.solved + hard.solved
  const totalProblems = easy.total + medium.total + hard.total
  const solvedRatio = totalProblems > 0 ? total / totalProblems : 0

  return (
    <div className="rounded-lg border border-border/50 bg-card/30 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Problems Solved</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums text-foreground">{total}</p>
        </div>

        {/* Circular progress */}
        <div className="relative h-16 w-16">
          <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-muted/30"
            />
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${solvedRatio * 97.4} 97.4`}
              strokeLinecap="round"
              className="text-emerald-500"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-muted-foreground">
            {Math.round(solvedRatio * 100)}%
          </span>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <DifficultyRow label="Easy" solved={easy.solved} total={easy.total} color="emerald" />
        <DifficultyRow label="Medium" solved={medium.solved} total={medium.total} color="amber" />
        <DifficultyRow label="Hard" solved={hard.solved} total={hard.total} color="red" />
      </div>
    </div>
  )
}

function DifficultyRow({
  label,
  solved,
  total,
  color,
}: {
  label: string
  solved: number
  total: number
  color: "emerald" | "amber" | "red"
}) {
  const percentage = total > 0 ? (solved / total) * 100 : 0
  const colorClasses = {
    emerald: "bg-emerald-500 text-emerald-400",
    amber: "bg-amber-500 text-amber-400",
    red: "bg-red-500 text-red-400",
  }

  return (
    <div className="flex items-center gap-3">
      <span className={cn("w-14 text-xs font-medium", colorClasses[color].split(" ")[1])}>{label}</span>
      <div className="h-2 flex-1 rounded-full bg-muted/30">
        <div
          className={cn("h-2 rounded-full", colorClasses[color].split(" ")[0])}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-12 text-right text-xs tabular-nums text-muted-foreground">
        {solved}/{total}
      </span>
    </div>
  )
}
