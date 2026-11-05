import { Head } from "@inertiajs/react"

import { PageHeader } from "@/admin/components/page-header"
import type { TranslationEntry } from "@/admin/components/translation-fields"
import { AreaForm } from "@/admin/features/areas/components/area-form"
import type { CityOption, ReferenceArea } from "@/admin/features/areas/types"
import AdminLayout from "@/admin/layouts/admin-layout"
import { adminAreas } from "@/routes"

interface Props {
  city_id: number | null
  translations: TranslationEntry[]
  cities: CityOption[]
  reference_areas: ReferenceArea[]
}

export default function AreaNew({
  city_id,
  translations,
  cities,
  reference_areas,
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
