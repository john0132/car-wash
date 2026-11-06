import { Link } from "@inertiajs/react"

import { serviceCategory } from "@/routes"
import { Breadcrumbs } from "@/website/components/breadcrumbs"
import { ServiceCard } from "@/website/components/service-card"
import type { ServicesListCategory } from "@/website/features/services-list/types"
import SiteLayout from "@/website/layouts/site-layout"
import { useI18n } from "@/website/lib/i18n"

interface Props {
  categories: ServicesListCategory[]
}

export default function ServicesIndex({ categories }: Props) {
  const { t } = useI18n()

  return (
    <SiteLayout
      title={t("Our services")}
      description={t(
        "Choose a service to book: hand washing, interior detailing and protection.",
      )}
      mainClassName="mx-auto min-h-[70vh] max-w-6xl px-6 pt-10 pb-24 lg:pt-16"
    >
      <Breadcrumbs items={[{ label: t("Services") }]} />

      <h1
        dir="auto"
        className="font-display mt-6 text-5xl leading-[1.05] text-balance sm:text-6xl"
      >
        {t("Our services")}
      </h1>
      <p dir="auto" className="text-sage mt-4 max-w-xl">
        {t("Pick the treatment you’d like and we’ll take it from there.")}
      </p>

      {categories.length === 0 && (
        <div className="border-pine/20 mt-12 rounded-3xl border border-dashed bg-white/50 px-6 py-16 text-center">
          <p dir="auto" className="text-lg">
            {t("No services are available yet.")}
          </p>
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
              dir="auto"
              id={`category-${category.id}`}
              className="font-display text-3xl sm:text-4xl"
            >
              {category.name}
            </h2>
            <Link
              href={serviceCategory(category.slug)}
              className="text-bronze shrink-0 text-sm underline-offset-4 hover:underline"
            >
              {t("See all {name}", { name: category.name })}
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
