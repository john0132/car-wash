import { Head, Link } from "@inertiajs/react"
import { Pencil } from "lucide-react"

import { ActivationSwitch } from "@/admin/components/activation-switch"
import { ActiveBadge } from "@/admin/components/active-badge"
import { ConfirmDeleteDialog } from "@/admin/components/confirm-delete-dialog"
import { PageHeader } from "@/admin/components/page-header"
import { StatCard } from "@/admin/components/stat-card"
import { TranslationsCard } from "@/admin/components/translations-card"
import type { ExtraDetail } from "@/admin/features/extras/types"
import { useCan } from "@/admin/hooks/use-can"
import AdminLayout from "@/admin/layouts/admin-layout"
import {
  formatDate,
  formatMoney,
  formatNumber,
  pluralize,
} from "@/admin/lib/format"
import { adminExtras } from "@/routes"
import { Button } from "@/shared/components/ui/button"

interface Props {
  extra: ExtraDetail & { bookings_count: number }
}

export default function ExtraShow({ extra }: Props) {
  const can = useCan()

  return (
    <AdminLayout
      breadcrumbs={[
        { title: "Extras", href: adminExtras.index().url },
        { title: extra.name, href: adminExtras.show(extra.id).url },
      ]}
    >
      <Head title={extra.name} />

      <div className="space-y-6 p-4">
        <PageHeader
          title={
            <span className="flex items-center gap-3">
              {extra.name}
              {!can("extras", "update") && (
                <ActiveBadge active={extra.is_active} />
              )}
            </span>
          }
          description={`Created ${formatDate(extra.created_at)}`}
          actions={
            <>
              {can("extras", "update") && (
                <>
                  <ActivationSwitch
                    active={extra.is_active}
                    name={extra.name}
                    action={adminExtras.activation(extra.id)}
                    label="Active"
                  />
                  <Button variant="outline" asChild>
                    <Link href={adminExtras.edit(extra.id)}>
                      <Pencil /> Edit
                    </Link>
                  </Button>
                </>
              )}
              {can("extras", "delete") && (
                <ConfirmDeleteDialog
                  title={`Delete ${extra.name}?`}
                  description={
                    extra.bookings_count > 0
                      ? `${extra.name} is on ${pluralize(extra.bookings_count, "booking")}, so it can't be deleted. Disable it instead.`
                      : "This permanently deletes the extra and its translations."
                  }
                  action={adminExtras.destroy(extra.id)}
                />
              )}
            </>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard label="Price" value={formatMoney(extra.price)} />
          <StatCard
            label="Bookings"
            value={formatNumber(extra.bookings_count)}
          />
        </div>

        <TranslationsCard
          translations={extra.translations}
          columns={[{ key: "name", label: "Name" }]}
        />
      </div>
    </AdminLayout>
  )
}
