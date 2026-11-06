import { Head, Link } from "@inertiajs/react"
import { Lock, Plus } from "lucide-react"

import { ListFilters, hasFilters } from "@/admin/components/list-filters"
import { PageHeader } from "@/admin/components/page-header"
import { Pagination } from "@/admin/components/pagination"
import { ResourceTable } from "@/admin/components/resource-table"
import type { RoleFilters, RoleRow } from "@/admin/features/roles/types"
import { useCan } from "@/admin/hooks/use-can"
import AdminLayout from "@/admin/layouts/admin-layout"
import { formatNumber } from "@/admin/lib/format"
import type { Pagination as PaginationData } from "@/admin/types"
import { adminRoles } from "@/routes"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { TableCell, TableHead, TableRow } from "@/shared/components/ui/table"

interface Props {
  roles: RoleRow[]
  filters: RoleFilters
  pagination: PaginationData
}

export default function RolesIndex({ roles, filters, pagination }: Props) {
  const can = useCan()

  return (
    <AdminLayout
      breadcrumbs={[{ title: "Roles", href: adminRoles.index().url }]}
    >
      <Head title="Roles" />

      <div className="space-y-6 p-4">
        <PageHeader
          title="Roles"
          description="Roles bundle permissions. Administrators can do only what their roles allow."
          actions={
            can("roles", "create") && (
              <Button asChild>
                <Link href={adminRoles.new()}>
                  <Plus /> New role
                </Link>
              </Button>
            )
          }
        />

        <ListFilters
          url={adminRoles.index().url}
          filters={filters}
          searchPlaceholder="Search role name…"
          showStatus={false}
        />

        <ResourceTable
          items={roles}
          emptyMessage="No roles yet."
          emptyFilteredMessage="No roles match this search."
          filtered={hasFilters(filters)}
          columns={
            <>
              <TableHead>Role</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Permissions</TableHead>
              <TableHead className="text-right">Administrators</TableHead>
            </>
          }
          renderRow={(role) => (
            <TableRow key={role.id}>
              <TableCell>
                <span className="flex items-center gap-2">
                  <Link
                    href={adminRoles.show(role.id)}
                    className="font-medium hover:underline"
                  >
                    {role.name}
                  </Link>
                  {role.super_admin && (
                    <Badge variant="secondary">
                      <Lock /> System
                    </Badge>
                  )}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground max-w-md truncate">
                {role.description}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatNumber(role.permissions_count)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatNumber(role.administrators_count)}
              </TableCell>
            </TableRow>
          )}
        />

        <Pagination pagination={pagination} noun="roles" />
      </div>
    </AdminLayout>
  )
}
