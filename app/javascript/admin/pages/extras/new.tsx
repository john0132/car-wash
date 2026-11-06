import { Head } from "@inertiajs/react"

import { PageHeader } from "@/admin/components/page-header"
import { ExtraForm } from "@/admin/features/extras/components/extra-form"
import AdminLayout from "@/admin/layouts/admin-layout"
import type { AdminLanguage, TranslationEntry } from "@/admin/types"
import { adminExtras } from "@/routes"

interface Props {
  translations: TranslationEntry[]
  languages: AdminLanguage[]
}

export default function ExtraNew({ translations, languages }: Props) {
  return (
    <AdminLayout
      breadcrumbs={[
        { title: "Extras", href: adminExtras.index().url },
        { title: "New", href: adminExtras.new().url },
      ]}
    >
      <Head title="New extra" />

      <div className="space-y-6 p-4">
        <PageHeader title="New extra" />
        <ExtraForm
          price={null}
          isActive
          translations={translations}
          languages={languages}
          action={adminExtras.create()}
          cancelHref={adminExtras.index().url}
          submitLabel="Create extra"
        />
      </div>
    </AdminLayout>
  )
}
