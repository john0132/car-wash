import { cn } from "cn"
import { Lock, Plus } from "lucide-react"

import { ReorderButtons } from "@/admin/components/reorder-buttons"
import {
  FIELD_TYPES,
  type FieldDraft,
  type FieldType,
  TRANSLATABLE_BY_DEFAULT,
  TRANSLATABLE_TYPES,
} from "@/admin/features/components/types"
import { fieldKey, newDraft } from "@/admin/features/components/utils"
import { moveItem } from "@/admin/lib/lists"
import { Button } from "@/shared/components/ui/button"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { Field, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip"

/**
 * Edits a component's field schema: label, key, type, whether it's
 * translatable/required, choice options and (for lists) sub-fields. Fields in
 * `locked` (paths pages store values for) can't change type or translation.
 */
export function FieldListEditor({
  fields,
  onChange,
  locked,
  nested = false,
  pathPrefix = "",
}: {
  fields: FieldDraft[]
  onChange: (fields: FieldDraft[]) => void
  locked: string[]
  nested?: boolean
  pathPrefix?: string
}) {
  const update = (uid: string, patch: Partial<FieldDraft>) =>
    onChange(fields.map((f) => (f.uid === uid ? { ...f, ...patch } : f)))

  const types = nested
    ? FIELD_TYPES.filter((t) => t.value !== "repeater")
    : FIELD_TYPES

  return (
    <div className="space-y-3">
      {fields.length === 0 && (
        <p className="text-muted-foreground text-sm">
          {nested ? "Add the fields each item has." : "No fields yet."}
        </p>
      )}

      {fields.map((field, index) => {
        const id = `field-${field.uid}`
        const isLocked = locked.includes(`${pathPrefix}${field.key}`)
        const canTranslate = TRANSLATABLE_TYPES.includes(field.type)

        return (
          <div
            key={field.uid}
            className={cn(
              "space-y-3 rounded-md border p-3",
              nested && "bg-muted/30",
            )}
          >
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_11rem_auto]">
              <Field>
                <FieldLabel htmlFor={`${id}-label`}>Label</FieldLabel>
                <Input
                  id={`${id}-label`}
                  value={field.label}
                  placeholder="e.g. Heading"
                  onChange={(event) => {
                    const label = event.target.value
                    update(field.uid, {
                      label,
                      ...(field.keyTouched ? {} : { key: fieldKey(label) }),
                    })
                  }}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor={`${id}-key`}>Key</FieldLabel>
                <Input
                  id={`${id}-key`}
                  value={field.key}
                  className="font-mono"
                  placeholder="heading"
                  onChange={(event) =>
                    update(field.uid, {
                      key: event.target.value,
                      keyTouched: true,
                    })
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor={`${id}-type`}>
                  Type
                  {isLocked && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Lock
                          className="text-muted-foreground size-3.5"
                          aria-label="Locked"
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        Pages store values for this field, so its type and
                        translation can&apos;t change.
                      </TooltipContent>
                    </Tooltip>
                  )}
                </FieldLabel>
                <Select
                  value={field.type}
                  disabled={isLocked}
                  onValueChange={(value) => {
                    const type = value as FieldType
                    update(field.uid, {
                      type,
                      translatable: TRANSLATABLE_BY_DEFAULT.includes(type),
                      fields: type === "repeater" ? field.fields : [],
                    })
                  }}
                >
                  <SelectTrigger id={`${id}-type`} className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <div className="pb-0.5">
                <ReorderButtons
                  index={index}
                  count={fields.length}
                  noun={field.label || "field"}
                  onMove={(offset) => onChange(moveItem(fields, index, offset))}
                  onRemove={() =>
                    onChange(fields.filter((f) => f.uid !== field.uid))
                  }
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={field.required}
                  onCheckedChange={(checked) =>
                    update(field.uid, { required: checked === true })
                  }
                />
                {field.type === "repeater"
                  ? "Needs at least one item"
                  : "Required"}
              </label>
              {canTranslate && (
                <label
                  className={cn(
                    "flex items-center gap-2",
                    isLocked && "opacity-60",
                  )}
                >
                  <Checkbox
                    checked={field.translatable}
                    disabled={isLocked}
                    onCheckedChange={(checked) =>
                      update(field.uid, { translatable: checked === true })
                    }
                  />
                  Different in each language
                </label>
              )}
            </div>

            {field.type === "select" && (
              <Field>
                <FieldLabel htmlFor={`${id}-options`}>
                  Options (comma separated)
                </FieldLabel>
                <Input
                  id={`${id}-options`}
                  value={field.optionsText}
                  placeholder="left, center, right"
                  onChange={(event) =>
                    update(field.uid, { optionsText: event.target.value })
                  }
                />
              </Field>
            )}

            {field.type === "repeater" && (
              <div className="space-y-2 border-l-2 pl-3">
                <p className="text-sm font-medium">Fields of each item</p>
                <FieldListEditor
                  nested
                  fields={field.fields}
                  locked={locked}
                  pathPrefix={`${field.key}.`}
                  onChange={(sub) => update(field.uid, { fields: sub })}
                />
              </div>
            )}
          </div>
        )
      })}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...fields, newDraft()])}
      >
        <Plus /> Add field
      </Button>
    </div>
  )
}
