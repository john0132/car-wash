import { Link } from "@inertiajs/react"
import { Banknote } from "lucide-react"
import type { ReactNode } from "react"

import { service as serviceRoute } from "@/routes"
import type { CheckoutSummary } from "@/website/features/checkout/types"
import { useI18n } from "@/website/lib/i18n"

/**
 * The read-only booking summary priced by the server. Changing the service or
 * extras means going back to the service page. `children` is the submit area.
 */
export function OrderSummary({
  summary,
  children,
}: {
  summary: CheckoutSummary
  children: ReactNode
}) {
  const { t, formatMoney, formatDuration } = useI18n()

  const duration = formatDuration(summary.service.duration_minutes)

  return (
    <aside
      aria-label={t("Booking summary")}
      className="border-pine/10 rounded-3xl border bg-white p-6 shadow-[0_32px_64px_-40px_rgba(43,58,50,0.45)] sm:p-7"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-display text-2xl leading-tight">
          {t("Your booking")}
        </h2>
        <Link
          href={serviceRoute(summary.service.slug)}
          className="text-bronze text-sm underline-offset-4 hover:underline"
        >
          {t("Change")}
        </Link>
      </div>

      <dl className="mt-5 space-y-3 text-[15px] tabular-nums">
        <div className="flex justify-between gap-4">
          <dt>
            <span className="font-medium">{summary.service.name}</span>
            {duration && (
              <span className="text-sage block text-sm">{duration}</span>
            )}
          </dt>
          <dd>{formatMoney(summary.service.price)}</dd>
        </div>

        {summary.extras.map((extra) => (
          <div key={extra.id} className="flex justify-between gap-4">
            <dt className="text-sage">+ {extra.name}</dt>
            <dd>{formatMoney(extra.price)}</dd>
          </div>
        ))}

        <div className="border-pine/10 flex justify-between gap-4 border-t pt-3 text-lg font-medium">
          <dt>{t("Total")}</dt>
          <dd>{formatMoney(summary.total)}</dd>
        </div>
      </dl>

      <p className="bg-ivory text-moss mt-4 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm">
        <Banknote className="text-bronze size-4 shrink-0" aria-hidden />
        {t("Pay in cash when we arrive.")}
      </p>

      <div className="mt-5">{children}</div>
    </aside>
  )
}
