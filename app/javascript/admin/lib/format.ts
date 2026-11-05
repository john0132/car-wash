const money = new Intl.NumberFormat("en-EG", {
  style: "currency",
  currency: "EGP",
  maximumFractionDigits: 2,
})
const compactNumber = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
})
const wholeNumber = new Intl.NumberFormat("en")

export function formatMoney(value: number) {
  return money.format(value)
}

export function formatNumber(value: number) {
  return wholeNumber.format(value)
}

/** 1,284 / 12.9K / 4.2M — for stat tiles. */
export function formatCompact(value: number) {
  return Math.abs(value) < 10_000
    ? wholeNumber.format(value)
    : compactNumber.format(value)
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "—"
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/** "in_progress" -> "In progress" */
export function humanize(value: string) {
  const text = value.replace(/_/g, " ")
  return text.charAt(0).toUpperCase() + text.slice(1)
}
