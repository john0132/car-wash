/** Server-side page info (Website::Paginates#paginate). */
export interface PaginationData {
  page: number
  pages: number
  total: number
  per_page: number
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
