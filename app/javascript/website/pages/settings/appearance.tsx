import { Head } from "@inertiajs/react"

import { settingsAppearance } from "@/routes"
import AppearanceTabs from "@/shared/components/appearance-tabs"
import HeadingSmall from "@/shared/components/heading-small"
import type { BreadcrumbItem } from "@/shared/types"
import AppLayout from "@/website/layouts/app-layout"
import SettingsLayout from "@/website/layouts/settings-layout"

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Appearance settings",
    href: settingsAppearance().url,
  },
]

export default function Appearance() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={breadcrumbs[breadcrumbs.length - 1].title} />

      <SettingsLayout>
        <div className="space-y-6">
          <HeadingSmall
            title="Appearance settings"
            description="Update your account's appearance settings"
          />
          <AppearanceTabs />
        </div>
      </SettingsLayout>
    </AppLayout>
  )
}
