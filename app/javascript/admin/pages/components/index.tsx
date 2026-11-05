import { Head, Link } from "@inertiajs/react"
import { Pencil, Plus } from "lucide-react"

import { ActivationSwitch } from "@/admin/components/activation-switch"
import { ListFilters } from "@/admin/components/list-filters"
import { PageHeader } from "@/admin/components/page-header"
import { Pagination } from "@/admin/components/pagination"
import type {
  ComponentFilters,
  ComponentRow,
} from "@/admin/features/components/types"
import { useCan } from "@/admin/hooks/use-can"
import AdminLayout from "@/admin/layouts/admin-layout"
import { formatNumber } from "@/admin/lib/format"
import type { Pagination as PaginationData } from "@/admin/types"
import { adminComponents } from "@/routes"
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
  components: ComponentRow[]
  filters: ComponentFilters
  pagination: PaginationData
}

export default function ComponentsIndex({
  components,
  filters,
  pagination,
}: Props) {
  const can = useCan()
  const canUpdate = can("components", "update")

  return (
    <AdminLayout
      breadcrumbs={[{ title: "Components", href: adminComponents.index().url }]}
    >
      <Head title="Components" />

      <div className="space-y-6 p-4">
        <PageHeader
          title="Components"
          description="The building blocks of pages. Define the fields a component has; pages then add it as sections and fill them in each language."
          actions={
            can("components", "create") && (
              <Button asChild>
                <Link href={adminComponents.new()}>
                  <Plus /> New component
                </Link>
              </Button>
            )
          }
        />

        <ListFilters
          url={adminComponents.index().url}
          filters={filters}
          searchPlaceholder="Search component name…"
        />

        <Card className="py-2">
          <CardContent className="px-2">
            {components.length === 0 ? (
              <p className="text-muted-foreground py-10 text-center text-sm">
                No components match these filters.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Component</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead className="text-right">Fields</TableHead>
                    <TableHead className="text-right">Used on pages</TableHead>
                    <TableHead className="text-right">Active</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {components.map((component) => (
                    <TableRow key={component.id}>
                      <TableCell>
                        <div className="space-y-0.5">
                          {canUpdate ? (
                            <Link
                              href={adminComponents.edit(component.id)}
                              className="font-medium hover:underline"
                            >
                              {component.name}
                            </Link>
                          ) : (
                            <span className="font-medium">
                              {component.name}
                            </span>
                          )}
                          {component.description && (
                            <p className="text-muted-foreground max-w-md truncate text-xs">
                              {component.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {component.key}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatNumber(component.fields_count)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatNumber(component.pages_count)}
                      </TableCell>
                      <TableCell className="text-right">
                        <ActivationSwitch
                          active={component.is_active}
                          name={component.name}
                          action={adminComponents.activation(component.id)}
                          disabled={!canUpdate}
                        />
                      </TableCell>
                      <TableCell>
                        {canUpdate && (
                          <Button variant="ghost" size="icon" asChild>
                            <Link
                              href={adminComponents.edit(component.id)}
                              aria-label={`Edit ${component.name}`}
                            >
                              <Pencil />
                            </Link>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Pagination pagination={pagination} noun="components" />
      </div>
    </AdminLayout>
  )
}
