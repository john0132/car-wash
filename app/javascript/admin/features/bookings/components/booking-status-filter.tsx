import { router } from "@inertiajs/react"

import { bookingStatusIcon } from "@/admin/features/bookings/components/booking-status-badge"
import {
  BOOKING_STATUSES,
  type BookingStatus,
  type BookingStatusCounts,
} from "@/admin/features/bookings/types"
import { humanize } from "@/admin/lib/format"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/shared/components/ui/toggle-group"

/**
 * Status chips with counts, doubling as the filter for the bookings list.
 * Writes `booking_status` to the URL; Rails filters.
 */
export function BookingStatusFilter({
  url,
  counts,
  value,
}: {
  url: string
  counts: BookingStatusCounts
  value: BookingStatus | null
}) {
  const total = BOOKING_STATUSES.reduce(
    (sum, status) => sum + counts[status],
    0,
  )

  return (
    <ToggleGroup
      type="single"
      variant="outline"
      size="sm"
      spacing={2}
      value={value ?? "all"}
      onValueChange={(next) =>
        router.get(
          url,
          { booking_status: next && next !== "all" ? next : undefined },
          { preserveScroll: true, preserveState: true, replace: true },
        )
      }
      className="flex-wrap"
      aria-label="Filter bookings by status"
    >
      <ToggleGroupItem value="all" className="gap-1.5 px-3">
        All <span className="text-muted-foreground tabular-nums">{total}</span>
      </ToggleGroupItem>
      {BOOKING_STATUSES.map((status) => {
        const Icon = bookingStatusIcon[status]
        return (
          <ToggleGroupItem key={status} value={status} className="gap-1.5 px-3">
            <Icon /> {humanize(status)}
            <span className="text-muted-foreground tabular-nums">
              {counts[status]}
            </span>
          </ToggleGroupItem>
        )
      })}
    </ToggleGroup>
  )
}
