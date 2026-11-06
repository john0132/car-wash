import { CalendarClock, Car, MapPin, Wallet } from "lucide-react"
import type { ReactNode } from "react"

import type { BookingDetail } from "@/website/features/bookings/types"
import {
  BOOKING_STATUS,
  PAYMENT_STATUS,
  formatWhen,
} from "@/website/features/bookings/utils"
import { formatMoney } from "@/website/features/home-catalog/utils"

/** Everything about one booking: when, where, which car, what and how much. */
export function BookingSummary({ booking }: { booking: BookingDetail }) {
  const status = BOOKING_STATUS[booking.status]

  return (
    <div className="rounded-3xl border border-[#2B3A32]/10 bg-white p-6 shadow-[0_32px_64px_-40px_rgba(43,58,50,0.45)] sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[#5B6B5E]">Booking #{booking.id}</p>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${status.tone}`}
        >
          {status.label}
        </span>
      </div>

      <dl className="mt-6 grid gap-5 sm:grid-cols-2">
        <Detail icon={<CalendarClock />} label="When">
          {formatWhen(booking.scheduled_at)}
        </Detail>
        <Detail icon={<MapPin />} label="Where">
          {booking.address
            ? `${booking.address.name} · ${booking.address.area}, ${booking.address.city}`
            : "—"}
        </Detail>
        <Detail icon={<Car />} label="Car">
          {booking.car ?? "—"}
        </Detail>
        <Detail icon={<Wallet />} label="Payment">
          {[booking.payment_method, PAYMENT_STATUS[booking.payment_status]]
            .filter(Boolean)
            .join(" · ")}
        </Detail>
      </dl>

      <dl className="mt-8 space-y-3 border-t border-[#2B3A32]/10 pt-6 text-[15px] tabular-nums">
        {booking.items.map((item) => (
          <div key={item.id} className="flex justify-between gap-4">
            <dt
              className={
                item.kind === "service" ? "font-medium" : "text-[#5B6B5E]"
              }
            >
              {item.kind === "service" ? "" : "+ "}
              {item.name ?? "Item"}
              {item.quantity > 1 && ` × ${item.quantity}`}
            </dt>
            <dd>{formatMoney(item.price * item.quantity)}</dd>
          </div>
        ))}
        <div className="flex justify-between gap-4 border-t border-[#2B3A32]/10 pt-3 text-lg font-medium">
          <dt>Total</dt>
          <dd>{formatMoney(booking.total_amount)}</dd>
        </div>
      </dl>
    </div>
  )
}

function Detail({
  icon,
  label,
  children,
}: {
  icon: ReactNode
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex gap-3">
      <span aria-hidden className="mt-0.5 text-[#8A6240] [&_svg]:size-5">
        {icon}
      </span>
      <div>
        <dt className="text-sm text-[#5B6B5E]">{label}</dt>
        <dd className="mt-0.5">{children}</dd>
      </div>
    </div>
  )
}
