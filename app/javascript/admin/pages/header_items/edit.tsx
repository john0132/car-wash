import { Head } from "@inertiajs/react"

import { PageHeader } from "@/admin/components/page-header"
import { HeaderForm } from "@/admin/features/navigation/components/header-form"
import type { LinkOptions, LinkProps } from "@/admin/features/navigation/types"
import { useCan } from "@/admin/hooks/use-can"
import AdminLayout from "@/admin/layouts/admin-layout"
import type { AdminLanguage } from "@/admin/types"
import { adminHeaderItems } from "@/routes"

interface Props {
  items: LinkProps[]
  options: LinkOptions
  languages: AdminLanguage[]
}

export default function HeaderNavigationEdit({
  items,
  options,
  languages,
}: Props) {
  const can = useCan()

  return (
    <AdminLayout
      breadcrumbs={[{ title: "Header", href: adminHeaderItems.edit().url }]}
    >
      <Head title="Header navigation" />

      <div className="space-y-6 p-4">
        <PageHeader
          title="Header navigation"
          description="The links in the website's header."
        />
        <HeaderForm
          items={items}
          options={options}
          languages={languages}
          canUpdate={can("header_items", "update")}
        />
      </div>
    </AdminLayout>
  )
}
