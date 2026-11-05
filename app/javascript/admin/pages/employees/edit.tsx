import { Head } from "@inertiajs/react"

import { PageHeader } from "@/admin/components/page-header"
import { StaffForm } from "@/admin/features/users/components/staff-form"
import type { ManagedUser } from "@/admin/features/users/types"
import AdminLayout from "@/admin/layouts/admin-layout"
import { adminEmployees } from "@/routes"

interface Props {
  user: ManagedUser
  can_manage_access: boolean
}

export default function EmployeeEdit({ user, can_manage_access }: Props) {
  return (
    <AdminLayout
      breadcrumbs={[
        { title: "Employees", href: adminEmployees.index().url },
        { title: user.full_name, href: adminEmployees.show(user.id).url },
        { title: "Edit", href: adminEmployees.edit(user.id).url },
      ]}
    >
      <Head title={`Edit ${user.full_name}`} />

      <div className="space-y-6 p-4">
        <PageHeader title={`Edit ${user.full_name}`} />
        <StaffForm
          key={user.id}
          user={user}
          action={adminEmployees.update(user.id)}
          cancelHref={adminEmployees.show(user.id).url}
          canManageAccess={can_manage_access}
          submitLabel="Save changes"
        />
      </div>
    </AdminLayout>
  )
}
