import { Head } from "@inertiajs/react"

import { PageHeader } from "@/admin/components/page-header"
import { AreaForm } from "@/admin/features/areas/components/area-form"
import type {
  AreaDetail,
  CityOption,
  ReferenceArea,
} from "@/admin/features/areas/types"
import AdminLayout from "@/admin/layouts/admin-layout"
import type { AdminLanguage, TranslationEntry } from "@/admin/types"
import { adminAreas } from "@/routes"

interface Props {
  area: AreaDetail
  translations: TranslationEntry[]
  cities: CityOption[]
  reference_areas: ReferenceArea[]
  languages: AdminLanguage[]
}

export default function AreaEdit({
  area,
  translations,
  cities,
  reference_areas,
  languages,
}: Props) {
  return (
    <AdminLayout
      breadcrumbs={[
        { title: "Areas", href: adminAreas.index().url },
        { title: area.name, href: adminAreas.show(area.id).url },
        { title: "Edit", href: adminAreas.edit(area.id).url },
      ]}
    >
      <Head title={`Edit ${area.name}`} />

      <div className="space-y-6 p-4">
        <PageHeader title={`Edit ${area.name}`} />
        <AreaForm
          key={area.id}
          area={area}
          cityId={area.city.id}
          translations={translations}
          languages={languages}
          cities={cities}
          referenceAreas={reference_areas}
          action={adminAreas.update(area.id)}
          cancelHref={adminAreas.show(area.id).url}
          submitLabel="Save changes"
        />
      </div>
    </AdminLayout>
  )
}
