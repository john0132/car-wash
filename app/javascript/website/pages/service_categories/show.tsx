import { Head, Link } from "@inertiajs/react"

import { root, serviceCategory } from "@/routes"
import { Pagination } from "@/website/components/pagination"
import { SiteFooter } from "@/website/components/site-footer"
import { SiteHeader } from "@/website/components/site-header"
import { ServiceFilters } from "@/website/features/category-detail/components/service-filters"
import type {
  CategoryDetail,
  CategoryFacets,
  CategoryFilters,
  CategoryService,
} from "@/website/features/category-detail/types"
import {
  filterQuery,
  hasActiveFilters,
} from "@/website/features/category-detail/utils"
import { ServiceCard } from "@/website/features/service-detail/components/service-card"
import type { PaginationData } from "@/website/lib/pagination"

// Filter/search/page visits only reload services, pagination and filters, so the category and
// facets are kept from the first load (and are optional in the type for that reason).
interface Props {
  category?: CategoryDetail
  services: CategoryService[]
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
    <>
      <Head title={category?.seo_title ?? name}>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Italiana&family=Jost:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        {category?.seo_description && (
          <meta name="description" content={category.seo_description} />
        )}
      </Head>

      <div
        style={{ fontFamily: "'Jost', system-ui, sans-serif" }}
        className="bg-[#F6F1E7] text-[#2B3A32]"
      >
        <SiteHeader />
        <main className="mx-auto min-h-[70vh] max-w-6xl px-6 pt-10 pb-24 lg:pt-16">
          <nav aria-label="Breadcrumb" className="text-sm text-[#5B6B5E]">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href={root()} className="hover:text-[#2B3A32]">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li aria-current="page">{name}</li>
            </ol>
          </nav>

          <h1
            style={{ fontFamily: "'Italiana', serif" }}
            className="mt-6 text-5xl leading-[1.05] text-balance sm:text-6xl"
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

          <p aria-live="polite" className="mt-8 mb-6 text-sm text-[#5B6B5E]">
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
            <div className="rounded-3xl border border-dashed border-[#2B3A32]/20 bg-white/50 px-6 py-16 text-center">
              <p className="text-lg">
                {filtered
                  ? "Nothing matches those filters."
                  : "No services in this category yet."}
              </p>
              {filtered && (
                <p className="mt-1 text-sm text-[#5B6B5E]">
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
        </main>
        <SiteFooter />
      </div>
    </>
  )
}
