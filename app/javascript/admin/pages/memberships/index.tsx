import { Head, Link } from "@inertiajs/react"
import { Crown, Pencil, Plus, Users } from "lucide-react"

import { PageHeader } from "@/admin/components/page-header"
import { StatCard } from "@/admin/components/stat-card"
import { MembershipBadge } from "@/admin/features/customers/components/membership-badge"
import type {
  MembershipRow,
  MembershipStats,
} from "@/admin/features/memberships/types"
import { ActivationSwitch } from "@/admin/features/users/components/activation-switch"
import { useCan } from "@/admin/hooks/use-can"
import AdminLayout from "@/admin/layouts/admin-layout"
import { formatNumber } from "@/admin/lib/format"
import { adminMemberships } from "@/routes"
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
  memberships: MembershipRow[]
  stats: MembershipStats
}

export default function MembershipsIndex({ memberships, stats }: Props) {
  const can = useCan()
  const canUpdate = can("memberships", "update")

  return (
    <AdminLayout
      breadcrumbs={[
        { title: "Memberships", href: adminMemberships.index().url },
      ]}
    >
      <Head title="Memberships" />

      <div className="space-y-6 p-4">
        <PageHeader
          title="Memberships"
          description="Loyalty tiers customers earn points in. They can't be deleted because customers belong to them; disable them instead."
          actions={
            can("memberships", "create") && (
              <Button asChild>
                <Link href={adminMemberships.new()}>
                  <Plus /> New membership
                </Link>
              </Button>
            )
          }
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Tiers"
            icon={Crown}
            value={formatNumber(stats.total)}
          />
          <StatCard
            label="Active tiers"
            icon={Crown}
            value={formatNumber(stats.active)}
          />
          <StatCard
            label="Members"
            icon={Users}
            value={formatNumber(stats.members)}
            hint="Customers on any tier"
          />
        </div>

        <Card className="py-2">
          <CardContent className="px-2">
            {memberships.length === 0 ? (
              <p className="text-muted-foreground py-10 text-center text-sm">
                No memberships yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tier</TableHead>
                    <TableHead className="text-right">
                      Earns (pts / EGP)
                    </TableHead>
                    <TableHead className="text-right">
                      Point value (EGP)
                    </TableHead>
                    <TableHead className="text-right">Customers</TableHead>
                    <TableHead className="text-right">Active</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {memberships.map((membership) => (
                    <TableRow key={membership.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <Link
                            href={adminMemberships.show(membership.id)}
                            className="hover:underline"
                          >
                            <MembershipBadge membership={membership} />
                          </Link>
                          {membership.description && (
                            <p className="text-muted-foreground max-w-xs truncate text-xs">
                              {membership.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {membership.egp_to_points}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {membership.points_to_egp}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatNumber(membership.customers_count)}
                      </TableCell>
                      <TableCell className="text-right">
                        <ActivationSwitch
                          active={membership.is_active}
                          name={
                            membership.name ?? `membership ${membership.id}`
                          }
                          action={adminMemberships.activation(membership.id)}
                          disabled={!canUpdate}
                        />
                      </TableCell>
                      <TableCell>
                        {canUpdate && (
                          <Button variant="ghost" size="icon" asChild>
                            <Link
                              href={adminMemberships.edit(membership.id)}
                              aria-label={`Edit ${membership.name ?? membership.id}`}
                            >
                              <Pencil />
                            </Link>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
