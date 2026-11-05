import { Link, usePage } from "@inertiajs/react"
import { ChevronRight } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupContent,
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
    <Collapsible defaultOpen className="group/collapsible">
      <SidebarGroup className="px-2 py-0">
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger className="flex w-full items-center">
            {label}
            <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent>
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
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  )
}

/** True for the item's own page and anything nested under it (e.g. /admin/customers/12). */
function isCurrent(path: string, href: string) {
  return path === href || path.startsWith(`${href}/`)
}
