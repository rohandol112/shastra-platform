"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, ChevronLeft, Trophy, Crown, Medal } from "lucide-react"
import { cn } from "@/lib/utils"
import type { LeaderboardEntry } from "@/lib/mock-data"

interface MiniLeaderboardProps {
  entries: LeaderboardEntry[]
  currentUserId?: string
}

export function MiniLeaderboard({ entries, currentUserId }: MiniLeaderboardProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const currentUserRank = entries.find((e) => e.userId === currentUserId)

  if (isCollapsed) {
    return (
      <div className="fixed right-0 top-1/2 z-40 -translate-y-1/2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsCollapsed(false)}
          className="rounded-l-xl rounded-r-none border border-r-0 border-border/50 bg-card/95 px-3 py-6 shadow-xl backdrop-blur-sm transition-all hover:bg-card hover:pl-4"
        >
          <div className="flex flex-col items-center gap-1">
            <Trophy className="h-4 w-4 text-amber-400" />
            <span className="text-lg font-bold text-foreground">#{currentUserRank?.rank || "-"}</span>
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </div>
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed right-0 top-1/2 z-40 w-72 -translate-y-1/2 overflow-hidden rounded-l-2xl border border-r-0 border-border/50 bg-card/95 shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 bg-gradient-to-r from-amber-500/10 to-transparent p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20">
            <Trophy className="h-4 w-4 text-amber-400" />
          </div>
          <span className="font-semibold text-foreground">Live Rankings</span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setIsCollapsed(true)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Leaderboard Entries */}
      <div className="max-h-80 overflow-y-auto p-2">
        {entries.slice(0, 10).map((entry) => {
          const isCurrentUser = entry.userId === currentUserId
          const isTop3 = entry.rank <= 3

          return (
            <div
              key={entry.userId}
              className={cn(
                "mb-1 flex items-center gap-3 rounded-xl p-3 transition-colors",
                isCurrentUser && "bg-primary/10 ring-1 ring-primary/30",
                !isCurrentUser && "hover:bg-card",
              )}
            >
              {/* Rank */}
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold",
                  entry.rank === 1 && "bg-amber-500/20 text-amber-400",
                  entry.rank === 2 && "bg-slate-400/20 text-slate-300",
                  entry.rank === 3 && "bg-amber-700/20 text-amber-600",
                  entry.rank > 3 && "bg-muted text-muted-foreground",
                )}
              >
                {entry.rank === 1 ? (
                  <Crown className="h-4 w-4" />
                ) : entry.rank <= 3 ? (
                  <Medal className="h-4 w-4" />
                ) : (
                  `#${entry.rank}`
                )}
              </div>

              {/* Username */}
              <div className="flex-1 truncate">
                <span className={cn("font-medium", isCurrentUser ? "text-primary" : "text-foreground")}>
                  {entry.username}
                </span>
                {isCurrentUser && (
                  <Badge className="ml-2 border-primary/30 bg-primary/10 text-primary text-[10px] px-1.5 py-0">
                    You
                  </Badge>
                )}
              </div>

              {/* Score */}
              <div className="text-right">
                <span className={cn("font-bold", isTop3 ? "text-amber-400" : "text-foreground")}>{entry.score}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Current User (if not in top 10) */}
      {currentUserRank && currentUserRank.rank > 10 && (
        <div className="border-t border-border/50 p-2">
          <div className="flex items-center gap-3 rounded-xl bg-primary/10 p-3 ring-1 ring-primary/30">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-sm font-bold text-muted-foreground">
              #{currentUserRank.rank}
            </div>
            <span className="flex-1 truncate font-medium text-primary">{currentUserRank.username}</span>
            <span className="font-bold text-foreground">{currentUserRank.score}</span>
          </div>
        </div>
      )}
    </div>
  )
}
