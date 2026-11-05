import type { ManagedUser } from "@/admin/features/users/types"

/** Admin::AdministratorsController#index row */
export interface AdministratorRow extends ManagedUser {
  roles: { id: number; name: string }[]
}

export interface AssignedRole {
  id: number
  name: string
  description: string | null
  permissions: string[]
}
