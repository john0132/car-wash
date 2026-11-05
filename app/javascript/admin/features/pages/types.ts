import type { ListFilterValues } from "@/admin/components/list-filters"
import type { ImageValue } from "@/admin/types"

/** Admin::PagesController#page_row */
export interface PageRow {
  id: number
  slug: string
  name: string | null
  title: string | null
  is_active: boolean
  languages: string[]
  sections_count: number
  updated_at: string
}

export type PageFilters = ListFilterValues

export interface PageDetail {
  id: number | null
  slug: string
  is_active: boolean
  name: string | null
}

/** Admin::ContentTranslations#content_translations_props for pages. */
export interface PageTranslation {
  language_id: number
  code: string
  language: string
  default: boolean
  name: string
  title: string
  subtitle: string
  seo_title: string
  seo_description: string
  seo_image: ImageValue | null
}

/** Any value a component field (or repeater item) can store: plain JSON. */
export type FieldValue =
  | string
  | number
  | boolean
  | null
  | FieldValue[]
  | { [key: string]: FieldValue }

/** A component's stored values, split like ComponentSchema: settings vs per-language content. */
export type FieldValues = Record<string, FieldValue>

/** Admin::PagesController#section_props */
export interface SectionProps {
  id: number
  component_id: number
  is_active: boolean
  settings: FieldValues
  /** By language id. */
  content: Record<number, FieldValues>
  /** signed_id => URL, for previews. */
  image_urls: Record<string, string>
}

/** A section in the page form. `uid` identifies it on the client, including unsaved ones. */
export interface SectionState extends Omit<SectionProps, "id"> {
  uid: string
  id: number | null
}

/** One repeater item in `settings[key]`; its translatable text is in `content[key][_id]`. */
export interface RepeaterItem {
  _id: string
  [key: string]: FieldValue
}
