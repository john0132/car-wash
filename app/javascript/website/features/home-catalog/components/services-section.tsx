import { Link } from "@inertiajs/react"

import { service as serviceRoute } from "@/routes"
import { ImageOrMark } from "@/website/features/home-catalog/components/image-or-mark"
import type { HomeService } from "@/website/features/home-catalog/types"
import { formatMoney } from "@/website/features/home-catalog/utils"

/**
 * Featured services as image-topped cards on the ivory band, left-aligned
 * like the "Care, by hand" section so it reads differently from the centred
 * category portraits. Renders nothing when empty.
 */
export function ServicesSection({ services }: { services: HomeService[] }) {
  if (services.length === 0) return null

  return (
    <section
      id="featured-services"
      aria-labelledby="featured-services-heading"
      className="bg-[#F6F1E7] px-6 py-24"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-xl">
          <p className="text-xs font-medium tracking-[0.3em] text-[#8A6240] uppercase">
            Most requested
          </p>
          <h2
            id="featured-services-heading"
            style={{ fontFamily: "'Italiana', serif" }}
            className="mt-4 text-4xl text-[#2B3A32] sm:text-5xl"
          >
            Treatments, finished by hand
          </h2>
        </div>

        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <li
              key={service.id}
              className="group relative overflow-hidden rounded-3xl border border-[#2B3A32]/10 bg-white transition-shadow duration-300 hover:shadow-[0_24px_48px_-24px_rgba(43,58,50,0.3)]"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <ImageOrMark image={service.image} />
              </div>
              <div className="p-6">
                {service.category && (
                  <p className="text-xs font-medium tracking-[0.2em] text-[#8A6240] uppercase">
                    {service.category}
                  </p>
                )}
                <div className="mt-2 flex items-baseline justify-between gap-4">
                  <h3 className="text-lg font-medium text-[#2B3A32]">
                    <Link
                      href={serviceRoute(service.slug)}
                      className="after:absolute after:inset-0 focus-visible:outline-none"
                    >
                      {service.name}
                    </Link>
                  </h3>
                  <p className="flex shrink-0 items-baseline gap-2 text-sm tabular-nums">
                    {service.sale_price !== null ? (
                      <>
                        <span className="font-medium text-[#2B3A32]">
                          {formatMoney(service.sale_price)}
                        </span>
                        <s className="text-xs text-[#5B6B5E]">
                          {formatMoney(service.price)}
                        </s>
                      </>
                    ) : (
                      <span className="text-[#5B6B5E]">
                        {formatMoney(service.price)}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
