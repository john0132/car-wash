import { Head, Link } from "@inertiajs/react"
import { Coins, Pencil, Sparkles, Users } from "lucide-react"

import { ActivationSwitch } from "@/admin/components/activation-switch"
import { ActiveBadge } from "@/admin/components/active-badge"
import { Detail } from "@/admin/components/detail"
import { PageHeader } from "@/admin/components/page-header"
import { StatCard } from "@/admin/components/stat-card"
import { TranslationsCard } from "@/admin/components/translations-card"
import { MembershipBadge } from "@/admin/features/customers/components/membership-badge"
import type {
  MembershipCustomer,
  MembershipDetail,
  MembershipShowStats,
  MembershipTranslation,
} from "@/admin/features/memberships/types"
import { useCan } from "@/admin/hooks/use-can"
import AdminLayout from "@/admin/layouts/admin-layout"
import { formatCompact, formatDate, formatNumber } from "@/admin/lib/format"
import { adminCustomers, adminMemberships } from "@/routes"
import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"

interface Props {
  membership: MembershipDetail & { created_at: string; updated_at: string }
  translations: MembershipTranslation[]
  stats: MembershipShowStats
  customers: MembershipCustomer[]
}

export default function MembershipShow({
  membership,
  translations,
  stats,
  customers,
}: Props) {
  const can = useCan()
  const canUpdate = can("memberships", "update")
  const name = membership.name ?? `Membership #${membership.id}`

  return (
    <AdminLayout
      breadcrumbs={[
        { title: "Memberships", href: adminMemberships.index().url },
        { title: name, href: adminMemberships.show(membership.id).url },
      ]}
    >
      <Head title={name} />

      <div className="space-y-6 p-4">
        <PageHeader
          title={
            <span className="flex items-center gap-3">
              {name}
              {!canUpdate && <ActiveBadge active={membership.is_active} />}
            </span>
          }
          description={
            <span className="inline-flex items-center gap-2">
              Membership #{membership.id}
              <MembershipBadge membership={membership} />
            </span>
          }
          actions={
            canUpdate && (
              <>
                <ActivationSwitch
                  active={membership.is_active}
                  name={name}
                  action={adminMemberships.activation(membership.id)}
                  label="Active"
                />
                <Button variant="outline" asChild>
                  <Link href={adminMemberships.edit(membership.id)}>
                    <Pencil /> Edit
                  </Link>
                </Button>
              </>
            )
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Customers"
            icon={Users}
            value={formatNumber(stats.customers_count)}
            hint={`${formatNumber(stats.active_customers_count)} active`}
          />
          <StatCard
            label="Points balance"
            icon={Coins}
            value={formatCompact(stats.points)}
            hint="Held by members now"
          />
          <StatCard
            label="Points earned"
            icon={Sparkles}
            value={formatCompact(stats.lifetime_points)}
            hint="All-time, all members"
          />
          <StatCard
            label="Earn rate"
            icon={Coins}
            value={`${membership.egp_to_points} pts / EGP`}
            hint={`1 point = ${membership.points_to_egp} EGP`}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3 text-sm">
                <Detail label="Colors">
                  <span className="font-mono text-xs">
                    {membership.background_color} on {membership.text_color}
                  </span>
                </Detail>
                <Detail label="Created">
                  {formatDate(membership.created_at)}
                </Detail>
                <Detail label="Last updated">
                  {formatDate(membership.updated_at)}
                </Detail>
              </dl>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Top members</CardTitle>
            </CardHeader>
            <CardContent className="px-2">
              {customers.length === 0 ? (
                <p className="text-muted-foreground py-10 text-center text-sm">
                  No customers on this tier yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead className="text-right">Points</TableHead>
                      <TableHead className="text-right">Earned</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <Link
                            href={adminCustomers.show(customer.id)}
                            className="font-medium hover:underline"
                          >
                            {customer.full_name}
                          </Link>
                          <div className="text-muted-foreground text-xs">
                            {customer.email}
                          </div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatNumber(customer.points)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatNumber(customer.lifetime_points)}
                        </TableCell>
                        <TableCell className="text-right">
                          <ActiveBadge active={customer.is_active} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <TranslationsCard
          translations={translations}
          columns={[
            { key: "name", label: "Name" },
            { key: "description", label: "Description", long: true },
          ]}
        />
      </div>
    </AdminLayout>
  )
}
