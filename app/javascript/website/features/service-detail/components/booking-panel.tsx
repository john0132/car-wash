import { Link } from "@inertiajs/react"
import { Check, Clock, X } from "lucide-react"

import { checkout } from "@/routes"
import { ExtrasDialog } from "@/website/features/service-detail/components/extras-dialog"
import type {
  ExtraOption,
  ExtrasPage,
  ServiceDetail,
} from "@/website/features/service-detail/types"
import { useI18n } from "@/website/lib/i18n"

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
  const { t, formatMoney, formatDuration } = useI18n()

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
    <div className="border-pine/10 relative z-10 mx-4 -mt-20 rounded-3xl border bg-white p-6 shadow-[0_32px_64px_-32px_rgba(43,58,50,0.45)] sm:mx-10">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div>
          <p className="text-sage text-sm">
            {onSale ? t("Special price") : t("Price")}
          </p>
          <p className="font-display text-pine mt-1 text-4xl tabular-nums">
            {formatMoney(onSale ? service.sale_price! : service.price)}
          </p>
          {onSale && (
            <p className="text-sage relative mt-1 text-sm tabular-nums">
              <s>
                <span className="sr-only">{t("Was")} </span>
                {formatMoney(service.price)}
              </s>
              <span className="text-bronze ms-2 font-medium">
                {t("{savings}% off", { savings })}
              </span>
            </p>
          )}
        </div>

        {duration && (
          <div className="sm:border-pine/15 flex items-center gap-2 sm:border-s sm:ps-6">
            <Clock className="text-bronze size-5" aria-hidden />
            <div>
              <p className="text-sage text-sm">{t("Takes about")}</p>
              <p className="text-pine font-medium">{duration}</p>
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
        <ul
          aria-label={t("Selected extras")}
          className="mt-4 flex flex-wrap gap-2"
        >
          {selectedExtras.map((extra) => (
            <li
              key={extra.id}
              className="border-pine/20 bg-ivory flex items-center gap-1.5 rounded-full border py-1 ps-3 pe-1 text-sm"
            >
              <Check className="text-bronze size-3.5" aria-hidden />
              {extra.name}
              <span className="text-sage tabular-nums">
                +{formatMoney(extra.price)}
              </span>
              <button
                type="button"
                onClick={() =>
                  onExtrasChange(
                    selectedExtras.filter((e) => e.id !== extra.id),
                  )
                }
                aria-label={t("Remove {name}", {
                  name: extra.name ?? t("extra"),
                })}
                className="text-sage hover:text-pine focus-visible:ring-bronze grid size-6 place-items-center rounded-full hover:bg-white focus-visible:ring-2 focus-visible:outline-none"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Link
        href={bookHref}
        className="bg-pine text-ivory hover:bg-pine-deep focus-visible:ring-bronze mt-4 block rounded-full px-6 py-3.5 text-center font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        {t("Book now")}
      </Link>
    </div>
  )
}
