import { Head } from "@inertiajs/react"

import { PageHeader } from "@/admin/components/page-header"
import { ComponentForm } from "@/admin/features/components/components/component-form"
import type {
  ComponentDetail,
  ComponentTranslation,
} from "@/admin/features/components/types"
import AdminLayout from "@/admin/layouts/admin-layout"
import type { AdminLanguage } from "@/admin/types"
import { adminComponents } from "@/routes"

interface Props {
  component: ComponentDetail
  translations: ComponentTranslation[]
  languages: AdminLanguage[]
}

export default function ComponentNew(props: Props) {
  return (
    <AdminLayout
      breadcrumbs={[
        { title: "Components", href: adminComponents.index().url },
        { title: "New", href: adminComponents.new().url },
      ]}
    >
      <Head title="New component" />

      <div className="space-y-6 p-4">
        <PageHeader title="New component" />
        <ComponentForm
          {...props}
          action={adminComponents.create()}
          cancelHref={adminComponents.index().url}
          submitLabel="Create component"
        />
      </div>
    </AdminLayout>
  )
}
