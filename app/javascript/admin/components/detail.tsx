import type { ReactNode } from "react"

/** A label/value row inside a `<dl>` on detail pages. */
export function Detail({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="space-y-0.5">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}
