import { asFieldErrors } from "@/admin/components/form-fields"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"

/** Admin::Translations#translations_props: one entry per language. */
export interface TranslationEntry {
  language_id: number
  code: string
  language: string
  /** The default locale's language; its name is required. */
  default: boolean
  name: string
}

const RTL_LANGUAGES = new Set(["ar", "fa", "he", "ur"])

/** `dir` for an input holding text in `code`'s language. */
export const textDirection = (code: string) =>
  RTL_LANGUAGES.has(code) ? "rtl" : undefined

/** The `translations` param Admin::Translations#assign_translations expects. */
export const translationParams = (translations: TranslationEntry[]) =>
  translations.map(({ language_id, name }) => ({ language_id, name }))

/**
 * One name input per language. Leaving an optional language blank removes it.
 * Extra fields on the entries (e.g. SEO text) are passed through untouched.
 */
export function TranslationFields<T extends TranslationEntry>({
  translations,
  onChange,
  errors,
  idPrefix = "name",
}: {
  translations: T[]
  onChange: (translations: T[]) => void
  errors?: string[]
  idPrefix?: string
}) {
  const setName = (languageId: number, name: string) =>
    onChange(
      translations.map((entry) =>
        entry.language_id === languageId ? { ...entry, name } : entry,
      ),
    )

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {translations.map((entry) => {
          const id = `${idPrefix}_${entry.code}`
          const invalid = Boolean(errors) && entry.default && !entry.name.trim()

          return (
            <Field key={entry.language_id} data-invalid={invalid || undefined}>
              <FieldLabel htmlFor={id}>
                Name ({entry.language})
                {!entry.default && (
                  <span className="text-muted-foreground font-normal">
                    optional
                  </span>
                )}
              </FieldLabel>
              <Input
                id={id}
                value={entry.name}
                dir={textDirection(entry.code)}
                lang={entry.code}
                onChange={(event) =>
                  setName(entry.language_id, event.target.value)
                }
                aria-invalid={invalid || undefined}
                required={entry.default}
              />
            </Field>
          )
        })}
      </div>
      {translations.length === 0 ? (
        <FieldDescription>
          No languages are set up yet. Add a Language record first.
        </FieldDescription>
      ) : null}
      <FieldError errors={asFieldErrors(errors)} />
    </div>
  )
}
