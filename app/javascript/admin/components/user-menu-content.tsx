import { Link, router } from "@inertiajs/react"
import { LogOut, Settings } from "lucide-react"

import { adminSignOut, settingsProfile } from "@/routes"
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/shared/components/ui/dropdown-menu"
import { UserInfo } from "@/shared/components/user-info"
import { useMobileNavigation } from "@/shared/hooks/use-mobile-navigation"
import type { User } from "@/shared/types"

interface UserMenuContentProps {
  user: User
}

export function UserMenuContent({ user }: UserMenuContentProps) {
  const cleanup = useMobileNavigation()

  const handleLogout = () => {
    cleanup()
    router.flushAll()
  }

  return (
    <>
      <DropdownMenuLabel className="p-0 font-normal">
        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
          <UserInfo user={user} showEmail={true} />
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem asChild>
          {/* Account settings live in the website app: a plain link forces a full page load. */}
          <a className="block w-full" href={settingsProfile().url}>
            <Settings className="mr-2" />
            Account settings
          </a>
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <Link
          className="block w-full"
          href={adminSignOut()}
          as="button"
          onClick={handleLogout}
        >
          <LogOut className="mr-2" />
          Log out
        </Link>
      </DropdownMenuItem>
    </>
  )
}
