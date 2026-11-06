import type { ListFilterValues } from "@/admin/components/list-filters"

/** Admin::ContactMessagesController#message_props */
export interface ContactMessageRow {
  id: number
  first_name: string
  last_name: string
  full_name: string
  email: string
  phone: string | null
  excerpt: string
  created_at: string
}

export type ContactMessageFilters = ListFilterValues
