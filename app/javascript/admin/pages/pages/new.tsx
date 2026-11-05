import { Head } from "@inertiajs/react"

import { PageHeader } from "@/admin/components/page-header"
import type { ComponentOption } from "@/admin/features/components/types"
import { PageForm } from "@/admin/features/pages/components/page-form"
import type {
  PageDetail,
  PageTranslation,
  SectionProps,
} from "@/admin/features/pages/types"
import AdminLayout from "@/admin/layouts/admin-layout"
import type { AdminLanguage } from "@/admin/types"
import { adminPages } from "@/routes"

interface Props {
  page: PageDetail
  translations: PageTranslation[]
  sections: SectionProps[]
  components: ComponentOption[]
  languages: AdminLanguage[]
}

export default function PageNew(props: Props) {
  return (
    <AdminLayout
      breadcrumbs={[
        { title: "Pages", href: adminPages.index().url },
        { title: "New", href: adminPages.new().url },
      ]}
    >
      <Head title="New page" />

      <div className="space-y-6 p-4">
        <PageHeader title="New page" />
        <PageForm
          {...props}
          action={adminPages.create()}
          cancelHref={adminPages.index().url}
          submitLabel="Create page"
        />
      </div>
    </AdminLayout>
  )
}
