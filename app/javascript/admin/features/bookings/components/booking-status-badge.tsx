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

/** Icon + label, so the status never relies on color alone. */
export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const Icon = bookingStatusIcon[status]
  return (
    <Badge variant="outline" className={tone[status]}>
      <Icon /> {humanize(status)}
    </Badge>
  )
}
