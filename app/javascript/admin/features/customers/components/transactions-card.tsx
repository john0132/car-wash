import type { CustomerTransaction } from "@/admin/features/customers/types"
import { formatDate, formatMoney, humanize } from "@/admin/lib/format"
import { Badge } from "@/shared/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
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

export function TransactionsCard({
  transactions,
}: {
  transactions: CustomerTransaction[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent payments</CardTitle>
        <CardDescription>
          Last 10 transactions, including wallet top-ups.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-muted-foreground text-sm">No payments yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>For</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="tabular-nums">
                    {formatDate(transaction.created_at)}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {transaction.reference ?? "—"}
                  </TableCell>
                  <TableCell>
                    {transaction.booking_id
                      ? `Booking #${transaction.booking_id}`
                      : "Wallet top-up"}
                  </TableCell>
                  <TableCell>{transaction.payment_method}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        transaction.status === "completed"
                          ? "secondary"
                          : transaction.status === "failed"
                            ? "destructive"
                            : "outline"
                      }
                    >
                      {humanize(transaction.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatMoney(transaction.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
