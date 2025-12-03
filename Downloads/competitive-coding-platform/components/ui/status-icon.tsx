import { Check, Circle, Clock, X } from "lucide-react"
import { cn } from "@/lib/utils"

type Status = "SOLVED" | "ATTEMPTED" | "TODO" | "FAILED"

interface StatusIconProps {
  status: Status
  className?: string
}

const statusConfig = {
  SOLVED: {
    icon: Check,
    className: "text-success",
    label: "Solved",
  },
  ATTEMPTED: {
    icon: Clock,
    className: "text-warning",
    label: "Attempted",
  },
  TODO: {
    icon: Circle,
    className: "text-muted-foreground",
    label: "Not attempted",
  },
  FAILED: {
    icon: X,
    className: "text-destructive",
    label: "Failed",
  },
}

export function StatusIcon({ status, className }: StatusIconProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return <Icon className={cn("h-5 w-5", config.className, className)} aria-label={config.label} />
}
