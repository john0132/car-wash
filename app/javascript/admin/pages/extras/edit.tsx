import { Head } from "@inertiajs/react"

import { PageHeader } from "@/admin/components/page-header"
import { ExtraForm } from "@/admin/features/extras/components/extra-form"
import type { ExtraDetail } from "@/admin/features/extras/types"
import AdminLayout from "@/admin/layouts/admin-layout"
import type { AdminLanguage, TranslationEntry } from "@/admin/types"
import { adminExtras } from "@/routes"

interface Props {
  extra: ExtraDetail
  translations: TranslationEntry[]
  languages: AdminLanguage[]
}

export default function ExtraEdit({ extra, translations, languages }: Props) {
  return (
    <AdminLayout
      breadcrumbs={[
        { title: "Extras", href: adminExtras.index().url },
        { title: extra.name, href: adminExtras.show(extra.id).url },
        { title: "Edit", href: adminExtras.edit(extra.id).url },
      ]}
    >
      <Head title={`Edit ${extra.name}`} />

      <div className="space-y-6 p-4">
        <PageHeader title={`Edit ${extra.name}`} />
        <ExtraForm
          key={extra.id}
          price={extra.price}
          isActive={extra.is_active}
          translations={translations}
          languages={languages}
          action={adminExtras.update(extra.id)}
          cancelHref={adminExtras.show(extra.id).url}
          submitLabel="Save changes"
        />
      </div>
    </AdminLayout>
  )
}
