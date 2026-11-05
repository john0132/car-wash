import { Head, Link } from "@inertiajs/react"
import { Pencil, Plus } from "lucide-react"

import { PageHeader } from "@/admin/components/page-header"
import { StatCard } from "@/admin/components/stat-card"
import type { PaymentMethodRow } from "@/admin/features/payments/types"
import { ActivationSwitch } from "@/admin/features/users/components/activation-switch"
import { useCan } from "@/admin/hooks/use-can"
import AdminLayout from "@/admin/layouts/admin-layout"
import { formatMoney, formatNumber } from "@/admin/lib/format"
import { adminPaymentMethods } from "@/routes"
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

        <Card className="py-2">
          <CardContent className="px-2">
            {payment_methods.length === 0 ? (
              <p className="text-muted-foreground py-10 text-center text-sm">
                No payment methods yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Method</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead className="text-right">Transactions</TableHead>
                    <TableHead className="text-right">Collected</TableHead>
                    <TableHead className="text-right">Active</TableHead>
                    {canUpdate && <TableHead className="w-12" />}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payment_methods.map((method) => (
                    <TableRow key={method.id}>
                      <TableCell className="font-medium">
                        {method.name ?? "—"}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {method.code}
                      </TableCell>
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
                      {canUpdate && (
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            aria-label={`Edit ${method.name ?? method.code}`}
                          >
                            <Link href={adminPaymentMethods.edit(method.id)}>
                              <Pencil />
                            </Link>
                          </Button>
                        </TableCell>
                      )}
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
