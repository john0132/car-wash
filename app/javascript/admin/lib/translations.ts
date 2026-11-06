import type { AdminLanguage, TranslationEntry } from "@/admin/types"

/** The languages of Admin::ContentTranslations entries, in their order (default first). */
export const languagesOf = (
  entries: Pick<
    TranslationEntry,
    "language_id" | "code" | "language" | "default"
  >[],
) =>
  entries.map((entry): AdminLanguage => ({
    id: entry.language_id,
    code: entry.code,
    name: entry.language,
    default: entry.default,
  }))

/** Form state for translations: each language's `fields`, keyed by language id. */
export function translationValues<F extends string>(
  entries: TranslationEntry<F>[],
  fields: readonly F[],
) {
  const values: Record<number, Record<F, string>> = {}
  for (const entry of entries) {
    const translation = blankValues(fields)
    for (const field of fields) translation[field] = entry[field] ?? ""
    values[entry.language_id] = translation
  }
  return values
}

/** Blank values for `fields`, for a language with nothing in form state yet. */
export const blankValues = <F extends string>(fields: readonly F[]) =>
  Object.fromEntries(fields.map((field) => [field, ""])) as Record<F, string>

/** `data` with `patch` merged into one language's translation. */
export function patchTranslation<
  V extends object,
  D extends { translations: Record<number, V> },
>(data: D, languageId: number, patch: Partial<V>, blank: V): D {
  return {
    ...data,
    translations: {
      ...data.translations,
      [languageId]: { ...(data.translations[languageId] ?? blank), ...patch },
    },
  }
}
