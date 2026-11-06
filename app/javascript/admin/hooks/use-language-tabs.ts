import { useState } from "react"

import type { FormErrors } from "@/admin/lib/forms"
import { errorLanguageCodes } from "@/admin/lib/languages"
import type { AdminLanguage } from "@/admin/types"

/**
 * The language a multilingual form is editing, for FormLayout's LanguageSwitcher.
 * Starts on the default language. When new errors arrive and the current tab has
 * none, it moves to the first tab that does, so a failed save always shows why.
 *
 * `language` is undefined only when no Language records exist.
 */
export function useLanguageTabs(
  languages: AdminLanguage[],
  errors: FormErrors,
) {
  const defaultLanguage = languages.find((l) => l.default) ?? languages[0]
  const [code, setCode] = useState(defaultLanguage?.code ?? "")
  const language = languages.find((l) => l.code === code) ?? defaultLanguage
  const errorCodes = errorLanguageCodes(errors, languages)

  // Adjusting state while rendering (not in an effect), keyed on the errors
  // object, which Inertia replaces on each failed submit.
  const [seenErrors, setSeenErrors] = useState(errors)
  if (errors !== seenErrors) {
    setSeenErrors(errors)
    if (errorCodes.length > 0 && !errorCodes.includes(code)) {
      setCode(errorCodes[0])
    }
  }

  return {
    language,
    setCode,
    errorCodes,
    /** The model-level "must include … in English" error, shown on the default tab. */
    baseError: errors.translations,
    /** The current language's errors for one translated attribute. */
    errorFor: (attribute: string) =>
      language ? errors[`translations.${language.id}.${attribute}`] : undefined,
  }
}
