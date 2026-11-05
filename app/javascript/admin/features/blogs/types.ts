import type { ListFilterValues } from "@/admin/components/list-filters"
import type { ImageValue } from "@/admin/types"

/** Admin::BlogsController#blog_row */
export interface BlogRow {
  id: number
  slug: string
  name: string | null
  title: string | null
  is_active: boolean
  cover_image: ImageValue | null
  languages: string[]
  updated_at: string
}

export type BlogFilters = ListFilterValues

export interface BlogDetail {
  id: number | null
  slug: string
  is_active: boolean
  cover_image: ImageValue | null
  name: string | null
}

/** Admin::ContentTranslations#content_translations_props for blogs. */
export interface BlogTranslation {
  language_id: number
  code: string
  language: string
  default: boolean
  name: string
  title: string
  subtitle: string
  body: string
  seo_title: string
  seo_description: string
  seo_image: ImageValue | null
}
