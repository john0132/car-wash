import { ListFilters } from "@/admin/components/list-filters"
import type { UserListFilters as Filters } from "@/admin/features/users/types"

/** Search + status filter, kept in the URL query (`q`, `status`) and applied by Rails. */
export function UserListFilters({
  url,
  filters,
}: {
  url: string
  filters: Filters
}) {
  return (
    <ListFilters
      url={url}
      filters={filters}
      searchPlaceholder="Search name or email…"
    />
  )
}
