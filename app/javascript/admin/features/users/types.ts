/** Admin::UserManagement#user_props */
export interface ManagedUser {
  id: number
  name: string
  last_name: string | null
  full_name: string
  email: string
  verified: boolean
  is_active: boolean
  created_at: string
}

export interface UserListFilters {
  q: string | null
  status: "active" | "inactive" | null
}

export interface RoleOption {
  id: number
  name: string
  description: string | null
  permissions_count: number
}

/** Fields posted by StaffForm as `user[...]`. */
export interface StaffFormData {
  name: string
  last_name: string
  email: string
  password: string
  password_confirmation: string
  is_active: boolean
  role_ids?: number[]
}
