import { Link, usePage } from "@inertiajs/react"

import { websiteSessions } from "@/routes"
import { Button } from "@/shared/components/ui/button"
import {
  ProfileCard,
  SectionHeading,
} from "@/website/features/profile/components/profile-card"
import type { DeviceSession } from "@/website/features/profile/types"
import { describeDevice } from "@/website/features/profile/utils"
import { useI18n } from "@/website/lib/i18n"

export function DevicesList({ sessions }: { sessions: DeviceSession[] }) {
  const { t, formatDate } = useI18n()

  const { auth } = usePage().props

  return (
    <ProfileCard id="devices">
      <div className="flex flex-col gap-5">
        <SectionHeading
          title={t("Devices")}
          description={t("Where you are signed in right now.")}
        />

        <ul className="flex flex-col">
          {sessions.map((session) => {
            const current = session.id === auth.session?.id
            return (
              <li
                key={session.id}
                className="border-pine/10 flex flex-wrap items-center justify-between gap-3 border-t py-4"
              >
                <div>
                  <p className="font-medium">
                    {describeDevice(session.user_agent, t)}
                    {current && (
                      <span className="bg-pine/10 ms-2 rounded-full px-2.5 py-0.5 text-xs font-normal">
                        {t("This device")}
                      </span>
                    )}
                  </p>
                  <p className="text-sage text-sm">
                    {t("{ip} · Signed in {date}", {
                      ip: session.ip_address,
                      date: formatDate(session.created_at, "medium"),
                    })}
                  </p>
                </div>
                {!current && (
                  <Button
                    asChild
                    variant="outline"
                    className="border-pine/30 text-pine hover:bg-pine/5 hover:text-pine h-10 rounded-full bg-transparent px-5"
                  >
                    <Link
                      href={websiteSessions.destroy(session.id)}
                      as="button"
                    >
                      {t("Sign out")}
                    </Link>
                  </Button>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </ProfileCard>
  )
}
