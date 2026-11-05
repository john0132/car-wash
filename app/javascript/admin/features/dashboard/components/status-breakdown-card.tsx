import { cn } from "cn"

import {
  bookingStatusFill,
  bookingStatusIcon,
} from "@/admin/features/bookings/components/booking-status-badge"
import {
  BOOKING_STATUSES,
  type BookingStatusCounts,
} from "@/admin/features/bookings/types"
import { formatNumber, humanize } from "@/admin/lib/format"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"

/** Proportional bars for each booking status, icon + label so color is never the only cue. */
export function StatusBreakdownCard({
  counts,
  windowDays,
}: {
  counts: BookingStatusCounts
  windowDays: number
}) {
  const total = BOOKING_STATUSES.reduce(
    (sum, status) => sum + counts[status],
    0,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bookings by status</CardTitle>
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
          BOOKING_STATUSES.map((status) => {
            const Icon = bookingStatusIcon[status]
            const count = counts[status]
            const share = total ? Math.round((count / total) * 100) : 0

            return (
              <div key={status} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-1.5">
                    <Icon className="size-3.5" aria-hidden /> {humanize(status)}
                  </span>
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
                      bookingStatusFill[status],
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
