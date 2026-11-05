import type { ListFilterValues } from "@/admin/components/list-filters"

/** ComponentSchema::TYPES */
export type FieldType =
  | "string"
  | "text"
  | "rich_text"
  | "url"
  | "image"
  | "select"
  | "number"
  | "boolean"
  | "repeater"

/** ComponentSchema::Field#as_json. A repeater's sub-fields are in `fields`. */
export interface ComponentField {
  key: string
  label: string
  type: FieldType
  translatable: boolean
  required: boolean
  options: string[]
  fields: ComponentField[]
}

/** Admin::ComponentOptions#component_option */
export interface ComponentOption {
  id: number
  key: string
  name: string
  description: string | null
  is_active: boolean
  fields: ComponentField[]
}

export interface ComponentRow extends Omit<ComponentOption, "fields"> {
  fields_count: number
  pages_count: number
}

export interface ComponentDetail extends Omit<ComponentOption, "id"> {
  id: number | null
  in_use: boolean
  /** Paths ("heading", "items.title") whose type can't change: pages store values for them. */
  locked_fields: string[]
}

export interface ComponentTranslation {
  language_id: number
  code: string
  language: string
  default: boolean
  name: string
  description: string
}

export type ComponentFilters = ListFilterValues

export const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: "string", label: "Short text" },
  { value: "text", label: "Long text" },
  { value: "rich_text", label: "Rich text" },
  { value: "url", label: "Link" },
  { value: "image", label: "Image" },
  { value: "select", label: "Choice" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Yes / no" },
  { value: "repeater", label: "List of items" },
]

/** ComponentSchema::TRANSLATABLE_TYPES: only text can differ per language. */
export const TRANSLATABLE_TYPES: FieldType[] = [
  "string",
  "text",
  "rich_text",
  "url",
]

/** New fields of these types start out translatable. */
export const TRANSLATABLE_BY_DEFAULT: FieldType[] = [
  "string",
  "text",
  "rich_text",
]

/** A field being edited in the schema builder. `uid` is client-only. */
export interface FieldDraft {
  uid: string
  key: string
  /** Once edited by hand, the key no longer follows the label. */
  keyTouched: boolean
  label: string
  type: FieldType
  translatable: boolean
  required: boolean
  optionsText: string
  fields: FieldDraft[]
}
