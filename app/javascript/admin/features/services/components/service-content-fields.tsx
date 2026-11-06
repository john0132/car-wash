import { textDirection } from "@/admin/components/translation-fields"
import type { ServiceTranslationEntry } from "@/admin/features/services/types"
import { Field, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"

/**
 * Headline and description per language. A language without a name has no
 * translation to store them on, so its inputs stay disabled until it gets one.
 */
export function ServiceContentFields({
  translations,
  onChange,
}: {
  translations: ServiceTranslationEntry[]
  onChange: (translations: ServiceTranslationEntry[]) => void
}) {
  const update = (
    languageId: number,
    field: "title" | "description",
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
        const id = `content_${entry.code}`

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
              <FieldLabel htmlFor={`${id}_title`}>Title</FieldLabel>
              <Input
                id={`${id}_title`}
                value={entry.title}
                dir={textDirection(entry.code)}
                lang={entry.code}
                maxLength={255}
                onChange={(event) =>
                  update(entry.language_id, "title", event.target.value)
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${id}_description`}>Description</FieldLabel>
              <Textarea
                id={`${id}_description`}
                value={entry.description}
                dir={textDirection(entry.code)}
                lang={entry.code}
                rows={5}
                onChange={(event) =>
                  update(entry.language_id, "description", event.target.value)
                }
              />
            </Field>
          </fieldset>
        )
      })}
    </div>
  )
}
