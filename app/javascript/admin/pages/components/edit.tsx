import { Head } from "@inertiajs/react"

import { ConfirmDeleteDialog } from "@/admin/components/confirm-delete-dialog"
import { PageHeader } from "@/admin/components/page-header"
import { ComponentForm } from "@/admin/features/components/components/component-form"
import type {
  ComponentDetail,
  ComponentTranslation,
} from "@/admin/features/components/types"
import { useCan } from "@/admin/hooks/use-can"
import AdminLayout from "@/admin/layouts/admin-layout"
import type { AdminLanguage } from "@/admin/types"
import { adminComponents } from "@/routes"

interface Props {
  component: ComponentDetail & { id: number }
  translations: ComponentTranslation[]
  languages: AdminLanguage[]
}

export default function ComponentEdit(props: Props) {
  const { component } = props
  const can = useCan()

  return (
    <AdminLayout
      breadcrumbs={[
        { title: "Components", href: adminComponents.index().url },
        { title: component.name, href: adminComponents.edit(component.id).url },
      ]}
    >
      <Head title={`Edit ${component.name}`} />

      <div className="space-y-6 p-4">
        <PageHeader
          title={component.name}
          description={<span className="font-mono">{component.key}</span>}
          actions={
            can("components", "delete") &&
            !component.in_use && (
              <ConfirmDeleteDialog
                title={`Delete ${component.name}?`}
                description="No pages use this component. Deleting it can't be undone."
                action={adminComponents.destroy(component.id)}
              />
            )
          }
        />
        <ComponentForm
          key={`${component.id}-${JSON.stringify(component.fields)}`}
          {...props}
          action={adminComponents.update(component.id)}
          cancelHref={adminComponents.index().url}
          submitLabel="Save changes"
        />
      </div>
    </AdminLayout>
  )
}
