import { Head, Link } from "@inertiajs/react"
import { Plus } from "lucide-react"

import { PageHeader } from "@/admin/components/page-header"
import { Pagination } from "@/admin/components/pagination"
import { ResourceTable } from "@/admin/components/resource-table"
import type { EmployeeRow } from "@/admin/features/employees/types"
import { ActivationSwitch } from "@/admin/features/users/components/activation-switch"
import { UserIdentity } from "@/admin/features/users/components/user-identity"
import { UserListFilters } from "@/admin/features/users/components/user-list-filters"
import type { UserListFilters as Filters } from "@/admin/features/users/types"
import { useCan } from "@/admin/hooks/use-can"
import AdminLayout from "@/admin/layouts/admin-layout"
import { formatNumber } from "@/admin/lib/format"
import type { Pagination as PaginationData } from "@/admin/types"
import { adminEmployees } from "@/routes"
import { Button } from "@/shared/components/ui/button"
import { TableCell, TableHead, TableRow } from "@/shared/components/ui/table"

interface Props {
  employees: EmployeeRow[]
  filters: Filters
  pagination: PaginationData
}

export default function EmployeesIndex({
  employees,
  filters,
  pagination,
}: Props) {
  const can = useCan()

  return (
    <AdminLayout
      breadcrumbs={[{ title: "Employees", href: adminEmployees.index().url }]}
    >
      <Head title="Employees" />

      <div className="space-y-6 p-4">
        <PageHeader
          title="Employees"
          description="Field staff who carry out bookings."
          actions={
            can("employees", "create") && (
              <Button asChild>
                <Link href={adminEmployees.new()}>
                  <Plus /> New employee
                </Link>
              </Button>
            )
          }
        />

        <UserListFilters url={adminEmployees.index().url} filters={filters} />

        <ResourceTable
          items={employees}
          emptyMessage="No employees match these filters."
          columns={
            <>
              <TableHead>Employee</TableHead>
              <TableHead className="text-right">Open</TableHead>
              <TableHead className="text-right">Completed</TableHead>
              <TableHead className="text-right">Total assigned</TableHead>
              <TableHead className="text-right">Active</TableHead>
            </>
          }
          renderRow={(employee) => (
            <TableRow key={employee.id}>
              <TableCell>
                <UserIdentity
                  user={employee}
                  href={adminEmployees.show(employee.id).url}
                />
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatNumber(employee.open_count)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatNumber(employee.completed_count)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatNumber(employee.assigned_count)}
              </TableCell>
              <TableCell className="text-right">
                <ActivationSwitch
                  active={employee.is_active}
                  name={employee.full_name}
                  action={adminEmployees.activation(employee.id)}
                  disabled={!can("employees", "update")}
                />
              </TableCell>
            </TableRow>
          )}
        />

        <Pagination pagination={pagination} noun="employees" />
      </div>
    </AdminLayout>
  )
}
