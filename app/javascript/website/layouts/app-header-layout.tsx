import type { PropsWithChildren } from "react"

import { AppContent } from "@/shared/components/app-content"
import { AppShell } from "@/shared/components/app-shell"
import type { BreadcrumbItem } from "@/shared/types"
import { AppHeader } from "@/website/components/app-header"

export default function AppHeaderLayout({
  children,
  breadcrumbs,
}: PropsWithChildren<{
  breadcrumbs?: BreadcrumbItem[]
}>) {
  return (
    <AppShell>
      <AppHeader breadcrumbs={breadcrumbs} />
      <AppContent>{children}</AppContent>
    </AppShell>
  )
}
