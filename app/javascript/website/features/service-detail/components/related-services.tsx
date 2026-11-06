import { Link } from "@inertiajs/react"

import { service as serviceRoute } from "@/routes"
import { ImageOrMark } from "@/website/features/home-catalog/components/image-or-mark"
import { formatMoney } from "@/website/features/home-catalog/utils"
import type { RelatedService } from "@/website/features/service-detail/types"
import { formatDuration } from "@/website/features/service-detail/utils"

/** Other services in the same category. Renders nothing when there are none. */
export function RelatedServices({
  category,
  services,
}: {
  category: string | null
  services: RelatedService[]
}) {
  if (services.length === 0) return null

  return (
    <section aria-labelledby="related-heading" className="bg-white px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <h2
          id="related-heading"
          style={{ fontFamily: "'Italiana', serif" }}
          className="text-3xl text-[#2B3A32] sm:text-4xl"
        >
          {category ? `More in ${category}` : "More services"}
        </h2>

        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((other) => (
            <li key={other.id}>
              <Link
                href={serviceRoute(other.slug)}
                className="group block overflow-hidden rounded-3xl border border-[#2B3A32]/10 bg-[#F6F1E7] transition-shadow duration-300 hover:shadow-[0_24px_48px_-24px_rgba(43,58,50,0.3)] focus-visible:ring-2 focus-visible:ring-[#8A6240] focus-visible:outline-none"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <ImageOrMark image={other.image} />
                </div>
                <div className="flex items-baseline justify-between gap-4 p-5">
                  <div>
                    <h3 className="font-medium text-[#2B3A32]">{other.name}</h3>
                    {formatDuration(other.duration_minutes) && (
                      <p className="mt-0.5 text-sm text-[#5B6B5E]">
                        {formatDuration(other.duration_minutes)}
                      </p>
                    )}
                  </div>
                  <p className="shrink-0 text-sm text-[#2B3A32] tabular-nums">
                    {formatMoney(other.sale_price ?? other.price)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
