const money = new Intl.NumberFormat("en-EG", {
  style: "currency",
  currency: "EGP",
  maximumFractionDigits: 2,
})

export const formatMoney = (value: number) => money.format(value)

/** 90 → "1 h 30 min", 45 → "45 min", null → null. */
export const formatDuration = (minutes: number | null) => {
  if (!minutes) return null
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest} min`
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`
}
