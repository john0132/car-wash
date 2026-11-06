import { Link } from "@inertiajs/react"

import { serviceCategory } from "@/routes"
import { Breadcrumbs } from "@/website/components/breadcrumbs"
import { ServiceCard } from "@/website/components/service-card"
import type { ServicesListCategory } from "@/website/features/services-list/types"
import SiteLayout from "@/website/layouts/site-layout"

interface Props {
  categories: ServicesListCategory[]
}

export default function ServicesIndex({ categories }: Props) {
  return (
    <SiteLayout
      title={"Our services"}
      description={
        "Choose a service to book: hand washing, interior detailing and protection."
      }
      mainClassName="mx-auto min-h-[70vh] max-w-6xl px-6 pt-10 pb-24 lg:pt-16"
    >
      <Breadcrumbs items={[{ label: "Services" }]} />

      <h1 className="font-display mt-6 text-5xl leading-[1.05] text-balance sm:text-6xl">
        Our services
      </h1>
      <p className="text-sage mt-4 max-w-xl">
        Pick the treatment you’d like and we’ll take it from there.
      </p>

      {categories.length === 0 && (
        <div className="border-pine/20 mt-12 rounded-3xl border border-dashed bg-white/50 px-6 py-16 text-center">
          <p className="text-lg">No services are available yet.</p>
        </div>
      )}

      {categories.map((category, categoryIndex) => (
        <section
          key={category.id}
          aria-labelledby={`category-${category.id}`}
          className="mt-14"
        >
          <div className="flex items-baseline justify-between gap-4">
            <h2
              id={`category-${category.id}`}
              className="font-display text-3xl sm:text-4xl"
            >
              {category.name}
            </h2>
            <Link
              href={serviceCategory(category.slug)}
              className="text-bronze shrink-0 text-sm underline-offset-4 hover:underline"
            >
              See all {category.name}
            </Link>
          </div>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {category.services.map((service, index) => (
              <li key={service.id}>
                <ServiceCard
                  service={service}
                  priority={categoryIndex === 0 && index < 3}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </SiteLayout>
  )
}
