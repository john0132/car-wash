import { Head } from "@inertiajs/react"
import { CalendarCheck, Coins, Gem, Receipt, Wallet } from "lucide-react"

import { PageHeader } from "@/admin/components/page-header"
import { Pagination } from "@/admin/components/pagination"
import { StatCard } from "@/admin/components/stat-card"
import { BookingsTable } from "@/admin/features/bookings/components/bookings-table"
import type { BookingRow } from "@/admin/features/bookings/types"
import { AddressesCard } from "@/admin/features/customers/components/addresses-card"
import { MembershipBadge } from "@/admin/features/customers/components/membership-badge"
import { TransactionsCard } from "@/admin/features/customers/components/transactions-card"
import type {
  CustomerAddress,
  CustomerDetail,
  CustomerStats,
  CustomerTransaction,
} from "@/admin/features/customers/types"
import {
  AccountCard,
  Detail,
} from "@/admin/features/users/components/account-card"
import { ActivationSwitch } from "@/admin/features/users/components/activation-switch"
import { useCan } from "@/admin/hooks/use-can"
import AdminLayout from "@/admin/layouts/admin-layout"
import {
  formatCompact,
  formatDate,
  formatMoney,
  formatNumber,
} from "@/admin/lib/format"
import type { Pagination as PaginationData } from "@/admin/types"
import { adminCustomers } from "@/routes"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"

interface Props {
  customer: CustomerDetail
  stats: CustomerStats
  addresses: CustomerAddress[]
  bookings: BookingRow[]
  bookings_pagination: PaginationData
  transactions: CustomerTransaction[]
}

export default function CustomerShow({
  customer,
  stats,
  addresses,
  bookings,
  bookings_pagination,
  transactions,
}: Props) {
  const can = useCan()

  return (
    <AdminLayout
      breadcrumbs={[
        { title: "Customers", href: adminCustomers.index().url },
        {
          title: customer.full_name,
          href: adminCustomers.show(customer.id).url,
        },
      ]}
    >
      <Head title={customer.full_name} />

      <div className="space-y-6 p-4">
        <PageHeader
          title={customer.full_name}
          description={
            <span className="inline-flex items-center gap-2">
              Customer #{customer.id}
              <MembershipBadge membership={customer.membership} />
            </span>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            label="Lifetime value"
            icon={Gem}
            value={formatMoney(stats.lifetime_value)}
            hint="Total of fully paid bookings"
          />
          <StatCard
            label="Average order"
            icon={Receipt}
            value={formatMoney(stats.average_order_value)}
            hint="Per paid booking"
          />
          <StatCard
            label="Bookings"
            icon={CalendarCheck}
            value={formatNumber(stats.bookings_count)}
            hint={`${stats.by_status.completed} completed · ${stats.by_status.cancelled} cancelled`}
          />
          <StatCard
            label="Wallet balance"
            icon={Wallet}
            value={formatMoney(customer.wallet)}
          />
          <StatCard
            label="Points"
            icon={Coins}
            value={formatCompact(customer.points)}
            hint={`${formatNumber(customer.lifetime_points)} earned all-time`}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AccountCard
              user={customer}
              activation={
                <ActivationSwitch
                  active={customer.is_active}
                  name={customer.full_name}
                  action={adminCustomers.activation(customer.id)}
                  disabled={!can("customers", "update")}
                />
              }
            >
              <Detail label="Membership tier">
                <MembershipBadge membership={customer.membership} />
                {customer.membership && (
                  <span className="text-muted-foreground ml-2 text-xs">
                    earns {customer.membership.egp_to_points} pts / EGP
                  </span>
                )}
              </Detail>
              <Detail label="Package">
                {customer.package
                  ? `${customer.package.name} (${formatMoney(customer.package.price)})`
                  : "None"}
              </Detail>
              <Detail label="Latest booking">
                {formatDate(stats.last_booking_at)}
              </Detail>
            </AccountCard>
          </div>
          <AddressesCard addresses={addresses} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bookings</CardTitle>
            <CardDescription>
              Every booking this customer has made, newest first.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <BookingsTable bookings={bookings} party="employee" />
            <Pagination pagination={bookings_pagination} noun="bookings" />
          </CardContent>
        </Card>

        <TransactionsCard transactions={transactions} />
      </div>
    </AdminLayout>
  )
}
