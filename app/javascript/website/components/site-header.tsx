import { Link, usePage } from "@inertiajs/react"

import { settingsProfile, signIn, signUp } from "@/routes"
import { Button } from "@/shared/components/ui/button"
import { Logo } from "@/website/components/brand-mark"

const navLinks = [
  { label: "Services", href: "#services" },
  { label: "Why Us", href: "#why-us" },
  { label: "Membership", href: "#membership" },
]

export function SiteHeader() {
  const { props } = usePage()
  const { auth } = props

  return (
    <header className="sticky top-0 z-40 border-b border-[#2B3A32]/10 bg-[#F6F1E7]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
        <a href="#top" className="shrink-0">
          <Logo />
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm tracking-wide text-[#2B3A32] transition-colors hover:text-[#8A6240]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {auth.user ? (
            <Button
              asChild
              variant="ghost"
              className="text-[#2B3A32] hover:bg-[#2B3A32]/5 hover:text-[#2B3A32]"
            >
              <Link href={settingsProfile()}>Account</Link>
            </Button>
          ) : (
            <Button
              asChild
              variant="ghost"
              className="hidden text-[#2B3A32] hover:bg-[#2B3A32]/5 hover:text-[#2B3A32] sm:inline-flex"
            >
              <Link href={signIn()}>Sign in</Link>
            </Button>
          )}
          <Button
            asChild
            className="rounded-full bg-[#2B3A32] px-5 text-[#F6F1E7] hover:bg-[#1F2B25]"
          >
            <Link href={signUp()}>Book your visit</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
