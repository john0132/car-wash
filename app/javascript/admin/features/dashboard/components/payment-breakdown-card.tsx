import { cn } from "cn"

import {
  PAYMENT_STATUSES,
  type PaymentStatus,
} from "@/admin/features/bookings/types"
import type { PaymentStatusCounts } from "@/admin/features/dashboard/types"
import { formatNumber, humanize } from "@/admin/lib/format"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"

// Good/warning/serious/critical, reserved for payment state — distinct from
// the booking-status hues so the two breakdowns never look interchangeable.
const fill: Record<PaymentStatus, string> = {
  paid: "bg-emerald-500",
  unpaid: "bg-muted-foreground/50",
  partially_refunded: "bg-amber-500",
  refunded: "bg-sky-500",
  failed: "bg-red-500",
}

/** Proportional bars for each payment status, over the same window as the booking breakdown. */
export function PaymentBreakdownCard({
  counts,
  windowDays,
}: {
  counts: PaymentStatusCounts
  windowDays: number
}) {
  const total = PAYMENT_STATUSES.reduce(
    (sum, status) => sum + counts[status],
    0,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bookings by payment status</CardTitle>
        <CardDescription>
          Last {windowDays} days · {formatNumber(total)} booking
          {total === 1 ? "" : "s"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {total === 0 ? (
          <p className="text-muted-foreground text-sm">
            No bookings in this window.
          </p>
        ) : (
          PAYMENT_STATUSES.map((status) => {
            const count = counts[status]
            const share = total ? Math.round((count / total) * 100) : 0

            return (
              <div key={status} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{humanize(status)}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {formatNumber(count)} · {share}%
                  </span>
                </div>
                <div
                  className="bg-muted h-2 overflow-hidden rounded-full"
                  role="img"
                  aria-label={`${humanize(status)}: ${count} of ${total} (${share}%)`}
                >
                  <div
                    className={cn(
                      "h-full rounded-full transition-[width]",
                      fill[status],
                    )}
                    style={{ width: `${share}%` }}
                  />
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
