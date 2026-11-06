import { Head, Link } from "@inertiajs/react"
import { Plus } from "lucide-react"

import { ActivationSwitch } from "@/admin/components/activation-switch"
import { ListFilters } from "@/admin/components/list-filters"
import { PageHeader } from "@/admin/components/page-header"
import { Pagination } from "@/admin/components/pagination"
import { ResourceTable } from "@/admin/components/resource-table"
import type {
  AreaDetail,
  AreaFilters,
  CityOption,
} from "@/admin/features/areas/types"
import { useCan } from "@/admin/hooks/use-can"
import AdminLayout from "@/admin/layouts/admin-layout"
import type { Pagination as PaginationData } from "@/admin/types"
import { adminAreas, adminCities } from "@/routes"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { TableCell, TableHead, TableRow } from "@/shared/components/ui/table"

interface Props {
  areas: AreaDetail[]
  cities: CityOption[]
  filters: AreaFilters
  pagination: PaginationData
}

export default function AreasIndex({
  areas,
  cities,
  filters,
  pagination,
}: Props) {
  const can = useCan()

  return (
    <AdminLayout
      breadcrumbs={[{ title: "Areas", href: adminAreas.index().url }]}
    >
      <Head title="Areas" />

      <div className="space-y-6 p-4">
        <PageHeader
          title="Areas"
          description="Service areas and the boundaries customers' addresses must fall in."
          actions={
            can("areas", "create") && (
              <Button asChild>
                <Link
                  href={adminAreas.new(
                    filters.city_id
                      ? { query: { city_id: filters.city_id } }
                      : undefined,
                  )}
                >
                  <Plus /> New area
                </Link>
              </Button>
            )
          }
        />

        <ListFilters
          url={adminAreas.index().url}
          filters={filters}
          searchPlaceholder="Search area name…"
          selects={[
            {
              param: "city_id",
              label: "Filter by city",
              allLabel: "All cities",
              options: cities.map((city) => ({
                value: String(city.id),
                label: city.name,
              })),
            },
          ]}
        />

        <ResourceTable
          items={areas}
          emptyMessage="No areas match these filters."
          columns={
            <>
              <TableHead>Area</TableHead>
              <TableHead>City</TableHead>
              <TableHead className="text-right">Rate</TableHead>
              <TableHead>Boundary</TableHead>
              <TableHead className="text-right">Active</TableHead>
            </>
          }
          renderRow={(area) => (
            <TableRow key={area.id}>
              <TableCell>
                <Link
                  href={adminAreas.show(area.id)}
                  className="font-medium hover:underline"
                >
                  {area.name}
                </Link>
              </TableCell>
              <TableCell>
                {can("cities", "read") ? (
                  <Link
                    href={adminCities.show(area.city.id)}
                    className="hover:underline"
                  >
                    {area.city.name}
                  </Link>
                ) : (
                  area.city.name
                )}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {area.rate.toFixed(2)}
              </TableCell>
              <TableCell>
                {area.geofence ? (
                  <span className="text-muted-foreground text-sm">
                    {area.geofence.coordinates[0].length - 1} points
                  </span>
                ) : (
                  <Badge variant="outline">Not drawn</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <ActivationSwitch
                  active={area.is_active}
                  name={area.name}
                  action={adminAreas.activation(area.id)}
                  disabled={!can("areas", "update")}
                />
              </TableCell>
            </TableRow>
          )}
        />

        <Pagination pagination={pagination} noun="areas" />
      </div>
    </AdminLayout>
  )
}
