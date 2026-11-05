import {
  CircleCheck,
  CircleDashed,
  CircleDot,
  CircleX,
  Clock,
  type LucideIcon,
} from "lucide-react"

import type { BookingStatus } from "@/admin/features/bookings/types"
import { humanize } from "@/admin/lib/format"
import { Badge } from "@/shared/components/ui/badge"

export const bookingStatusIcon: Record<BookingStatus, LucideIcon> = {
  pending: Clock,
  confirmed: CircleDot,
  in_progress: CircleDashed,
  completed: CircleCheck,
  cancelled: CircleX,
}

const tone: Record<BookingStatus, string> = {
  pending: "text-amber-700 dark:text-amber-400",
  confirmed: "text-sky-700 dark:text-sky-400",
  in_progress: "text-violet-700 dark:text-violet-400",
  completed: "text-emerald-700 dark:text-emerald-400",
  cancelled: "text-muted-foreground",
}

/** Solid fill for each status, for chart bars — same hues as `tone` above. */
export const bookingStatusFill: Record<BookingStatus, string> = {
  pending: "bg-amber-500",
  confirmed: "bg-sky-500",
  in_progress: "bg-violet-500",
  completed: "bg-emerald-500",
  cancelled: "bg-muted-foreground/50",
}

/** Icon + label, so the status never relies on color alone. */
export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const Icon = bookingStatusIcon[status]
  return (
    <Badge variant="outline" className={tone[status]}>
      <Icon /> {humanize(status)}
    </Badge>
  )
}
