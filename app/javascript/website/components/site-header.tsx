import { Link, usePage } from "@inertiajs/react"
import { User } from "lucide-react"

import { profile, root, services, signIn } from "@/routes"
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar"
import { Button } from "@/shared/components/ui/button"
import { useInitials } from "@/shared/hooks/use-initials"
import { Logo } from "@/website/components/brand-mark"
import { HeaderNavItem } from "@/website/components/header-nav-item"
import { LanguageSwitcher } from "@/website/components/language-switcher"
import type { SiteSharedProps } from "@/website/features/site-chrome/types"
import { useI18n } from "@/website/lib/i18n"

export function SiteHeader() {
  const { t } = useI18n()

  const { props } = usePage<SiteSharedProps>()
  const { auth, site } = props
  const getInitials = useInitials()

  return (
    <header className="border-pine/10 bg-ivory/95 sticky top-0 z-40 border-b backdrop-blur-sm">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href={root()} className="shrink-0">
          <Logo compact />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {site.header.items.map((link) => (
            <HeaderNavItem key={link.id} link={link} />
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher className="max-sm:hidden" />
          {auth.user ? (
            <Link
              href={profile()}
              aria-label={t("My profile")}
              title={auth.user.name}
              className="focus-visible:ring-pine/40 rounded-full focus-visible:ring-2 focus-visible:outline-none"
            >
              <Avatar className="border-pine/15 size-10 border">
                <AvatarFallback className="bg-pine text-ivory text-sm">
                  {getInitials(auth.user.name)}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="text-pine hover:bg-pine/5 hover:text-pine size-10 rounded-full"
            >
              <Link href={signIn()} aria-label={t("Log in or register")}>
                <User className="size-5" />
              </Link>
            </Button>
          )}
          <Button
            asChild
            className="bg-pine text-ivory hover:bg-pine-deep rounded-full px-4 sm:px-5"
          >
            <Link href={services()} aria-label={t("Book your visit")}>
              <span className="sm:hidden">{t("Book")}</span>
              <span className="max-sm:hidden">{t("Book your visit")}</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
