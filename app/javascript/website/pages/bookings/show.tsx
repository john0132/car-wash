import { Link } from "@inertiajs/react"
import { CircleCheck } from "lucide-react"

import { profileBookings, services } from "@/routes"
import { BookingSummary } from "@/website/features/bookings/components/booking-summary"
import type { BookingDetail } from "@/website/features/bookings/types"
import BookingLayout from "@/website/layouts/booking-layout"

/** A booking's own page; straight after checkout it is the thank-you page. */
export default function BookingShow({
  booking,
  just_placed,
}: {
  booking: BookingDetail
  just_placed: boolean
}) {
  return (
    <BookingLayout
      title={
        just_placed
          ? "Booking placed — Auto Atelier"
          : `Booking #${booking.id} — Auto Atelier`
      }
    >
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 text-center">
          {just_placed && (
            <CircleCheck
              className="text-bronze mx-auto mb-4 size-12"
              aria-hidden
            />
          )}
          <h1 className="font-display text-4xl leading-tight sm:text-5xl">
            {just_placed ? "Thank you!" : `Booking #${booking.id}`}
          </h1>
          {just_placed && (
            <p className="text-sage mx-auto mt-3 max-w-md">
              Your booking is placed. We&apos;ll confirm it shortly and see you
              at the time below.
            </p>
          )}
        </header>

        <BookingSummary booking={booking} />

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={profileBookings()}
            className="bg-pine text-ivory hover:bg-pine-deep focus-visible:ring-bronze rounded-full px-6 py-3 font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            My bookings
          </Link>
          <Link
            href={services()}
            className="border-pine/30 hover:bg-pine/5 focus-visible:ring-bronze rounded-full border px-6 py-3 font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Book another service
          </Link>
        </div>
      </div>
    </BookingLayout>
  )
}
