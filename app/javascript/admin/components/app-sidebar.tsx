import { Link, usePage } from "@inertiajs/react"
import {
  Blocks,
  Building2,
  CalendarCheck,
  Car,
  CreditCard,
  Crown,
  FileText,
  FolderTree,
  Gift,
  HardHat,
  HelpCircle,
  KeyRound,
  LayoutGrid,
  Map,
  MessageSquare,
  Newspaper,
  PanelBottom,
  PanelTop,
  Receipt,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react"

import { NavMain } from "@/admin/components/nav-main"
import { NavUser } from "@/admin/components/nav-user"
import { useCan } from "@/admin/hooks/use-can"
import {
  adminAdministrators,
  adminAreas,
  adminBlogs,
  adminBookings,
  adminCars,
  adminCities,
  adminComponents,
  adminContactMessages,
  adminCustomers,
  adminDashboard,
  adminEmployees,
  adminExtras,
  adminFaqs,
  adminFooters,
  adminHeaderItems,
  adminMemberships,
  adminPages,
  adminPaymentMethods,
  adminPaymentTransactions,
  adminRoles,
  adminServiceCategories,
  adminServices,
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
const operationsNavItems: (NavItem & { resource: string })[] = [
  {
    title: "Bookings",
    href: adminBookings.index().url,
    icon: CalendarCheck,
    resource: "bookings",
  },
  {
    title: "Customers",
    href: adminCustomers.index().url,
    icon: Users,
    resource: "customers",
  },
  {
    title: "Cars",
    href: adminCars.index().url,
    icon: Car,
    resource: "cars",
  },
  {
    title: "Contact messages",
    href: adminContactMessages.index().url,
    icon: MessageSquare,
    resource: "contact_messages",
  },
]

const administrationNavItems: (NavItem & { resource: string })[] = [
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
  {
    title: "Roles",
    href: adminRoles.index().url,
    icon: KeyRound,
    resource: "roles",
  },
]

const catalogNavItems: (NavItem & { resource: string })[] = [
  {
    title: "Services",
    href: adminServices.index().url,
    icon: Sparkles,
    resource: "services",
  },
  {
    title: "Service categories",
    href: adminServiceCategories.index().url,
    icon: FolderTree,
    resource: "service_categories",
  },
  {
    title: "Memberships",
    href: adminMemberships.index().url,
    icon: Crown,
    resource: "memberships",
  },
  {
    title: "Extras",
    href: adminExtras.index().url,
    icon: Gift,
    resource: "extras",
  },
]

const locationNavItems: (NavItem & { resource: string })[] = [
  {
    title: "Cities",
    href: adminCities.index().url,
    icon: Building2,
    resource: "cities",
  },
  {
    title: "Areas",
    href: adminAreas.index().url,
    icon: Map,
    resource: "areas",
  },
]

const contentNavItems: (NavItem & { resource: string })[] = [
  {
    title: "Pages",
    href: adminPages.index().url,
    icon: FileText,
    resource: "pages",
  },
  {
    title: "Blog",
    href: adminBlogs.index().url,
    icon: Newspaper,
    resource: "blogs",
  },
  {
    title: "FAQs",
    href: adminFaqs.index().url,
    icon: HelpCircle,
    resource: "faqs",
  },
]

// The website's structure: shared header/footer and the building blocks pages use.
const websiteNavItems: (NavItem & { resource: string })[] = [
  {
    title: "Header",
    href: adminHeaderItems.edit().url,
    icon: PanelTop,
    resource: "header_items",
  },
  {
    title: "Footer",
    href: adminFooters.edit().url,
    icon: PanelBottom,
    resource: "footers",
  },
  {
    title: "Components",
    href: adminComponents.index().url,
    icon: Blocks,
    resource: "components",
  },
]

const paymentNavItems: (NavItem & { resource: string })[] = [
  {
    title: "Transactions",
    href: adminPaymentTransactions.index().url,
    icon: Receipt,
    resource: "payment_transactions",
  },
  {
    title: "Payment methods",
    href: adminPaymentMethods.index().url,
    icon: CreditCard,
    resource: "payment_methods",
  },
]

export function AppSidebar() {
  const { url } = usePage()
  const can = useCan()
  const operationsItems = operationsNavItems.filter((item) =>
    can(item.resource, "read"),
  )

  const administrationItems = administrationNavItems.filter((item) =>
    can(item.resource, "read"),
  )

  const catalogItems = catalogNavItems.filter((item) =>
    can(item.resource, "read"),
  )

  const locationItems = locationNavItems.filter((item) =>
    can(item.resource, "read"),
  )

  const contentItems = contentNavItems.filter((item) =>
    can(item.resource, "read"),
  )

  const websiteItems = websiteNavItems.filter((item) =>
    can(item.resource, "read"),
  )

  const paymentItems = paymentNavItems.filter((item) =>
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
          label="Overview"
        />
        {operationsItems.length > 0 && (
          <NavMain items={operationsItems} label="Operations" />
        )}
        {catalogItems.length > 0 && (
          <NavMain items={catalogItems} label="Catalog" />
        )}
        {locationItems.length > 0 && (
          <NavMain items={locationItems} label="Locations" />
        )}
        {contentItems.length > 0 && (
          <NavMain items={contentItems} label="Content" />
        )}
        {websiteItems.length > 0 && (
          <NavMain items={websiteItems} label="Website" />
        )}
        {paymentItems.length > 0 && (
          <NavMain items={paymentItems} label="Payments" />
        )}
        {administrationItems.length > 0 && (
          <NavMain items={administrationItems} label="Administration" />
        )}
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
