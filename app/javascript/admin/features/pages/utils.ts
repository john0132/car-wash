import type {
  ComponentField,
  ComponentOption,
} from "@/admin/features/components/types"
import type {
  FieldValue,
  FieldValues,
  RepeaterItem,
  SectionProps,
  SectionState,
} from "@/admin/features/pages/types"

export const newItemId = () =>
  crypto.randomUUID().replace(/-/g, "").slice(0, 10)

export const sectionState = (section: SectionProps): SectionState => ({
  ...section,
  uid: `section-${section.id}`,
})

export const newSection = (component: ComponentOption): SectionState => ({
  uid: `new-${crypto.randomUUID()}`,
  id: null,
  component_id: component.id,
  is_active: true,
  settings: {},
  content: {},
  image_urls: {},
})

export const repeaterItems = (value: FieldValue | undefined): RepeaterItem[] =>
  Array.isArray(value)
    ? value.filter(
        (item): item is RepeaterItem =>
          typeof item === "object" && item !== null && "_id" in item,
      )
    : []

export const repeaterTexts = (
  value: FieldValue | undefined,
): Record<string, FieldValues> =>
  typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, FieldValues>)
    : {}

/** A short, human summary of a section for its collapsed header. */
export function sectionSummary(
  fields: ComponentField[],
  section: SectionState,
  languageId: number | undefined,
) {
  const content =
    (languageId === undefined ? undefined : section.content[languageId]) ?? {}
  for (const field of fields) {
    if (!["string", "text"].includes(field.type)) continue
    const value = field.translatable
      ? content[field.key]
      : section.settings[field.key]
    if (typeof value === "string" && value.trim()) return value.trim()
  }
  return null
}

/**
 * Error keys the server sends for section `index` (see PageSection):
 * `sections.<i>.fields.<path>` for shared values and
 * `sections.<i>.fields.<code>.<path>` for translatable ones.
 */
export function sectionErrors(
  errors: Record<string, string[] | undefined>,
  index: number,
) {
  const prefix = `sections.${index}.`
  const scoped: Record<string, string[] | undefined> = {}
  for (const [key, messages] of Object.entries(errors)) {
    if (key.startsWith(prefix)) scoped[key.slice(prefix.length)] = messages
  }
  return scoped
}
