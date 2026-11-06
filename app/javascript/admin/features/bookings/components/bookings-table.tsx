import { Link } from "@inertiajs/react"

import { BookingStatusBadge } from "@/admin/features/bookings/components/booking-status-badge"
import { PaymentStatusBadge } from "@/admin/features/bookings/components/payment-status-badge"
import type { BookingRow } from "@/admin/features/bookings/types"
import { useCan } from "@/admin/hooks/use-can"
import { formatDateTime, formatMoney } from "@/admin/lib/format"
import { adminBookings, adminCustomers, adminEmployees } from "@/routes"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"

/**
 * Bookings list. `party` picks the counterpart column(s): a customer's page
 * shows who carried the booking out, an employee's page shows who booked it,
 * and "both" (the main bookings list) shows both. The booking id links to its
 * show page when the viewer can read bookings.
 */
export function BookingsTable({
  bookings,
  party,
  emptyMessage = "No bookings yet.",
}: {
  bookings: BookingRow[]
  party: "customer" | "employee" | "both"
  emptyMessage?: string
}) {
  const can = useCan()
  const canReadBookings = can("bookings", "read")

  if (bookings.length === 0) {
    return (
      <p className="text-muted-foreground py-10 text-center text-sm">
        {emptyMessage}
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Booking</TableHead>
          <TableHead>Scheduled</TableHead>
          {party !== "employee" && <TableHead>Customer</TableHead>}
          {party !== "customer" && <TableHead>Employee</TableHead>}
          <TableHead>Address</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Payment</TableHead>
          <TableHead className="text-right">Items</TableHead>
          <TableHead className="text-right">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map((booking) => (
          <TableRow key={booking.id}>
            <TableCell className="font-medium tabular-nums">
              {canReadBookings ? (
                <Link
                  href={adminBookings.show(booking.id).url}
                  className="hover:underline"
                >
                  #{booking.id}
                </Link>
              ) : (
                `#${booking.id}`
              )}
            </TableCell>
            <TableCell className="tabular-nums">
              {formatDateTime(booking.scheduled_at)}
            </TableCell>
            {party !== "employee" && (
              <TableCell>
                <PartyLink
                  party={booking.customer}
                  href={
                    booking.customer && can("customers", "read")
                      ? adminCustomers.show(booking.customer.id).url
                      : undefined
                  }
                  fallback="—"
                />
              </TableCell>
            )}
            {party !== "customer" && (
              <TableCell>
                <PartyLink
                  party={booking.employee}
                  href={
                    booking.employee && can("employees", "read")
                      ? adminEmployees.show(booking.employee.id).url
                      : undefined
                  }
                  fallback="Unassigned"
                />
              </TableCell>
            )}
            <TableCell className="text-muted-foreground max-w-56 truncate">
              {booking.address ?? "—"}
            </TableCell>
            <TableCell>
              <BookingStatusBadge status={booking.status} />
            </TableCell>
            <TableCell>
              <PaymentStatusBadge status={booking.payment_status} />
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {booking.items_count}
            </TableCell>
            <TableCell className="text-right font-medium tabular-nums">
              {formatMoney(booking.total_amount)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function PartyLink({
  party,
  href,
  fallback,
}: {
  party: { full_name: string } | null
  href?: string
  fallback: string
}) {
  if (!party) return <span className="text-muted-foreground">{fallback}</span>
  if (!href) return <span>{party.full_name}</span>
  return (
    <Link href={href} className="hover:underline">
      {party.full_name}
    </Link>
  )
}
