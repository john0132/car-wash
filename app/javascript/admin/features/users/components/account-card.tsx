import type { ReactNode } from "react"

import { ActiveBadge } from "@/admin/features/users/components/active-badge"
import { UserIdentity } from "@/admin/features/users/components/user-identity"
import type { ManagedUser } from "@/admin/features/users/types"
import { formatDate, formatDateTime } from "@/admin/lib/format"
import { Card, CardContent } from "@/shared/components/ui/card"

/** Identity + basic account facts shown at the top of every user detail page. */
export function AccountCard({
  user,
  lastSeenAt,
  activation,
  children,
}: {
  user: ManagedUser
  lastSeenAt?: string | null
  /** The enable/disable control; omitted when the viewer can't change it. */
  activation?: ReactNode
  /** Extra rows rendered after the defaults. */
  children?: ReactNode
}) {
  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <UserIdentity user={user} size="lg" />
          <ActiveBadge active={user.is_active} />
        </div>
        <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          <Detail label="Joined">{formatDate(user.created_at)}</Detail>
          {lastSeenAt !== undefined && (
            <Detail label="Last active">{formatDateTime(lastSeenAt)}</Detail>
          )}
          {children}
        </dl>
        {activation && (
          <div className="flex items-center justify-between gap-4 border-t pt-4 text-sm">
            <div>
              <div className="font-medium">Account access</div>
              <div className="text-muted-foreground text-xs">
                Disabled accounts are signed out and can&apos;t sign in.
              </div>
            </div>
            {activation}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

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
