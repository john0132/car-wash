import { Head, Link } from "@inertiajs/react"
import { Plus } from "lucide-react"

import { ActivationSwitch } from "@/admin/components/activation-switch"
import { PageHeader } from "@/admin/components/page-header"
import { ResourceTable } from "@/admin/components/resource-table"
import { StatCard } from "@/admin/components/stat-card"
import type { PaymentMethodRow } from "@/admin/features/payments/types"
import { useCan } from "@/admin/hooks/use-can"
import AdminLayout from "@/admin/layouts/admin-layout"
import { formatMoney, formatNumber } from "@/admin/lib/format"
import { adminPaymentMethods } from "@/routes"
import { Button } from "@/shared/components/ui/button"
import { TableCell, TableHead, TableRow } from "@/shared/components/ui/table"

interface Props {
  payment_methods: PaymentMethodRow[]
  stats: { total: number; active: number }
}

export default function PaymentMethodsIndex({ payment_methods, stats }: Props) {
  const can = useCan()
  const canUpdate = can("payment_methods", "update")

  return (
    <AdminLayout
      breadcrumbs={[
        { title: "Payment methods", href: adminPaymentMethods.index().url },
      ]}
    >
      <Head title="Payment methods" />

      <div className="space-y-6 p-4">
        <PageHeader
          title="Payment methods"
          description="How customers can pay. Methods can't be deleted because transactions belong to them; disable them instead."
          actions={
            can("payment_methods", "create") && (
              <Button asChild>
                <Link href={adminPaymentMethods.new()}>
                  <Plus /> New method
                </Link>
              </Button>
            )
          }
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard label="Methods" value={formatNumber(stats.total)} />
          <StatCard label="Active" value={formatNumber(stats.active)} />
        </div>

        <ResourceTable
          items={payment_methods}
          emptyMessage="No payment methods yet."
          columns={
            <>
              <TableHead>Method</TableHead>
              <TableHead>Code</TableHead>
              <TableHead className="text-right">Transactions</TableHead>
              <TableHead className="text-right">Collected</TableHead>
              <TableHead className="text-right">Active</TableHead>
            </>
          }
          renderRow={(method) => (
            <TableRow key={method.id}>
              <TableCell>
                {canUpdate ? (
                  <Link
                    href={adminPaymentMethods.edit(method.id)}
                    className="font-medium hover:underline"
                  >
                    {method.name ?? method.code}
                  </Link>
                ) : (
                  <span className="font-medium">
                    {method.name ?? method.code}
                  </span>
                )}
              </TableCell>
              <TableCell className="font-mono text-xs">{method.code}</TableCell>
              <TableCell className="text-right tabular-nums">
                {formatNumber(method.transactions_count)}
              </TableCell>
              <TableCell className="text-right font-medium tabular-nums">
                {formatMoney(method.revenue)}
              </TableCell>
              <TableCell className="text-right">
                <ActivationSwitch
                  active={method.is_active}
                  name={method.name ?? method.code}
                  action={adminPaymentMethods.activation(method.id)}
                  disabled={!canUpdate}
                />
              </TableCell>
            </TableRow>
          )}
        />
      </div>
    </AdminLayout>
  )
}
