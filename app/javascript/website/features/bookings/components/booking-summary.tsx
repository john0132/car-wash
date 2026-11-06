import { CalendarClock, Car, MapPin, Wallet } from "lucide-react"
import type { ReactNode } from "react"

import type { BookingDetail } from "@/website/features/bookings/types"
import {
  BOOKING_STATUS,
  PAYMENT_STATUS,
} from "@/website/features/bookings/utils"
import { useI18n } from "@/website/lib/i18n"

/** Everything about one booking: when, where, which car, what and how much. */
export function BookingSummary({ booking }: { booking: BookingDetail }) {
  const { t, formatMoney, formatWhen } = useI18n()

  const status = BOOKING_STATUS[booking.status]

  return (
    <div className="border-pine/10 rounded-3xl border bg-white p-6 shadow-[0_32px_64px_-40px_rgba(43,58,50,0.45)] sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sage text-sm">
          {t("Booking #{id}", { id: booking.id })}
        </p>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${status.tone}`}
        >
          {t(status.label)}
        </span>
      </div>

      <dl className="mt-6 grid gap-5 sm:grid-cols-2">
        <Detail icon={<CalendarClock />} label={t("When")}>
          {formatWhen(booking.scheduled_at)}
        </Detail>
        <Detail icon={<MapPin />} label={t("Where")}>
          {booking.address
            ? `${booking.address.name} · ${booking.address.area}, ${booking.address.city}`
            : "—"}
        </Detail>
        <Detail icon={<Car />} label={t("Car")}>
          {booking.car ?? "—"}
        </Detail>
        <Detail icon={<Wallet />} label={t("Payment")}>
          {[booking.payment_method, t(PAYMENT_STATUS[booking.payment_status])]
            .filter(Boolean)
            .join(" · ")}
        </Detail>
      </dl>

      <dl className="border-pine/10 mt-8 space-y-3 border-t pt-6 text-[15px] tabular-nums">
        {booking.items.map((item) => (
          <div key={item.id} className="flex justify-between gap-4">
            <dt
              className={item.kind === "service" ? "font-medium" : "text-sage"}
            >
              {item.kind === "service" ? "" : "+ "}
              {item.name ?? t("Item")}
              {item.quantity > 1 && ` × ${item.quantity}`}
            </dt>
            <dd>{formatMoney(item.price * item.quantity)}</dd>
          </div>
        ))}
        <div className="border-pine/10 flex justify-between gap-4 border-t pt-3 text-lg font-medium">
          <dt>{t("Total")}</dt>
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
      <span aria-hidden className="text-bronze mt-0.5 [&_svg]:size-5">
        {icon}
      </span>
      <div>
        <dt className="text-sage text-sm">{label}</dt>
        <dd className="mt-0.5">{children}</dd>
      </div>
    </div>
  )
}
