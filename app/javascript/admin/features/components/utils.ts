import {
  type ComponentField,
  type FieldDraft,
  type FieldType,
  TRANSLATABLE_BY_DEFAULT,
  TRANSLATABLE_TYPES,
} from "@/admin/features/components/types"

const uid = () => crypto.randomUUID()

/** "Button label" -> "button_label" */
export const fieldKey = (label: string) =>
  label
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^[^a-z]+/, "")
    .replace(/_+$/, "")

export const toDraft = (field: ComponentField): FieldDraft => ({
  uid: uid(),
  key: field.key,
  keyTouched: true,
  label: field.label,
  type: field.type,
  translatable: field.translatable,
  required: field.required,
  optionsText: field.options.join(", "),
  fields: field.fields.map(toDraft),
})

export const newDraft = (type: FieldType = "string"): FieldDraft => ({
  uid: uid(),
  key: "",
  keyTouched: false,
  label: "",
  type,
  translatable: TRANSLATABLE_BY_DEFAULT.includes(type),
  required: false,
  optionsText: "",
  fields: [],
})

const parseOptions = (text: string) => [
  ...new Set(
    text
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean),
  ),
]

export const fromDraft = (draft: FieldDraft): ComponentField => ({
  key: draft.key.trim(),
  label: draft.label.trim() || draft.key.trim(),
  type: draft.type,
  translatable: TRANSLATABLE_TYPES.includes(draft.type) && draft.translatable,
  required: draft.required,
  options: draft.type === "select" ? parseOptions(draft.optionsText) : [],
  fields: draft.type === "repeater" ? draft.fields.map(fromDraft) : [],
})
