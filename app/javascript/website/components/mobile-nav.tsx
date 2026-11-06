import { Link, router, usePage } from "@inertiajs/react"
import { ChevronDown, Menu, User, X } from "lucide-react"
import { useEffect, useId, useState } from "react"

import { profile, services, signIn } from "@/routes"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet"
import { LanguageSwitcher } from "@/website/components/language-switcher"
import { SiteLinkAnchor } from "@/website/features/site-chrome/site-link"
import type {
  SiteLink,
  SiteSharedProps,
} from "@/website/features/site-chrome/types"
import { useI18n } from "@/website/lib/i18n"

const itemClass =
  "text-pine hover:text-bronze block flex-1 py-3 text-base transition-colors"

/** One level of the menu; items with children get an expand button. */
function NavList({ links, depth = 0 }: { links: SiteLink[]; depth?: number }) {
  return (
    <ul className={depth > 0 ? "border-pine/10 ms-2 border-s ps-4" : ""}>
      {links.map((link) => (
        <NavEntry key={link.id} link={link} depth={depth} />
      ))}
    </ul>
  )
}

function NavEntry({ link, depth }: { link: SiteLink; depth: number }) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const children = link.children ?? []

  return (
    <li>
      <div className="flex items-center">
        <SiteLinkAnchor
          link={link}
          className={`${itemClass} ${depth === 0 ? "font-medium" : "text-[15px]"}`}
        />
        {children.length > 0 && (
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={t("{name} submenu", { name: link.label })}
            onClick={() => setOpen((value) => !value)}
            className="text-pine/70 hover:text-bronze focus-visible:ring-bronze grid size-11 place-items-center rounded-full focus-visible:ring-2 focus-visible:outline-none"
          >
            <ChevronDown
              aria-hidden
              className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </div>
      {children.length > 0 && (
        <div id={panelId} hidden={!open}>
          <NavList links={children} depth={depth + 1} />
        </div>
      )}
    </li>
  )
}

/**
 * The header navigation below the `md` breakpoint: a menu button that opens a
 * side sheet (on the reading-start side) with the same links as the desktop
 * header, the account link, the booking button and the language switcher.
 */
export function MobileNav() {
  const { t, locale } = useI18n()
  const { auth, site } = usePage<SiteSharedProps>().props
  const [open, setOpen] = useState(false)

  // Close after any navigation (a link inside the sheet, or the browser's back button).
  useEffect(() => router.on("navigate", () => setOpen(false)), [])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={t("Open menu")}
          className="text-pine hover:bg-pine/5 focus-visible:ring-bronze -ms-2 grid size-10 place-items-center rounded-full focus-visible:ring-2 focus-visible:outline-none md:hidden"
        >
          <Menu className="size-5" aria-hidden />
        </button>
      </SheetTrigger>
      <SheetContent
        side={locale.dir === "rtl" ? "right" : "left"}
        showCloseButton={false}
        className="bg-ivory text-pine w-[86%] max-w-sm gap-0 p-0"
      >
        <div className="border-pine/10 flex h-20 items-center justify-between border-b px-5">
          <SheetTitle className="font-display text-xl font-normal">
            {t("Menu")}
          </SheetTitle>
          <SheetDescription className="sr-only">
            {t("Site navigation")}
          </SheetDescription>
          <SheetClose asChild>
            <button
              type="button"
              aria-label={t("Close")}
              className="text-pine hover:bg-pine/5 focus-visible:ring-bronze -me-2 grid size-10 place-items-center rounded-full focus-visible:ring-2 focus-visible:outline-none"
            >
              <X className="size-5" aria-hidden />
            </button>
          </SheetClose>
        </div>

        <nav
          aria-label={t("Site navigation")}
          className="flex-1 overflow-y-auto px-5 py-3"
        >
          <NavList links={site.header.items} />
        </nav>

        <div className="border-pine/10 flex flex-col gap-4 border-t p-5">
          <Link
            href={services()}
            className="bg-pine text-ivory hover:bg-pine-deep focus-visible:ring-bronze rounded-full px-6 py-3 text-center text-sm font-medium focus-visible:ring-2 focus-visible:outline-none"
          >
            {t("Book your visit")}
          </Link>
          <Link
            href={auth.user ? profile() : signIn()}
            className="text-pine hover:text-bronze flex items-center gap-2 text-sm"
          >
            <User className="size-4" aria-hidden />
            {auth.user ? t("My profile") : t("Log in or register")}
          </Link>
          <LanguageSwitcher />
        </div>
      </SheetContent>
    </Sheet>
  )
}
