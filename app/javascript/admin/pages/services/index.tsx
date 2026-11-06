import { Head, Link } from "@inertiajs/react"
import { Plus } from "lucide-react"

import { ActivationSwitch } from "@/admin/components/activation-switch"
import { ListFilters } from "@/admin/components/list-filters"
import { PageHeader } from "@/admin/components/page-header"
import { Pagination } from "@/admin/components/pagination"
import { ResourceTable } from "@/admin/components/resource-table"
import { HomePageBadge } from "@/admin/features/services/components/home-page-badge"
import { ServicePrice } from "@/admin/features/services/components/service-price"
import type {
  ServiceCategoryOption,
  ServiceDetail,
  ServiceFilters,
} from "@/admin/features/services/types"
import { useCan } from "@/admin/hooks/use-can"
import AdminLayout from "@/admin/layouts/admin-layout"
import type { Pagination as PaginationData } from "@/admin/types"
import { adminServiceCategories, adminServices } from "@/routes"
import { Button } from "@/shared/components/ui/button"
import { TableCell, TableHead, TableRow } from "@/shared/components/ui/table"

interface Props {
  services: ServiceDetail[]
  categories: ServiceCategoryOption[]
  filters: ServiceFilters
  pagination: PaginationData
}

export default function ServicesIndex({
  services,
  categories,
  filters,
  pagination,
}: Props) {
  const can = useCan()

  return (
    <AdminLayout
      breadcrumbs={[{ title: "Services", href: adminServices.index().url }]}
    >
      <Head title="Services" />

      <div className="space-y-6 p-4">
        <PageHeader
          title="Services"
          description="What customers can book, and what it costs."
          actions={
            can("services", "create") && (
              <Button asChild>
                <Link
                  href={adminServices.new(
                    filters.service_category_id
                      ? {
                          query: {
                            service_category_id: filters.service_category_id,
                          },
                        }
                      : undefined,
                  )}
                >
                  <Plus /> New service
                </Link>
              </Button>
            )
          }
        />

        <ListFilters
          url={adminServices.index().url}
          filters={filters}
          searchPlaceholder="Search service name…"
          selects={[
            {
              param: "service_category_id",
              label: "Filter by category",
              allLabel: "All categories",
              options: categories.map((category) => ({
                value: String(category.id),
                label: category.name,
              })),
            },
          ]}
        />

        <ResourceTable
          items={services}
          emptyMessage="No services match these filters."
          columns={
            <>
              <TableHead>Service</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead>Display on Homepage</TableHead>
              <TableHead className="text-right">Active</TableHead>
            </>
          }
          renderRow={(service) => (
            <TableRow key={service.id}>
              <TableCell>
                <Link
                  href={adminServices.show(service.id)}
                  className="font-medium hover:underline"
                >
                  {service.name}
                </Link>
              </TableCell>
              <TableCell>
                {can("service_categories", "read") ? (
                  <Link
                    href={adminServiceCategories.show(
                      service.service_category.id,
                    )}
                    className="hover:underline"
                  >
                    {service.service_category.name}
                  </Link>
                ) : (
                  service.service_category.name
                )}
              </TableCell>
              <TableCell className="text-right">
                <ServicePrice
                  price={service.price}
                  salePrice={service.sale_price}
                />
              </TableCell>
              <TableCell>
                <HomePageBadge displayed={service.display_in_home_page} />
              </TableCell>
              <TableCell className="text-right">
                <ActivationSwitch
                  active={service.is_active}
                  name={service.name}
                  action={adminServices.activation(service.id)}
                  disabled={!can("services", "update")}
                />
              </TableCell>
            </TableRow>
          )}
        />

        <Pagination pagination={pagination} noun="services" />
      </div>
    </AdminLayout>
  )
}
