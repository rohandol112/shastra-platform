"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"

interface ActivityData {
  date: string
  count: number
}

interface ActivityHeatmapProps {
  data: ActivityData[]
}

function toDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  // The API only returns days that HAVE submissions — build a full contiguous
  // 52-week grid ending today and look counts up per day.
  const { weeks, totalSubmissions, currentStreak } = useMemo(() => {
    const countByDate = new Map<string, number>()
    for (const d of data) {
      // normalize whatever date format we get to YYYY-MM-DD
      const key = d.date.length > 10 ? d.date.slice(0, 10) : d.date
      countByDate.set(key, (countByDate.get(key) ?? 0) + d.count)
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const days: ActivityData[] = []
    const totalDays = 52 * 7
    for (let i = totalDays - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const key = toDateKey(date)
      days.push({ date: key, count: countByDate.get(key) ?? 0 })
    }

    // pad the first week so columns start on Sunday
    const result: ActivityData[][] = []
    let currentWeek: ActivityData[] = []
    const firstDayOfWeek = new Date(days[0].date + "T00:00:00").getDay()
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({ date: "", count: -1 })
    }
    for (const day of days) {
      currentWeek.push(day)
      if (currentWeek.length === 7) {
        result.push(currentWeek)
        currentWeek = []
      }
    }
    if (currentWeek.length > 0) result.push(currentWeek)

    const total = days.reduce((acc, d) => acc + Math.max(0, d.count), 0)

    // streak: consecutive days with activity counting back from today
    // (an empty today doesn't break yesterday's streak)
    let streak = 0
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].count > 0) {
        streak++
      } else if (i === days.length - 1) {
        continue
      } else {
        break
      }
    }

    return { weeks: result, totalSubmissions: total, currentStreak: streak }
  }, [data])

  const getIntensity = (count: number) => {
    if (count < 0) return "bg-transparent"
    if (count === 0) return "bg-muted/20"
    if (count <= 1) return "bg-emerald-500/30"
    if (count <= 2) return "bg-emerald-500/50"
    if (count <= 3) return "bg-emerald-500/70"
    return "bg-emerald-500"
  }

  return (
    <div className="rounded-lg border border-border/50 bg-card/30 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-foreground">{totalSubmissions} submissions in the last year</h3>
        </div>
        {currentStreak > 0 && <span className="text-xs text-emerald-400">{currentStreak} day streak</span>}
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="inline-flex gap-[3px]">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[3px]">
              {week.map((day, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={cn("h-[10px] w-[10px] rounded-sm", getIntensity(day.count))}
                  title={day.date ? `${day.date}: ${day.count} submissions` : undefined}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-1.5">
        <span className="text-[10px] text-muted-foreground">Less</span>
        {[0, 1, 2, 3, 4].map((count) => (
          <div key={count} className={cn("h-[10px] w-[10px] rounded-sm", getIntensity(count))} />
        ))}
        <span className="text-[10px] text-muted-foreground">More</span>
      </div>
    </div>
  )
}
