import { Head } from "@inertiajs/react"

import { PageHeader } from "@/admin/components/page-header"
import type { TranslationEntry } from "@/admin/components/translation-fields"
import { CityForm } from "@/admin/features/cities/components/city-form"
import AdminLayout from "@/admin/layouts/admin-layout"
import { adminCities } from "@/routes"

interface Props {
  translations: TranslationEntry[]
}

export default function CityNew({ translations }: Props) {
  return (
    <AdminLayout
      breadcrumbs={[
        { title: "Cities", href: adminCities.index().url },
        { title: "New", href: adminCities.new().url },
      ]}
    >
      <Head title="New city" />

      <div className="space-y-6 p-4">
        <PageHeader title="New city" />
        <CityForm
          isActive
          translations={translations}
          action={adminCities.create()}
          cancelHref={adminCities.index().url}
          submitLabel="Create city"
        />
      </div>
    </AdminLayout>
  )
}
