import { Head } from "@inertiajs/react"

import { PageHeader } from "@/admin/components/page-header"
import { FaqForm } from "@/admin/features/faqs/components/faq-form"
import type { FaqDetail, FaqTranslation } from "@/admin/features/faqs/types"
import AdminLayout from "@/admin/layouts/admin-layout"
import type { AdminLanguage } from "@/admin/types"
import { adminFaqs } from "@/routes"

interface Props {
  faq: FaqDetail
  translations: FaqTranslation[]
  languages: AdminLanguage[]
}

export default function FaqNew(props: Props) {
  return (
    <AdminLayout
      breadcrumbs={[
        { title: "FAQs", href: adminFaqs.index().url },
        { title: "New", href: adminFaqs.new().url },
      ]}
    >
      <Head title="New FAQ" />

      <div className="space-y-6 p-4">
        <PageHeader title="New FAQ" />
        <FaqForm
          {...props}
          action={adminFaqs.create()}
          cancelHref={adminFaqs.index().url}
          submitLabel="Create FAQ"
        />
      </div>
    </AdminLayout>
  )
}
