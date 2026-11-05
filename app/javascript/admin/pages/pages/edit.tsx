import { Head } from "@inertiajs/react"

import { ConfirmDeleteDialog } from "@/admin/components/confirm-delete-dialog"
import { PageHeader } from "@/admin/components/page-header"
import type { ComponentOption } from "@/admin/features/components/types"
import { PageForm } from "@/admin/features/pages/components/page-form"
import type {
  PageDetail,
  PageTranslation,
  SectionProps,
} from "@/admin/features/pages/types"
import { useCan } from "@/admin/hooks/use-can"
import AdminLayout from "@/admin/layouts/admin-layout"
import type { AdminLanguage } from "@/admin/types"
import { adminPages } from "@/routes"

interface Props {
  page: PageDetail & { id: number }
  translations: PageTranslation[]
  sections: SectionProps[]
  components: ComponentOption[]
  languages: AdminLanguage[]
}

export default function PageEdit(props: Props) {
  const { page } = props
  const can = useCan()
  const name = page.name ?? page.slug

  return (
    <AdminLayout
      breadcrumbs={[
        { title: "Pages", href: adminPages.index().url },
        { title: name, href: adminPages.edit(page.id).url },
      ]}
    >
      <Head title={`Edit ${name}`} />

      <div className="space-y-6 p-4">
        <PageHeader
          title={name}
          description={<span className="font-mono">/{page.slug}</span>}
          actions={
            can("pages", "delete") && (
              <ConfirmDeleteDialog
                title={`Delete ${name}?`}
                description="The page and all of its sections are removed from the website. This can't be undone."
                action={adminPages.destroy(page.id)}
              />
            )
          }
        />
        <PageForm
          // Remount after a save so new sections pick up their ids.
          key={`${page.id}-${props.sections.map((s) => s.id).join(",")}`}
          {...props}
          action={adminPages.update(page.id)}
          cancelHref={adminPages.index().url}
          submitLabel="Save changes"
        />
      </div>
    </AdminLayout>
  )
}
