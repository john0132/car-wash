import { Link } from "@inertiajs/react"
import { Banknote } from "lucide-react"
import type { ReactNode } from "react"

import { service as serviceRoute } from "@/routes"
import type { CheckoutSummary } from "@/website/features/checkout/types"
import { formatMoney } from "@/website/features/home-catalog/utils"
import { formatDuration } from "@/website/features/service-detail/utils"

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
  const duration = formatDuration(summary.service.duration_minutes)

  return (
    <aside
      aria-label="Booking summary"
      className="rounded-3xl border border-[#2B3A32]/10 bg-white p-6 shadow-[0_32px_64px_-40px_rgba(43,58,50,0.45)] sm:p-7"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2
          style={{ fontFamily: "'Italiana', serif" }}
          className="text-2xl leading-tight"
        >
          Your booking
        </h2>
        <Link
          href={serviceRoute(summary.service.slug)}
          className="text-sm text-[#8A6240] underline-offset-4 hover:underline"
        >
          Change
        </Link>
      </div>

      <dl className="mt-5 space-y-3 text-[15px] tabular-nums">
        <div className="flex justify-between gap-4">
          <dt>
            <span className="font-medium">{summary.service.name}</span>
            {duration && (
              <span className="block text-sm text-[#5B6B5E]">{duration}</span>
            )}
          </dt>
          <dd>{formatMoney(summary.service.price)}</dd>
        </div>

        {summary.extras.map((extra) => (
          <div key={extra.id} className="flex justify-between gap-4">
            <dt className="text-[#5B6B5E]">+ {extra.name}</dt>
            <dd>{formatMoney(extra.price)}</dd>
          </div>
        ))}

        <div className="flex justify-between gap-4 border-t border-[#2B3A32]/10 pt-3 text-lg font-medium">
          <dt>Total</dt>
          <dd>{formatMoney(summary.total)}</dd>
        </div>
      </dl>

      <p className="mt-4 flex items-center gap-2 rounded-2xl bg-[#F6F1E7] px-4 py-3 text-sm text-[#3F4F45]">
        <Banknote className="size-4 shrink-0 text-[#8A6240]" aria-hidden />
        Pay in cash when we arrive.
      </p>

      <div className="mt-5">{children}</div>
    </aside>
  )
}
