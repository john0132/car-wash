/** Admin::RolesController#role_props */
export interface RoleDetail {
  id: number
  name: string
  description: string | null
  /** The seeded role holding every permission. It can't be edited or deleted. */
  super_admin: boolean
  created_at: string
}

export interface RoleRow extends RoleDetail {
  permissions_count: number
  administrators_count: number
}

/** One resource of Permission::CATALOG (Admin::RolesController#catalog_props). */
export interface PermissionGroup {
  resource: string
  label: string
  actions: string[]
}

export interface RoleAdministrator {
  id: number
  full_name: string
  email: string
  is_active: boolean
}

export interface RoleFilters {
  q: string | null
}
