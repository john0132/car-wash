import { Head } from "@inertiajs/react"

import { PageHeader } from "@/admin/components/page-header"
import { AreaForm } from "@/admin/features/areas/components/area-form"
import type { CityOption, ReferenceArea } from "@/admin/features/areas/types"
import AdminLayout from "@/admin/layouts/admin-layout"
import type { AdminLanguage, TranslationEntry } from "@/admin/types"
import { adminAreas } from "@/routes"

interface Props {
  city_id: number | null
  translations: TranslationEntry[]
  cities: CityOption[]
  reference_areas: ReferenceArea[]
  languages: AdminLanguage[]
}

export default function AreaNew({
  city_id,
  translations,
  cities,
  reference_areas,
  languages,
}: Props) {
  return (
    <AdminLayout
      breadcrumbs={[
        { title: "Areas", href: adminAreas.index().url },
        { title: "New", href: adminAreas.new().url },
      ]}
    >
      <Head title="New area" />

      <div className="space-y-6 p-4">
        <PageHeader title="New area" />
        <AreaForm
          area={null}
          cityId={city_id}
          translations={translations}
          languages={languages}
          cities={cities}
          referenceAreas={reference_areas}
          action={adminAreas.create()}
          cancelHref={adminAreas.index().url}
          submitLabel="Create area"
        />
      </div>
    </AdminLayout>
  )
}
