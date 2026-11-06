import { Head } from "@inertiajs/react"

import { PageHeader } from "@/admin/components/page-header"
import { Pagination } from "@/admin/components/pagination"
import { ResourceTable } from "@/admin/components/resource-table"
import { MembershipBadge } from "@/admin/features/customers/components/membership-badge"
import type { CustomerRow } from "@/admin/features/customers/types"
import { ActivationSwitch } from "@/admin/features/users/components/activation-switch"
import { UserIdentity } from "@/admin/features/users/components/user-identity"
import { UserListFilters } from "@/admin/features/users/components/user-list-filters"
import type { UserListFilters as Filters } from "@/admin/features/users/types"
import { useCan } from "@/admin/hooks/use-can"
import AdminLayout from "@/admin/layouts/admin-layout"
import { formatMoney, formatNumber } from "@/admin/lib/format"
import type { Pagination as PaginationData } from "@/admin/types"
import { adminCustomers } from "@/routes"
import { TableCell, TableHead, TableRow } from "@/shared/components/ui/table"

interface Props {
  customers: CustomerRow[]
  filters: Filters
  pagination: PaginationData
}

export default function CustomersIndex({
  customers,
  filters,
  pagination,
}: Props) {
  const can = useCan()
  const canUpdate = can("customers", "update")

  return (
    <AdminLayout
      breadcrumbs={[{ title: "Customers", href: adminCustomers.index().url }]}
    >
      <Head title="Customers" />

      <div className="space-y-6 p-4">
        <PageHeader
          title="Customers"
          description="Customers sign up on the website. They can't be deleted because bookings belong to them; disable them instead."
        />

        <UserListFilters url={adminCustomers.index().url} filters={filters} />

        <ResourceTable
          items={customers}
          emptyMessage="No customers match these filters."
          columns={
            <>
              <TableHead>Customer</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead className="text-right">Bookings</TableHead>
              <TableHead className="text-right">Lifetime value</TableHead>
              <TableHead className="text-right">Wallet</TableHead>
              <TableHead className="text-right">Points</TableHead>
              <TableHead className="text-right">Active</TableHead>
            </>
          }
          renderRow={(customer) => (
            <TableRow key={customer.id}>
              <TableCell>
                <UserIdentity
                  user={customer}
                  href={adminCustomers.show(customer.id).url}
                />
              </TableCell>
              <TableCell>
                <MembershipBadge membership={customer.membership} />
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatNumber(customer.bookings_count)}
              </TableCell>
              <TableCell className="text-right font-medium tabular-nums">
                {formatMoney(customer.lifetime_value)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatMoney(customer.wallet)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatNumber(customer.points)}
              </TableCell>
              <TableCell className="text-right">
                <ActivationSwitch
                  active={customer.is_active}
                  name={customer.full_name}
                  action={adminCustomers.activation(customer.id)}
                  disabled={!canUpdate}
                />
              </TableCell>
            </TableRow>
          )}
        />

        <Pagination pagination={pagination} noun="customers" />
      </div>
    </AdminLayout>
  )
}
