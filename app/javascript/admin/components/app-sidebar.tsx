import { Link, usePage } from "@inertiajs/react"
import { BookOpen, HardHat, LayoutGrid, ShieldCheck, Users } from "lucide-react"

import { NavFooter } from "@/admin/components/nav-footer"
import { NavMain } from "@/admin/components/nav-main"
import { NavUser } from "@/admin/components/nav-user"
import { useCan } from "@/admin/hooks/use-can"
import {
  adminAdministrators,
  adminCustomers,
  adminDashboard,
  adminEmployees,
} from "@/routes"
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

// Each link shows only when the user holds its "<resource>.read" permission.
const peopleNavItems: (NavItem & { resource: string })[] = [
  {
    title: "Customers",
    href: adminCustomers.index().url,
    icon: Users,
    resource: "customers",
  },
  {
    title: "Employees",
    href: adminEmployees.index().url,
    icon: HardHat,
    resource: "employees",
  },
  {
    title: "Administrators",
    href: adminAdministrators.index().url,
    icon: ShieldCheck,
    resource: "admins",
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
  const { url } = usePage()
  const can = useCan()
  const peopleItems = peopleNavItems.filter((item) =>
    can(item.resource, "read"),
  )

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
        <NavMain
          items={mainNavItems.map((item) => ({
            ...item,
            // /admin prefixes every admin URL, so the dashboard matches exactly.
            isActive: url.split("?")[0] === item.href,
          }))}
        />
        {peopleItems.length > 0 && (
          <NavMain items={peopleItems} label="People" />
        )}
      </SidebarContent>

      <SidebarFooter>
        <NavFooter items={footerNavItems} className="mt-auto" />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
