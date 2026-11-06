import { Head, Link, router } from "@inertiajs/react"
import { Search } from "lucide-react"
import { useState } from "react"

import { PageHeader } from "@/admin/components/page-header"
import { Pagination } from "@/admin/components/pagination"
import { ResourceTable } from "@/admin/components/resource-table"
import type { CarFilters, CarRow } from "@/admin/features/cars/types"
import AdminLayout from "@/admin/layouts/admin-layout"
import { formatDate } from "@/admin/lib/format"
import type { Pagination as PaginationData } from "@/admin/types"
import { adminCars, adminCustomers } from "@/routes"
import { Input } from "@/shared/components/ui/input"
import { TableCell, TableHead, TableRow } from "@/shared/components/ui/table"

interface Props {
  cars: CarRow[]
  filters: CarFilters
  pagination: PaginationData
}

export default function CarsIndex({ cars, filters, pagination }: Props) {
  const [query, setQuery] = useState(filters.q ?? "")

  return (
    <AdminLayout breadcrumbs={[{ title: "Cars", href: adminCars.index().url }]}>
      <Head title="Cars" />

      <div className="space-y-6 p-4">
        <PageHeader
          title="Cars"
          description="Cars saved by customers. Customers manage them on the website."
        />

        <form
          className="relative w-full max-w-sm"
          onSubmit={(event) => {
            event.preventDefault()
            router.get(
              adminCars.index().url,
              { q: query.trim() || undefined },
              { preserveState: true, preserveScroll: true, replace: true },
            )
          }}
        >
          <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search make, model, plate or customer…"
            aria-label="Search cars"
            className="pl-8"
          />
        </form>

        <ResourceTable
          items={cars}
          emptyMessage="No cars match this search."
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
