import type {
  CategoryFilters,
  SortOption,
} from "@/website/features/category-detail/types"

export const DEFAULT_SORT: SortOption = "name"

export const SORT_LABELS: Record<SortOption, string> = {
  name: "Name (A–Z)",
  price_asc: "Price: low to high",
  price_desc: "Price: high to low",
}

/** Query params for a filter state: defaults and blanks are left out so URLs stay clean. */
export function filterQuery(
  filters: CategoryFilters,
  page?: number,
): Record<string, string | number> {
  const query: Record<string, string | number> = {}
  if (filters.q) query.q = filters.q
  if (filters.min_price !== null) query.min_price = filters.min_price
  if (filters.max_price !== null) query.max_price = filters.max_price
  if (filters.max_duration !== null) query.max_duration = filters.max_duration
  if (filters.on_sale) query.on_sale = 1
  if (filters.sort !== DEFAULT_SORT) query.sort = filters.sort
  if (page && page > 1) query.page = page
  return query
}

export const hasActiveFilters = (filters: CategoryFilters) =>
  Object.keys(filterQuery(filters)).length > 0

/** A number input's text → a non-negative number, or null when blank/invalid. */
export const parsePrice = (text: string) => {
  const value = Number(text)
  return text.trim() !== "" && Number.isFinite(value) && value >= 0
    ? value
    : null
}

/** Page numbers to show: first, last, and a window around the current one; null is a gap. */
export function pageWindow(page: number, pages: number): (number | null)[] {
  const wanted = new Set(
    [1, pages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= pages),
  )
  const sorted = [...wanted].sort((a, b) => a - b)
  return sorted.flatMap((p, i) =>
    i > 0 && p - sorted[i - 1] > 1 ? [null, p] : [p],
  )
}
