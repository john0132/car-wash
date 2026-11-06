import { Head } from "@inertiajs/react"

import { PageHeader } from "@/admin/components/page-header"
import { ServiceForm } from "@/admin/features/services/components/service-form"
import type { ServiceTranslationEntry } from "@/admin/features/services/types"
import type { ServiceCategoryOption } from "@/admin/features/services/types"
import AdminLayout from "@/admin/layouts/admin-layout"
import type { AdminLanguage } from "@/admin/types"
import { adminServiceCategories, adminServices } from "@/routes"

interface Props {
  translations: ServiceTranslationEntry[]
  service_category_id: number | null
  categories: ServiceCategoryOption[]
  languages: AdminLanguage[]
}

export default function ServiceNew({
  translations,
  service_category_id: serviceCategoryId,
  categories,
  languages,
}: Props) {
  return (
    <AdminLayout
      breadcrumbs={[
        { title: "Services", href: adminServices.index().url },
        { title: "New", href: adminServices.new().url },
      ]}
    >
      <Head title="New service" />

      <div className="space-y-6 p-4">
        <PageHeader title="New service" />
        <ServiceForm
          service={null}
          serviceCategoryId={serviceCategoryId}
          translations={translations}
          languages={languages}
          categories={categories}
          action={adminServices.create()}
          cancelHref={
            serviceCategoryId
              ? adminServiceCategories.show(serviceCategoryId).url
              : adminServices.index().url
          }
          submitLabel="Create service"
        />
      </div>
    </AdminLayout>
  )
}
