import { Head } from "@inertiajs/react"

import { PageHeader } from "@/admin/components/page-header"
import type { SeoTranslationEntry } from "@/admin/components/seo-fields"
import { ServiceCategoryForm } from "@/admin/features/services/components/service-category-form"
import AdminLayout from "@/admin/layouts/admin-layout"
import { adminServiceCategories } from "@/routes"

interface Props {
  translations: SeoTranslationEntry[]
}

export default function ServiceCategoryNew({ translations }: Props) {
  return (
    <AdminLayout
      breadcrumbs={[
        {
          title: "Service categories",
          href: adminServiceCategories.index().url,
        },
        { title: "New", href: adminServiceCategories.new().url },
      ]}
    >
      <Head title="New service category" />

      <div className="space-y-6 p-4">
        <PageHeader title="New service category" />
        <ServiceCategoryForm
          isActive
          translations={translations}
          action={adminServiceCategories.create()}
          cancelHref={adminServiceCategories.index().url}
          submitLabel="Create category"
        />
      </div>
    </AdminLayout>
  )
}
