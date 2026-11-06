import { Head, Link } from "@inertiajs/react"
import { Plus } from "lucide-react"

import { ActivationSwitch } from "@/admin/components/activation-switch"
import { ListFilters } from "@/admin/components/list-filters"
import { PageHeader } from "@/admin/components/page-header"
import { Pagination } from "@/admin/components/pagination"
import { ResourceTable } from "@/admin/components/resource-table"
import type {
  ServiceCategoryFilters,
  ServiceCategoryRow,
} from "@/admin/features/services/types"
import { useCan } from "@/admin/hooks/use-can"
import AdminLayout from "@/admin/layouts/admin-layout"
import { formatNumber } from "@/admin/lib/format"
import type { Pagination as PaginationData } from "@/admin/types"
import { adminServiceCategories, adminServices } from "@/routes"
import { Button } from "@/shared/components/ui/button"
import { TableCell, TableHead, TableRow } from "@/shared/components/ui/table"

interface Props {
  service_categories: ServiceCategoryRow[]
  filters: ServiceCategoryFilters
  pagination: PaginationData
}

export default function ServiceCategoriesIndex({
  service_categories: categories,
  filters,
  pagination,
}: Props) {
  const can = useCan()

  return (
    <AdminLayout
      breadcrumbs={[
        {
          title: "Service categories",
          href: adminServiceCategories.index().url,
        },
      ]}
    >
      <Head title="Service categories" />

      <div className="space-y-6 p-4">
        <PageHeader
          title="Service categories"
          description="Groups the services customers can book."
          actions={
            can("service_categories", "create") && (
              <Button asChild>
                <Link href={adminServiceCategories.new()}>
                  <Plus /> New category
                </Link>
              </Button>
            )
          }
        />

        <ListFilters
          url={adminServiceCategories.index().url}
          filters={filters}
          searchPlaceholder="Search category name…"
        />

        <ResourceTable
          items={categories}
          emptyMessage="No service categories match these filters."
          columns={
            <>
              <TableHead>Category</TableHead>
              <TableHead>Other names</TableHead>
              <TableHead className="text-right">Services</TableHead>
              <TableHead className="text-right">Active</TableHead>
            </>
          }
          renderRow={(category) => (
            <TableRow key={category.id}>
              <TableCell>
                <Link
                  href={adminServiceCategories.show(category.id)}
                  className="font-medium hover:underline"
                >
                  {category.name}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground space-x-3">
                {category.translations
                  .filter((t) => !t.default && t.name)
                  .map((t) => (
                    <span key={t.language_id} lang={t.code}>
                      {t.name}
                    </span>
                  ))}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {can("services", "read") ? (
                  <Link
                    href={adminServices.index({
                      query: { service_category_id: category.id },
                    })}
                    className="hover:underline"
                  >
                    {formatNumber(category.services_count)}
                  </Link>
                ) : (
                  formatNumber(category.services_count)
                )}
              </TableCell>
              <TableCell className="text-right">
                <ActivationSwitch
                  active={category.is_active}
                  name={category.name}
                  action={adminServiceCategories.activation(category.id)}
                  disabled={!can("service_categories", "update")}
                />
              </TableCell>
            </TableRow>
          )}
        />

        <Pagination pagination={pagination} noun="categories" />
      </div>
    </AdminLayout>
  )
}
