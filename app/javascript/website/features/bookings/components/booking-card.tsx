import { Link } from "@inertiajs/react"

import { booking as bookingRoute } from "@/routes"
import type { CustomerBooking } from "@/website/features/bookings/types"
import {
  BOOKING_STATUS,
  PAYMENT_STATUS,
  formatWhen,
} from "@/website/features/bookings/utils"
import { formatMoney } from "@/website/lib/format"

export function BookingCard({ booking }: { booking: CustomerBooking }) {
  const status = BOOKING_STATUS[booking.status]

  return (
    <li className="border-pine/10 rounded-[20px] border bg-white/60 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href={bookingRoute(booking.id)}
            className="text-sage hover:text-pine text-sm underline-offset-4 hover:underline"
          >
            Booking #{booking.id}
          </Link>
          <p className="font-display text-2xl leading-tight">
            {formatWhen(booking.scheduled_at)}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${status.tone}`}
        >
          {status.label}
        </span>
      </div>

      {booking.items.length > 0 && (
        <ul className="mt-4 space-y-1 text-[15px]">
          {booking.items.map((item) => (
            <li key={item.id}>
              {item.name ?? "Item"}
              {item.quantity > 1 && (
                <span className="text-sage"> × {item.quantity}</span>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="border-pine/10 mt-4 flex flex-wrap items-end justify-between gap-3 border-t pt-4">
        <p className="text-sage text-sm">{booking.address ?? "No address"}</p>
        <p className="text-right">
          <span className="block text-lg font-medium">
            {formatMoney(booking.total_amount)}
          </span>
          <span className="text-sage text-sm">
            {PAYMENT_STATUS[booking.payment_status]}
          </span>
        </p>
      </div>
    </li>
  )
}
