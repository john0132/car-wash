import { Link } from "@inertiajs/react"

import { profileBookings, services } from "@/routes"
import { Button } from "@/shared/components/ui/button"
import { Pagination } from "@/website/components/pagination"
import { BookingCard } from "@/website/features/bookings/components/booking-card"
import type { CustomerBooking } from "@/website/features/bookings/types"
import {
  ProfileCard,
  SectionHeading,
  primaryButtonClass,
} from "@/website/features/profile/components/profile-card"
import ProfileLayout from "@/website/layouts/profile-layout"
import type { PaginationData } from "@/website/lib/pagination"

export default function BookingsIndex({
  bookings,
  pagination,
}: {
  bookings: CustomerBooking[]
  pagination: PaginationData
}) {
  return (
    <ProfileLayout title="My bookings">
      {bookings.length === 0 ? (
        <ProfileCard id="bookings">
          <div className="flex flex-col gap-8">
            <SectionHeading
              title="My bookings"
              description="Your past and upcoming visits."
            />
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-[#2B3A32]/25 px-6 py-14 text-center">
              <p className="font-medium">No bookings yet</p>
              <Button asChild className={primaryButtonClass}>
                <Link href={services()}>Book your first visit</Link>
              </Button>
            </div>
          </div>
        </ProfileCard>
      ) : (
        <>
          <SectionHeading
            title="My bookings"
            description="Your past and upcoming visits."
          />
          <ul className="flex flex-col gap-4">
            {bookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </ul>
          <Pagination
            pagination={pagination}
            hrefFor={(n) =>
              profileBookings({ query: n > 1 ? { page: n } : {} }).url
            }
          />
        </>
      )}
    </ProfileLayout>
  )
}
