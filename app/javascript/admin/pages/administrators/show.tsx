import { Head, Link, usePage } from "@inertiajs/react"
import { Pencil, ShieldCheck } from "lucide-react"

import { ActivationSwitch } from "@/admin/components/activation-switch"
import { PageHeader } from "@/admin/components/page-header"
import type { AssignedRole } from "@/admin/features/administrators/types"
import { AccountCard } from "@/admin/features/users/components/account-card"
import { DeleteUserDialog } from "@/admin/features/users/components/delete-user-dialog"
import type { ManagedUser } from "@/admin/features/users/types"
import { useCan } from "@/admin/hooks/use-can"
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
  administrator: ManagedUser & { last_seen_at: string | null }
  roles: AssignedRole[]
  permissions: string[]
}

export default function AdministratorShow({
  administrator,
  roles,
  permissions,
}: Props) {
  const can = useCan()
  const { auth } = usePage().props
  const isSelf = administrator.id === auth.user?.id

  return (
    <AdminLayout
      breadcrumbs={[
        { title: "Administrators", href: adminAdministrators.index().url },
        {
          title: administrator.full_name,
          href: adminAdministrators.show(administrator.id).url,
        },
      ]}
    >
      <Head title={administrator.full_name} />

      <div className="space-y-6 p-4">
        <PageHeader
          title={administrator.full_name}
          description={`Administrator #${administrator.id}${isSelf ? " · this is you" : ""}`}
          actions={
            <>
              {can("admins", "update") && (
                <Button variant="outline" asChild>
                  <Link href={adminAdministrators.edit(administrator.id)}>
                    <Pencil /> Edit
                  </Link>
                </Button>
              )}
              {can("admins", "delete") && !isSelf && (
                <DeleteUserDialog
                  name={administrator.full_name}
                  action={adminAdministrators.destroy(administrator.id)}
                />
              )}
            </>
          }
        />

        <div className="grid gap-4 lg:grid-cols-2">
          <AccountCard
            user={administrator}
            lastSeenAt={administrator.last_seen_at}
            activation={
              <ActivationSwitch
                active={administrator.is_active}
                name={administrator.full_name}
                action={adminAdministrators.activation(administrator.id)}
                disabled={!can("admins", "update") || isSelf}
              />
            }
          />

          <Card>
            <CardHeader>
              <CardTitle>Effective permissions</CardTitle>
              <CardDescription>
                Everything this administrator can do, combined from all their
                roles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {permissions.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No permissions. Without a role this administrator can sign in
                  but can&apos;t manage anything.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {permissions.map((permission) => (
                    <Badge
                      key={permission}
                      variant="outline"
                      className="font-mono"
                    >
                      {permission}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Roles</CardTitle>
          </CardHeader>
          <CardContent>
            {roles.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No roles assigned.
              </p>
            ) : (
              <ul className="divide-y">
                {roles.map((role) => (
                  <li
                    key={role.id}
                    className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="text-muted-foreground size-4" />
                      {can("roles", "read") ? (
                        <Link
                          href={adminRoles.show(role.id)}
                          className="font-medium hover:underline"
                        >
                          {role.name}
                        </Link>
                      ) : (
                        <span className="font-medium">{role.name}</span>
                      )}
                      <span className="text-muted-foreground text-sm">
                        {role.description}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pl-6">
                      {role.permissions.map((permission) => (
                        <Badge
                          key={permission}
                          variant="secondary"
                          className="font-mono"
                        >
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
