import { Link, useForm } from "@inertiajs/react"
import type { ReactNode } from "react"

import { asFieldErrors } from "@/admin/components/form-fields"
import { MembershipBadge } from "@/admin/features/customers/components/membership-badge"
import type {
  MembershipDetail,
  MembershipFormData,
  MembershipTranslation,
} from "@/admin/features/memberships/types"
import type { RouteDefinition } from "@/routes/runtime"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { Spinner } from "@/shared/components/ui/spinner"
import { Switch } from "@/shared/components/ui/switch"

const toHex = (color: string) => (color.startsWith("#") ? color : `#${color}`)

/** Create/edit form for a membership tier. Posts `{ membership: {...} }`. */
export function MembershipForm({
  membership,
  translations,
  action,
  cancelHref,
  submitLabel,
}: {
  membership: MembershipDetail
  translations: MembershipTranslation[]
  action: RouteDefinition<"post" | "patch">
  cancelHref: string
  submitLabel: string
}) {
  const form = useForm<MembershipFormData>({
    is_active: membership.is_active,
    egp_to_points: String(membership.egp_to_points),
    points_to_egp: String(membership.points_to_egp),
    background_color: toHex(membership.background_color),
    text_color: toHex(membership.text_color),
    translations: Object.fromEntries(
      translations.map((t) => [
        t.language_id,
        { name: t.name ?? "", description: t.description ?? "" },
      ]),
    ),
  })
  const { data, setData, errors, processing } = form
  const fieldErrors = errors as Record<string, string[] | undefined>

  form.transform((values) => ({ membership: values }))

  const setTranslation = (
    languageId: number,
    key: "name" | "description",
    value: string,
  ) =>
    setData("translations", {
      ...data.translations,
      [languageId]: { ...data.translations[languageId], [key]: value },
    })

  const previewName =
    Object.values(data.translations).find((t) => t.name.trim())?.name ??
    "Tier name"

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        form.submit(action, { preserveScroll: true })
      }}
      className="max-w-2xl space-y-6"
    >
      <Section
        title="Name & description"
        description="Shown to customers in their language. Fill in at least one language."
      >
        {translations.map((t) => (
          <div
            key={t.language_id}
            className="space-y-3 rounded-md border p-3"
            dir={t.code === "ar" ? "rtl" : undefined}
          >
            <p className="text-muted-foreground text-xs font-medium uppercase">
              {t.language}
            </p>
            <TextField
              id={`name_${t.language_id}`}
              label="Name"
              value={data.translations[t.language_id]?.name ?? ""}
              onChange={(value) => setTranslation(t.language_id, "name", value)}
            />
            <TextField
              id={`description_${t.language_id}`}
              label="Description"
              value={data.translations[t.language_id]?.description ?? ""}
              onChange={(value) =>
                setTranslation(t.language_id, "description", value)
              }
            />
          </div>
        ))}
        <FieldError errors={asFieldErrors(fieldErrors.translations)} />
      </Section>

      <Section
        title="Points"
        description="How customers in this tier earn and spend points."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="egp_to_points"
            label="Points earned per EGP spent"
            type="number"
            step="0.01"
            min="0"
            value={data.egp_to_points}
            onChange={(value) => setData("egp_to_points", value)}
            errors={errors.egp_to_points}
            required
          />
          <TextField
            id="points_to_egp"
            label="EGP value of one point"
            type="number"
            step="0.01"
            min="0"
            value={data.points_to_egp}
            onChange={(value) => setData("points_to_egp", value)}
            errors={errors.points_to_egp}
            required
          />
        </div>
      </Section>

      <Section title="Appearance">
        <div className="grid gap-4 sm:grid-cols-2">
          <ColorField
            id="background_color"
            label="Background color"
            value={data.background_color}
            onChange={(value) => setData("background_color", value)}
            errors={errors.background_color}
          />
          <ColorField
            id="text_color"
            label="Text color"
            value={data.text_color}
            onChange={(value) => setData("text_color", value)}
            errors={errors.text_color}
          />
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">Preview</span>
          <MembershipBadge
            membership={{
              ...membership,
              name: previewName,
              background_color: data.background_color,
              text_color: data.text_color,
            }}
          />
        </div>
      </Section>

      <Section title="Status">
        <Field orientation="horizontal">
          <Switch
            id="is_active"
            checked={data.is_active}
            onCheckedChange={(checked) => setData("is_active", checked)}
          />
          <FieldContent>
            <FieldLabel htmlFor="is_active">Active</FieldLabel>
            <FieldDescription>
              Inactive tiers can&apos;t be assigned to new customers.
            </FieldDescription>
          </FieldContent>
        </Field>
      </Section>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={processing}>
          {processing && <Spinner />}
          {submitLabel}
        </Button>
        <Button variant="ghost" asChild>
          <Link href={cancelHref}>Cancel</Link>
        </Button>
      </div>
    </form>
  )
}

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <h2 className="font-medium">{title}</h2>
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
        </div>
        {children}
      </CardContent>
    </Card>
  )
}

function TextField({
  id,
  label,
  value,
  onChange,
  errors,
  type = "text",
  ...props
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  errors?: string[]
  type?: string
  step?: string
  min?: string
  required?: boolean
}) {
  return (
    <Field data-invalid={errors ? true : undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={errors ? true : undefined}
        {...props}
      />
      <FieldError errors={asFieldErrors(errors)} />
    </Field>
  )
}

function ColorField({
  id,
  label,
  value,
  onChange,
  errors,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  errors?: string[]
}) {
  return (
    <Field data-invalid={errors ? true : undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label} picker`}
          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000"}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-12 cursor-pointer rounded-md border bg-transparent p-1"
        />
        <Input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={errors ? true : undefined}
          className="font-mono"
        />
      </div>
      <FieldError errors={asFieldErrors(errors)} />
    </Field>
  )
}
