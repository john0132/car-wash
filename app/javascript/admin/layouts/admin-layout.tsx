import type { ReactNode } from "react"

import AdminSidebarLayout from "@/admin/layouts/admin-sidebar-layout"
import type { BreadcrumbItem } from "@/shared/types"

interface AdminLayoutProps {
  children: ReactNode
  breadcrumbs?: BreadcrumbItem[]
}

export default function AdminLayout({
  children,
  breadcrumbs,
  ...props
}: AdminLayoutProps) {
  return (
    <AdminSidebarLayout breadcrumbs={breadcrumbs} {...props}>
      {children}
    </AdminSidebarLayout>
  )
}
