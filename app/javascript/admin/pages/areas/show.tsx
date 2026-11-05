import { Head, Link } from "@inertiajs/react"
import { Pencil } from "lucide-react"
import type { ReactNode } from "react"

import { ActivationSwitch } from "@/admin/components/activation-switch"
import { ActiveBadge } from "@/admin/components/active-badge"
import { ConfirmDeleteDialog } from "@/admin/components/confirm-delete-dialog"
import { PageHeader } from "@/admin/components/page-header"
import { AreasMap } from "@/admin/features/areas/components/areas-map"
import type { AreaDetail, ReferenceArea } from "@/admin/features/areas/types"
import { useCan } from "@/admin/hooks/use-can"
import AdminLayout from "@/admin/layouts/admin-layout"
import { formatDate, formatNumber } from "@/admin/lib/format"
import { adminAreas, adminCities } from "@/routes"
import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"

interface Props {
  area: AreaDetail & { addresses_count: number }
  reference_areas: ReferenceArea[]
}

export default function AreaShow({ area, reference_areas }: Props) {
  const can = useCan()

  return (
    <AdminLayout
      breadcrumbs={[
        { title: "Areas", href: adminAreas.index().url },
        { title: area.name, href: adminAreas.show(area.id).url },
      ]}
    >
      <Head title={area.name} />

      <div className="space-y-6 p-4">
        <PageHeader
          title={
            <span className="flex items-center gap-3">
              {area.name} <ActiveBadge active={area.is_active} />
            </span>
          }
          description={
            can("cities", "read") ? (
              <Link
                href={adminCities.show(area.city.id)}
                className="hover:underline"
              >
                {area.city.name}
              </Link>
            ) : (
              area.city.name
            )
          }
          actions={
            <>
              {can("areas", "update") && (
                <>
                  <ActivationSwitch
                    active={area.is_active}
                    name={area.name}
                    action={adminAreas.activation(area.id)}
                  />
                  <Button variant="outline" asChild>
                    <Link href={adminAreas.edit(area.id)}>
                      <Pencil /> Edit
                    </Link>
                  </Button>
                </>
              )}
              {can("areas", "delete") && (
                <ConfirmDeleteDialog
                  title={`Delete ${area.name}?`}
                  description={
                    area.addresses_count > 0
                      ? `${formatNumber(area.addresses_count)} customer address(es) are in this area, so it can't be deleted. Disable it instead.`
                      : "This permanently deletes the area, its boundary and its translations."
                  }
                  action={adminAreas.destroy(area.id)}
                />
              )}
            </>
          }
        />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
                {area.translations.map((t) => (
                  <Row key={t.language_id} label={`Name (${t.language})`}>
                    <span lang={t.code}>
                      {t.name || (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </span>
                  </Row>
                ))}
                <Row label="Rate">
                  <span className="tabular-nums">{area.rate.toFixed(2)}</span>
                </Row>
                <Row label="Addresses">
                  {formatNumber(area.addresses_count)}
                </Row>
                <Row label="Created">{formatDate(area.created_at)}</Row>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Coverage</CardTitle>
              <CardDescription>
                {area.geofence
                  ? "Other areas in the same city are shown in grey."
                  : "No boundary drawn yet. Edit the area to draw one."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AreasMap areas={[area]} referenceAreas={reference_areas} />
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{children}</dd>
    </>
  )
}
