import { Head } from "@inertiajs/react"

import { PageHeader } from "@/admin/components/page-header"
import type { SeoTranslationEntry } from "@/admin/components/seo-fields"
import { ServiceForm } from "@/admin/features/services/components/service-form"
import type {
  ServiceCategoryOption,
  ServiceDetail,
} from "@/admin/features/services/types"
import AdminLayout from "@/admin/layouts/admin-layout"
import { adminServices } from "@/routes"

interface Props {
  service: ServiceDetail
  translations: SeoTranslationEntry[]
  categories: ServiceCategoryOption[]
}

export default function ServiceEdit({
  service,
  translations,
  categories,
}: Props) {
  return (
    <AdminLayout
      breadcrumbs={[
        { title: "Services", href: adminServices.index().url },
        { title: service.name, href: adminServices.show(service.id).url },
        { title: "Edit", href: adminServices.edit(service.id).url },
      ]}
    >
      <Head title={`Edit ${service.name}`} />

      <div className="space-y-6 p-4">
        <PageHeader title={`Edit ${service.name}`} />
        <ServiceForm
          key={service.id}
          service={service}
          serviceCategoryId={service.service_category.id}
          translations={translations}
          categories={categories}
          action={adminServices.update(service.id)}
          cancelHref={adminServices.show(service.id).url}
          submitLabel="Save changes"
        />
      </div>
    </AdminLayout>
  )
}
