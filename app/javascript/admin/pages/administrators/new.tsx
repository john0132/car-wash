import { Head } from "@inertiajs/react"

import { PageHeader } from "@/admin/components/page-header"
import { StaffForm } from "@/admin/features/users/components/staff-form"
import type { RoleOption } from "@/admin/features/users/types"
import AdminLayout from "@/admin/layouts/admin-layout"
import { adminAdministrators } from "@/routes"

export default function AdministratorNew({ roles }: { roles: RoleOption[] }) {
  return (
    <AdminLayout
      breadcrumbs={[
        { title: "Administrators", href: adminAdministrators.index().url },
        { title: "New", href: adminAdministrators.new().url },
      ]}
    >
      <Head title="New administrator" />

      <div className="space-y-6 p-4">
        <PageHeader
          title="New administrator"
          description="Pick at least one role, or the account can sign in but do nothing."
        />
        <StaffForm
          user={null}
          roles={roles}
          action={adminAdministrators.create()}
          cancelHref={adminAdministrators.index().url}
          canManageAccess
          submitLabel="Create administrator"
        />
      </div>
    </AdminLayout>
  )
}
