import type { ServiceTranslationEntry } from "@/admin/features/services/types"

/** The `translations` param Admin::ServicesController expects. */
export const serviceTranslationParams = (
  translations: ServiceTranslationEntry[],
) =>
  translations.map(
    ({
      language_id,
      name,
      title,
      description,
      seo_title,
      seo_description,
    }) => ({
      language_id,
      name,
      title,
      description,
      seo_title,
      seo_description,
    }),
  )

/** 90 → "1 h 30 min", 45 → "45 min", null → null. */
export const formatDuration = (minutes: number | null) => {
  if (!minutes) return null
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest} min`
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`
}
