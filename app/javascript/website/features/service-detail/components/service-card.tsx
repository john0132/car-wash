import { Link } from "@inertiajs/react"

import { service as serviceRoute } from "@/routes"
import { ImageOrMark } from "@/website/features/home-catalog/components/image-or-mark"
import type { HomeImage } from "@/website/features/home-catalog/types"
import { formatMoney } from "@/website/features/home-catalog/utils"
import { formatDuration } from "@/website/features/service-detail/utils"

interface CardService {
  slug: string
  name: string | null
  price: number
  sale_price: number | null
  duration_minutes: number | null
  image: HomeImage | null
}

/** A service as a linked card: image, name, duration and the price (struck through when on sale). */
export function ServiceCard({ service }: { service: CardService }) {
  const duration = formatDuration(service.duration_minutes)

  return (
    <Link
      href={serviceRoute(service.slug)}
      className="group block h-full overflow-hidden rounded-3xl border border-[#2B3A32]/10 bg-[#F6F1E7] transition-shadow duration-300 hover:shadow-[0_24px_48px_-24px_rgba(43,58,50,0.3)] focus-visible:ring-2 focus-visible:ring-[#8A6240] focus-visible:outline-none"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <ImageOrMark image={service.image} />
        {service.sale_price !== null && (
          <span className="absolute top-3 left-3 rounded-full bg-[#2B3A32] px-3 py-1 text-xs font-medium tracking-wide text-[#F6F1E7] uppercase">
            Sale
          </span>
        )}
      </div>
      <div className="flex items-baseline justify-between gap-4 p-5">
        <div>
          <h3 className="font-medium text-[#2B3A32]">{service.name}</h3>
          {duration && (
            <p className="mt-0.5 text-sm text-[#5B6B5E]">{duration}</p>
          )}
        </div>
        <p className="shrink-0 text-right text-sm text-[#2B3A32] tabular-nums">
          {service.sale_price !== null && (
            <span className="mr-1.5 text-[#5B6B5E] line-through">
              {formatMoney(service.price)}
            </span>
          )}
          {formatMoney(service.sale_price ?? service.price)}
        </p>
      </div>
    </Link>
  )
}
