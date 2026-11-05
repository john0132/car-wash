import { Check, Minus } from "lucide-react"

import type { PermissionGroup } from "@/admin/features/roles/types"
import {
  PERMISSION_ACTIONS,
  groupKeys,
  permissionKey,
  toggleGroup,
  togglePermission,
} from "@/admin/features/roles/utils"
import { Checkbox } from "@/shared/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"

const actionLabel = (action: string) =>
  action.charAt(0).toUpperCase() + action.slice(1)

/**
 * Resources × actions grid of a role's permissions. Editable when `onChange`
 * is given, read-only otherwise. Cells for actions a resource doesn't have
 * (e.g. deleting payment transactions) stay empty.
 */
export function PermissionMatrix({
  catalog,
  value,
  onChange,
}: {
  catalog: PermissionGroup[]
  value: string[]
  onChange?: (keys: string[]) => void
}) {
  const granted = new Set(value)
  const editable = onChange !== undefined

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Resource</TableHead>
          {PERMISSION_ACTIONS.map((action) => (
            <TableHead key={action} className="w-24 text-center">
              {actionLabel(action)}
            </TableHead>
          ))}
          {editable && <TableHead className="w-16 text-center">All</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {catalog.map((group) => {
          // Checked only when every action is granted; clicking a partial row grants all.
          // (The shadcn Checkbox draws "indeterminate" with the same check icon, so it isn't used.)
          const allGranted = groupKeys(group).every((key) => granted.has(key))

          return (
            <TableRow key={group.resource}>
              <TableCell className="font-medium">{group.label}</TableCell>
              {PERMISSION_ACTIONS.map((action) => {
                if (!group.actions.includes(action)) {
                  return <TableCell key={action} />
                }

                const key = permissionKey(group.resource, action)
                const checked = granted.has(key)

                return (
                  <TableCell key={action} className="text-center">
                    {editable ? (
                      <Checkbox
                        checked={checked}
                        aria-label={`${group.label}: ${action}`}
                        onCheckedChange={(state) =>
                          onChange(
                            togglePermission(
                              value,
                              group,
                              action,
                              state === true,
                            ),
                          )
                        }
                      />
                    ) : checked ? (
                      <Check
                        className="text-primary mx-auto size-4"
                        aria-label={`${group.label}: ${action} granted`}
                      />
                    ) : (
                      <Minus
                        className="text-muted-foreground/50 mx-auto size-4"
                        aria-label={`${group.label}: ${action} not granted`}
                      />
                    )}
                  </TableCell>
                )
              })}
              {editable && (
                <TableCell className="text-center">
                  <Checkbox
                    checked={allGranted}
                    aria-label={`${group.label}: all actions`}
                    onCheckedChange={(state) =>
                      onChange(toggleGroup(value, group, state === true))
                    }
                  />
                </TableCell>
              )}
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
