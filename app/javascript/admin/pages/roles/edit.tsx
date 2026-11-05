import { Head } from "@inertiajs/react"

import { PageHeader } from "@/admin/components/page-header"
import { RoleForm } from "@/admin/features/roles/components/role-form"
import type { PermissionGroup, RoleDetail } from "@/admin/features/roles/types"
import AdminLayout from "@/admin/layouts/admin-layout"
import { adminRoles } from "@/routes"

interface Props {
  role: RoleDetail
  permission_keys: string[]
  catalog: PermissionGroup[]
}

export default function RoleEdit({ role, permission_keys, catalog }: Props) {
  return (
    <AdminLayout
      breadcrumbs={[
        { title: "Roles", href: adminRoles.index().url },
        { title: role.name, href: adminRoles.show(role.id).url },
        { title: "Edit", href: adminRoles.edit(role.id).url },
      ]}
    >
      <Head title={`Edit ${role.name}`} />

      <div className="space-y-6 p-4">
        <PageHeader title={`Edit ${role.name}`} />
        <RoleForm
          key={role.id}
          name={role.name}
          description={role.description}
          permissionKeys={permission_keys}
          catalog={catalog}
          action={adminRoles.update(role.id)}
          cancelHref={adminRoles.show(role.id).url}
          submitLabel="Save changes"
        />
      </div>
    </AdminLayout>
  )
}
