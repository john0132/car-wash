import { Link } from "@inertiajs/react"
import { Clock } from "lucide-react"

import { signUp } from "@/routes"
import { formatMoney } from "@/website/features/home-catalog/utils"
import { ExtrasDrawer } from "@/website/features/service-detail/components/extras-drawer"
import type {
  ExtraOption,
  ExtrasPage,
  ServiceDetail,
} from "@/website/features/service-detail/types"
import { formatDuration } from "@/website/features/service-detail/utils"

/** Price, duration and the booking call to action, laid over the image's lower edge. */
export function BookingPanel({
  service,
  extras,
  selectedExtras,
  onToggleExtra,
}: {
  service: ServiceDetail
  extras: ExtrasPage | undefined
  selectedExtras: ExtraOption[]
  onToggleExtra: (extra: ExtraOption) => void
}) {
  const duration = formatDuration(service.duration_minutes)
  const onSale = service.sale_price !== null
  const extrasTotal = selectedExtras.reduce(
    (sum, extra) => sum + extra.price,
    0,
  )
  const total = (service.sale_price ?? service.price) + extrasTotal
  const savings = onSale
    ? Math.round((1 - service.sale_price! / service.price) * 100)
    : 0

  return (
    <div className="relative z-10 mx-4 -mt-20 rounded-3xl border border-[#2B3A32]/10 bg-white p-6 shadow-[0_32px_64px_-32px_rgba(43,58,50,0.45)] sm:mx-10">
      <div className="flex items-end justify-between gap-6">
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
            <p className="mt-1 text-sm text-[#5B6B5E] tabular-nums">
              <s>{formatMoney(service.price)}</s>
              <span className="ml-2 font-medium text-[#8A6240]">
                {savings}% off
              </span>
            </p>
          )}
        </div>

        {duration && (
          <div className="flex items-center gap-2 border-l border-[#2B3A32]/15 pl-6">
            <Clock className="size-5 text-[#8A6240]" aria-hidden />
            <div>
              <p className="text-sm text-[#5B6B5E]">Takes about</p>
              <p className="font-medium text-[#2B3A32]">{duration}</p>
            </div>
          </div>
        )}
      </div>

      <ExtrasDrawer
        serviceSlug={service.slug}
        extras={extras}
        selected={selectedExtras}
        onToggle={onToggleExtra}
      />

      {selectedExtras.length > 0 && (
        <dl className="mt-5 space-y-1.5 border-t border-[#2B3A32]/10 pt-4 text-sm tabular-nums">
          {selectedExtras.map((extra) => (
            <div key={extra.id} className="flex justify-between gap-4">
              <dt className="text-[#5B6B5E]">{extra.name}</dt>
              <dd>{formatMoney(extra.price)}</dd>
            </div>
          ))}
          <div className="flex justify-between gap-4 pt-1 font-medium">
            <dt>Total</dt>
            <dd>{formatMoney(total)}</dd>
          </div>
        </dl>
      )}

      <Link
        href={signUp()}
        className="mt-3 block rounded-full bg-[#2B3A32] px-6 py-3.5 text-center font-medium text-[#F6F1E7] transition-colors hover:bg-[#1F2B25] focus-visible:ring-2 focus-visible:ring-[#8A6240] focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        Book this service
      </Link>
    </div>
  )
}
