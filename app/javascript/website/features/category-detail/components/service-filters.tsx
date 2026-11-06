import { router } from "@inertiajs/react"
import { Search, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { serviceCategory } from "@/routes"
import { Input } from "@/shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { brandInput, brandSelect } from "@/website/components/brand"
import type {
  CategoryFacets,
  CategoryFilters,
  SortOption,
} from "@/website/features/category-detail/types"
import {
  SORT_LABELS,
  filterQuery,
  hasActiveFilters,
  parsePrice,
} from "@/website/features/category-detail/utils"
import { formatDuration } from "@/website/lib/format"

const DEBOUNCE_MS = 350
const ANY = "any"

/**
 * Search, price range, duration, "on sale" and sort. Every change is a GET to the category
 * page that resets to page 1 and asks Rails for only `services`, `pagination` and `filters`,
 * so the category and facet queries are not repeated. Typing is debounced; the in-flight
 * request is cancelled by the next one (Inertia's default).
 */
export function ServiceFilters({
  slug,
  filters,
  facets,
}: {
  slug: string
  filters: CategoryFilters
  facets: CategoryFacets | undefined
}) {
  const [search, setSearch] = useState(filters.q ?? "")
  const [minPrice, setMinPrice] = useState(filters.min_price?.toString() ?? "")
  const [maxPrice, setMaxPrice] = useState(filters.max_price?.toString() ?? "")
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const latest = useRef(filters)
  // Edits waiting on the debounce, merged so typing in one box doesn't drop another's.
  const pending = useRef<Partial<CategoryFilters>>({})

  useEffect(() => {
    latest.current = filters
  })
  useEffect(() => () => clearTimeout(timer.current), [])

  // Follow the server when the filters change from elsewhere (back/forward, "clear all"),
  // keeping what's typed when it already matches (e.g. a trailing space).
  const serverKey = `${filters.q}|${filters.min_price}|${filters.max_price}`
  const [seenKey, setSeenKey] = useState(serverKey)
  if (seenKey !== serverKey) {
    setSeenKey(serverKey)
    if (search.trim() !== (filters.q ?? "")) setSearch(filters.q ?? "")
    if (parsePrice(minPrice) !== filters.min_price)
      setMinPrice(filters.min_price?.toString() ?? "")
    if (parsePrice(maxPrice) !== filters.max_price)
      setMaxPrice(filters.max_price?.toString() ?? "")
  }

  // Debounced typing replaces the history entry (no one Back-clicks through
  // every keystroke); discrete choices push one, so Back undoes them.
  const visit = (next: CategoryFilters, replace = false) =>
    router.get(serviceCategory(slug).url, filterQuery(next), {
      only: ["services", "pagination", "filters"],
      preserveState: true,
      preserveScroll: true,
      replace,
    })

  const apply = (patch: Partial<CategoryFilters>, delay = 0) => {
    clearTimeout(timer.current)
    pending.current = { ...pending.current, ...patch }
    const run = () => {
      visit({ ...latest.current, ...pending.current }, delay > 0)
      pending.current = {}
    }
    if (delay) timer.current = setTimeout(run, delay)
    else run()
  }

  const clearAll = () => {
    clearTimeout(timer.current)
    pending.current = {}
    setSearch("")
    setMinPrice("")
    setMaxPrice("")
    visit({
      q: null,
      min_price: null,
      max_price: null,
      max_duration: null,
      on_sale: false,
      sort: "name",
    })
  }

  const priceHint = (value: number | null | undefined) =>
    value === null || value === undefined ? "" : String(value)

  const labelClass =
    "text-[11px] font-medium tracking-[0.14em] text-sage uppercase"
  const fieldClass = `${brandInput} [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`
  const triggerClass = brandSelect

  const showOnSale = facets === undefined || facets.on_sale_count > 0

  return (
    <div
      role="search"
      className="border-pine/10 rounded-3xl border bg-white p-4 sm:p-6"
    >
      <div className="relative">
        <Search
          aria-hidden
          className="text-bronze pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2"
        />
        <Input
          type="search"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            apply({ q: event.target.value.trim() || null }, DEBOUNCE_MS)
          }}
          placeholder="Search services"
          aria-label="Search services"
          maxLength={100}
          className={`${brandInput} h-12 ps-12 text-base`}
        />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div className="grid gap-2">
          <span className={labelClass}>Price (EGP)</span>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              value={minPrice}
              placeholder={priceHint(facets?.min_price) || "Min"}
              aria-label="Minimum price"
              onChange={(event) => {
                setMinPrice(event.target.value)
                apply(
                  { min_price: parsePrice(event.target.value) },
                  DEBOUNCE_MS,
                )
              }}
              className={fieldClass}
            />
            <span aria-hidden className="text-sage">
              –
            </span>
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              value={maxPrice}
              placeholder={priceHint(facets?.max_price) || "Max"}
              aria-label="Maximum price"
              onChange={(event) => {
                setMaxPrice(event.target.value)
                apply(
                  { max_price: parsePrice(event.target.value) },
                  DEBOUNCE_MS,
                )
              }}
              className={fieldClass}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <span id="duration-label" className={labelClass}>
            Duration
          </span>
          <Select
            value={filters.max_duration?.toString() ?? ANY}
            onValueChange={(value) =>
              apply({ max_duration: value === ANY ? null : Number(value) })
            }
          >
            <SelectTrigger
              aria-labelledby="duration-label"
              className={triggerClass}
            >
              <SelectValue>
                {filters.max_duration
                  ? `Up to ${formatDuration(filters.max_duration)}`
                  : "Any length"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>Any length</SelectItem>
              {(facets?.durations ?? []).map((minutes) => (
                <SelectItem key={minutes} value={String(minutes)}>
                  Up to {formatDuration(minutes)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <span id="sort-label" className={labelClass}>
            Sort by
          </span>
          <Select
            value={filters.sort}
            onValueChange={(value) => apply({ sort: value as SortOption })}
          >
            <SelectTrigger
              aria-labelledby="sort-label"
              className={triggerClass}
            >
              <SelectValue>{SORT_LABELS[filters.sort]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => (
                <SelectItem key={option} value={option}>
                  {SORT_LABELS[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {(showOnSale || hasActiveFilters(filters)) && (
        <div className="border-pine/10 mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          {showOnSale ? (
            <button
              type="button"
              aria-pressed={filters.on_sale}
              onClick={() => apply({ on_sale: !filters.on_sale })}
              className={`focus-visible:ring-bronze h-9 rounded-full border px-4 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                filters.on_sale
                  ? "border-pine bg-pine text-ivory"
                  : "border-pine/15 text-pine hover:border-pine/40 bg-white"
              }`}
            >
              On sale
            </button>
          ) : (
            <span />
          )}

          {hasActiveFilters(filters) && (
            <button
              type="button"
              onClick={clearAll}
              className="text-bronze flex h-9 items-center gap-1.5 text-sm underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
            >
              <X aria-hidden className="size-4" />
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  )
}
