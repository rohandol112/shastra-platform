"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import type { ContestListItem } from "@/lib/api"
import { cn } from "@/lib/utils"

type Contest = ContestListItem

interface UpcomingContestsProps {
  contests: Contest[]
}

export function UpcomingContests({ contests }: UpcomingContestsProps) {
  const upcomingContests = contests.filter((c) => c.status === "SCHEDULED" || c.status === "RUNNING")

  if (upcomingContests.length === 0) {
    return (
      <div className="rounded-lg border border-border/50 bg-card/30 p-5">
        <h3 className="text-sm font-medium text-foreground">Contests</h3>
        <p className="mt-3 text-sm text-muted-foreground">No upcoming contests</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border/50 bg-card/30">
      <div className="flex items-center justify-between border-b border-border/30 px-5 py-3">
        <h3 className="text-sm font-medium text-foreground">Contests</h3>
        <Link href="/contests" className="text-xs text-muted-foreground hover:text-foreground">
          View all
        </Link>
      </div>

      <div className="divide-y divide-border/20">
        {upcomingContests.slice(0, 3).map((contest) => (
          <ContestRow key={contest.id} contest={contest} />
        ))}
      </div>
    </div>
  )
}

function ContestRow({ contest }: { contest: Contest }) {
  const [countdown, setCountdown] = useState("")

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime()
      const target = new Date(contest.startTime).getTime()
      const diff = target - now

      if (diff <= 0) {
        setCountdown("Live")
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      if (days > 0) {
        setCountdown(`${days}d ${hours}h`)
      } else if (hours > 0) {
        setCountdown(`${hours}h ${mins}m`)
      } else {
        setCountdown(`${mins}m`)
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 60000)
    return () => clearInterval(interval)
  }, [contest.startTime])

  const isLive = contest.status === "RUNNING"
  const startDate = new Date(contest.startTime)

  return (
    <div className="flex items-center gap-3 px-5 py-3">
      <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-md bg-muted/30">
        <span className="text-[10px] uppercase text-muted-foreground">
          {startDate.toLocaleDateString("en-US", { month: "short" })}
        </span>
        <span className="text-sm font-medium text-foreground leading-none">{startDate.getDate()}</span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{contest.title}</p>
        <p className="text-xs text-muted-foreground">{contest.participantCount.toLocaleString()} registered</p>
      </div>

      {isLive ? (
        <Link href={`/contests/${contest.slug}/arena`}>
          <Button size="sm" className="h-7 bg-emerald-600 px-3 text-xs hover:bg-emerald-700">
            Enter
          </Button>
        </Link>
      ) : (
        <div className="flex items-center gap-2">
          <span
            className={cn("text-xs tabular-nums", countdown === "Live" ? "text-emerald-400" : "text-muted-foreground")}
          >
            {countdown}
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
        </div>
      )}
    </div>
  )
}
