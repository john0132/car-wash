import type { ComponentField } from "@/admin/features/components/types"
import { FieldInput } from "@/admin/features/pages/components/field-input"
import { RepeaterInput } from "@/admin/features/pages/components/repeater-input"
import type { FieldValues } from "@/admin/features/pages/types"
import { repeaterItems, repeaterTexts } from "@/admin/features/pages/utils"
import { textDirection } from "@/admin/lib/languages"
import type { AdminLanguage, ImageValue } from "@/admin/types"

const WIDE_TYPES = new Set(["text", "rich_text", "repeater"])

/**
 * Inputs for every field of a component schema, editing one language at a
 * time. Shared (non-translatable) values go to `settings`; translatable ones to
 * that language's `content`. This is the whole editor for any component staff
 * define, so new components need no frontend code.
 */
export function SectionFields({
  idPrefix,
  fields,
  language,
  multilingual,
  settings,
  content,
  onChange,
  errors = {},
  imageUrls,
  onImageUploaded,
}: {
  idPrefix: string
  fields: ComponentField[]
  language: AdminLanguage
  multilingual: boolean
  settings: FieldValues
  /** `language`'s content. */
  content: FieldValues
  onChange: (settings: FieldValues, content: FieldValues) => void
  /** Section-scoped error keys: `fields.<path>` / `fields.<code>.<path>`. */
  errors?: Record<string, string[] | undefined>
  imageUrls: Record<string, string>
  onImageUploaded: (image: ImageValue) => void
}) {
  const context = {
    code: language.code,
    dir: textDirection(language.code),
    multilingual,
    imageUrls,
    onImageUploaded,
  }
  const errorAt = (path: string, translatable: boolean) =>
    errors[translatable ? `fields.${language.code}.${path}` : `fields.${path}`]

  if (fields.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        This component has no fields.
      </p>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((field) => (
        <div
          key={field.key}
          className={WIDE_TYPES.has(field.type) ? "sm:col-span-2" : undefined}
        >
          {field.type === "repeater" ? (
            <RepeaterInput
              id={`${idPrefix}-${field.key}`}
              field={field}
              items={repeaterItems(settings[field.key])}
              texts={repeaterTexts(content[field.key])}
              context={context}
              errors={errorAt(field.key, false)}
              errorFor={(index, sub) =>
                errorAt(`${field.key}.${index}.${sub.key}`, sub.translatable)
              }
              onChange={(items, texts) =>
                onChange(
                  { ...settings, [field.key]: items },
                  { ...content, [field.key]: texts },
                )
              }
            />
          ) : (
            <FieldInput
              id={`${idPrefix}-${field.key}`}
              field={field}
              value={
                field.translatable ? content[field.key] : settings[field.key]
              }
              errors={errorAt(field.key, field.translatable)}
              context={context}
              onChange={(value) =>
                field.translatable
                  ? onChange(settings, { ...content, [field.key]: value })
                  : onChange({ ...settings, [field.key]: value }, content)
              }
            />
          )}
        </div>
      ))}
    </div>
  )
}
