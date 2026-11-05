import { Head, Link, usePage } from "@inertiajs/react"
import { Plus } from "lucide-react"

import { PageHeader } from "@/admin/components/page-header"
import { Pagination } from "@/admin/components/pagination"
import type { AdministratorRow } from "@/admin/features/administrators/types"
import { ActivationSwitch } from "@/admin/features/users/components/activation-switch"
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
import { Card, CardContent } from "@/shared/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"

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
  const { auth } = usePage().props

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

        <Card className="py-2">
          <CardContent className="px-2">
            {administrators.length === 0 ? (
              <p className="text-muted-foreground py-10 text-center text-sm">
                No administrators match these filters.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Administrator</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {administrators.map((admin) => (
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
                          disabled={
                            !can("admins", "update") ||
                            admin.id === auth.user.id
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Pagination pagination={pagination} noun="administrators" />
      </div>
    </AdminLayout>
  )
}
