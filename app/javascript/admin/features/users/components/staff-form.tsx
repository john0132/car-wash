import { Link, useForm } from "@inertiajs/react"
import type { ReactNode } from "react"

import type {
  ManagedUser,
  RoleOption,
  StaffFormData,
} from "@/admin/features/users/types"
import type { RouteDefinition } from "@/routes/runtime"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Checkbox } from "@/shared/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { Spinner } from "@/shared/components/ui/spinner"
import { Switch } from "@/shared/components/ui/switch"

const asFieldErrors = (messages?: string[]) =>
  messages?.map((message) => ({ message }))

/**
 * Create/edit form for staff accounts (administrators and employees).
 * Posts `{ user: {...} }`. Pass `roles` to show the role picker (administrators).
 */
export function StaffForm({
  user,
  roleIds,
  roles,
  action,
  cancelHref,
  canManageAccess,
  submitLabel,
}: {
  user: ManagedUser | null
  roleIds?: number[]
  roles?: RoleOption[]
  action: RouteDefinition<"post" | "patch">
  cancelHref: string
  canManageAccess: boolean
  submitLabel: string
}) {
  const isNew = user === null
  const form = useForm<StaffFormData>({
    name: user?.name ?? "",
    last_name: user?.last_name ?? "",
    email: user?.email ?? "",
    password: "",
    password_confirmation: "",
    is_active: user?.is_active ?? true,
    ...(roles ? { role_ids: roleIds ?? [] } : {}),
  })
  const { data, setData, errors, processing } = form

  form.transform((values) => ({ user: values }))

  const toggleRole = (id: number, checked: boolean) =>
    setData(
      "role_ids",
      checked
        ? [...(data.role_ids ?? []), id]
        : (data.role_ids ?? []).filter((roleId) => roleId !== id),
    )

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        form.submit(action, {
          preserveScroll: true,
          onSuccess: () => form.reset("password", "password_confirmation"),
        })
      }}
      className="max-w-2xl space-y-6"
    >
      <Section title="Profile">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="name"
            label="First name"
            value={data.name}
            onChange={(value) => setData("name", value)}
            errors={errors.name}
            autoComplete="given-name"
            required
          />
          <TextField
            id="last_name"
            label="Last name"
            value={data.last_name}
            onChange={(value) => setData("last_name", value)}
            errors={errors.last_name}
            autoComplete="family-name"
          />
        </div>
        <TextField
          id="email"
          label="Email"
          type="email"
          value={data.email}
          onChange={(value) => setData("email", value)}
          errors={errors.email}
          autoComplete="off"
          required
        />
      </Section>

      <Section
        title="Password"
        description={
          isNew
            ? "At least 12 characters."
            : "Leave blank to keep the current password. Changing it signs the user out everywhere."
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="password"
            label="Password"
            type="password"
            value={data.password}
            onChange={(value) => setData("password", value)}
            errors={errors.password}
            autoComplete="new-password"
            required={isNew}
          />
          <TextField
            id="password_confirmation"
            label="Confirm password"
            type="password"
            value={data.password_confirmation}
            onChange={(value) => setData("password_confirmation", value)}
            errors={errors.password_confirmation}
            autoComplete="new-password"
            required={isNew}
          />
        </div>
      </Section>

      <Section
        title="Access"
        description={
          canManageAccess
            ? undefined
            : "You can't disable your own account or change your own roles."
        }
      >
        <Field orientation="horizontal">
          <Switch
            id="is_active"
            checked={data.is_active}
            disabled={!canManageAccess}
            onCheckedChange={(checked) => setData("is_active", checked)}
          />
          <FieldContent>
            <FieldLabel htmlFor="is_active">Active</FieldLabel>
            <FieldDescription>
              Disabled accounts are signed out and can&apos;t sign in.
            </FieldDescription>
          </FieldContent>
        </Field>

        {roles && (
          <FieldSet>
            <FieldLegend variant="label">Roles</FieldLegend>
            <FieldDescription>
              An administrator&apos;s permissions come only from their roles.
            </FieldDescription>
            <FieldGroup className="gap-3">
              {roles.map((role) => (
                <Field key={role.id} orientation="horizontal">
                  <Checkbox
                    id={`role_${role.id}`}
                    checked={data.role_ids?.includes(role.id) ?? false}
                    disabled={!canManageAccess}
                    onCheckedChange={(checked) =>
                      toggleRole(role.id, checked === true)
                    }
                  />
                  <FieldContent>
                    <FieldLabel htmlFor={`role_${role.id}`}>
                      {role.name}
                    </FieldLabel>
                    <FieldDescription>
                      {role.description ?? "No description"} ·{" "}
                      {role.permissions_count} permissions
                    </FieldDescription>
                  </FieldContent>
                </Field>
              ))}
              {roles.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  No roles exist yet.
                </p>
              )}
            </FieldGroup>
            <FieldError errors={asFieldErrors(errors.role_ids)} />
          </FieldSet>
        )}
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
  autoComplete?: string
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
