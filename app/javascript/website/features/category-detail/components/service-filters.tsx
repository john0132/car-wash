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
import { formatDuration } from "@/website/features/service-detail/utils"

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

  const visit = (next: CategoryFilters) =>
    router.get(serviceCategory(slug).url, filterQuery(next), {
      only: ["services", "pagination", "filters"],
      preserveState: true,
      preserveScroll: true,
      replace: true,
    })

  const apply = (patch: Partial<CategoryFilters>, delay = 0) => {
    clearTimeout(timer.current)
    pending.current = { ...pending.current, ...patch }
    const run = () => {
      visit({ ...latest.current, ...pending.current })
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

  return (
    <div className="space-y-4" role="search">
      <div className="relative">
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[#5B6B5E]"
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
          className="h-12 rounded-full border-[#2B3A32]/15 bg-white pl-11 text-base"
        />
      </div>

      <div className="flex flex-wrap items-end gap-x-5 gap-y-4">
        <label className="grid gap-1.5 text-xs font-medium tracking-wide text-[#5B6B5E] uppercase">
          Price (EGP)
          <span className="flex items-center gap-2">
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              value={minPrice}
              placeholder={priceHint(facets?.min_price)}
              aria-label="Minimum price"
              onChange={(event) => {
                setMinPrice(event.target.value)
                apply(
                  { min_price: parsePrice(event.target.value) },
                  DEBOUNCE_MS,
                )
              }}
              className="w-24 rounded-full border-[#2B3A32]/15 bg-white"
            />
            <span aria-hidden>–</span>
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              value={maxPrice}
              placeholder={priceHint(facets?.max_price)}
              aria-label="Maximum price"
              onChange={(event) => {
                setMaxPrice(event.target.value)
                apply(
                  { max_price: parsePrice(event.target.value) },
                  DEBOUNCE_MS,
                )
              }}
              className="w-24 rounded-full border-[#2B3A32]/15 bg-white"
            />
          </span>
        </label>

        <div className="grid gap-1.5 text-xs font-medium tracking-wide text-[#5B6B5E] uppercase">
          <span id="duration-label">Duration</span>
          <Select
            value={filters.max_duration?.toString() ?? ANY}
            onValueChange={(value) =>
              apply({ max_duration: value === ANY ? null : Number(value) })
            }
          >
            <SelectTrigger
              aria-labelledby="duration-label"
              className="w-40 rounded-full border-[#2B3A32]/15 bg-white"
            >
              <SelectValue />
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

        <div className="grid gap-1.5 text-xs font-medium tracking-wide text-[#5B6B5E] uppercase">
          <span id="sort-label">Sort by</span>
          <Select
            value={filters.sort}
            onValueChange={(value) => apply({ sort: value as SortOption })}
          >
            <SelectTrigger
              aria-labelledby="sort-label"
              className="w-48 rounded-full border-[#2B3A32]/15 bg-white"
            >
              <SelectValue />
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

        {(facets === undefined || facets.on_sale_count > 0) && (
          <button
            type="button"
            aria-pressed={filters.on_sale}
            onClick={() => apply({ on_sale: !filters.on_sale })}
            className={`h-9 rounded-full border px-4 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-[#8A6240] focus-visible:outline-none ${
              filters.on_sale
                ? "border-[#2B3A32] bg-[#2B3A32] text-[#F6F1E7]"
                : "border-[#2B3A32]/15 bg-white text-[#2B3A32] hover:border-[#2B3A32]/40"
            }`}
          >
            On sale
          </button>
        )}

        {hasActiveFilters(filters) && (
          <button
            type="button"
            onClick={clearAll}
            className="flex h-9 items-center gap-1.5 text-sm text-[#8A6240] underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
          >
            <X aria-hidden className="size-4" />
            Clear all
          </button>
        )}
      </div>
    </div>
  )
}
