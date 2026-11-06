import { Head } from "@inertiajs/react"

import { PageHeader } from "@/admin/components/page-header"
import { ServiceCategoryForm } from "@/admin/features/services/components/service-category-form"
import type {
  ServiceCategoryDetail,
  ServiceCategoryTranslationEntry,
} from "@/admin/features/services/types"
import AdminLayout from "@/admin/layouts/admin-layout"
import type { AdminLanguage } from "@/admin/types"
import { adminServiceCategories } from "@/routes"

interface Props {
  service_category: ServiceCategoryDetail
  translations: ServiceCategoryTranslationEntry[]
  languages: AdminLanguage[]
}

export default function ServiceCategoryEdit({
  service_category: category,
  translations,
  languages,
}: Props) {
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
        { title: "Edit", href: adminServiceCategories.edit(category.id).url },
      ]}
    >
      <Head title={`Edit ${category.name}`} />

      <div className="space-y-6 p-4">
        <PageHeader title={`Edit ${category.name}`} />
        <ServiceCategoryForm
          key={category.id}
          category={category}
          translations={translations}
          languages={languages}
          action={adminServiceCategories.update(category.id)}
          cancelHref={adminServiceCategories.show(category.id).url}
          submitLabel="Save changes"
        />
      </div>
    </AdminLayout>
  )
}
