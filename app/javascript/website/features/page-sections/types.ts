/** ComponentSchema::Field#as_json. A repeater's sub-fields are in `fields`. */
export interface SchemaField {
  key: string
  label: string
  type:
    | "string"
    | "text"
    | "rich_text"
    | "url"
    | "image"
    | "select"
    | "number"
    | "boolean"
    | "repeater"
  translatable: boolean
  required: boolean
  options: string[]
  fields: SchemaField[]
}

/** PageSection#render_props. */
export interface PageSectionData {
  id: number
  component: string
  data: Record<string, unknown>
}

/**
 * Whether `data` has every field `schema` marks `required`, type-checked
 * loosely by `field.type`. Used to guard a dedicated block's cast of
 * `PageSectionData#data` (untyped staff-authored JSON) before trusting it —
 * a schema edited in the dashboard can drift from what a block component
 * expects, and rendering with a missing/wrong-typed required field is worse
 * than falling back to GenericBlock.
 */
export function hasRequiredFields(
  schema: SchemaField[],
  data: Record<string, unknown>,
): boolean {
  return schema.every((field) => {
    if (!field.required) return true
    const value = data[field.key]
    switch (field.type) {
      case "number":
        return typeof value === "number"
      case "boolean":
        return typeof value === "boolean"
      case "repeater":
        return Array.isArray(value)
      default:
        return typeof value === "string" && value !== ""
    }
  })
}

/** Page#render_props. */
export interface PageProps {
  id: number
  slug: string
  title: string | null
  subtitle: string | null
  seo: {
    title: string | null
    description: string | null
    image: { url: string } | null
  }
  sections: PageSectionData[]
  components: Record<string, SchemaField[]>
}
