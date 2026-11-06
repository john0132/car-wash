import { Link } from "@inertiajs/react"

import { booking as bookingRoute } from "@/routes"
import type { CustomerBooking } from "@/website/features/bookings/types"
import {
  BOOKING_STATUS,
  PAYMENT_STATUS,
  formatWhen,
} from "@/website/features/bookings/utils"
import { formatMoney } from "@/website/features/home-catalog/utils"

export function BookingCard({ booking }: { booking: CustomerBooking }) {
  const status = BOOKING_STATUS[booking.status]

  return (
    <li className="rounded-[20px] border border-[#2B3A32]/10 bg-white/60 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href={bookingRoute(booking.id)}
            className="text-sm text-[#2B3A32]/65 underline-offset-4 hover:text-[#2B3A32] hover:underline"
          >
            Booking #{booking.id}
          </Link>
          <p
            style={{ fontFamily: "'Italiana', serif" }}
            className="text-2xl leading-tight"
          >
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
                <span className="text-[#2B3A32]/65"> × {item.quantity}</span>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-[#2B3A32]/10 pt-4">
        <p className="text-sm text-[#2B3A32]/65">
          {booking.address ?? "No address"}
        </p>
        <p className="text-right">
          <span className="block text-lg font-medium">
            {formatMoney(booking.total_amount)}
          </span>
          <span className="text-sm text-[#2B3A32]/65">
            {PAYMENT_STATUS[booking.payment_status]}
          </span>
        </p>
      </div>
    </li>
  )
}
