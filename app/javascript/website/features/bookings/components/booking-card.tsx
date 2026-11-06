import type { CustomerBooking } from "@/website/features/bookings/types"

const STATUS: Record<
  CustomerBooking["status"],
  { label: string; tone: string }
> = {
  pending: { label: "Pending", tone: "bg-amber-100 text-amber-900" },
  confirmed: { label: "Confirmed", tone: "bg-sky-100 text-sky-900" },
  in_progress: { label: "In progress", tone: "bg-indigo-100 text-indigo-900" },
  completed: { label: "Completed", tone: "bg-emerald-100 text-emerald-900" },
  cancelled: { label: "Cancelled", tone: "bg-neutral-200 text-neutral-800" },
}

const PAYMENT: Record<CustomerBooking["payment_status"], string> = {
  unpaid: "Unpaid",
  paid: "Paid",
  partially_refunded: "Partially refunded",
  refunded: "Refunded",
  failed: "Payment failed",
}

const money = new Intl.NumberFormat("en-EG", {
  style: "currency",
  currency: "EGP",
})

function formatWhen(value: string | null) {
  if (!value) return "Date to be confirmed"
  return new Date(value).toLocaleString("en", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function BookingCard({ booking }: { booking: CustomerBooking }) {
  const status = STATUS[booking.status]

  return (
    <li className="rounded-[20px] border border-[#2B3A32]/10 bg-white/60 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-[#2B3A32]/65">Booking #{booking.id}</p>
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
            {money.format(booking.total_amount)}
          </span>
          <span className="text-sm text-[#2B3A32]/65">
            {PAYMENT[booking.payment_status]}
          </span>
        </p>
      </div>
    </li>
  )
}
