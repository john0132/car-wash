import type { ReactNode } from "react"

import { SmartLink } from "@/website/components/smart-link"
import type { SchemaField } from "@/website/features/page-sections/types"

type Data = Record<string, unknown>

const isText = (value: unknown): value is string =>
  typeof value === "string" && value.trim() !== ""

// `cta_url` is shown with the text of `cta_label` (or `cta_text`) when the component has one.
function labelFieldFor(urlField: SchemaField, schema: SchemaField[]) {
  const stem = urlField.key.replace(/_?url$/i, "")
  return schema.find(
    (field) =>
      field.type === "string" &&
      field.key !== urlField.key &&
      (field.key === `${stem}_label` ||
        field.key === `${stem}_text` ||
        field.key === `${stem}_title`),
  )
}

function renderFields(
  schema: SchemaField[],
  data: Data,
  keyPrefix: string,
): ReactNode[] {
  const labelKeys = new Set(
    schema
      .filter((field) => field.type === "url")
      .map((field) => labelFieldFor(field, schema)?.key)
      .filter(Boolean),
  )
  let headingShown = false

  return schema.flatMap((field) => {
    const value = data[field.key]
    const key = `${keyPrefix}${field.key}`
    if (labelKeys.has(field.key)) return []

    switch (field.type) {
      case "image": {
        const image = value as { url: string } | null | undefined
        return image?.url
          ? [
              <img
                key={key}
                src={image.url}
                alt=""
                className="h-auto max-w-full rounded-xl"
              />,
            ]
          : []
      }

      case "rich_text":
        // Sanitized on save (HtmlSanitizer), like RichTextBlock.
        return isText(value)
          ? [
              <div
                key={key}
                dir="auto"
                className="prose text-pine [&_a]:text-bronze max-w-none"
                dangerouslySetInnerHTML={{ __html: value }}
              />,
            ]
          : []

      case "url": {
        if (!isText(value)) return []
        const label = labelFieldFor(field, schema)
        const text = label && isText(data[label.key]) ? data[label.key] : value
        return [
          <SmartLink
            key={key}
            href={value}
            className="bg-pine text-ivory hover:bg-pine-deep focus-visible:ring-bronze inline-block w-fit rounded-full px-7 py-3 text-sm font-medium focus-visible:ring-2 focus-visible:outline-none"
          >
            {text as string}
          </SmartLink>,
        ]
      }

      case "repeater": {
        const items = Array.isArray(value) ? (value as Data[]) : []
        return items.length === 0
          ? []
          : [
              <div key={key} className="grid gap-6 sm:grid-cols-2">
                {items.map((item, index) => (
                  <div
                    key={(item.id as string) ?? index}
                    className="border-pine/10 flex flex-col gap-3 rounded-2xl border p-5"
                  >
                    {renderFields(field.fields, item, `${key}.${index}.`)}
                  </div>
                ))}
              </div>,
            ]
      }

      case "boolean":
        return []

      default: {
        const text =
          typeof value === "number"
            ? String(value)
            : isText(value)
              ? value
              : null
        if (text === null) return []
        // The first short text field is the section's heading; the rest is body text.
        if (!headingShown && field.type === "string") {
          headingShown = true
          return [
            <h2
              key={key}
              dir="auto"
              className="font-display text-pine text-3xl sm:text-4xl"
            >
              {text}
            </h2>,
          ]
        }
        return [
          <p key={key} dir="auto" className="text-sage leading-relaxed">
            {text}
          </p>,
        ]
      }
    }
  })
}

// Renders a section whose component key has no dedicated React component —
// a staff-defined component created in the dashboard (see Component model
// and Page#render_props' `components` schema map) — generically from its
// field schema, so new components work on the website without a deploy. Field
// labels are for the dashboard and are never shown to visitors.
export function GenericBlock({
  schema,
  data,
}: {
  schema: SchemaField[]
  data: Data
}) {
  return (
    <section className="bg-white px-6 py-16">
      <div className="mx-auto flex max-w-3xl flex-col gap-5">
        {renderFields(schema, data, "")}
      </div>
    </section>
  )
}
