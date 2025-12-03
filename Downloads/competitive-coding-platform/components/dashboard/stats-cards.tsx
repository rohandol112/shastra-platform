import { cn } from "@/lib/utils"

interface StatsCardsProps {
  stats: {
    problemsSolved: number
    contestsParticipated: number
    globalRank: number
    rating: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border/60 bg-border/60 sm:grid-cols-4">
      <StatCell label="Solved" value={stats.problemsSolved} detail="+12 this week" />
      <StatCell label="Contests" value={stats.contestsParticipated} detail="3 upcoming" />
      <StatCell label="Rank" value={`#${stats.globalRank.toLocaleString()}`} detail="Top 2%" highlight />
      <StatCell label="Rating" value={stats.rating} detail="Expert" highlight />
    </div>
  )
}

function StatCell({
  label,
  value,
  detail,
  highlight,
}: {
  label: string
  value: string | number
  detail: string
  highlight?: boolean
}) {
  return (
    <div className="bg-card/80 px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 text-2xl font-semibold tabular-nums tracking-tight",
          highlight ? "text-primary" : "text-foreground",
        )}
      >
        {value}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>
    </div>
  )
}
