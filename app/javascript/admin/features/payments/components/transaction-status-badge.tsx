import {
  CircleCheck,
  CircleX,
  Clock,
  type LucideIcon,
  Undo2,
} from "lucide-react"

import type { TransactionStatus } from "@/admin/features/payments/types"
import { humanize } from "@/admin/lib/format"
import { Badge } from "@/shared/components/ui/badge"

const icon: Record<TransactionStatus, LucideIcon> = {
  completed: CircleCheck,
  pending: Clock,
  refunded: Undo2,
  failed: CircleX,
}

const tone: Record<TransactionStatus, string> = {
  completed: "text-emerald-700 dark:text-emerald-400",
  pending: "text-amber-700 dark:text-amber-400",
  refunded: "text-muted-foreground",
  failed: "text-destructive",
}

/** Icon + label, so the status never relies on color alone. */
export function TransactionStatusBadge({
  status,
}: {
  status: TransactionStatus
}) {
  const Icon = icon[status]
  return (
    <Badge variant="outline" className={tone[status]}>
      <Icon /> {humanize(status)}
    </Badge>
  )
}
