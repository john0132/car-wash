const RTL_LANGUAGES = new Set(["ar", "fa", "he", "ur"])

/** `dir` attribute for inputs holding text in `code`. */
export const textDirection = (code: string): "rtl" | undefined =>
  RTL_LANGUAGES.has(code) ? "rtl" : undefined

/**
 * Codes of languages with errors, for LanguageSwitcher: translation errors are
 * keyed `translations.<language_id>.<attribute>`, section content errors
 * `sections.<i>.fields.<code>.<path>`.
 */
export function errorLanguageCodes(
  errors: Record<string, unknown>,
  languages: { id: number; code: string }[],
) {
  const codes = new Set<string>()
  for (const key of Object.keys(errors)) {
    const translation = /^translations\.(\d+)\./.exec(key)
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
  return [...codes]
}
