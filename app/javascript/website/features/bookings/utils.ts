import type { CustomerBooking } from "@/website/features/bookings/types"
import { msg } from "@/website/lib/i18n"

export const BOOKING_STATUS: Record<
  CustomerBooking["status"],
  { label: string; tone: string }
> = {
  pending: { label: msg("Pending"), tone: "bg-amber-100 text-amber-900" },
  confirmed: { label: msg("Confirmed"), tone: "bg-sky-100 text-sky-900" },
  in_progress: {
    label: msg("In progress"),
    tone: "bg-indigo-100 text-indigo-900",
  },
  completed: {
    label: msg("Completed"),
    tone: "bg-emerald-100 text-emerald-900",
  },
  cancelled: {
    label: msg("Cancelled"),
    tone: "bg-neutral-200 text-neutral-800",
  },
}

export const PAYMENT_STATUS: Record<CustomerBooking["payment_status"], string> =
  {
    unpaid: msg("Unpaid"),
    paid: msg("Paid"),
    partially_refunded: msg("Partially refunded"),
    refunded: msg("Refunded"),
    failed: msg("Payment failed"),
  }
