import { ServiceCard } from "@/website/components/service-card"
import type { ServiceSummary } from "@/website/lib/types"

/** Other services in the same category. Renders nothing when there are none. */
export function RelatedServices({
  category,
  services,
}: {
  category: string | null
  services: ServiceSummary[]
}) {
  if (services.length === 0) return null

  return (
    <section aria-labelledby="related-heading" className="bg-white px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <h2
          id="related-heading"
          className="font-display text-pine text-3xl sm:text-4xl"
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
