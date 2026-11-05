import { Head } from "@inertiajs/react"

import { PageHeader } from "@/admin/components/page-header"
import { StaffForm } from "@/admin/features/users/components/staff-form"
import AdminLayout from "@/admin/layouts/admin-layout"
import { adminEmployees } from "@/routes"

export default function EmployeeNew() {
  return (
    <AdminLayout
      breadcrumbs={[
        { title: "Employees", href: adminEmployees.index().url },
        { title: "New", href: adminEmployees.new().url },
      ]}
    >
      <Head title="New employee" />

      <div className="space-y-6 p-4">
        <PageHeader title="New employee" />
        <StaffForm
          user={null}
          action={adminEmployees.create()}
          cancelHref={adminEmployees.index().url}
          canManageAccess
          submitLabel="Create employee"
        />
      </div>
    </AdminLayout>
  )
}
