import type { ReactNode } from "react"

import type { BreadcrumbItem } from "@/shared/types"
import AppLayoutTemplate from "@/website/layouts/app-header-layout"

interface AppLayoutProps {
  children: ReactNode
  breadcrumbs?: BreadcrumbItem[]
}

export default function AppLayout({
  children,
  breadcrumbs,
  ...props
}: AppLayoutProps) {
  return (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
      {children}
    </AppLayoutTemplate>
  )
}
