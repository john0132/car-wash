import { Head, Link } from "@inertiajs/react"
import { Pencil, Plus } from "lucide-react"

import { ActivationSwitch } from "@/admin/components/activation-switch"
import { ActiveBadge } from "@/admin/components/active-badge"
import { ConfirmDeleteDialog } from "@/admin/components/confirm-delete-dialog"
import { PageHeader } from "@/admin/components/page-header"
import { TranslationsCard } from "@/admin/components/translations-card"
import { AreasMap } from "@/admin/features/areas/components/areas-map"
import type { AreaSummary } from "@/admin/features/areas/types"
import type { CityDetail } from "@/admin/features/cities/types"
import { useCan } from "@/admin/hooks/use-can"
import AdminLayout from "@/admin/layouts/admin-layout"
import { pluralize } from "@/admin/lib/format"
import { adminAreas, adminCities } from "@/routes"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
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
  city: CityDetail
  areas: AreaSummary[]
}

export default function CityShow({ city, areas }: Props) {
  const can = useCan()
  const mapped = areas.filter((area) => area.geofence)

  return (
    <AdminLayout
      breadcrumbs={[
        { title: "Cities", href: adminCities.index().url },
        { title: city.name, href: adminCities.show(city.id).url },
      ]}
    >
      <Head title={city.name} />

      <div className="space-y-6 p-4">
        <PageHeader
          title={
            <span className="flex items-center gap-3">
              {city.name}
              {!can("cities", "update") && (
                <ActiveBadge active={city.is_active} />
              )}
            </span>
          }
          actions={
            <>
              {can("cities", "update") && (
                <>
                  <ActivationSwitch
                    active={city.is_active}
                    name={city.name}
                    action={adminCities.activation(city.id)}
                    label="Active"
                  />
                  <Button variant="outline" asChild>
                    <Link href={adminCities.edit(city.id)}>
                      <Pencil /> Edit
                    </Link>
                  </Button>
                </>
              )}
              {can("cities", "delete") && (
                <ConfirmDeleteDialog
                  title={`Delete ${city.name}?`}
                  description={
                    areas.length > 0
                      ? `${city.name} still has ${pluralize(areas.length, "area")}. Delete or move them first, or disable the city instead.`
                      : "This permanently deletes the city and its translations."
                  }
                  action={adminCities.destroy(city.id)}
                />
              )}
            </>
          }
        />

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="space-y-1.5">
              <CardTitle>Areas</CardTitle>
              <CardDescription>
                {areas.length === 0
                  ? "No areas in this city yet."
                  : `${pluralize(areas.length, "area")}. Click a shape to open it.`}
              </CardDescription>
            </div>
            {can("areas", "create") && (
              <Button size="sm" asChild>
                <Link href={adminAreas.new({ query: { city_id: city.id } })}>
                  <Plus /> New area
                </Link>
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {mapped.length > 0 && (
              <AreasMap
                areas={mapped.map((area) => ({
                  ...area,
                  href: adminAreas.show(area.id).url,
                }))}
              />
            )}

            {areas.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Area</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead>Boundary</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {areas.map((area) => (
                    <TableRow key={area.id}>
                      <TableCell>
                        <Link
                          href={adminAreas.show(area.id)}
                          className="font-medium hover:underline"
                        >
                          {area.name}
                        </Link>
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
                        <ActiveBadge active={area.is_active} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <TranslationsCard
          translations={city.translations}
          columns={[{ key: "name", label: "Name" }]}
        />
      </div>
    </AdminLayout>
  )
}
