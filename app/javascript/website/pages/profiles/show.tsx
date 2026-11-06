import { Head } from "@inertiajs/react"

import { SiteFooter } from "@/website/components/site-footer"
import { SiteHeader } from "@/website/components/site-header"
import { DeleteAccount } from "@/website/features/profile/components/delete-account"
import { DetailsForm } from "@/website/features/profile/components/details-form"
import { DevicesList } from "@/website/features/profile/components/devices-list"
import { PasswordForm } from "@/website/features/profile/components/password-form"
import { ProfileHero } from "@/website/features/profile/components/profile-hero"
import type {
  DeviceSession,
  ProfileData,
} from "@/website/features/profile/types"
import { LIGHT_TOKENS } from "@/website/lib/light-theme"

interface Props {
  profile: ProfileData
  sessions: DeviceSession[]
}

const SECTIONS = [
  { href: "#details", label: "Personal details" },
  { href: "#password", label: "Password" },
  { href: "#devices", label: "Devices" },
  { href: "#delete", label: "Delete account" },
]

export default function ProfileShow({ profile, sessions }: Props) {
  return (
    <>
      <Head title="My profile">
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
        className="bg-[#F6F1E7] text-[#2B3A32]"
      >
        <SiteHeader />

        <main className="mx-auto flex max-w-6xl flex-col gap-10 px-6 pt-14 pb-24">
          <ProfileHero profile={profile} />

          <div className="flex flex-wrap items-start gap-10">
            <nav
              aria-label="Profile sections"
              className="flex w-full shrink-0 flex-row flex-wrap gap-1 lg:sticky lg:top-28 lg:w-52 lg:flex-col"
            >
              {SECTIONS.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className="rounded-[10px] px-3.5 py-2.5 text-[15px] text-[#2B3A32]/70 hover:bg-[#2B3A32]/8 hover:text-[#2B3A32]"
                >
                  {label}
                </a>
              ))}
            </nav>

            <div className="flex min-w-0 flex-[999_1_34rem] flex-col gap-6">
              <DetailsForm profile={profile} />
              <PasswordForm />
              <DevicesList sessions={sessions} />
              <DeleteAccount />
            </div>
          </div>
        </main>

        <SiteFooter />
      </div>
    </>
  )
}
