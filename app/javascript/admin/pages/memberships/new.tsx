import { Head } from "@inertiajs/react"

import { PageHeader } from "@/admin/components/page-header"
import { MembershipForm } from "@/admin/features/memberships/components/membership-form"
import type {
  MembershipDetail,
  MembershipTranslation,
} from "@/admin/features/memberships/types"
import AdminLayout from "@/admin/layouts/admin-layout"
import type { AdminLanguage } from "@/admin/types"
import { adminMemberships } from "@/routes"

interface Props {
  membership: MembershipDetail
  translations: MembershipTranslation[]
  languages: AdminLanguage[]
}

export default function MembershipNew({
  membership,
  translations,
  languages,
}: Props) {
  return (
    <AdminLayout
      breadcrumbs={[
        { title: "Memberships", href: adminMemberships.index().url },
        { title: "New", href: adminMemberships.new().url },
      ]}
    >
      <Head title="New membership" />

      <div className="space-y-6 p-4">
        <PageHeader title="New membership" />
        <MembershipForm
          membership={membership}
          translations={translations}
          languages={languages}
          action={adminMemberships.create()}
          cancelHref={adminMemberships.index().url}
          submitLabel="Create membership"
        />
      </div>
    </AdminLayout>
  )
}
