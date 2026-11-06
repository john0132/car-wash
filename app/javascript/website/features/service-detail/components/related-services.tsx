import { ServiceCard } from "@/website/features/service-detail/components/service-card"
import type { RelatedService } from "@/website/features/service-detail/types"

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
              <ServiceCard service={other} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
