import type { ComponentProps, ReactNode } from "react"

import { Card, CardContent } from "@/shared/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"

export const asFieldErrors = (messages?: string[] | string) =>
  messages === undefined
    ? undefined
    : (Array.isArray(messages) ? messages : [messages]).map((message) => ({
        message,
      }))

/** A titled card grouping related form inputs. */
export function FormSection({
  title,
  description,
  actions,
  children,
}: {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 className="font-medium">{title}</h2>
            {description && (
              <p className="text-muted-foreground text-sm">{description}</p>
            )}
          </div>
          {actions}
        </div>
        {children}
      </CardContent>
    </Card>
  )
}

interface TextFieldProps {
  id: string
  label: ReactNode
  value: string
  onChange: (value: string) => void
  errors?: string[]
  description?: ReactNode
  required?: boolean
}

/** Labelled text input with errors. */
export function TextField({
  id,
  label,
  value,
  onChange,
  errors,
  description,
  required,
  ...props
}: TextFieldProps & Omit<ComponentProps<typeof Input>, keyof TextFieldProps>) {
  return (
    <Field data-invalid={errors ? true : undefined}>
      <FieldLabel htmlFor={id}>
        {label}
        {required && (
          <span aria-hidden className="text-destructive">
            *
          </span>
        )}
      </FieldLabel>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={errors ? true : undefined}
        {...props}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={asFieldErrors(errors)} />
    </Field>
  )
}

/** Labelled textarea with errors. */
export function TextareaField({
  id,
  label,
  value,
  onChange,
  errors,
  description,
  required,
  ...props
}: TextFieldProps &
  Omit<ComponentProps<typeof Textarea>, keyof TextFieldProps>) {
  return (
    <Field data-invalid={errors ? true : undefined}>
      <FieldLabel htmlFor={id}>
        {label}
        {required && (
          <span aria-hidden className="text-destructive">
            *
          </span>
        )}
      </FieldLabel>
      <Textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={errors ? true : undefined}
        {...props}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={asFieldErrors(errors)} />
    </Field>
  )
}

/** "about-us" from "About us!" */
export const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
