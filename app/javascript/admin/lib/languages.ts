import type { AdminLanguage } from "@/admin/types"

const RTL_LANGUAGES = new Set(["ar", "fa", "he", "ur"])

/** `dir` attribute for inputs holding text in `code`. */
export const textDirection = (code: string): "rtl" | undefined =>
  RTL_LANGUAGES.has(code) ? "rtl" : undefined

/**
 * Codes of languages with errors, for LanguageSwitcher. Translation errors are
 * keyed `translations.<language_id>.<attribute>`, also nested under a prefix
 * (`items.0.translations.<id>.label`); page section content errors are keyed
 * `sections.<i>.fields.<code>.<path>`. A bare `translations` error ("must
 * include a name in English"), also nested (`columns.0.translations`), belongs
 * to the default language.
 */
export function errorLanguageCodes(
  errors: Record<string, unknown>,
  languages: AdminLanguage[],
) {
  const codes = new Set<string>()
  for (const key of Object.keys(errors)) {
    if (key === "translations" || key.endsWith(".translations")) {
      const fallback = languages.find((l) => l.default) ?? languages[0]
      if (fallback) codes.add(fallback.code)
      continue
    }
    const translation = /(?:^|\.)translations\.(\d+)\./.exec(key)
    if (translation) {
      const language = languages.find((l) => l.id === Number(translation[1]))
      if (language) codes.add(language.code)
    }
    const section =
      /^sections\.\d+\.fields\.([a-z]{2,3}(?:-[A-Za-z]+)?)\./.exec(key)
    if (section && languages.some((l) => l.code === section[1])) {
      codes.add(section[1])
    }
  }
  // In tab order, so the first one is the first tab with errors.
  return languages.map((l) => l.code).filter((code) => codes.has(code))
}

const isBlank = (value: unknown) =>
  value == null ||
  (typeof value === "string" && value.replace(/<[^>]*>/g, "").trim() === "")

/**
 * Codes of the optional (non-default) languages with nothing filled in, for
 * LanguageSwitcher's "empty" marker. `translations` is form state keyed by
 * language id; only string values count (images and flags are ignored).
 */
export function emptyLanguageCodes(
  translations: Record<number, object | undefined>,
  languages: AdminLanguage[],
) {
  return languages
    .filter((language) => {
      if (language.default) return false
      const values = Object.values(translations[language.id] ?? {}).filter(
        (value) => typeof value === "string" || value == null,
      )
      return values.every(isBlank)
    })
    .map((language) => language.code)
}
