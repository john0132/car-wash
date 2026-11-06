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
              className="mx-auto mb-4 size-12 text-[#8A6240]"
              aria-hidden
            />
          )}
          <h1
            style={{ fontFamily: "'Italiana', serif" }}
            className="text-4xl leading-tight sm:text-5xl"
          >
            {just_placed ? "Thank you!" : `Booking #${booking.id}`}
          </h1>
          {just_placed && (
            <p className="mx-auto mt-3 max-w-md text-[#5B6B5E]">
              Your booking is placed. We&apos;ll confirm it shortly and see you
              at the time below.
            </p>
          )}
        </header>

        <BookingSummary booking={booking} />

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={profileBookings()}
            className="rounded-full bg-[#2B3A32] px-6 py-3 font-medium text-[#F6F1E7] hover:bg-[#1F2B25] focus-visible:ring-2 focus-visible:ring-[#8A6240] focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            My bookings
          </Link>
          <Link
            href={services()}
            className="rounded-full border border-[#2B3A32]/30 px-6 py-3 font-medium hover:bg-[#2B3A32]/5 focus-visible:ring-2 focus-visible:ring-[#8A6240] focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Book another service
          </Link>
        </div>
      </div>
    </BookingLayout>
  )
}
