import type { ReactNode } from "react"

import { Card, CardContent } from "@/shared/components/ui/card"

/** A titled card grouping related form fields. */
export function FormSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <h2 className="font-medium">{title}</h2>
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
        </div>
        {children}
      </CardContent>
    </Card>
  )
}
