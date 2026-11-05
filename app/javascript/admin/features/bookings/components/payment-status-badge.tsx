import type { PaymentStatus } from "@/admin/features/bookings/types"
import { humanize } from "@/admin/lib/format"
import { Badge } from "@/shared/components/ui/badge"

const variant: Record<PaymentStatus, "secondary" | "outline" | "destructive"> =
  {
    paid: "secondary",
    unpaid: "outline",
    partially_refunded: "outline",
    refunded: "outline",
    failed: "destructive",
  }

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge variant={variant[status]}>{humanize(status)}</Badge>
}
