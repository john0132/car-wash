/** Admin::MembershipsController#membership_props */
export interface MembershipDetail {
  id: number
  name: string | null
  description: string | null
  is_active: boolean
  egp_to_points: number
  points_to_egp: number
  background_color: string
  text_color: string
}

export interface MembershipRow extends MembershipDetail {
  customers_count: number
}

export interface MembershipTranslation {
  language_id: number
  code: string
  language: string
  name: string | null
  description: string | null
}

export interface MembershipStats {
  total: number
  active: number
  members: number
}

export interface MembershipShowStats {
  customers_count: number
  active_customers_count: number
  points: number
  lifetime_points: number
}

export interface MembershipCustomer {
  id: number
  full_name: string
  email: string
  points: number
  lifetime_points: number
  is_active: boolean
}

/** Posted by MembershipForm as `membership[...]`. */
export interface MembershipFormData {
  is_active: boolean
  egp_to_points: string
  points_to_egp: string
  background_color: string
  text_color: string
  translations: Record<string, { name: string; description: string }>
}
