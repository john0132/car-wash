import { Link } from "@inertiajs/react"

import { serviceCategory } from "@/routes"
import { ImageOrMark } from "@/website/components/image-or-mark"
import type { HomeCategory } from "@/website/features/home-catalog/types"
import { useI18n } from "@/website/lib/i18n"

/**
 * Categories as arch-framed portraits (echoing the hero's round frame) on a
 * white band, centred however many there are. Renders nothing when empty.
 */
export function ServiceCategoriesSection({
  categories,
}: {
  categories: HomeCategory[]
}) {
  const { t, tp } = useI18n()

  if (categories.length === 0) return null

  return (
    <section
      id="service-categories"
      aria-labelledby="service-categories-heading"
      className="bg-white px-6 py-24"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-xl text-center">
          <p
            dir="auto"
            className="text-bronze text-xs font-medium tracking-[0.3em] uppercase"
          >
            {t("The collections")}
          </p>
          <h2
            dir="auto"
            id="service-categories-heading"
            className="font-display text-pine mt-4 text-4xl sm:text-5xl"
          >
            {t("Care for every corner")}
          </h2>
        </div>

        <ul className="mt-14 flex flex-wrap justify-center gap-x-6 gap-y-12">
          {categories.map((category) => (
            <li
              key={category.id}
              className="w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)]"
            >
              <Link
                href={serviceCategory(category.slug)}
                className="group focus-visible:ring-bronze block focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-none"
              >
                <div className="border-bronze-light/30 bg-ivory aspect-[3/4] overflow-hidden rounded-t-full border p-2">
                  <div className="h-full w-full overflow-hidden rounded-t-full">
                    <ImageOrMark image={category.image} />
                  </div>
                </div>
                <div className="mt-5 text-center">
                  <h3 dir="auto" className="font-display text-pine text-2xl">
                    {category.name}
                  </h3>
                  {category.services_count > 0 && (
                    <p dir="auto" className="text-sage mt-1 text-sm">
                      {tp(
                        category.services_count,
                        "{n} service",
                        "{n} services",
                      )}
                    </p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
