import { Link } from "@inertiajs/react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { type PaginationData, pageWindow } from "@/website/lib/pagination"

const base =
  "flex size-10 items-center justify-center rounded-full border text-sm tabular-nums transition-colors focus-visible:ring-2 focus-visible:ring-bronze focus-visible:outline-none"

/**
 * Numbered page links. `hrefFor` builds each page's URL (so callers keep their
 * filters); `only` limits the Inertia reload to those props. Renders nothing
 * for a single page.
 */
export function Pagination({
  pagination,
  hrefFor,
  only,
}: {
  pagination: PaginationData
  hrefFor: (page: number) => string
  only?: string[]
}) {
  const { page, pages } = pagination
  if (pages <= 1) return null

  const linkProps = { only, preserveScroll: false, preserveState: true }

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
          className={`${base} border-pine/15 text-pine hover:border-pine/40 bg-white`}
        >
          <ChevronLeft aria-hidden className="size-4 rtl:rotate-180" />
        </Link>
      ) : (
        <span aria-hidden className={`${base} border-transparent opacity-30`}>
          <ChevronLeft className="size-4 rtl:rotate-180" />
        </span>
      )}

      {pageWindow(page, pages).map((entry, index) =>
        entry === null ? (
          <span key={`gap-${index}`} aria-hidden className="text-sage px-1">
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
                ? "border-pine bg-pine text-ivory"
                : "border-pine/15 text-pine hover:border-pine/40 bg-white"
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
          className={`${base} border-pine/15 text-pine hover:border-pine/40 bg-white`}
        >
          <ChevronRight aria-hidden className="size-4 rtl:rotate-180" />
        </Link>
      ) : (
        <span aria-hidden className={`${base} border-transparent opacity-30`}>
          <ChevronRight className="size-4 rtl:rotate-180" />
        </span>
      )}
    </nav>
  )
}
