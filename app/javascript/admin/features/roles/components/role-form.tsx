import { Link, useForm } from "@inertiajs/react"

import {
  FormSection,
  TextField,
  TextareaField,
} from "@/admin/components/form-fields"
import { PermissionMatrix } from "@/admin/features/roles/components/permission-matrix"
import type { PermissionGroup } from "@/admin/features/roles/types"
import { catalogKeys } from "@/admin/features/roles/utils"
import type { RouteDefinition } from "@/routes/runtime"
import { Button } from "@/shared/components/ui/button"
import { Spinner } from "@/shared/components/ui/spinner"

interface RoleFormData {
  name: string
  description: string
  permission_keys: string[]
}

/** Create/edit form for a role. Posts `{ role: { name, description, permission_keys } }`. */
export function RoleForm({
  name,
  description,
  permissionKeys,
  catalog,
  action,
  cancelHref,
  submitLabel,
}: {
  name: string
  description: string | null
  permissionKeys: string[]
  catalog: PermissionGroup[]
  action: RouteDefinition<"post" | "patch">
  cancelHref: string
  submitLabel: string
}) {
  const form = useForm<RoleFormData>({
    name,
    description: description ?? "",
    permission_keys: permissionKeys,
  })
  const { data, setData, processing } = form
  const errors = form.errors as Record<string, string[] | undefined>
  const total = catalogKeys(catalog).length
  const selected = data.permission_keys.length

  form.transform((values) => ({ role: values }))

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        form.submit(action, { preserveScroll: true })
      }}
      className="max-w-4xl space-y-6"
    >
      <FormSection title="Details">
        <TextField
          id="name"
          label="Name"
          required
          value={data.name}
          onChange={(value) => setData("name", value)}
          errors={errors.name}
          placeholder="e.g. Content editor"
        />
        <TextareaField
          id="description"
          label="Description"
          value={data.description}
          onChange={(value) => setData("description", value)}
          errors={errors.description}
          description="What this role is for, shown when assigning it to administrators."
          rows={2}
        />
      </FormSection>

      <FormSection
        title="Permissions"
        description={`${selected} of ${total} selected. Granting create, update or delete also grants read.`}
        actions={
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={selected === total}
              onClick={() => setData("permission_keys", catalogKeys(catalog))}
            >
              Select all
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={selected === 0}
              onClick={() => setData("permission_keys", [])}
            >
              Clear
            </Button>
          </div>
        }
      >
        <PermissionMatrix
          catalog={catalog}
          value={data.permission_keys}
          onChange={(keys) => setData("permission_keys", keys)}
        />
      </FormSection>

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
