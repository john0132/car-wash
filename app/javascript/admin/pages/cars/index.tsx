import { Head, Link } from "@inertiajs/react"

import { ListFilters, hasFilters } from "@/admin/components/list-filters"
import { PageHeader } from "@/admin/components/page-header"
import { Pagination } from "@/admin/components/pagination"
import { ResourceTable } from "@/admin/components/resource-table"
import type { CarFilters, CarRow } from "@/admin/features/cars/types"
import AdminLayout from "@/admin/layouts/admin-layout"
import { formatDate } from "@/admin/lib/format"
import type { Pagination as PaginationData } from "@/admin/types"
import { adminCars, adminCustomers } from "@/routes"
import { TableCell, TableHead, TableRow } from "@/shared/components/ui/table"

interface Props {
  cars: CarRow[]
  filters: CarFilters
  pagination: PaginationData
}

export default function CarsIndex({ cars, filters, pagination }: Props) {
  return (
    <AdminLayout breadcrumbs={[{ title: "Cars", href: adminCars.index().url }]}>
      <Head title="Cars" />

      <div className="space-y-6 p-4">
        <PageHeader
          title="Cars"
          description="Cars saved by customers. Customers manage them on the website."
        />

        <ListFilters
          url={adminCars.index().url}
          filters={filters}
          searchPlaceholder="Search make, model, plate or customer…"
          showStatus={false}
        />

        <ResourceTable
          items={cars}
          emptyMessage="No cars yet."
          emptyFilteredMessage="No cars match this search."
          filtered={hasFilters(filters)}
          columns={
            <>
              <TableHead>Car</TableHead>
              <TableHead>License plate</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Added</TableHead>
            </>
          }
          renderRow={(car) => (
            <TableRow key={car.id}>
              <TableCell className="font-medium">
                {car.make} {car.model}
              </TableCell>
              <TableCell className="font-mono text-xs">
                {car.license_plate}
              </TableCell>
              <TableCell>{car.color}</TableCell>
              <TableCell>
                <Link
                  href={adminCustomers.show(car.customer.id)}
                  className="font-medium hover:underline"
                >
                  {car.customer.full_name}
                </Link>
                <div className="text-muted-foreground text-xs">
                  {car.customer.email}
                </div>
              </TableCell>
              <TableCell className="tabular-nums">
                {formatDate(car.created_at)}
              </TableCell>
            </TableRow>
          )}
        />

        <Pagination pagination={pagination} noun="cars" />
      </div>
    </AdminLayout>
  )
}
