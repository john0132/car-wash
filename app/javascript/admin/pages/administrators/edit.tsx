import { Head } from "@inertiajs/react"

import { PageHeader } from "@/admin/components/page-header"
import { StaffForm } from "@/admin/features/users/components/staff-form"
import type { ManagedUser, RoleOption } from "@/admin/features/users/types"
import AdminLayout from "@/admin/layouts/admin-layout"
import { adminAdministrators } from "@/routes"

interface Props {
  user: ManagedUser & { role_ids: number[] }
  roles: RoleOption[]
  can_manage_access: boolean
}

export default function AdministratorEdit({
  user,
  roles,
  can_manage_access,
}: Props) {
  return (
    <AdminLayout
      breadcrumbs={[
        { title: "Administrators", href: adminAdministrators.index().url },
        { title: user.full_name, href: adminAdministrators.show(user.id).url },
        { title: "Edit", href: adminAdministrators.edit(user.id).url },
      ]}
    >
      <Head title={`Edit ${user.full_name}`} />

      <div className="space-y-6 p-4">
        <PageHeader title={`Edit ${user.full_name}`} />
        <StaffForm
          // Remount after a save so the form picks up the stored values.
          key={user.id}
          user={user}
          roleIds={user.role_ids}
          roles={roles}
          action={adminAdministrators.update(user.id)}
          cancelHref={adminAdministrators.show(user.id).url}
          canManageAccess={can_manage_access}
          submitLabel="Save changes"
        />
      </div>
    </AdminLayout>
  )
}
