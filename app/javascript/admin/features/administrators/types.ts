import type { ManagedUser } from "@/admin/features/users/types"

/** Admin::AdministratorsController#index row */
export interface AdministratorRow extends ManagedUser {
  roles: { id: number; name: string }[]
  /** UserPolicy#manage_access? for the signed-in admin. */
  can_manage_access: boolean
}

/** Admin::AdministratorsController#show — what UserPolicy lets the signed-in admin do. */
export interface AdministratorAbilities {
  update: boolean
  destroy: boolean
  manage_access: boolean
}

export interface AssignedRole {
  id: number
  name: string
  description: string | null
  permissions: string[]
}
