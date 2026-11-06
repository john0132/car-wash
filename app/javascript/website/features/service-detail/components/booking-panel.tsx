import { Link } from "@inertiajs/react"
import { Check, Clock, X } from "lucide-react"

import { checkout } from "@/routes"
import { formatMoney } from "@/website/features/home-catalog/utils"
import { ExtrasDialog } from "@/website/features/service-detail/components/extras-dialog"
import type {
  ExtraOption,
  ExtrasPage,
  ServiceDetail,
} from "@/website/features/service-detail/types"
import { formatDuration } from "@/website/features/service-detail/utils"

/**
 * Price, duration, the chosen extras and the "Book now" call to action, laid
 * over the image's lower edge. Totals are left to checkout, which prices
 * everything on the server.
 */
export function BookingPanel({
  service,
  extras,
  selectedExtras,
  onExtrasChange,
}: {
  service: ServiceDetail
  extras: ExtrasPage | undefined
  selectedExtras: ExtraOption[]
  onExtrasChange: (extras: ExtraOption[]) => void
}) {
  const duration = formatDuration(service.duration_minutes)
  const onSale = service.sale_price !== null
  const savings = onSale
    ? Math.round((1 - service.sale_price! / service.price) * 100)
    : 0
  const bookHref = checkout({
    query: {
      service: service.slug,
      extras: selectedExtras.map((extra) => extra.id),
    },
  })

  return (
    <div className="relative z-10 mx-4 -mt-20 rounded-3xl border border-[#2B3A32]/10 bg-white p-6 shadow-[0_32px_64px_-32px_rgba(43,58,50,0.45)] sm:mx-10">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div>
          <p className="text-sm text-[#5B6B5E]">
            {onSale ? "Special price" : "Price"}
          </p>
          <p
            style={{ fontFamily: "'Italiana', serif" }}
            className="mt-1 text-4xl text-[#2B3A32] tabular-nums"
          >
            {formatMoney(onSale ? service.sale_price! : service.price)}
          </p>
          {onSale && (
            <p className="relative mt-1 text-sm text-[#5B6B5E] tabular-nums">
              <s>
                <span className="sr-only">Was </span>
                {formatMoney(service.price)}
              </s>
              <span className="ms-2 font-medium text-[#8A6240]">
                {savings}% off
              </span>
            </p>
          )}
        </div>

        {duration && (
          <div className="flex items-center gap-2 sm:border-s sm:border-[#2B3A32]/15 sm:ps-6">
            <Clock className="size-5 text-[#8A6240]" aria-hidden />
            <div>
              <p className="text-sm text-[#5B6B5E]">Takes about</p>
              <p className="font-medium text-[#2B3A32]">{duration}</p>
            </div>
          </div>
        )}
      </div>

      <ExtrasDialog
        serviceSlug={service.slug}
        extras={extras}
        selected={selectedExtras}
        onConfirm={onExtrasChange}
      />

      {selectedExtras.length > 0 && (
        <ul aria-label="Selected extras" className="mt-4 flex flex-wrap gap-2">
          {selectedExtras.map((extra) => (
            <li
              key={extra.id}
              className="flex items-center gap-1.5 rounded-full border border-[#2B3A32]/20 bg-[#F6F1E7] py-1 pr-1 pl-3 text-sm"
            >
              <Check className="size-3.5 text-[#8A6240]" aria-hidden />
              {extra.name}
              <span className="text-[#5B6B5E] tabular-nums">
                +{formatMoney(extra.price)}
              </span>
              <button
                type="button"
                onClick={() =>
                  onExtrasChange(
                    selectedExtras.filter((e) => e.id !== extra.id),
                  )
                }
                aria-label={`Remove ${extra.name ?? "extra"}`}
                className="grid size-6 place-items-center rounded-full text-[#5B6B5E] hover:bg-white hover:text-[#2B3A32] focus-visible:ring-2 focus-visible:ring-[#8A6240] focus-visible:outline-none"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Link
        href={bookHref}
        className="mt-4 block rounded-full bg-[#2B3A32] px-6 py-3.5 text-center font-medium text-[#F6F1E7] transition-colors hover:bg-[#1F2B25] focus-visible:ring-2 focus-visible:ring-[#8A6240] focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        Book now
      </Link>
    </div>
  )
}
