import type { ReactNode } from "react"

import { Card, CardContent } from "@/shared/components/ui/card"
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"

/**
 * The Card + empty-state + Table shell repeated across every admin list
 * page. Columns and row content stay page-specific; this only captures the
 * chrome around them. When the list is `filtered` (see hasFilters), an empty
 * result shows `emptyFilteredMessage` instead of `emptyMessage`.
 */
export function ResourceTable<T>({
  items,
  emptyMessage,
  emptyFilteredMessage,
  filtered = false,
  columns,
  renderRow,
}: {
  items: T[]
  emptyMessage: ReactNode
  emptyFilteredMessage?: ReactNode
  filtered?: boolean
  columns: ReactNode
  renderRow: (item: T) => ReactNode
}) {
  return (
    <Card className="py-2">
      <CardContent className="px-2">
        {items.length === 0 ? (
          <p className="text-muted-foreground py-10 text-center text-sm">
            {filtered && emptyFilteredMessage
              ? emptyFilteredMessage
              : emptyMessage}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>{columns}</TableRow>
            </TableHeader>
            <TableBody>{items.map(renderRow)}</TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
