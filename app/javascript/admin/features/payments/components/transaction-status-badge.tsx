import type { TransactionStatus } from "@/admin/features/payments/types"
import { humanize } from "@/admin/lib/format"
import { Badge } from "@/shared/components/ui/badge"

const variant: Record<
  TransactionStatus,
  "secondary" | "outline" | "destructive"
> = {
  completed: "secondary",
  pending: "outline",
  refunded: "outline",
  failed: "destructive",
}

export function TransactionStatusBadge({
  status,
}: {
  status: TransactionStatus
}) {
  return <Badge variant={variant[status]}>{humanize(status)}</Badge>
}
