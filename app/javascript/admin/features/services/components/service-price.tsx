import { formatMoney } from "@/admin/lib/format"

/** The price customers pay, with the regular price struck through while on sale. */
export function ServicePrice({
  price,
  salePrice,
}: {
  price: number
  salePrice: number | null
}) {
  if (salePrice === null) {
    return <span className="tabular-nums">{formatMoney(price)}</span>
  }

  return (
    <span className="inline-flex items-baseline gap-2 tabular-nums">
      <span className="font-medium">{formatMoney(salePrice)}</span>
      <s className="text-muted-foreground text-xs">{formatMoney(price)}</s>
    </span>
  )
}
