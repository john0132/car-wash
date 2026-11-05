import { Head, Link } from "@inertiajs/react"

import { PageHeader } from "@/admin/components/page-header"
import { PaymentStatusBadge } from "@/admin/features/bookings/components/payment-status-badge"
import type {
  BookingStatus,
  PaymentStatus,
} from "@/admin/features/bookings/types"
import { TransactionStatusBadge } from "@/admin/features/payments/components/transaction-status-badge"
import type { TransactionRow } from "@/admin/features/payments/types"
import { Detail } from "@/admin/features/users/components/account-card"
import AdminLayout from "@/admin/layouts/admin-layout"
import { formatDateTime, formatMoney, humanize } from "@/admin/lib/format"
import { adminCustomers, adminPaymentTransactions } from "@/routes"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"

interface Props {
  transaction: TransactionRow & { updated_at: string }
  booking: {
    id: number
    status: BookingStatus
    payment_status: PaymentStatus
    total_amount: number
    scheduled_at: string | null
  } | null
}

export default function PaymentTransactionShow({
  transaction,
  booking,
}: Props) {
  const title = transaction.reference ?? `Transaction #${transaction.id}`

  return (
    <AdminLayout
      breadcrumbs={[
        {
          title: "Transactions",
          href: adminPaymentTransactions.index().url,
        },
        {
          title,
          href: adminPaymentTransactions.show(transaction.id).url,
        },
      ]}
    >
      <Head title={title} />

      <div className="space-y-6 p-4">
        <PageHeader
          title={title}
          description={
            <span className="inline-flex items-center gap-2">
              Transaction #{transaction.id}
              <TransactionStatusBadge status={transaction.status} />
            </span>
          }
        />

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                <Detail label="Amount">
                  <span className="font-medium tabular-nums">
                    {formatMoney(transaction.amount)}
                  </span>
                </Detail>
                <Detail label="Method">{transaction.payment_method}</Detail>
                <Detail label="Reference">
                  <span className="font-mono text-xs">
                    {transaction.reference ?? "—"}
                  </span>
                </Detail>
                <Detail label="For">
                  {transaction.booking_id
                    ? `Booking #${transaction.booking_id}`
                    : "Wallet top-up"}
                </Detail>
                <Detail label="Created">
                  {formatDateTime(transaction.created_at)}
                </Detail>
                <Detail label="Last updated">
                  {formatDateTime(transaction.updated_at)}
                </Detail>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <Link
                href={adminCustomers.show(transaction.customer.id)}
                className="font-medium hover:underline"
              >
                {transaction.customer.full_name}
              </Link>
              <div className="text-muted-foreground">
                {transaction.customer.email}
              </div>
            </CardContent>
          </Card>
        </div>

        {booking && (
          <Card>
            <CardHeader>
              <CardTitle>Booking #{booking.id}</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
                <Detail label="Status">{humanize(booking.status)}</Detail>
                <Detail label="Payment status">
                  <PaymentStatusBadge status={booking.payment_status} />
                </Detail>
                <Detail label="Total">
                  <span className="tabular-nums">
                    {formatMoney(booking.total_amount)}
                  </span>
                </Detail>
                <Detail label="Scheduled">
                  {formatDateTime(booking.scheduled_at)}
                </Detail>
              </dl>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}
