/** Props shared with every admin page by Admin::BaseController (`inertia_share admin:`). */
export interface AdminSharedProps {
  [key: string]: unknown
  admin: {
    /** "resource.action" keys, e.g. "bookings.read". UI visibility only — Rails enforces access. */
    permissions: string[]
    /** Holds the Super Admin role. UI visibility only — Rails enforces access. */
    is_super_admin: boolean
  }
}

/** Page-number pagination from Admin::UserManagement#paginate. */
export interface Pagination {
  page: number
  pages: number
  total: number
}

/** Admin::ContentTranslations#languages_props, default language first. */
export interface AdminLanguage {
  id: number
  code: string
  name: string
  default: boolean
}

/** An uploaded image: Admin::ContentTranslations#image_prop. */
export interface ImageValue {
  signed_id: string
  url: string
}
