import { Head, Link } from "@inertiajs/react"
import { Pencil, Plus } from "lucide-react"

import { ActivationSwitch } from "@/admin/components/activation-switch"
import { ActiveBadge } from "@/admin/components/active-badge"
import { ConfirmDeleteDialog } from "@/admin/components/confirm-delete-dialog"
import { PageHeader } from "@/admin/components/page-header"
import { TranslationsCard } from "@/admin/components/translations-card"
import { ServicePrice } from "@/admin/features/services/components/service-price"
import type {
  ServiceCategoryDetail,
  ServiceSummary,
} from "@/admin/features/services/types"
import { useCan } from "@/admin/hooks/use-can"
import AdminLayout from "@/admin/layouts/admin-layout"
import { pluralize } from "@/admin/lib/format"
import { adminServiceCategories, adminServices } from "@/routes"
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
  service_category: ServiceCategoryDetail
  services: ServiceSummary[]
}

export default function ServiceCategoryShow({
  service_category: category,
  services,
}: Props) {
  const can = useCan()

  return (
    <AdminLayout
      breadcrumbs={[
        {
          title: "Service categories",
          href: adminServiceCategories.index().url,
        },
        {
          title: category.name,
          href: adminServiceCategories.show(category.id).url,
        },
      ]}
    >
      <Head title={category.name} />

      <div className="space-y-6 p-4">
        <PageHeader
          title={
            <span className="flex items-center gap-3">
              {category.name}
              {!can("service_categories", "update") && (
                <ActiveBadge active={category.is_active} />
              )}
            </span>
          }
          actions={
            <>
              {can("service_categories", "update") && (
                <>
                  <ActivationSwitch
                    active={category.is_active}
                    name={category.name}
                    action={adminServiceCategories.activation(category.id)}
                    label="Active"
                  />
                  <Button variant="outline" asChild>
                    <Link href={adminServiceCategories.edit(category.id)}>
                      <Pencil /> Edit
                    </Link>
                  </Button>
                </>
              )}
              {can("service_categories", "delete") && (
                <ConfirmDeleteDialog
                  title={`Delete ${category.name}?`}
                  description={
                    services.length > 0
                      ? `${category.name} still has ${pluralize(services.length, "service")}. Delete or move them first, or disable the category instead.`
                      : "This permanently deletes the category and its translations."
                  }
                  action={adminServiceCategories.destroy(category.id)}
                />
              )}
            </>
          }
        />

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="space-y-1.5">
              <CardTitle>Services</CardTitle>
              <CardDescription>
                {services.length === 0
                  ? "No services in this category yet."
                  : `${pluralize(services.length, "service")}.`}
              </CardDescription>
            </div>
            {can("services", "create") && (
              <Button size="sm" asChild>
                <Link
                  href={adminServices.new({
                    query: { service_category_id: category.id },
                  })}
                >
                  <Plus /> New service
                </Link>
              </Button>
            )}
          </CardHeader>
          {services.length > 0 && (
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        {can("services", "read") ? (
                          <Link
                            href={adminServices.show(service.id)}
                            className="font-medium hover:underline"
                          >
                            {service.name}
                          </Link>
                        ) : (
                          <span className="font-medium">{service.name}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <ServicePrice
                          price={service.price}
                          salePrice={service.sale_price}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <ActiveBadge active={service.is_active} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          )}
        </Card>

        <TranslationsCard
          translations={category.translations}
          columns={[
            { key: "name", label: "Name" },
            { key: "seo_title", label: "SEO title" },
            { key: "seo_description", label: "SEO description", long: true },
          ]}
        />
      </div>
    </AdminLayout>
  )
}
