import { Head } from "@inertiajs/react"

import { PageHeader } from "@/admin/components/page-header"
import { MembershipForm } from "@/admin/features/memberships/components/membership-form"
import type {
  MembershipDetail,
  MembershipTranslation,
} from "@/admin/features/memberships/types"
import AdminLayout from "@/admin/layouts/admin-layout"
import { adminMemberships } from "@/routes"

interface Props {
  membership: MembershipDetail
  translations: MembershipTranslation[]
}

export default function MembershipEdit({ membership, translations }: Props) {
  const name = membership.name ?? `Membership #${membership.id}`

  return (
    <AdminLayout
      breadcrumbs={[
        { title: "Memberships", href: adminMemberships.index().url },
        { title: name, href: adminMemberships.show(membership.id).url },
        { title: "Edit", href: adminMemberships.edit(membership.id).url },
      ]}
    >
      <Head title={`Edit ${name}`} />

      <div className="space-y-6 p-4">
        <PageHeader title={`Edit ${name}`} />
        <MembershipForm
          key={membership.id}
          membership={membership}
          translations={translations}
          action={adminMemberships.update(membership.id)}
          cancelHref={adminMemberships.show(membership.id).url}
          submitLabel="Save changes"
        />
      </div>
    </AdminLayout>
  )
}
