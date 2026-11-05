import type { PropsWithChildren } from "react"

import { AppSidebar } from "@/admin/components/app-sidebar"
import { AppSidebarHeader } from "@/admin/components/app-sidebar-header"
import { AppContent } from "@/shared/components/app-content"
import { AppShell } from "@/shared/components/app-shell"
import type { BreadcrumbItem } from "@/shared/types"

export default function AdminSidebarLayout({
  children,
  breadcrumbs = [],
}: PropsWithChildren<{
  breadcrumbs?: BreadcrumbItem[]
}>) {
  return (
    <AppShell variant="sidebar">
      <AppSidebar />
      <AppContent variant="sidebar" className="overflow-x-hidden">
        <AppSidebarHeader breadcrumbs={breadcrumbs} />
        {children}
      </AppContent>
    </AppShell>
  )
}
