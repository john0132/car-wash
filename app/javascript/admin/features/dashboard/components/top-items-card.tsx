import type { TopItem } from "@/admin/features/dashboard/types"
import { formatMoney } from "@/admin/lib/format"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"

/** Services, extras and packages ranked by revenue, highest first. */
export function TopItemsCard({
  items,
  windowDays,
}: {
  items: TopItem[]
  windowDays: number
}) {
  const max = Math.max(1, ...items.map((item) => item.revenue))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top services & extras</CardTitle>
        <CardDescription>By revenue, last {windowDays} days</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Nothing sold in this window.
          </p>
        ) : (
          items.map((item, index) => {
            const share = Math.round((item.revenue / max) * 100)
            return (
              <div
                key={`${item.type}-${item.name}-${index}`}
                className="space-y-1"
              >
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate">
                    <span className="text-muted-foreground tabular-nums">
                      {index + 1}.
                    </span>{" "}
                    {item.name}
                  </span>
                  <span className="text-muted-foreground shrink-0 tabular-nums">
                    {formatMoney(item.revenue)}
                  </span>
                </div>
                <div className="bg-muted h-2 overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{ width: `${share}%` }}
                  />
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
