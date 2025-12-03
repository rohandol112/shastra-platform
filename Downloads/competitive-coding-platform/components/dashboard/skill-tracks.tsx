import Link from "next/link"
import { cn } from "@/lib/utils"
import type { SkillTrack } from "@/lib/mock-data"
import { ChevronRight } from "lucide-react"

interface SkillTracksProps {
  tracks: SkillTrack[]
}

export function SkillTracks({ tracks }: SkillTracksProps) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-medium text-foreground">Skills</h2>
        <Link href="/problems" className="text-xs text-muted-foreground hover:text-foreground">
          View all
        </Link>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {tracks.map((track) => (
          <Link
            key={track.id}
            href={`/problems?tag=${track.name}`}
            className="group flex items-center gap-3 rounded-lg border border-border/50 bg-card/30 px-4 py-3 transition-colors hover:bg-card/60"
          >
            <SkillIcon name={track.icon} />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{track.name}</span>
                {track.badge && <BadgeIndicator tier={track.badge} />}
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-1 flex-1 rounded-full bg-muted/50">
                  <div className="h-1 rounded-full bg-emerald-500" style={{ width: `${track.progress}%` }} />
                </div>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {track.solvedProblems}/{track.totalProblems}
                </span>
              </div>
            </div>

            <ChevronRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </div>
  )
}

function SkillIcon({ name }: { name: string }) {
  const icons: Record<string, { bg: string; text: string; letter: string }> = {
    algo: { bg: "bg-blue-500/10", text: "text-blue-400", letter: "A" },
    ds: { bg: "bg-purple-500/10", text: "text-purple-400", letter: "D" },
    sql: { bg: "bg-orange-500/10", text: "text-orange-400", letter: "S" },
    python: { bg: "bg-yellow-500/10", text: "text-yellow-400", letter: "Py" },
    java: { bg: "bg-red-500/10", text: "text-red-400", letter: "J" },
    cpp: { bg: "bg-cyan-500/10", text: "text-cyan-400", letter: "C+" },
  }

  const icon = icons[name] || { bg: "bg-muted", text: "text-muted-foreground", letter: "?" }

  return (
    <div className={cn("flex h-9 w-9 items-center justify-center rounded-md text-xs font-bold", icon.bg, icon.text)}>
      {icon.letter}
    </div>
  )
}

function BadgeIndicator({ tier }: { tier: "gold" | "silver" | "bronze" }) {
  const colors = {
    gold: "bg-yellow-500/20 text-yellow-500",
    silver: "bg-slate-400/20 text-slate-400",
    bronze: "bg-orange-600/20 text-orange-500",
  }

  return <span className={cn("h-1.5 w-1.5 rounded-full", colors[tier].split(" ")[0].replace("text-", "bg-"))} />
}
