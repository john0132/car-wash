import { Link, usePage } from "@inertiajs/react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar"
import type { NavItem } from "@/shared/types"

export function NavMain({
  items = [],
  label = "Platform",
}: {
  items: NavItem[]
  label?: string
}) {
  const page = usePage()
  const path = page.url.split("?")[0]
  return (
    <SidebarGroup className="px-2 py-0">
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              isActive={item.isActive ?? isCurrent(path, item.href)}
              tooltip={{ children: item.title }}
            >
              <Link href={item.href} prefetch>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

/** True for the item's own page and anything nested under it (e.g. /admin/customers/12). */
function isCurrent(path: string, href: string) {
  return path === href || path.startsWith(`${href}/`)
}
