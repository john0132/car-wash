/** 90 → "1 h 30 min", 45 → "45 min", null → null. */
export const formatDuration = (minutes: number | null) => {
  if (!minutes) return null
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest} min`
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`
}

/** Session storage key for the extras picked on a service's page. */
export const selectedExtrasKey = (serviceSlug: string) =>
  `service-extras:${serviceSlug}`

/** Blank-line separated text → paragraphs. */
export const paragraphs = (text: string | null) =>
  (text ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
