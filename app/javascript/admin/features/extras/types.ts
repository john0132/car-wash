import type { ListFilterValues } from "@/admin/components/list-filters"
import type { TranslationEntry } from "@/admin/types"

/** Admin::ExtrasController#extra_props */
export interface ExtraDetail {
  id: number
  name: string
  price: number
  is_active: boolean
  translations: TranslationEntry[]
  created_at: string
}

export type ExtraRow = ExtraDetail

export type ExtraFilters = ListFilterValues
