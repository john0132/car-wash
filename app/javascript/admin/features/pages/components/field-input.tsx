import { Globe } from "lucide-react"

import { asFieldErrors } from "@/admin/components/form-fields"
import { ImageUploadField } from "@/admin/components/image-upload-field"
import { RichTextEditor } from "@/admin/components/rich-text-editor"
import type { ComponentField } from "@/admin/features/components/types"
import type { FieldValue } from "@/admin/features/pages/types"
import type { ImageValue } from "@/admin/types"
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { Switch } from "@/shared/components/ui/switch"
import { Textarea } from "@/shared/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip"

const NONE = "__none__"

const asText = (value: FieldValue | undefined) =>
  typeof value === "string" || typeof value === "number" ? String(value) : ""

/** Context an input needs beyond its own value. */
export interface FieldInputContext {
  /** Language of translatable text (for `dir`/`lang`). */
  code: string
  dir?: "rtl"
  /** Show the "same in every language" marker on shared fields. */
  multilingual: boolean
  imageUrls: Record<string, string>
  onImageUploaded: (image: ImageValue) => void
}

/** One schema field's input (any type but `repeater`). */
export function FieldInput({
  id,
  field,
  value,
  onChange,
  errors,
  context,
}: {
  id: string
  field: ComponentField
  value: FieldValue | undefined
  onChange: (value: FieldValue) => void
  errors?: string[]
  context: FieldInputContext
}) {
  const invalid = errors ? true : undefined
  const textProps = field.translatable
    ? { dir: context.dir, lang: context.code }
    : {}

  const label = (
    <FieldLabel htmlFor={id}>
      {field.label}
      {field.required && (
        <span aria-hidden className="text-destructive">
          *
        </span>
      )}
      {!field.translatable && context.multilingual && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Globe
              className="text-muted-foreground size-3.5"
              aria-label="Same in every language"
            />
          </TooltipTrigger>
          <TooltipContent>Same in every language</TooltipContent>
        </Tooltip>
      )}
    </FieldLabel>
  )

  if (field.type === "boolean") {
    return (
      <Field orientation="horizontal" data-invalid={invalid}>
        <Switch
          id={id}
          checked={value === true}
          onCheckedChange={(checked) => onChange(checked)}
        />
        <FieldContent>
          {label}
          <FieldError errors={asFieldErrors(errors)} />
        </FieldContent>
      </Field>
    )
  }

  let input
  switch (field.type) {
    case "text":
      input = (
        <Textarea
          id={id}
          rows={3}
          value={asText(value)}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={invalid}
          {...textProps}
        />
      )
      break
    case "rich_text":
      input = (
        <RichTextEditor
          // Remount per language: the editor owns its content once mounted.
          key={`${id}-${context.code}`}
          id={id}
          value={asText(value)}
          onChange={onChange}
          invalid={invalid}
          {...textProps}
        />
      )
      break
    case "image": {
      const signedId = typeof value === "string" && value ? value : null
      input = (
        <ImageUploadField
          id={id}
          invalid={invalid}
          value={
            signedId
              ? { signed_id: signedId, url: context.imageUrls[signedId] ?? "" }
              : null
          }
          onChange={(image) => {
            if (image) context.onImageUploaded(image)
            onChange(image?.signed_id ?? null)
          }}
        />
      )
      break
    }
    case "select":
      input = (
        <Select
          value={asText(value) || NONE}
          onValueChange={(next) => onChange(next === NONE ? null : next)}
        >
          <SelectTrigger id={id} className="w-full" aria-invalid={invalid}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>
              <span className="text-muted-foreground">Default</span>
            </SelectItem>
            {field.options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
      break
    default:
      input = (
        <Input
          id={id}
          type={field.type === "number" ? "number" : "text"}
          inputMode={field.type === "url" ? "url" : undefined}
          placeholder={field.type === "url" ? "https://… or /path" : undefined}
          value={asText(value)}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={invalid}
          {...textProps}
        />
      )
  }

  return (
    <Field data-invalid={invalid}>
      {label}
      {input}
      <FieldError errors={asFieldErrors(errors)} />
    </Field>
  )
}
