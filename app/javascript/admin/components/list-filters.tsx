import { router } from "@inertiajs/react"
import { Search } from "lucide-react"
import { useState } from "react"

import { Input } from "@/shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"

const ALL = "all"

export type StatusFilter = "active" | "inactive" | null

/** Query params a list page filters on. Extra params (e.g. `city_id`) go alongside. */
export interface ListFilterValues {
  q: string | null
  status: StatusFilter
}

type QueryValue = string | number | null | undefined

export interface SelectFilter {
  /** Query param name, e.g. "city_id". */
  param: string
  label: string
  allLabel: string
  options: { value: string; label: string }[]
}

/** Drop blank values so they don't end up in the URL. */
const presence = (value: QueryValue) =>
  value === null || value === undefined || value === "" ? undefined : value

/**
 * Search + status filter (plus optional extra selects), kept in the URL query
 * and applied by Rails.
 */
export function ListFilters({
  url,
  filters,
  searchPlaceholder,
  selects = [],
}: {
  url: string
  filters: ListFilterValues
  searchPlaceholder: string
  selects?: SelectFilter[]
}) {
  const [query, setQuery] = useState(filters.q ?? "")

  const values = filters as unknown as Record<string, QueryValue>

  const apply = (next: Record<string, QueryValue>) => {
    const params = { ...values, q: query, ...next }
    router.get(
      url,
      Object.fromEntries(
        Object.entries(params).map(([key, value]) => [key, presence(value)]),
      ),
      { preserveState: true, preserveScroll: true, replace: true },
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <form
        className="relative w-full max-w-sm"
        onSubmit={(event) => {
          event.preventDefault()
          apply({ q: query })
        }}
      >
        <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder.replace(/…$/, "")}
          className="pl-8"
        />
      </form>

      {selects.map((select) => (
        <Select
          key={select.param}
          value={String(values[select.param] ?? ALL)}
          onValueChange={(value) =>
            apply({ [select.param]: value === ALL ? null : value })
          }
        >
          <SelectTrigger className="w-44" aria-label={select.label}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{select.allLabel}</SelectItem>
            {select.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      <Select
        value={filters.status ?? ALL}
        onValueChange={(value) =>
          apply({ status: value === ALL ? null : value })
        }
      >
        <SelectTrigger className="w-36" aria-label="Filter by status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All statuses</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Disabled</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
