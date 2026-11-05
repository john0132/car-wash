import { router } from "@inertiajs/react"
import { Search } from "lucide-react"
import { useState } from "react"

import {
  type BookingFilters as Filters,
  PAYMENT_STATUSES,
} from "@/admin/features/bookings/types"
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

const presence = (value: string | null) =>
  value === null || value === "" ? undefined : value

/** Search + payment status, kept in the URL query. Booking status has its own toggle group. */
export function BookingFilters({
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
        booking_status: presence(params.booking_status),
        payment_status: presence(params.payment_status),
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
          placeholder="Search booking #, customer or email…"
          aria-label="Search bookings"
          className="pl-8"
        />
      </form>

      <Select
        value={filters.payment_status ?? ALL}
        onValueChange={(value) =>
          apply({
            payment_status:
              value === ALL ? null : (value as Filters["payment_status"]),
          })
        }
      >
        <SelectTrigger className="w-44" aria-label="Filter by payment status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All payment statuses</SelectItem>
          {PAYMENT_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {humanize(status)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
