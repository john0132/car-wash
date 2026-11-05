import { Head } from "@inertiajs/react"

import { PageHeader } from "@/admin/components/page-header"
import { BookingForm } from "@/admin/features/bookings/components/booking-form"
import type {
  BookingDetail,
  EmployeeOption,
} from "@/admin/features/bookings/types"
import AdminLayout from "@/admin/layouts/admin-layout"
import { adminBookings } from "@/routes"

interface Props {
  booking: BookingDetail
  employee_options: EmployeeOption[]
}

export default function BookingEdit({ booking, employee_options }: Props) {
  const title = `Booking #${booking.id}`

  return (
    <AdminLayout
      breadcrumbs={[
        { title: "Bookings", href: adminBookings.index().url },
        { title, href: adminBookings.show(booking.id).url },
        { title: "Edit", href: adminBookings.edit(booking.id).url },
      ]}
    >
      <Head title={`Edit ${title}`} />

      <div className="space-y-6 p-4">
        <PageHeader
          title={`Edit ${title}`}
          description="Only status, payment status, assigned employee and schedule can be changed here."
        />
        <BookingForm
          key={booking.id}
          booking={booking}
          employeeOptions={employee_options}
          action={adminBookings.update(booking.id)}
          cancelHref={adminBookings.show(booking.id).url}
        />
      </div>
    </AdminLayout>
  )
}
