import { Head } from "@inertiajs/react"

import { PageHeader } from "@/admin/components/page-header"
import { ServiceCategoryForm } from "@/admin/features/services/components/service-category-form"
import type { ServiceCategoryTranslationEntry } from "@/admin/features/services/types"
import AdminLayout from "@/admin/layouts/admin-layout"
import type { AdminLanguage } from "@/admin/types"
import { adminServiceCategories } from "@/routes"

interface Props {
  translations: ServiceCategoryTranslationEntry[]
  languages: AdminLanguage[]
}

export default function ServiceCategoryNew({ translations, languages }: Props) {
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
          category={null}
          translations={translations}
          languages={languages}
          action={adminServiceCategories.create()}
          cancelHref={adminServiceCategories.index().url}
          submitLabel="Create category"
        />
      </div>
    </AdminLayout>
  )
}
