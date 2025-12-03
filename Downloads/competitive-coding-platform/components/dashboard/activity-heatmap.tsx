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

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const weeks = useMemo(() => {
    const result: ActivityData[][] = []
    let currentWeek: ActivityData[] = []

    const firstDate = new Date(data[0]?.date || new Date())
    const dayOfWeek = firstDate.getDay()
    for (let i = 0; i < dayOfWeek; i++) {
      currentWeek.push({ date: "", count: -1 })
    }

    data.forEach((day) => {
      currentWeek.push(day)
      if (currentWeek.length === 7) {
        result.push(currentWeek)
        currentWeek = []
      }
    })

    if (currentWeek.length > 0) {
      result.push(currentWeek)
    }

    return result
  }, [data])

  const getIntensity = (count: number) => {
    if (count < 0) return "bg-transparent"
    if (count === 0) return "bg-muted/20"
    if (count <= 1) return "bg-emerald-500/30"
    if (count <= 2) return "bg-emerald-500/50"
    if (count <= 3) return "bg-emerald-500/70"
    return "bg-emerald-500"
  }

  const totalSubmissions = data.reduce((acc, d) => acc + Math.max(0, d.count), 0)
  const currentStreak = calculateStreak(data)

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

function calculateStreak(data: ActivityData[]): number {
  let streak = 0
  const sortedData = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  for (const day of sortedData) {
    if (day.count > 0) {
      streak++
    } else {
      break
    }
  }

  return streak
}
