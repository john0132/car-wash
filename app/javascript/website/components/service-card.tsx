import { Link } from "@inertiajs/react"

import { service as serviceRoute } from "@/routes"
import { ImageOrMark } from "@/website/components/image-or-mark"
import { formatDuration, formatMoney } from "@/website/lib/format"
import type { ServiceSummary } from "@/website/lib/types"

/** A service as a linked card: image, name, duration and the price (struck through when on sale). */
export function ServiceCard({
  service,
  priority = false,
  eyebrow,
}: {
  service: ServiceSummary
  /** Above the fold: load the image eagerly. */
  priority?: boolean
  /** Small label above the name, e.g. the category on the homepage. */
  eyebrow?: string | null
}) {
  const duration = formatDuration(service.duration_minutes)

  return (
    <Link
      href={serviceRoute(service.slug)}
      className="group border-pine/10 bg-ivory focus-visible:ring-bronze block h-full overflow-hidden rounded-3xl border transition-shadow duration-300 hover:shadow-[0_24px_48px_-24px_rgba(43,58,50,0.3)] focus-visible:ring-2 focus-visible:outline-none"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <ImageOrMark image={service.image} priority={priority} />
        {service.sale_price !== null && (
          <span className="bg-pine text-ivory absolute start-3 top-3 rounded-full px-3 py-1 text-xs font-medium tracking-wide uppercase">
            Sale
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 p-5">
        <div>
          {eyebrow && (
            <p className="text-bronze mb-1 text-xs font-medium tracking-[0.2em] uppercase">
              {eyebrow}
            </p>
          )}
          <h3 className="text-pine font-medium">{service.name}</h3>
          {duration && <p className="text-sage mt-0.5 text-sm">{duration}</p>}
        </div>
        <p className="text-pine relative shrink-0 text-end text-sm tabular-nums">
          {service.sale_price !== null && (
            <span className="text-sage me-1.5 line-through">
              <span className="sr-only">Was </span>
              {formatMoney(service.price)}
            </span>
          )}
          {service.sale_price !== null && <span className="sr-only">Now </span>}
          {formatMoney(service.sale_price ?? service.price)}
        </p>
      </div>
    </Link>
  )
}
