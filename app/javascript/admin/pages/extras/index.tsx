import { Head, Link } from "@inertiajs/react"
import { Plus } from "lucide-react"

import { ActivationSwitch } from "@/admin/components/activation-switch"
import { ListFilters } from "@/admin/components/list-filters"
import { PageHeader } from "@/admin/components/page-header"
import { Pagination } from "@/admin/components/pagination"
import type { ExtraFilters, ExtraRow } from "@/admin/features/extras/types"
import { useCan } from "@/admin/hooks/use-can"
import AdminLayout from "@/admin/layouts/admin-layout"
import { formatMoney } from "@/admin/lib/format"
import type { Pagination as PaginationData } from "@/admin/types"
import { adminExtras } from "@/routes"
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
  extras: ExtraRow[]
  filters: ExtraFilters
  pagination: PaginationData
}

export default function ExtrasIndex({ extras, filters, pagination }: Props) {
  const can = useCan()

  return (
    <AdminLayout
      breadcrumbs={[{ title: "Extras", href: adminExtras.index().url }]}
    >
      <Head title="Extras" />

      <div className="space-y-6 p-4">
        <PageHeader
          title="Extras"
          description="Add-ons customers can attach to a booking."
          actions={
            can("extras", "create") && (
              <Button asChild>
                <Link href={adminExtras.new()}>
                  <Plus /> New extra
                </Link>
              </Button>
            )
          }
        />

        <ListFilters
          url={adminExtras.index().url}
          filters={filters}
          searchPlaceholder="Search extra name…"
        />

        <Card className="py-2">
          <CardContent className="px-2">
            {extras.length === 0 ? (
              <p className="text-muted-foreground py-10 text-center text-sm">
                No extras match these filters.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Extra</TableHead>
                    <TableHead>Other names</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {extras.map((extra) => (
                    <TableRow key={extra.id}>
                      <TableCell>
                        <Link
                          href={adminExtras.show(extra.id)}
                          className="font-medium hover:underline"
                        >
                          {extra.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground space-x-3">
                        {extra.translations
                          .filter((t) => !t.default && t.name)
                          .map((t) => (
                            <span key={t.language_id} lang={t.code}>
                              {t.name}
                            </span>
                          ))}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatMoney(extra.price)}
                      </TableCell>
                      <TableCell className="text-right">
                        <ActivationSwitch
                          active={extra.is_active}
                          name={extra.name}
                          action={adminExtras.activation(extra.id)}
                          disabled={!can("extras", "update")}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Pagination pagination={pagination} noun="extras" />
      </div>
    </AdminLayout>
  )
}
