import { Link, usePage } from "@inertiajs/react"
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
import { fullName } from "@/website/features/profile/utils"
import SiteLayout from "@/website/layouts/site-layout"
import { msg, useI18n } from "@/website/lib/i18n"

const TABS = [
  { label: msg("Profile"), route: profile, icon: User },
  { label: msg("My bookings"), route: profileBookings, icon: CalendarCheck },
  { label: msg("My addresses"), route: profileAddresses, icon: MapPin },
  { label: msg("My cars"), route: profileCars, icon: Car },
]

// Shared chrome for the customer account area: header, summary and the tab sidebar.
export default function ProfileLayout({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  const { t } = useI18n()

  const { props, url } = usePage()
  const user = props.auth.user
  const getInitials = useInitials()
  // The account area is behind sign-in (Website::BaseController), so a user is always present.
  const name = user ? fullName(user.name, user.last_name) : ""
  const path = url.split("?")[0]

  return (
    <SiteLayout
      title={title}
      noindex
      mainClassName="mx-auto flex max-w-6xl flex-col gap-10 px-6 pt-14 pb-24"
    >
      <div className="flex items-center gap-5">
        <Avatar className="size-20">
          <AvatarFallback className="font-display bg-pine text-ivory text-3xl">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h1 className="font-display truncate text-4xl leading-tight sm:text-[44px]">
            {name}
          </h1>
          <p className="text-sage mt-1 truncate text-[15px]">{user?.email}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-10">
        <nav
          aria-label={t("My account")}
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
                    ? "bg-pine/10 font-medium"
                    : "text-pine/80 hover:bg-pine/5 hover:text-pine"
                }`}
              >
                <Icon className="size-4" aria-hidden="true" />
                {t(label)}
              </Link>
            )
          })}
        </nav>

        <div className="flex min-w-0 flex-[999_1_34rem] flex-col gap-6">
          {children}
        </div>
      </div>
    </SiteLayout>
  )
}
