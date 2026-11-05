import { Link } from "@inertiajs/react"
import { BookOpen, LayoutGrid } from "lucide-react"

import { NavFooter } from "@/admin/components/nav-footer"
import { NavMain } from "@/admin/components/nav-main"
import { NavUser } from "@/admin/components/nav-user"
import { adminDashboard } from "@/routes"
import AppLogo from "@/shared/components/app-logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar"
import type { NavItem } from "@/shared/types"

const mainNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: adminDashboard.index().url,
    icon: LayoutGrid,
  },
]

const footerNavItems: NavItem[] = [
  {
    title: "Documentation",
    href: "https://inertia-rails.dev",
    icon: BookOpen,
  },
]

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={adminDashboard.index()} prefetch>
                <AppLogo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={mainNavItems} />
      </SidebarContent>

      <SidebarFooter>
        <NavFooter items={footerNavItems} className="mt-auto" />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
