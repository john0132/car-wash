import { Link, usePage } from "@inertiajs/react"
import { User } from "lucide-react"

import { profile, services, signIn } from "@/routes"
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar"
import { Button } from "@/shared/components/ui/button"
import { useInitials } from "@/shared/hooks/use-initials"
import { Logo } from "@/website/components/brand-mark"
import { HeaderNavItem } from "@/website/components/header-nav-item"
import type { SiteSharedProps } from "@/website/features/site-chrome/types"

export function SiteHeader() {
  const { props } = usePage<SiteSharedProps>()
  const { auth, site } = props
  const getInitials = useInitials()

  return (
    <header className="sticky top-0 z-40 border-b border-[#2B3A32]/10 bg-[#F6F1E7]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
        <a href="/" className="shrink-0">
          <Logo />
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {site.header.items.map((link) => (
            <HeaderNavItem key={link.id} link={link} />
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {auth.user ? (
            <Link
              href={profile()}
              aria-label="My profile"
              title={auth.user.name}
              className="rounded-full focus-visible:ring-2 focus-visible:ring-[#2B3A32]/40 focus-visible:outline-none"
            >
              <Avatar className="size-10 border border-[#2B3A32]/15">
                <AvatarFallback className="bg-[#2B3A32] text-sm text-[#F6F1E7]">
                  {getInitials(auth.user.name)}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="size-10 rounded-full text-[#2B3A32] hover:bg-[#2B3A32]/5 hover:text-[#2B3A32]"
            >
              <Link href={signIn()} aria-label="Log in or register">
                <User className="size-5" />
              </Link>
            </Button>
          )}
          <Button
            asChild
            className="rounded-full bg-[#2B3A32] px-5 text-[#F6F1E7] hover:bg-[#1F2B25]"
          >
            <Link href={services()}>Book your visit</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
