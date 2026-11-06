import { Link } from "@inertiajs/react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { serviceCategory } from "@/routes"
import type {
  CategoryFilters,
  PaginationData,
} from "@/website/features/category-detail/types"
import {
  filterQuery,
  pageWindow,
} from "@/website/features/category-detail/utils"

const base =
  "flex size-10 items-center justify-center rounded-full border text-sm tabular-nums transition-colors focus-visible:ring-2 focus-visible:ring-[#8A6240] focus-visible:outline-none"

/** Numbered page links that keep the active filters. Renders nothing for a single page. */
export function CatalogPagination({
  slug,
  filters,
  pagination,
}: {
  slug: string
  filters: CategoryFilters
  pagination: PaginationData
}) {
  const { page, pages } = pagination
  if (pages <= 1) return null

  const hrefFor = (target: number) =>
    serviceCategory(slug, { query: filterQuery(filters, target) }).url
  const linkProps = {
    only: ["services", "pagination", "filters"],
    preserveScroll: false,
    preserveState: true,
  }

  return (
    <nav
      aria-label="Pagination"
      className="mt-12 flex flex-wrap items-center justify-center gap-2"
    >
      {page > 1 ? (
        <Link
          href={hrefFor(page - 1)}
          {...linkProps}
          aria-label="Previous page"
          className={`${base} border-[#2B3A32]/15 bg-white text-[#2B3A32] hover:border-[#2B3A32]/40`}
        >
          <ChevronLeft aria-hidden className="size-4" />
        </Link>
      ) : (
        <span aria-hidden className={`${base} border-transparent opacity-30`}>
          <ChevronLeft className="size-4" />
        </span>
      )}

      {pageWindow(page, pages).map((entry, index) =>
        entry === null ? (
          <span
            key={`gap-${index}`}
            aria-hidden
            className="px-1 text-[#5B6B5E]"
          >
            …
          </span>
        ) : (
          <Link
            key={entry}
            href={hrefFor(entry)}
            {...linkProps}
            aria-label={`Page ${entry}`}
            aria-current={entry === page ? "page" : undefined}
            className={`${base} ${
              entry === page
                ? "border-[#2B3A32] bg-[#2B3A32] text-[#F6F1E7]"
                : "border-[#2B3A32]/15 bg-white text-[#2B3A32] hover:border-[#2B3A32]/40"
            }`}
          >
            {entry}
          </Link>
        ),
      )}

      {page < pages ? (
        <Link
          href={hrefFor(page + 1)}
          {...linkProps}
          aria-label="Next page"
          className={`${base} border-[#2B3A32]/15 bg-white text-[#2B3A32] hover:border-[#2B3A32]/40`}
        >
          <ChevronRight aria-hidden className="size-4" />
        </Link>
      ) : (
        <span aria-hidden className={`${base} border-transparent opacity-30`}>
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  )
}
