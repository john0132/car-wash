import { Link } from "@inertiajs/react"

import type { ManagedUser } from "@/admin/features/users/types"
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar"
import { useInitials } from "@/shared/hooks/use-initials"

/** Avatar + name + email. Links to `href` when given. */
export function UserIdentity({
  user,
  href,
  size = "default",
}: {
  user: Pick<ManagedUser, "full_name" | "email">
  href?: string
  size?: "default" | "lg"
}) {
  const getInitials = useInitials()
  const name = href ? (
    <Link href={href} className="font-medium hover:underline">
      {user.full_name}
    </Link>
  ) : (
    <span className="font-medium">{user.full_name}</span>
  )

  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar size={size}>
        <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
      </Avatar>
      <div
        className={
          size === "lg"
            ? "grid text-base leading-tight"
            : "grid text-sm leading-tight"
        }
      >
        <span className="truncate">{name}</span>
        <span className="text-muted-foreground truncate text-xs">
          {user.email}
        </span>
      </div>
    </div>
  )
}
