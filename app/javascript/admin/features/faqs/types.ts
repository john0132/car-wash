import type { ListFilterValues } from "@/admin/components/list-filters"
import type { TranslationEntry } from "@/admin/types"

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
/** Admin::ContentTranslations#content_translations_props entry. */
export type FaqTranslation = TranslationEntry<"question" | "answer">
