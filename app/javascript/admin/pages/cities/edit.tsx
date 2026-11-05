import { Head } from "@inertiajs/react"

import { PageHeader } from "@/admin/components/page-header"
import type { TranslationEntry } from "@/admin/components/translation-fields"
import { CityForm } from "@/admin/features/cities/components/city-form"
import type { CityDetail } from "@/admin/features/cities/types"
import AdminLayout from "@/admin/layouts/admin-layout"
import { adminCities } from "@/routes"

interface Props {
  city: CityDetail
  translations: TranslationEntry[]
}

export default function CityEdit({ city, translations }: Props) {
  return (
    <AdminLayout
      breadcrumbs={[
        { title: "Cities", href: adminCities.index().url },
        { title: city.name, href: adminCities.show(city.id).url },
        { title: "Edit", href: adminCities.edit(city.id).url },
      ]}
    >
      <Head title={`Edit ${city.name}`} />

      <div className="space-y-6 p-4">
        <PageHeader title={`Edit ${city.name}`} />
        <CityForm
          key={city.id}
          isActive={city.is_active}
          translations={translations}
          action={adminCities.update(city.id)}
          cancelHref={adminCities.show(city.id).url}
          submitLabel="Save changes"
        />
      </div>
    </AdminLayout>
  )
}
