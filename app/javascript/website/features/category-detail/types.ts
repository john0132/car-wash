import type { HomeImage } from "@/website/features/home-catalog/types"

/** Website::ServiceCategoriesController#category_props */
export interface CategoryDetail {
  id: number
  slug: string
  name: string | null
  seo_title: string | null
  seo_description: string | null
  image: HomeImage | null
}

/** Website::ServiceCategoriesController#service_card_props */
export interface CategoryService {
  id: number
  slug: string
  name: string | null
  price: number
  sale_price: number | null
  duration_minutes: number | null
  image: HomeImage | null
}

export type SortOption = "name" | "price_asc" | "price_desc"

/** Website::ServiceCategoriesController#filter_props: the sanitised query the server applied. */
export interface CategoryFilters {
  q: string | null
  min_price: number | null
  max_price: number | null
  max_duration: number | null
  on_sale: boolean
  sort: SortOption
}

/** Website::ServiceCategoriesController#facet_props: unfiltered ranges of the category. */
export interface CategoryFacets {
  min_price: number | null
  max_price: number | null
  on_sale_count: number
  durations: number[]
}

export interface PaginationData {
  page: number
  pages: number
  total: number
  per_page: number
}
