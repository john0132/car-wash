import { Crown } from "lucide-react"

import type { MembershipTier } from "@/admin/features/customers/types"

const hex = (color: string) => (color.startsWith("#") ? color : `#${color}`)

/** The tier's own brand colors; text is always present, so color is never the only cue. */
export function MembershipBadge({
  membership,
}: {
  membership: MembershipTier | null
}) {
  if (!membership) {
    return <span className="text-muted-foreground text-sm">No tier</span>
  }

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: hex(membership.background_color),
        color: hex(membership.text_color),
      }}
    >
      <Crown className="size-3" aria-hidden />
      {membership.name ?? "Member"}
    </span>
  )
}
