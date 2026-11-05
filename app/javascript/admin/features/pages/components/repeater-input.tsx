import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react"

import type { ComponentField } from "@/admin/features/components/types"
import {
  FieldInput,
  type FieldInputContext,
} from "@/admin/features/pages/components/field-input"
import type { FieldValues, RepeaterItem } from "@/admin/features/pages/types"
import { newItemId } from "@/admin/features/pages/utils"
import { Button } from "@/shared/components/ui/button"
import { FieldError, FieldLabel } from "@/shared/components/ui/field"

const asFieldErrors = (messages?: string[]) =>
  messages?.map((message) => ({ message }))

/**
 * A `repeater` field. Items (order + shared sub-fields) are the same in every
 * language; translatable sub-fields show the current language's text, stored
 * by item `_id`. Adding, removing or moving an item affects all languages.
 */
export function RepeaterInput({
  id,
  field,
  items,
  texts,
  onChange,
  errorFor,
  errors,
  context,
}: {
  id: string
  field: ComponentField
  items: RepeaterItem[]
  /** Current language's text: `{ [item._id]: { [subKey]: value } }`. */
  texts: Record<string, FieldValues>
  onChange: (items: RepeaterItem[], texts: Record<string, FieldValues>) => void
  /** Errors for `items.<index>.<subKey>` (already scoped to the language for translatable ones). */
  errorFor: (index: number, sub: ComponentField) => string[] | undefined
  /** Errors for the list itself, e.g. "needs at least one item". */
  errors?: string[]
  context: FieldInputContext
}) {
  const move = (index: number, offset: number) => {
    const next = [...items]
    const [item] = next.splice(index, 1)
    next.splice(index + offset, 0, item)
    onChange(next, texts)
  }

  return (
    <fieldset className="space-y-3">
      <FieldLabel asChild>
        <legend>
          {field.label}
          {field.required && (
            <span aria-hidden className="text-destructive">
              *
            </span>
          )}
        </legend>
      </FieldLabel>

      {items.length === 0 && (
        <p className="text-muted-foreground text-sm">No items yet.</p>
      )}

      <ol className="space-y-3">
        {items.map((item, index) => (
          <li key={item._id} className="space-y-3 rounded-md border p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground text-xs font-medium uppercase">
                Item {index + 1}
              </span>
              <div className="flex items-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label={`Move item ${index + 1} up`}
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  <ArrowUp />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label={`Move item ${index + 1} down`}
                  disabled={index === items.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <ArrowDown />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label={`Remove item ${index + 1}`}
                  onClick={() => {
                    onChange(
                      items.filter((other) => other._id !== item._id),
                      Object.fromEntries(
                        Object.entries(texts).filter(([id]) => id !== item._id),
                      ),
                    )
                  }}
                >
                  <Trash2 />
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {field.fields.map((sub) => (
                <div
                  key={sub.key}
                  className={
                    sub.type === "rich_text" || sub.type === "text"
                      ? "sm:col-span-2"
                      : undefined
                  }
                >
                  <FieldInput
                    id={`${id}-${index}-${sub.key}`}
                    field={sub}
                    value={
                      sub.translatable
                        ? texts[item._id]?.[sub.key]
                        : item[sub.key]
                    }
                    errors={errorFor(index, sub)}
                    context={context}
                    onChange={(value) =>
                      sub.translatable
                        ? onChange(items, {
                            ...texts,
                            [item._id]: {
                              ...texts[item._id],
                              [sub.key]: value,
                            },
                          })
                        : onChange(
                            items.map((other) =>
                              other._id === item._id
                                ? { ...other, [sub.key]: value }
                                : other,
                            ),
                            texts,
                          )
                    }
                  />
                </div>
              ))}
            </div>
          </li>
        ))}
      </ol>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...items, { _id: newItemId() }], texts)}
      >
        <Plus /> Add item
      </Button>
      <FieldError errors={asFieldErrors(errors)} />
    </fieldset>
  )
}
