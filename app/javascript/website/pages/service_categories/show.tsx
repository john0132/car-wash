import { serviceCategory } from "@/routes"
import { Breadcrumbs } from "@/website/components/breadcrumbs"
import { Pagination } from "@/website/components/pagination"
import { ServiceCard } from "@/website/components/service-card"
import { ServiceFilters } from "@/website/features/category-detail/components/service-filters"
import type {
  CategoryDetail,
  CategoryFacets,
  CategoryFilters,
} from "@/website/features/category-detail/types"
import {
  filterQuery,
  hasActiveFilters,
} from "@/website/features/category-detail/utils"
import SiteLayout from "@/website/layouts/site-layout"
import type { PaginationData } from "@/website/lib/pagination"
import type { ServiceSummary } from "@/website/lib/types"

// Filter/search/page visits only reload services, pagination and filters, so the category and
// facets are kept from the first load (and are optional in the type for that reason).
interface Props {
  category?: CategoryDetail
  services: ServiceSummary[]
  pagination: PaginationData
  filters: CategoryFilters
  facets?: CategoryFacets
}

export default function ServiceCategoryShow({
  category,
  services,
  pagination,
  filters,
  facets,
}: Props) {
  // Kept across partial reloads: Inertia merges the new props over the old ones.
  const name = category?.name ?? "Services"
  const filtered = hasActiveFilters(filters)
  const first = (pagination.page - 1) * pagination.per_page + 1

  return (
    <SiteLayout
      title={category?.seo_title ?? name}
      description={category?.seo_description}
      mainClassName="mx-auto min-h-[70vh] max-w-6xl px-6 pt-10 pb-24 lg:pt-16"
    >
      <Breadcrumbs items={[{ label: name }]} />

      <h1 className="font-display mt-6 text-5xl leading-[1.05] text-balance sm:text-6xl">
        {name}
      </h1>

      <div className="mt-10">
        <ServiceFilters
          slug={category?.slug ?? ""}
          filters={filters}
          facets={facets}
        />
      </div>

      <p aria-live="polite" className="text-sage mt-8 mb-6 text-sm">
        {pagination.total === 0
          ? "No services found"
          : `Showing ${first}–${first + services.length - 1} of ${pagination.total} ${pagination.total === 1 ? "service" : "services"}`}
      </p>

      {services.length > 0 ? (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <li key={service.id}>
              <ServiceCard service={service} priority={index < 3} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="border-pine/20 rounded-3xl border border-dashed bg-white/50 px-6 py-16 text-center">
          <p className="text-lg">
            {filtered
              ? "Nothing matches those filters."
              : "No services in this category yet."}
          </p>
          {filtered && (
            <p className="text-sage mt-1 text-sm">
              Try a different search, or use “Clear all”.
            </p>
          )}
        </div>
      )}

      <Pagination
        pagination={pagination}
        only={["services", "pagination", "filters"]}
        hrefFor={(n) =>
          serviceCategory(category?.slug ?? "", {
            query: filterQuery(filters, n),
          }).url
        }
      />
    </SiteLayout>
  )
}
