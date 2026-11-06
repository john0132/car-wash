import type { LucideIcon } from "lucide-react"

/** Signed-out visitors get nulls (the website is public); the admin is always signed in. */
export interface Auth {
  user: User | null
  session: Pick<Session, "id"> | null
}

export interface BreadcrumbItem {
  title: string
  href: string
}

export interface NavItem {
  title: string
  href: string
  icon?: LucideIcon | null
  isActive?: boolean
}

export interface FlashData {
  alert?: string
  notice?: string
}

export interface SharedProps {
  auth: Auth
}

/** The fields InertiaController shares for the signed-in user. */
export interface User {
  id: number
  name: string
  last_name: string | null
  email: string
  created_at: string
  updated_at: string
}

export interface Session {
  id: number
  user_agent: string
  ip_address: string
  created_at: string
}
