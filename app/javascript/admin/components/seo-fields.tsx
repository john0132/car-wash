import {
  type TranslationEntry,
  textDirection,
} from "@/admin/components/translation-fields"
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"

/** A translation entry carrying SEO text (Admin::Translations with `fields: %i[seo_title seo_description]`). */
export interface SeoTranslationEntry extends TranslationEntry {
  seo_title: string
  seo_description: string
}

/** The `translations` param for entries with SEO text. */
export const seoTranslationParams = (translations: SeoTranslationEntry[]) =>
  translations.map(({ language_id, name, seo_title, seo_description }) => ({
    language_id,
    name,
    seo_title,
    seo_description,
  }))

/**
 * SEO title and description per language. A language without a name has no
 * translation to store them on, so its inputs stay disabled until it gets one.
 */
export function SeoFields<T extends SeoTranslationEntry>({
  translations,
  onChange,
  idPrefix = "seo",
}: {
  translations: T[]
  onChange: (translations: T[]) => void
  idPrefix?: string
}) {
  const update = (
    languageId: number,
    field: "seo_title" | "seo_description",
    value: string,
  ) =>
    onChange(
      translations.map((entry) =>
        entry.language_id === languageId ? { ...entry, [field]: value } : entry,
      ),
    )

  return (
    <div className="space-y-6">
      {translations.map((entry) => {
        const disabled = !entry.name.trim()
        const id = `${idPrefix}_${entry.code}`

        return (
          <fieldset
            key={entry.language_id}
            className="space-y-4"
            disabled={disabled}
          >
            <legend className="text-sm font-medium">
              {entry.language}
              {disabled && (
                <span className="text-muted-foreground ml-2 font-normal">
                  Add a {entry.language} name first
                </span>
              )}
            </legend>
            <Field>
              <FieldLabel htmlFor={`${id}_title`}>SEO title</FieldLabel>
              <Input
                id={`${id}_title`}
                value={entry.seo_title}
                dir={textDirection(entry.code)}
                lang={entry.code}
                maxLength={255}
                onChange={(event) =>
                  update(entry.language_id, "seo_title", event.target.value)
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${id}_description`}>
                SEO description
              </FieldLabel>
              <Textarea
                id={`${id}_description`}
                value={entry.seo_description}
                dir={textDirection(entry.code)}
                lang={entry.code}
                rows={3}
                onChange={(event) =>
                  update(
                    entry.language_id,
                    "seo_description",
                    event.target.value,
                  )
                }
              />
              <FieldDescription>
                {entry.seo_description.length} characters. Search engines
                usually show about 155.
              </FieldDescription>
            </Field>
          </fieldset>
        )
      })}
    </div>
  )
}
