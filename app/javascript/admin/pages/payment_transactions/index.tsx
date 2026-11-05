import { Head, Link } from "@inertiajs/react"
import { CircleAlert, Clock, HandCoins, Undo2 } from "lucide-react"

import { PageHeader } from "@/admin/components/page-header"
import { Pagination } from "@/admin/components/pagination"
import { StatCard } from "@/admin/components/stat-card"
import { TransactionFilters } from "@/admin/features/payments/components/transaction-filters"
import { TransactionStatusBadge } from "@/admin/features/payments/components/transaction-status-badge"
import type {
  TransactionFilters as Filters,
  TransactionRow,
  TransactionStats,
} from "@/admin/features/payments/types"
import AdminLayout from "@/admin/layouts/admin-layout"
import { formatDateTime, formatMoney, formatNumber } from "@/admin/lib/format"
import type { Pagination as PaginationData } from "@/admin/types"
import { adminCustomers, adminPaymentTransactions } from "@/routes"
import { Card, CardContent } from "@/shared/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"

interface Props {
  transactions: TransactionRow[]
  filters: Filters
  payment_method_options: { id: number; name: string }[]
  stats: TransactionStats
  pagination: PaginationData
}

export default function PaymentTransactionsIndex({
  transactions,
  filters,
  payment_method_options,
  stats,
  pagination,
}: Props) {
  return (
    <AdminLayout
      breadcrumbs={[
        {
          title: "Transactions",
          href: adminPaymentTransactions.index().url,
        },
      ]}
    >
      <Head title="Payment transactions" />

      <div className="space-y-6 p-4">
        <PageHeader
          title="Payment transactions"
          description="Every payment and wallet top-up. Totals follow the current filters."
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Collected"
            icon={HandCoins}
            value={formatMoney(stats.collected)}
            hint="Completed payments"
          />
          <StatCard
            label="Refunded"
            icon={Undo2}
            value={formatMoney(stats.refunded)}
          />
          <StatCard
            label="Pending"
            icon={Clock}
            value={formatNumber(stats.pending_count)}
          />
          <StatCard
            label="Failed"
            icon={CircleAlert}
            value={formatNumber(stats.failed_count)}
          />
        </div>

        <TransactionFilters
          url={adminPaymentTransactions.index().url}
          filters={filters}
          methods={payment_method_options}
        />

        <Card className="py-2">
          <CardContent className="px-2">
            {transactions.length === 0 ? (
              <p className="text-muted-foreground py-10 text-center text-sm">
                No transactions match these filters.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>For</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="tabular-nums">
                        {formatDateTime(transaction.created_at)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        <Link
                          href={adminPaymentTransactions.show(transaction.id)}
                          className="hover:underline"
                        >
                          {transaction.reference ?? `#${transaction.id}`}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={adminCustomers.show(transaction.customer.id)}
                          className="font-medium hover:underline"
                        >
                          {transaction.customer.full_name}
                        </Link>
                        <div className="text-muted-foreground text-xs">
                          {transaction.customer.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        {transaction.booking_id
                          ? `Booking #${transaction.booking_id}`
                          : "Wallet top-up"}
                      </TableCell>
                      <TableCell>{transaction.payment_method}</TableCell>
                      <TableCell>
                        <TransactionStatusBadge status={transaction.status} />
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {formatMoney(transaction.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Pagination pagination={pagination} noun="transactions" />
      </div>
    </AdminLayout>
  )
}
