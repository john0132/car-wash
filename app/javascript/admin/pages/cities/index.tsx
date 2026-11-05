import { Head, Link } from "@inertiajs/react"
import { Plus } from "lucide-react"

import { ActivationSwitch } from "@/admin/components/activation-switch"
import { ListFilters } from "@/admin/components/list-filters"
import { PageHeader } from "@/admin/components/page-header"
import { Pagination } from "@/admin/components/pagination"
import type { CityFilters, CityRow } from "@/admin/features/cities/types"
import { useCan } from "@/admin/hooks/use-can"
import AdminLayout from "@/admin/layouts/admin-layout"
import { formatNumber } from "@/admin/lib/format"
import type { Pagination as PaginationData } from "@/admin/types"
import { adminCities } from "@/routes"
import { Button } from "@/shared/components/ui/button"
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
  cities: CityRow[]
  filters: CityFilters
  pagination: PaginationData
}

export default function CitiesIndex({ cities, filters, pagination }: Props) {
  const can = useCan()

  return (
    <AdminLayout
      breadcrumbs={[{ title: "Cities", href: adminCities.index().url }]}
    >
      <Head title="Cities" />

      <div className="space-y-6 p-4">
        <PageHeader
          title="Cities"
          description="Cities group the areas we serve."
          actions={
            can("cities", "create") && (
              <Button asChild>
                <Link href={adminCities.new()}>
                  <Plus /> New city
                </Link>
              </Button>
            )
          }
        />

        <ListFilters
          url={adminCities.index().url}
          filters={filters}
          searchPlaceholder="Search city name…"
        />

        <Card className="py-2">
          <CardContent className="px-2">
            {cities.length === 0 ? (
              <p className="text-muted-foreground py-10 text-center text-sm">
                No cities match these filters.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>City</TableHead>
                    <TableHead>Other names</TableHead>
                    <TableHead className="text-right">Areas</TableHead>
                    <TableHead className="text-right">Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cities.map((city) => (
                    <TableRow key={city.id}>
                      <TableCell>
                        <Link
                          href={adminCities.show(city.id)}
                          className="font-medium hover:underline"
                        >
                          {city.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground space-x-3">
                        {city.translations
                          .filter((t) => !t.default && t.name)
                          .map((t) => (
                            <span key={t.language_id} lang={t.code}>
                              {t.name}
                            </span>
                          ))}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatNumber(city.areas_count)}
                      </TableCell>
                      <TableCell className="text-right">
                        <ActivationSwitch
                          active={city.is_active}
                          name={city.name}
                          action={adminCities.activation(city.id)}
                          disabled={!can("cities", "update")}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Pagination pagination={pagination} noun="cities" />
      </div>
    </AdminLayout>
  )
}
