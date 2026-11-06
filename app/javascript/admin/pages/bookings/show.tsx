import { Head, Link } from "@inertiajs/react"
import { Pencil } from "lucide-react"

import { PageHeader } from "@/admin/components/page-header"
import { BookingStatusBadge } from "@/admin/features/bookings/components/booking-status-badge"
import { PaymentStatusBadge } from "@/admin/features/bookings/components/payment-status-badge"
import type { BookingDetail } from "@/admin/features/bookings/types"
import { Detail } from "@/admin/features/users/components/account-card"
import { useCan } from "@/admin/hooks/use-can"
import AdminLayout from "@/admin/layouts/admin-layout"
import { formatDateTime, formatMoney } from "@/admin/lib/format"
import { adminBookings, adminCustomers, adminEmployees } from "@/routes"
import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"

interface Props {
  booking: BookingDetail
}

export default function BookingShow({ booking }: Props) {
  const can = useCan()
  const title = `Booking #${booking.id}`

  return (
    <AdminLayout
      breadcrumbs={[
        { title: "Bookings", href: adminBookings.index().url },
        { title, href: adminBookings.show(booking.id).url },
      ]}
    >
      <Head title={title} />

      <div className="space-y-6 p-4">
        <PageHeader
          title={title}
          description={
            <span className="inline-flex items-center gap-2">
              <BookingStatusBadge status={booking.status} />
              <PaymentStatusBadge status={booking.payment_status} />
            </span>
          }
          actions={
            can("bookings", "update") && (
              <Button variant="outline" asChild>
                <Link href={adminBookings.edit(booking.id)}>
                  <Pencil /> Edit
                </Link>
              </Button>
            )
          }
        />

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Schedule & assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                <Detail label="Scheduled for">
                  {formatDateTime(booking.scheduled_at)}
                </Detail>
                <Detail label="Employee">
                  {booking.employee ? (
                    can("employees", "read") ? (
                      <Link
                        href={adminEmployees.show(booking.employee.id)}
                        className="hover:underline"
                      >
                        {booking.employee.full_name}
                      </Link>
                    ) : (
                      booking.employee.full_name
                    )
                  ) : (
                    <span className="text-muted-foreground">Unassigned</span>
                  )}
                </Detail>
                <Detail label="Created">
                  {formatDateTime(booking.created_at)}
                </Detail>
                <Detail label="Last updated">
                  {formatDateTime(booking.updated_at)}
                </Detail>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              {can("customers", "read") ? (
                <Link
                  href={adminCustomers.show(booking.customer.id)}
                  className="font-medium hover:underline"
                >
                  {booking.customer.full_name}
                </Link>
              ) : (
                <div className="font-medium">{booking.customer.full_name}</div>
              )}
              <div className="text-muted-foreground">
                {booking.customer.email}
              </div>
              {booking.customer.phone && (
                <a
                  href={`tel:${booking.customer.phone}`}
                  className="text-muted-foreground block hover:underline"
                >
                  {booking.customer.phone}
                </a>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Address & car</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {booking.address ? (
              <p>
                {booking.address.name}, {booking.address.area_name},{" "}
                {booking.address.city_name}
              </p>
            ) : (
              <p className="text-muted-foreground">No address on file.</p>
            )}
            <p className={booking.car ? undefined : "text-muted-foreground"}>
              {booking.car ?? "No car on file."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {booking.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMoney(item.price)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {booking.package && (
              <p className="text-muted-foreground text-sm">
                Package: {booking.package.name} (
                {formatMoney(booking.package.price)})
              </p>
            )}

            <dl className="grid gap-1 border-t pt-4 text-sm sm:ml-auto sm:w-64">
              <SummaryRow label="Subtotal" value={booking.subtotal} />
              <SummaryRow label="Extras" value={booking.extras_total} />
              <SummaryRow label="Discounts" value={-booking.discounts} />
              <SummaryRow
                label="Total"
                value={booking.total_amount}
                emphasize
              />
            </dl>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

function SummaryRow({
  label,
  value,
  emphasize = false,
}: {
  label: string
  value: number
  emphasize?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className={emphasize ? "font-medium" : "text-muted-foreground"}>
        {label}
      </dt>
      <dd className={emphasize ? "font-medium tabular-nums" : "tabular-nums"}>
        {formatMoney(value)}
      </dd>
    </div>
  )
}
