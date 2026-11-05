import { Head } from "@inertiajs/react"

import { PageHeader } from "@/admin/components/page-header"
import { Pagination } from "@/admin/components/pagination"
import { BookingFilters } from "@/admin/features/bookings/components/booking-filters"
import { BookingStatusFilter } from "@/admin/features/bookings/components/booking-status-filter"
import { BookingsTable } from "@/admin/features/bookings/components/bookings-table"
import type {
  BookingFilters as Filters,
  BookingRow,
  BookingStatusCounts,
} from "@/admin/features/bookings/types"
import AdminLayout from "@/admin/layouts/admin-layout"
import type { Pagination as PaginationData } from "@/admin/types"
import { adminBookings } from "@/routes"
import { Card, CardContent } from "@/shared/components/ui/card"

interface Props {
  bookings: BookingRow[]
  filters: Filters
  stats: BookingStatusCounts
  pagination: PaginationData
}

export default function BookingsIndex({
  bookings,
  filters,
  stats,
  pagination,
}: Props) {
  return (
    <AdminLayout
      breadcrumbs={[{ title: "Bookings", href: adminBookings.index().url }]}
    >
      <Head title="Bookings" />

      <div className="space-y-6 p-4">
        <PageHeader
          title="Bookings"
          description="Every booking placed by customers. Update the status, payment status or assigned employee — the details a customer entered aren't editable here."
        />

        <BookingStatusFilter
          url={adminBookings.index().url}
          counts={stats}
          value={filters.booking_status}
          params={{ q: filters.q, payment_status: filters.payment_status }}
        />

        <BookingFilters url={adminBookings.index().url} filters={filters} />

        <Card className="py-2">
          <CardContent className="px-2">
            <BookingsTable
              bookings={bookings}
              party="both"
              emptyMessage="No bookings match these filters."
            />
          </CardContent>
        </Card>

        <Pagination pagination={pagination} noun="bookings" />
      </div>
    </AdminLayout>
  )
}
