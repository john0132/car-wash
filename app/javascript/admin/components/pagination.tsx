import { Link, usePage } from "@inertiajs/react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import type { Pagination as PaginationData } from "@/admin/types"
import { Button } from "@/shared/components/ui/button"

/** Prev/next links that keep the current query string and swap `param`. */
export function Pagination({
  pagination,
  param = "page",
  noun = "results",
}: {
  pagination: PaginationData
  param?: string
  noun?: string
}) {
  const { url } = usePage()
  const { page, pages, total } = pagination

  const hrefFor = (target: number) => {
    const next = new URL(url, "http://localhost")
    next.searchParams.set(param, String(target))
    return `${next.pathname}${next.search}`
  }

  return (
    <div className="text-muted-foreground flex items-center justify-between gap-4 text-sm">
      <span>
        {total} {noun}
      </span>
      {pages > 1 && (
        <div className="flex items-center gap-2">
          <span>
            Page {page} of {pages}
          </span>
          <Button variant="outline" size="icon" asChild disabled={page <= 1}>
            {page > 1 ? (
              <Link
                href={hrefFor(page - 1)}
                preserveScroll
                aria-label="Previous page"
              >
                <ChevronLeft />
              </Link>
            ) : (
              <span aria-disabled className="pointer-events-none opacity-50">
                <ChevronLeft />
              </span>
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            asChild
            disabled={page >= pages}
          >
            {page < pages ? (
              <Link
                href={hrefFor(page + 1)}
                preserveScroll
                aria-label="Next page"
              >
                <ChevronRight />
              </Link>
            ) : (
              <span aria-disabled className="pointer-events-none opacity-50">
                <ChevronRight />
              </span>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
