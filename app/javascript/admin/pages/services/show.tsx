import { Head, Link } from "@inertiajs/react"
import { Pencil } from "lucide-react"

import { ActivationSwitch } from "@/admin/components/activation-switch"
import { ActiveBadge } from "@/admin/components/active-badge"
import { ConfirmDeleteDialog } from "@/admin/components/confirm-delete-dialog"
import { PageHeader } from "@/admin/components/page-header"
import { StatCard } from "@/admin/components/stat-card"
import { TranslationsCard } from "@/admin/components/translations-card"
import type { ServiceDetail } from "@/admin/features/services/types"
import { formatDuration } from "@/admin/features/services/utils"
import { useCan } from "@/admin/hooks/use-can"
import AdminLayout from "@/admin/layouts/admin-layout"
import {
  formatDate,
  formatMoney,
  formatNumber,
  pluralize,
} from "@/admin/lib/format"
import { adminServiceCategories, adminServices } from "@/routes"
import { Button } from "@/shared/components/ui/button"

interface Props {
  service: ServiceDetail & { bookings_count: number }
}

export default function ServiceShow({ service }: Props) {
  const can = useCan()
  const category = service.service_category

  return (
    <AdminLayout
      breadcrumbs={[
        { title: "Services", href: adminServices.index().url },
        { title: service.name, href: adminServices.show(service.id).url },
      ]}
    >
      <Head title={service.name} />

      <div className="space-y-6 p-4">
        <PageHeader
          title={
            <span className="flex items-center gap-3">
              {service.name}
              {!can("services", "update") && (
                <ActiveBadge active={service.is_active} />
              )}
            </span>
          }
          description={
            <>
              In{" "}
              {can("service_categories", "read") ? (
                <Link
                  href={adminServiceCategories.show(category.id)}
                  className="text-foreground hover:underline"
                >
                  {category.name}
                </Link>
              ) : (
                category.name
              )}{" "}
              · Created {formatDate(service.created_at)}
            </>
          }
          actions={
            <>
              {can("services", "update") && (
                <>
                  <ActivationSwitch
                    active={service.is_active}
                    name={service.name}
                    action={adminServices.activation(service.id)}
                    label="Active"
                  />
                  <Button variant="outline" asChild>
                    <Link href={adminServices.edit(service.id)}>
                      <Pencil /> Edit
                    </Link>
                  </Button>
                </>
              )}
              {can("services", "delete") && (
                <ConfirmDeleteDialog
                  title={`Delete ${service.name}?`}
                  description={
                    service.bookings_count > 0
                      ? `${service.name} is on ${pluralize(service.bookings_count, "booking")}, so it can't be deleted. Disable it instead.`
                      : "This permanently deletes the service and its translations."
                  }
                  action={adminServices.destroy(service.id)}
                />
              )}
            </>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Price" value={formatMoney(service.price)} />
          <StatCard
            label="Sale price"
            value={
              service.sale_price === null
                ? "—"
                : formatMoney(service.sale_price)
            }
            hint={
              service.sale_price === null
                ? "Not on sale"
                : `${Math.round((1 - service.sale_price / service.price) * 100)}% off`
            }
          />
          <StatCard
            label="Duration"
            value={formatDuration(service.duration_minutes) ?? "—"}
          />
          <StatCard
            label="Bookings"
            value={formatNumber(service.bookings_count)}
          />
        </div>

        <TranslationsCard
          translations={service.translations}
          columns={[
            { key: "name", label: "Name" },
            { key: "title", label: "Title" },
            { key: "description", label: "Description", long: true },
            { key: "seo_title", label: "SEO title" },
            { key: "seo_description", label: "SEO description", long: true },
          ]}
        />
      </div>
    </AdminLayout>
  )
}
