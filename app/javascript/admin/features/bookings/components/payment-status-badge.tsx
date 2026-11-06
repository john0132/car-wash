import {
  CircleCheck,
  CircleX,
  Clock,
  type LucideIcon,
  Undo2,
} from "lucide-react"

import type { PaymentStatus } from "@/admin/features/bookings/types"
import { humanize } from "@/admin/lib/format"
import { Badge } from "@/shared/components/ui/badge"

const icon: Record<PaymentStatus, LucideIcon> = {
  paid: CircleCheck,
  unpaid: Clock,
  partially_refunded: Undo2,
  refunded: Undo2,
  failed: CircleX,
}

const tone: Record<PaymentStatus, string> = {
  paid: "text-emerald-700 dark:text-emerald-400",
  unpaid: "text-amber-700 dark:text-amber-400",
  partially_refunded: "text-sky-700 dark:text-sky-400",
  refunded: "text-muted-foreground",
  failed: "text-destructive",
}

/** Icon + label, so the status never relies on color alone. */
export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const Icon = icon[status]
  return (
    <Badge variant="outline" className={tone[status]}>
      <Icon /> {humanize(status)}
    </Badge>
  )
}
