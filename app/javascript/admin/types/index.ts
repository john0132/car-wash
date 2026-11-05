/** Props shared with every admin page by Admin::BaseController (`inertia_share admin:`). */
export interface AdminSharedProps {
  [key: string]: unknown
  admin: {
    /** "resource.action" keys, e.g. "bookings.read". UI visibility only — Rails enforces access. */
    permissions: string[]
  }
}
