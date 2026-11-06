import { Head, Link } from "@inertiajs/react"
import { Lock, Pencil } from "lucide-react"

import { ActiveBadge } from "@/admin/components/active-badge"
import { ConfirmDeleteDialog } from "@/admin/components/confirm-delete-dialog"
import { PageHeader } from "@/admin/components/page-header"
import { PermissionMatrix } from "@/admin/features/roles/components/permission-matrix"
import type {
  PermissionGroup,
  RoleAdministrator,
  RoleDetail,
} from "@/admin/features/roles/types"
import { catalogKeys } from "@/admin/features/roles/utils"
import { useCan, useIsSuperAdmin } from "@/admin/hooks/use-can"
import AdminLayout from "@/admin/layouts/admin-layout"
import { adminAdministrators, adminRoles } from "@/routes"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"

interface Props {
  role: RoleDetail & { permission_keys: string[] }
  catalog: PermissionGroup[]
  administrators_count: number
  /** Null when the viewer can't list administrators. */
  administrators: RoleAdministrator[] | null
}

export default function RoleShow({
  role,
  catalog,
  administrators_count,
  administrators,
}: Props) {
  const can = useCan()
  const isSuperAdmin = useIsSuperAdmin()
  const editable = !role.super_admin || isSuperAdmin
  const deletable = !role.super_admin

  return (
    <AdminLayout
      breadcrumbs={[
        { title: "Roles", href: adminRoles.index().url },
        { title: role.name, href: adminRoles.show(role.id).url },
      ]}
    >
      <Head title={role.name} />

      <div className="space-y-6 p-4">
        <PageHeader
          title={
            <span className="flex items-center gap-3">
              {role.name}
              {role.super_admin && (
                <Badge variant="secondary">
                  <Lock /> System
                </Badge>
              )}
            </span>
          }
          description={role.description ?? "No description"}
          actions={
            <>
              {editable && can("roles", "update") && (
                <Button variant="outline" asChild>
                  <Link href={adminRoles.edit(role.id)}>
                    <Pencil /> Edit
                  </Link>
                </Button>
              )}
              {deletable && can("roles", "delete") && (
                <ConfirmDeleteDialog
                  title={`Delete ${role.name}?`}
                  description={
                    administrators_count > 0
                      ? `${administrators_count} administrator(s) hold this role and will lose the permissions it grants.`
                      : "No administrator holds this role. This permanently deletes it."
                  }
                  action={adminRoles.destroy(role.id)}
                />
              )}
            </>
          }
        />

        {role.super_admin && (
          <p className="text-muted-foreground text-sm">
            The {role.name} role can&apos;t be deleted
            {!isSuperAdmin && " or edited"}, and always holds every permission,
            including ones added later
            {isSuperAdmin && " unless you change that here"}.
          </p>
        )}

        <div className="grid items-start gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Permissions</CardTitle>
              <CardDescription>
                {role.permission_keys.length} of {catalogKeys(catalog).length}{" "}
                permissions granted.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PermissionMatrix
                catalog={catalog}
                value={role.permission_keys}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Administrators</CardTitle>
              <CardDescription>
                {administrators_count === 0
                  ? "No administrator holds this role."
                  : `${administrators_count} administrator(s) hold this role.`}
              </CardDescription>
            </CardHeader>
            {administrators && administrators.length > 0 && (
              <CardContent>
                <ul className="divide-y">
                  {administrators.map((administrator) => (
                    <li
                      key={administrator.id}
                      className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <Link
                          href={adminAdministrators.show(administrator.id)}
                          className="block truncate font-medium hover:underline"
                        >
                          {administrator.full_name}
                        </Link>
                        <span className="text-muted-foreground block truncate text-sm">
                          {administrator.email}
                        </span>
                      </div>
                      <ActiveBadge active={administrator.is_active} />
                    </li>
                  ))}
                </ul>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
