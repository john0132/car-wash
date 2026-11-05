import type { RevenueTrendPoint } from "@/admin/features/dashboard/types"
import { formatMoney } from "@/admin/lib/format"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"

const CHART_HEIGHT = 160 // px, matches the h-40 wrapper below

// Parses "YYYY-MM-DD" as a local date, so the label never shifts a day from
// how the backend bucketed it (new Date(isoString) would parse as UTC).
function formatTrendDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number)
  return new Date(year, month - 1, day).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  })
}

/** Daily revenue as a single-hue bar chart — one series, so no legend is needed. */
export function RevenueTrendChart({ points }: { points: RevenueTrendPoint[] }) {
  const max = Math.max(1, ...points.map((point) => point.amount))
  const total = points.reduce((sum, point) => sum + point.amount, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue trend</CardTitle>
        <CardDescription>
          Paid bookings, last {points.length} days · {formatMoney(total)} total
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className="flex h-40 items-end gap-1"
          role="img"
          aria-label={`Daily revenue for the last ${points.length} days, totaling ${formatMoney(total)}`}
        >
          {points.map((point) => {
            const height = Math.round((point.amount / max) * CHART_HEIGHT)
            return (
              <div
                key={point.date}
                className="flex-1"
                title={`${formatTrendDate(point.date)} · ${formatMoney(point.amount)}`}
              >
                <div
                  className="bg-chart-1 mx-auto w-full rounded-t-[4px]"
                  style={{ height: Math.max(height, point.amount > 0 ? 3 : 1) }}
                />
              </div>
            )
          })}
        </div>
        <div className="text-muted-foreground mt-2 flex justify-between text-xs">
          <span>{formatTrendDate(points[0].date)}</span>
          <span>{formatTrendDate(points[points.length - 1].date)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
