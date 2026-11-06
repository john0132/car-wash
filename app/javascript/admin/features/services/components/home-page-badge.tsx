import { House, Minus } from "lucide-react"

import { Badge } from "@/shared/components/ui/badge"

/** Whether a service/category is featured on the public homepage. */
export function HomePageBadge({ displayed }: { displayed: boolean }) {
  return displayed ? (
    <Badge variant="outline" className="text-emerald-700 dark:text-emerald-400">
      <House /> On homepage
    </Badge>
  ) : (
    <Badge variant="outline" className="text-muted-foreground">
      <Minus /> Hidden
    </Badge>
  )
}
