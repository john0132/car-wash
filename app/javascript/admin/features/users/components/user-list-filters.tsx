import { router } from "@inertiajs/react"
import { Search } from "lucide-react"
import { useState } from "react"

import type { UserListFilters as Filters } from "@/admin/features/users/types"
import { Input } from "@/shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"

const ALL = "all"

/** Drop blank values so they don't end up in the URL. */
const presence = (value: string | null) =>
  value === null || value === "" ? undefined : value

/** Search + status filter, kept in the URL query (`q`, `status`) and applied by Rails. */
export function UserListFilters({
  url,
  filters,
}: {
  url: string
  filters: Filters
}) {
  const [query, setQuery] = useState(filters.q ?? "")

  const apply = (next: Partial<Filters>) => {
    const params = { ...filters, q: query, ...next }
    router.get(
      url,
      {
        q: presence(params.q),
        status: presence(params.status),
      },
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
          placeholder="Search name or email…"
          aria-label="Search name or email"
          className="pl-8"
        />
      </form>

      <Select
        value={filters.status ?? ALL}
        onValueChange={(value) =>
          apply({ status: value === ALL ? null : (value as Filters["status"]) })
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
