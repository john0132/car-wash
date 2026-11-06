import { Head } from "@inertiajs/react"

import { ConfirmDeleteDialog } from "@/admin/components/confirm-delete-dialog"
import { PageHeader } from "@/admin/components/page-header"
import { FaqForm } from "@/admin/features/faqs/components/faq-form"
import type { FaqDetail, FaqTranslation } from "@/admin/features/faqs/types"
import { useCan } from "@/admin/hooks/use-can"
import AdminLayout from "@/admin/layouts/admin-layout"
import type { AdminLanguage } from "@/admin/types"
import { adminFaqs } from "@/routes"

interface Props {
  faq: FaqDetail & { id: number }
  translations: FaqTranslation[]
  languages: AdminLanguage[]
}

export default function FaqEdit({ faq, translations, languages }: Props) {
  const can = useCan()
  const defaultQuestion = translations.find((t) => t.default)?.question
  const anyQuestion = translations.find((t) => t.question)?.question
  const title = defaultQuestion ?? anyQuestion ?? `FAQ #${faq.id}`

  return (
    <AdminLayout
      breadcrumbs={[
        { title: "FAQs", href: adminFaqs.index().url },
        { title, href: adminFaqs.edit(faq.id).url },
      ]}
    >
      <Head title={`Edit ${title}`} />

      <div className="space-y-6 p-4">
        <PageHeader
          title={title}
          actions={
            can("faqs", "delete") && (
              <ConfirmDeleteDialog
                title={`Delete this FAQ?`}
                description="This can't be undone."
                action={adminFaqs.destroy(faq.id)}
              />
            )
          }
        />
        <FaqForm
          faq={faq}
          translations={translations}
          languages={languages}
          action={adminFaqs.update(faq.id)}
          cancelHref={adminFaqs.index().url}
          submitLabel="Save changes"
        />
      </div>
    </AdminLayout>
  )
}
