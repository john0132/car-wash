import { Head } from "@inertiajs/react"

import { PageHeader } from "@/admin/components/page-header"
import { FooterForm } from "@/admin/features/footer/components/footer-form"
import type {
  ColumnProps,
  FooterTranslations,
  SocialLinkProps,
} from "@/admin/features/footer/types"
import type { LinkOptions } from "@/admin/features/navigation/types"
import { useCan } from "@/admin/hooks/use-can"
import AdminLayout from "@/admin/layouts/admin-layout"
import type { AdminLanguage, ImageValue } from "@/admin/types"
import { adminFooters } from "@/routes"

interface Props {
  footer: { image: ImageValue | null }
  translations: FooterTranslations
  social_links: SocialLinkProps[]
  columns: ColumnProps[]
  options: LinkOptions
  languages: AdminLanguage[]
}

export default function FooterEdit({
  footer,
  translations,
  social_links,
  columns,
  options,
  languages,
}: Props) {
  const can = useCan()

  return (
    <AdminLayout
      breadcrumbs={[{ title: "Footer", href: adminFooters.edit().url }]}
    >
      <Head title="Footer" />

      <div className="space-y-6 p-4">
        <PageHeader
          title="Footer"
          description="The website footer: text, image, social links and columns of links."
        />
        <FooterForm
          footer={footer}
          translations={translations}
          socialLinks={social_links}
          columns={columns}
          options={options}
          languages={languages}
          canUpdate={can("footers", "update")}
        />
      </div>
    </AdminLayout>
  )
}
