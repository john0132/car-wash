import { ServiceCard } from "@/website/components/service-card"
import { useI18n } from "@/website/lib/i18n"
import type { ServiceSummary } from "@/website/lib/types"

/**
 * Featured services as image-topped cards on the ivory band, left-aligned
 * like the "Care, by hand" section so it reads differently from the centred
 * category portraits. Renders nothing when empty.
 */
export function ServicesSection({ services }: { services: ServiceSummary[] }) {
  const { t } = useI18n()

  if (services.length === 0) return null

  return (
    <section
      id="featured-services"
      aria-labelledby="featured-services-heading"
      className="bg-ivory px-6 py-24"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-xl">
          <p className="text-bronze text-xs font-medium tracking-[0.3em] uppercase">
            {t("Most requested")}
          </p>
          <h2
            id="featured-services-heading"
            className="font-display text-pine mt-4 text-4xl sm:text-5xl"
          >
            {t("Treatments, finished by hand")}
          </h2>
        </div>

        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <li key={service.id}>
              <ServiceCard
                service={service}
                eyebrow={service.category}
                priority={index < 3}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
