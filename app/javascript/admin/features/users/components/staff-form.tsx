import { useForm } from "@inertiajs/react"

import {
  FormSection,
  SwitchField,
  TextField,
  asFieldErrors,
} from "@/admin/components/form-fields"
import { FormLayout } from "@/admin/components/form-layout"
import type {
  ManagedUser,
  RoleOption,
  StaffFormData,
} from "@/admin/features/users/types"
import { SUBMIT_OPTIONS, formErrors } from "@/admin/lib/forms"
import type { RouteDefinition } from "@/routes/runtime"
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
  const { data, setData, processing } = form
  const errors = formErrors(form)

  form.transform((values) => ({ user: values }))

  const toggleRole = (id: number, checked: boolean) =>
    setData(
      "role_ids",
      checked
        ? [...(data.role_ids ?? []), id]
        : (data.role_ids ?? []).filter((roleId) => roleId !== id),
    )

  return (
    <FormLayout
      onSubmit={() =>
        form.submit(action, {
          ...SUBMIT_OPTIONS,
          onSuccess: () => form.reset("password", "password_confirmation"),
        })
      }
      cancelHref={cancelHref}
      submitLabel={submitLabel}
      processing={processing}
    >
      <FormSection title="Profile">
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
      </FormSection>

      <FormSection
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
      </FormSection>

      <FormSection
        title="Access"
        description={
          canManageAccess
            ? undefined
            : "You can't disable your own account or change your own roles."
        }
      >
        <SwitchField
          id="is_active"
          label="Active"
          description="Disabled accounts are signed out and can't sign in."
          checked={data.is_active}
          disabled={!canManageAccess}
          onChange={(checked) => setData("is_active", checked)}
        />

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
      </FormSection>
    </FormLayout>
  )
}
