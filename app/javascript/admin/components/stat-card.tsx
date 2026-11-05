import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Card, CardContent } from "@/shared/components/ui/card"

/** Stat tile: a label, one headline value and an optional hint line. */
export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
  icon?: LucideIcon
}) {
  return (
    <Card className="gap-2 py-4">
      <CardContent className="space-y-1 px-4">
        <div className="text-muted-foreground flex items-center justify-between text-sm">
          <span>{label}</span>
          {Icon && <Icon className="size-4" aria-hidden />}
        </div>
        <div className="text-2xl font-semibold tabular-nums">{value}</div>
        {hint && <div className="text-muted-foreground text-xs">{hint}</div>}
      </CardContent>
    </Card>
  )
}
