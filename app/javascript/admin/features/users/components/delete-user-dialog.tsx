import { ConfirmDeleteDialog } from "@/admin/components/confirm-delete-dialog"
import type { RouteDefinition } from "@/routes/runtime"

export function DeleteUserDialog({
  name,
  action,
}: {
  name: string
  action: RouteDefinition<"delete">
}) {
  return (
    <ConfirmDeleteDialog
      title={`Delete ${name}?`}
      description="This permanently deletes the account and signs it out everywhere. Bookings assigned to it become unassigned. To keep the account but block access, disable it instead."
      action={action}
    />
  )
}
