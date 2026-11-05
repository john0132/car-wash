import type { PermissionGroup } from "@/admin/features/roles/types"

/** Column order of the permission matrix. */
export const PERMISSION_ACTIONS = ["read", "create", "update", "delete"]

export const permissionKey = (resource: string, action: string) =>
  `${resource}.${action}`

export const groupKeys = (group: PermissionGroup) =>
  group.actions.map((action) => permissionKey(group.resource, action))

export const catalogKeys = (catalog: PermissionGroup[]) =>
  catalog.flatMap(groupKeys)

/**
 * Turns one permission on or off. Writing without reading is useless in the
 * dashboard, so granting create/update/delete also grants read, and revoking
 * read revokes the rest of that resource.
 */
export function togglePermission(
  keys: string[],
  group: PermissionGroup,
  action: string,
  checked: boolean,
): string[] {
  const key = permissionKey(group.resource, action)
  const read = permissionKey(group.resource, "read")
  const hasRead = group.actions.includes("read")

  if (checked) {
    const added = action !== "read" && hasRead ? [key, read] : [key]
    return [...new Set([...keys, ...added])]
  }

  const removed = action === "read" ? groupKeys(group) : [key]
  return keys.filter((existing) => !removed.includes(existing))
}

/** Grants or revokes every action of one resource. */
export function toggleGroup(
  keys: string[],
  group: PermissionGroup,
  checked: boolean,
): string[] {
  const all = groupKeys(group)
  return checked
    ? [...new Set([...keys, ...all])]
    : keys.filter((key) => !all.includes(key))
}
