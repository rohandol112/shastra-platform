import { cn } from "@/lib/utils"

type Difficulty = "EASY" | "MEDIUM" | "HARD"

interface DifficultyBadgeProps {
  difficulty: Difficulty
  className?: string
}

const difficultyConfig = {
  EASY: {
    label: "Easy",
    className: "bg-success/20 text-success border-success/30",
  },
  MEDIUM: {
    label: "Medium",
    className: "bg-warning/20 text-warning border-warning/30",
  },
  HARD: {
    label: "Hard",
    className: "bg-destructive/20 text-destructive border-destructive/30",
  },
}

export function DifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
  const config = difficultyConfig[difficulty]

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  )
}
