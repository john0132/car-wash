import { Head, Link } from "@inertiajs/react"
import { Plus } from "lucide-react"

import { ActivationSwitch } from "@/admin/components/activation-switch"
import { hasFilters } from "@/admin/components/list-filters"
import { PageHeader } from "@/admin/components/page-header"
import { Pagination } from "@/admin/components/pagination"
import { ResourceTable } from "@/admin/components/resource-table"
import type { AdministratorRow } from "@/admin/features/administrators/types"
import { UserIdentity } from "@/admin/features/users/components/user-identity"
import { UserListFilters } from "@/admin/features/users/components/user-list-filters"
import type { UserListFilters as Filters } from "@/admin/features/users/types"
import { useCan } from "@/admin/hooks/use-can"
import AdminLayout from "@/admin/layouts/admin-layout"
import { formatDate } from "@/admin/lib/format"
import type { Pagination as PaginationData } from "@/admin/types"
import { adminAdministrators } from "@/routes"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { TableCell, TableHead, TableRow } from "@/shared/components/ui/table"

interface Props {
  administrators: AdministratorRow[]
  filters: Filters
  pagination: PaginationData
}

export default function AdministratorsIndex({
  administrators,
  filters,
  pagination,
}: Props) {
  const can = useCan()

  return (
    <AdminLayout
      breadcrumbs={[
        { title: "Administrators", href: adminAdministrators.index().url },
      ]}
    >
      <Head title="Administrators" />

      <div className="space-y-6 p-4">
        <PageHeader
          title="Administrators"
          description="Dashboard staff. What each one can do comes from their roles."
          actions={
            can("admins", "create") && (
              <Button asChild>
                <Link href={adminAdministrators.new()}>
                  <Plus /> New administrator
                </Link>
              </Button>
            )
          }
        />

        <UserListFilters
          url={adminAdministrators.index().url}
          filters={filters}
        />

        <ResourceTable
          items={administrators}
          emptyMessage="No administrators yet."
          emptyFilteredMessage="No administrators match these filters."
          filtered={hasFilters(filters)}
          columns={
            <>
              <TableHead>Administrator</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Active</TableHead>
            </>
          }
          renderRow={(admin) => (
            <TableRow key={admin.id}>
              <TableCell>
                <UserIdentity
                  user={admin}
                  href={adminAdministrators.show(admin.id).url}
                />
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {admin.roles.length === 0 ? (
                    <span className="text-muted-foreground text-sm">
                      No roles (no access)
                    </span>
                  ) : (
                    admin.roles.map((role) => (
                      <Badge key={role.id} variant="secondary">
                        {role.name}
                      </Badge>
                    ))
                  )}
                </div>
              </TableCell>
              <TableCell className="tabular-nums">
                {formatDate(admin.created_at)}
              </TableCell>
              <TableCell className="text-right">
                <ActivationSwitch
                  active={admin.is_active}
                  name={admin.full_name}
                  action={adminAdministrators.activation(admin.id)}
                  disabled={!admin.can_manage_access}
                />
              </TableCell>
            </TableRow>
          )}
        />

        <Pagination pagination={pagination} noun="administrators" />
      </div>
    </AdminLayout>
  )
}
