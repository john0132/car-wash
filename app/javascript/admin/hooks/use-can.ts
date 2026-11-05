import { usePage } from "@inertiajs/react"

import type { AdminSharedProps } from "@/admin/types"

/**
 * Returns a checker for admin permissions shared by Admin::BaseController.
 * Use it only to hide or show UI — authorization is always enforced in Rails.
 *
 *   const can = useCan()
 *   if (can("bookings", "update")) …
 */
export function useCan() {
  const { admin } = usePage<AdminSharedProps>().props
  return (resource: string, action: string) =>
    admin.permissions.includes(`${resource}.${action}`)
}

/**
 * True when the signed-in administrator holds the Super Admin role.
 * Use it only to hide or show UI — authorization is always enforced in Rails.
 */
export function useIsSuperAdmin() {
  const { admin } = usePage<AdminSharedProps>().props
  return admin.is_super_admin
}
