import { Head } from "@inertiajs/react"

import { PageHeader } from "@/admin/components/page-header"
import { RoleForm } from "@/admin/features/roles/components/role-form"
import type { PermissionGroup } from "@/admin/features/roles/types"
import AdminLayout from "@/admin/layouts/admin-layout"
import { adminRoles } from "@/routes"

interface Props {
  permission_keys: string[]
  catalog: PermissionGroup[]
}

export default function RoleNew({ permission_keys, catalog }: Props) {
  return (
    <AdminLayout
      breadcrumbs={[
        { title: "Roles", href: adminRoles.index().url },
        { title: "New", href: adminRoles.new().url },
      ]}
    >
      <Head title="New role" />

      <div className="space-y-6 p-4">
        <PageHeader title="New role" />
        <RoleForm
          name=""
          description={null}
          permissionKeys={permission_keys}
          catalog={catalog}
          action={adminRoles.create()}
          cancelHref={adminRoles.index().url}
          submitLabel="Create role"
        />
      </div>
    </AdminLayout>
  )
}
