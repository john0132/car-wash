import type { ListFilterValues } from "@/admin/components/list-filters"
import type { SeoTranslationEntry } from "@/admin/components/seo-fields"
import type { ImageValue } from "@/admin/types"

/** Admin::ServiceCategoriesController#category_props */
export interface ServiceCategoryDetail {
  id: number
  name: string
  is_active: boolean
  display_in_home_page: boolean
  image: ImageValue | null
  translations: SeoTranslationEntry[]
  created_at: string
}

export interface ServiceCategoryRow extends ServiceCategoryDetail {
  services_count: number
}

export type ServiceCategoryFilters = ListFilterValues

/** Admin::ServicesController#category_options */
export interface ServiceCategoryOption {
  id: number
  name: string
  is_active: boolean
}

/** Admin::ServiceCategoriesController#service_summary_props */
export interface ServiceSummary {
  id: number
  name: string
  price: number
  sale_price: number | null
  is_active: boolean
}

/** Admin::ServicesController#service_props */
export interface ServiceDetail extends ServiceSummary {
  display_in_home_page: boolean
  image: ImageValue | null
  translations: SeoTranslationEntry[]
  service_category: { id: number; name: string }
  created_at: string
}

export type ServiceFilters = ListFilterValues & {
  service_category_id: number | null
}
