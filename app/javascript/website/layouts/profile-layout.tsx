import { Head, Link, usePage } from "@inertiajs/react"
import { CalendarCheck, Car, MapPin, User } from "lucide-react"
import type { ReactNode } from "react"

import {
  profile,
  profileAddresses,
  profileBookings,
  profileCars,
} from "@/routes"
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar"
import { useInitials } from "@/shared/hooks/use-initials"
import { SiteFooter } from "@/website/components/site-footer"
import { SiteHeader } from "@/website/components/site-header"
import { fullName } from "@/website/features/profile/utils"
import { LIGHT_TOKENS } from "@/website/lib/light-theme"

const TABS = [
  { label: "Profile", route: profile, icon: User },
  { label: "My bookings", route: profileBookings, icon: CalendarCheck },
  { label: "My addresses", route: profileAddresses, icon: MapPin },
  { label: "My cars", route: profileCars, icon: Car },
]

interface AuthUser {
  name: string
  last_name: string | null
  email: string
}

// Shared chrome for the customer account area: header, summary and the tab sidebar.
export default function ProfileLayout({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  const page = usePage<{ auth: { user: AuthUser } }>()
  const { auth } = page.props
  const { url } = page
  const getInitials = useInitials()
  const name = fullName(auth.user.name, auth.user.last_name)
  const path = url.split("?")[0]

  return (
    <>
      <Head title={title}>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Italiana&family=Jost:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div
        style={{ ...LIGHT_TOKENS, fontFamily: "'Jost', system-ui, sans-serif" }}
        className="min-h-svh bg-[#F6F1E7] text-[#2B3A32]"
      >
        <SiteHeader />

        <main className="mx-auto flex max-w-6xl flex-col gap-10 px-6 pt-14 pb-24">
          <div className="flex items-center gap-5">
            <Avatar className="size-20">
              <AvatarFallback
                style={{ fontFamily: "'Italiana', serif" }}
                className="bg-[#2B3A32] text-3xl text-[#F6F1E7]"
              >
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h1
                style={{ fontFamily: "'Italiana', serif" }}
                className="truncate text-4xl leading-tight sm:text-[44px]"
              >
                {name}
              </h1>
              <p className="mt-1 truncate text-[15px] text-[#5B6B5E]">
                {auth.user.email}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-start gap-10">
            <nav
              aria-label="My account"
              className="flex w-full shrink-0 flex-row flex-wrap gap-1 lg:sticky lg:top-28 lg:w-56 lg:flex-col"
            >
              {TABS.map(({ label, route, icon: Icon }) => {
                const active = path === route().url
                return (
                  <Link
                    key={label}
                    href={route()}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-2.5 rounded-[10px] px-3.5 py-2.5 text-[15px] ${
                      active
                        ? "bg-[#2B3A32]/10 font-medium"
                        : "text-[#2B3A32]/70 hover:bg-[#2B3A32]/5 hover:text-[#2B3A32]"
                    }`}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {label}
                  </Link>
                )
              })}
            </nav>

            <div className="flex min-w-0 flex-[999_1_34rem] flex-col gap-6">
              {children}
            </div>
          </div>
        </main>

        <SiteFooter />
      </div>
    </>
  )
}
