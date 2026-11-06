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
import { useI18n } from "@/website/lib/i18n"
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
  const { t, tp } = useI18n()

  // Kept across partial reloads: Inertia merges the new props over the old ones.
  const name = category?.name ?? t("Services")
  const filtered = hasActiveFilters(filters)
  const first = (pagination.page - 1) * pagination.per_page + 1

  return (
    <SiteLayout
      title={category?.seo_title ?? name}
      description={category?.seo_description}
      mainClassName="mx-auto min-h-[70vh] max-w-6xl px-6 pt-10 pb-24 lg:pt-16"
    >
      <Breadcrumbs items={[{ label: name }]} />

      <h1
        dir="auto"
        className="font-display mt-6 text-5xl leading-[1.05] text-balance sm:text-6xl"
      >
        {name}
      </h1>

      <div className="mt-10">
        <ServiceFilters
          slug={category?.slug ?? ""}
          filters={filters}
          facets={facets}
        />
      </div>

      <p dir="auto" aria-live="polite" className="text-sage mt-8 mb-6 text-sm">
        {pagination.total === 0
          ? t("No services found")
          : tp(
              pagination.total,
              "Showing {from}–{to} of {n} service",
              "Showing {from}–{to} of {n} services",
              {
                from: first,
                to: first + services.length - 1,
              },
            )}
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
          <p dir="auto" className="text-lg">
            {filtered
              ? t("Nothing matches those filters.")
              : t("No services in this category yet.")}
          </p>
          {filtered && (
            <p dir="auto" className="text-sage mt-1 text-sm">
              {t("Try a different search, or use “Clear all”.")}
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
