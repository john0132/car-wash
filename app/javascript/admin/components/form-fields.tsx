import { Globe } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"

import type { AdminLanguage } from "@/admin/types"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
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

export const asFieldErrors = (messages?: string[] | string) =>
  messages === undefined
    ? undefined
    : (Array.isArray(messages) ? messages : [messages]).map((message) => ({
        message,
      }))

const RequiredMark = () => (
  <span aria-hidden className="text-destructive">
    *
  </span>
)

/**
 * A titled card grouping related form inputs. In multilingual forms, mark
 * sections whose inputs are the same in every language as `shared`.
 */
export function FormSection({
  title,
  description,
  actions,
  shared = false,
  children,
}: {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  shared?: boolean
  children: ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2 className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {title}
            {shared && (
              <span className="text-muted-foreground inline-flex items-center gap-1 text-xs font-normal">
                <Globe aria-hidden className="size-3.5" />
                Same in every language
              </span>
            )}
          </h2>
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {actions && <CardAction>{actions}</CardAction>}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  )
}

/**
 * A FormSection holding one language's text, titled "{title} · {language}".
 * By default the description says whether the language is required; pass
 * `description={null}` to leave it out. On the default language, `baseError`
 * shows the model's "must include … in English".
 */
export function TranslatedSection({
  title,
  language,
  description,
  baseError,
  children,
}: {
  title: ReactNode
  language: AdminLanguage
  description?: ReactNode | null
  baseError?: string[]
  children: ReactNode
}) {
  return (
    <FormSection
      title={
        <>
          {title} · <span lang={language.code}>{language.name}</span>
        </>
      }
      description={
        description !== undefined
          ? description
          : language.default
            ? "Required in the default language."
            : "Optional. Leave every field empty to remove this language; the website then falls back to the default language."
      }
    >
      {language.default && baseError && (
        <FieldError
          className="bg-destructive/10 rounded-md px-3 py-2"
          errors={asFieldErrors(
            baseError.map((message) => `Translations ${message}`),
          )}
        />
      )}
      {children}
    </FormSection>
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
        {required && <RequiredMark />}
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
        {required && <RequiredMark />}
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

/** A switch with a label and help text, e.g. "Active" or "Published". */
export function SwitchField({
  id,
  label,
  description,
  checked,
  onChange,
  errors,
  disabled,
}: {
  id: string
  label: ReactNode
  description?: ReactNode
  checked: boolean
  onChange: (checked: boolean) => void
  errors?: string[]
  disabled?: boolean
}) {
  return (
    <Field orientation="horizontal" data-invalid={errors ? true : undefined}>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
      />
      <FieldContent>
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        {description && <FieldDescription>{description}</FieldDescription>}
        <FieldError errors={asFieldErrors(errors)} />
      </FieldContent>
    </Field>
  )
}

export interface SelectOption {
  value: string
  label: ReactNode
  disabled?: boolean
}

/** Labelled single select with errors. `value` "" shows the placeholder. */
export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  errors,
  description,
  required,
  className,
}: {
  id: string
  label: ReactNode
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  errors?: string[]
  description?: ReactNode
  required?: boolean
  className?: string
}) {
  return (
    <Field data-invalid={errors ? true : undefined} className={className}>
      <FieldLabel htmlFor={id}>
        {label}
        {required && <RequiredMark />}
      </FieldLabel>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          id={id}
          className="w-full"
          aria-invalid={errors ? true : undefined}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={asFieldErrors(errors)} />
    </Field>
  )
}

/**
 * URL slug input; typing is normalised to lowercase letters, numbers and dashes.
 * `path` is the public URL prefix shown in the help text, e.g. "/services/".
 */
export function SlugField({
  value,
  onChange,
  path,
  errors,
  required = false,
  placeholder,
}: {
  value: string
  onChange: (slug: string) => void
  path: string
  errors?: string[]
  required?: boolean
  placeholder?: string
}) {
  return (
    <TextField
      id="slug"
      label="URL slug"
      value={value}
      onChange={(next) =>
        onChange(next.toLowerCase().replace(/[^a-z0-9-]+/g, "-"))
      }
      errors={errors}
      required={required}
      placeholder={placeholder}
      className="sm:max-w-sm"
      description={
        <>
          The page lives at {path}
          {value || "your-slug"}.
          {!required && " Leave blank to generate it from the name."}
        </>
      }
    />
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
