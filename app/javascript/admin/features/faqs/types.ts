import type { ListFilterValues } from "@/admin/components/list-filters"

/** Admin::FaqsController#faq_row */
export interface FaqRow {
  id: number
  question: string | null
  sort_order: number
  is_active: boolean
  languages: string[]
  updated_at: string
}

export type FaqFilters = ListFilterValues

export interface FaqDetail {
  id: number | null
  sort_order: number
  is_active: boolean
}

/** Admin::ContentTranslations#content_translations_props for faqs. */
export interface FaqTranslation {
  language_id: number
  code: string
  language: string
  default: boolean
  question: string
  answer: string
}
