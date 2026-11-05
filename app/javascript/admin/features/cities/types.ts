import type { ListFilterValues } from "@/admin/components/list-filters"
import type { TranslationEntry } from "@/admin/components/translation-fields"

/** Admin::CitiesController#city_props */
export interface CityDetail {
  id: number
  name: string
  is_active: boolean
  translations: TranslationEntry[]
  created_at: string
}

export interface CityRow extends CityDetail {
  areas_count: number
}

export type CityFilters = ListFilterValues
