import { cn } from "@/lib/utils"
import type { Badge } from "@/lib/mock-data"

interface BadgesEarnedProps {
  badges: Badge[]
}

export function BadgesEarned({ badges }: BadgesEarnedProps) {
  return (
    <div className="rounded-lg border border-border/50 bg-card/30 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Badges</h3>
        <span className="text-xs text-muted-foreground">{badges.length} earned</span>
      </div>

      <div className="flex flex-wrap gap-3">
        {badges.map((badge) => (
          <div key={badge.id} className="group relative" title={`${badge.name} - ${badge.description}`}>
            <BadgeIcon tier={badge.tier} />
          </div>
        ))}

        {/* Placeholder for unearned badges */}
        {[...Array(3)].map((_, i) => (
          <div key={`empty-${i}`} className="h-10 w-10 rounded-full border-2 border-dashed border-muted/30" />
        ))}
      </div>
    </div>
  )
}

function BadgeIcon({ tier }: { tier: "gold" | "silver" | "bronze" }) {
  const colors = {
    gold: "from-yellow-400 to-yellow-600 shadow-yellow-500/20",
    silver: "from-slate-300 to-slate-500 shadow-slate-400/20",
    bronze: "from-orange-400 to-orange-600 shadow-orange-500/20",
  }

  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br shadow-lg",
        colors[tier],
      )}
    >
      <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    </div>
  )
}
