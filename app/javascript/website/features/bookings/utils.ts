import type { CustomerBooking } from "@/website/features/bookings/types"

export const BOOKING_STATUS: Record<
  CustomerBooking["status"],
  { label: string; tone: string }
> = {
  pending: { label: "Pending", tone: "bg-amber-100 text-amber-900" },
  confirmed: { label: "Confirmed", tone: "bg-sky-100 text-sky-900" },
  in_progress: { label: "In progress", tone: "bg-indigo-100 text-indigo-900" },
  completed: { label: "Completed", tone: "bg-emerald-100 text-emerald-900" },
  cancelled: { label: "Cancelled", tone: "bg-neutral-200 text-neutral-800" },
}

export const PAYMENT_STATUS: Record<CustomerBooking["payment_status"], string> =
  {
    unpaid: "Unpaid",
    paid: "Paid",
    partially_refunded: "Partially refunded",
    refunded: "Refunded",
    failed: "Payment failed",
  }

// Appointments are in the business's local time (config.time_zone), whatever
// the browser's zone, and SSR renders the same text the browser hydrates.
const when = new Intl.DateTimeFormat("en", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Africa/Cairo",
})

export function formatWhen(value: string | null) {
  return value ? when.format(new Date(value)) : "Date to be confirmed"
}
