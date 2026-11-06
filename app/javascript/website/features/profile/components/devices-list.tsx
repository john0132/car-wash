import { Link, usePage } from "@inertiajs/react"

import { websiteSessions } from "@/routes"
import { Button } from "@/shared/components/ui/button"
import {
  ProfileCard,
  SectionHeading,
} from "@/website/features/profile/components/profile-card"
import type { DeviceSession } from "@/website/features/profile/types"
import { describeDevice, formatDate } from "@/website/features/profile/utils"

export function DevicesList({ sessions }: { sessions: DeviceSession[] }) {
  const { auth } = usePage<{ auth: { session: { id: number } } }>().props

  return (
    <ProfileCard id="devices">
      <div className="flex flex-col gap-5">
        <SectionHeading
          title="Devices"
          description="Where you are signed in right now."
        />

        <ul className="flex flex-col">
          {sessions.map((session) => {
            const current = session.id === auth.session.id
            return (
              <li
                key={session.id}
                className="flex flex-wrap items-center justify-between gap-3 border-t border-[#2B3A32]/10 py-4"
              >
                <div>
                  <p className="font-medium">
                    {describeDevice(session.user_agent)}
                    {current && (
                      <span className="ml-2 rounded-full bg-[#2B3A32]/10 px-2.5 py-0.5 text-xs font-normal">
                        This device
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-[#5B6B5E]">
                    {session.ip_address} · Signed in{" "}
                    {formatDate(session.created_at)}
                  </p>
                </div>
                {!current && (
                  <Button
                    asChild
                    variant="outline"
                    className="h-10 rounded-full border-[#2B3A32]/30 bg-transparent px-5 text-[#2B3A32] hover:bg-[#2B3A32]/5 hover:text-[#2B3A32]"
                  >
                    <Link
                      href={websiteSessions.destroy(session.id)}
                      as="button"
                    >
                      Sign out
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
