import { Head, Link, usePage } from "@inertiajs/react"

import {
  websiteSessions as sessionsRoutes,
  websiteSettingsSessions,
} from "@/routes"
import HeadingSmall from "@/shared/components/heading-small"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import type { BreadcrumbItem, Session } from "@/shared/types"
import AppLayout from "@/website/layouts/app-layout"
import SettingsLayout from "@/website/layouts/settings-layout"

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Sessions",
    href: websiteSettingsSessions.index().url,
  },
]

interface SessionsProps {
  sessions: Session[]
}

export default function Sessions({ sessions }: SessionsProps) {
  const { auth } = usePage().props

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={breadcrumbs[breadcrumbs.length - 1].title} />

      <SettingsLayout>
        <div className="space-y-6">
          <HeadingSmall
            title="Sessions"
            description="Manage your active sessions across devices"
          />

          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex flex-col space-y-2 rounded-lg border p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">
                      {session.user_agent}
                      {session.id === auth.session.id && (
                        <Badge variant="secondary" className="ml-2">
                          Current
                        </Badge>
                      )}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      IP: {session.ip_address}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Active since:{" "}
                      {new Date(session.created_at).toLocaleString()}
                    </p>
                  </div>
                  {session.id !== auth.session.id && (
                    <Button variant="destructive" asChild>
                      <Link
                        href={sessionsRoutes.destroy(session.id)}
                        as="button"
                      >
                        Log out
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </SettingsLayout>
    </AppLayout>
  )
}
