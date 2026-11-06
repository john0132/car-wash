import type { SchemaField } from "@/website/features/page-sections/types"

function GenericValue({
  field,
  value,
}: {
  field: SchemaField
  value: unknown
}) {
  if (field.type === "image") {
    const image = value as { url: string } | null | undefined
    return image?.url ? (
      <img src={image.url} alt="" className="h-auto max-w-full rounded-xl" />
    ) : null
  }

  if (field.type === "repeater") {
    const items = Array.isArray(value)
      ? (value as Record<string, unknown>[])
      : []
    return (
      <div className="grid gap-6 sm:grid-cols-2">
        {items.map((item, index) => (
          <div
            key={(item.id as string) ?? index}
            className="rounded-2xl border border-[#2B3A32]/10 p-5"
          >
            {field.fields.map((sub) => (
              <div key={sub.key} className="mt-2">
                <GenericValue field={sub} value={item[sub.key]} />
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  if (field.type === "boolean") return <span>{value ? "Yes" : "No"}</span>

  if (value === null || value === undefined || value === "") return null

  const text =
    typeof value === "string" || typeof value === "number" ? value : null
  if (text === null) return null

  return <p className="text-sm leading-relaxed text-[#5B6B5E]">{text}</p>
}

// Renders a section whose component key has no dedicated React component —
// a staff-defined component created in the dashboard (see Component model
// and Page#render_props' `components` schema map) — generically from its
// field schema, so new components work on the website without a deploy.
export function GenericBlock({
  schema,
  data,
}: {
  schema: SchemaField[]
  data: Record<string, unknown>
}) {
  return (
    <section className="bg-white px-6 py-16">
      <div className="mx-auto max-w-3xl space-y-8">
        {schema.map((field) => (
          <div key={field.key}>
            <p className="text-xs font-medium tracking-[0.2em] text-[#8A6240] uppercase">
              {field.label}
            </p>
            <div className="mt-2">
              <GenericValue field={field} value={data[field.key]} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
