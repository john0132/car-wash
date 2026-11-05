import { CircleCheck, CircleSlash } from "lucide-react"

import { Badge } from "@/shared/components/ui/badge"

export function ActiveBadge({ active }: { active: boolean }) {
  return active ? (
    <Badge variant="outline" className="text-emerald-700 dark:text-emerald-400">
      <CircleCheck /> Active
    </Badge>
  ) : (
    <Badge variant="outline" className="text-muted-foreground">
      <CircleSlash /> Disabled
    </Badge>
  )
}
