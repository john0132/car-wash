import { router } from "@inertiajs/react"
import { Search } from "lucide-react"
import { useState } from "react"

import {
  TRANSACTION_STATUSES,
  type TransactionFilters as Filters,
} from "@/admin/features/payments/types"
import { humanize } from "@/admin/lib/format"
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

/** Search + status + method filters, kept in the URL query and applied by Rails. */
export function TransactionFilters({
  url,
  filters,
  methods,
}: {
  url: string
  filters: Filters
  methods: { id: number; name: string }[]
}) {
  const [query, setQuery] = useState(filters.q ?? "")

  const apply = (next: Partial<Filters>) => {
    const params = { ...filters, q: query, ...next }
    router.get(
      url,
      {
        q: presence(params.q),
        status: presence(params.status),
        payment_method_id: presence(params.payment_method_id),
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
          placeholder="Search reference, customer or email…"
          aria-label="Search transactions"
          className="pl-8"
        />
      </form>

      <Select
        value={filters.status ?? ALL}
        onValueChange={(value) =>
          apply({ status: value === ALL ? null : (value as Filters["status"]) })
        }
      >
        <SelectTrigger className="w-40" aria-label="Filter by status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All statuses</SelectItem>
          {TRANSACTION_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {humanize(status)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.payment_method_id ?? ALL}
        onValueChange={(value) =>
          apply({ payment_method_id: value === ALL ? null : value })
        }
      >
        <SelectTrigger className="w-44" aria-label="Filter by method">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All methods</SelectItem>
          {methods.map((method) => (
            <SelectItem key={method.id} value={String(method.id)}>
              {method.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
