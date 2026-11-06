/** Session storage key for the extras picked on a service's page. */
export const selectedExtrasKey = (serviceSlug: string) =>
  `service-extras:${serviceSlug}`

/** Blank-line separated text → paragraphs. */
export const paragraphs = (text: string | null) =>
  (text ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
