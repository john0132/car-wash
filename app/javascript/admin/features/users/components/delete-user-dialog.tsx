import { router } from "@inertiajs/react"
import { Trash2 } from "lucide-react"
import { useState } from "react"

import type { RouteDefinition } from "@/routes/runtime"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog"
import { Button } from "@/shared/components/ui/button"

export function DeleteUserDialog({
  name,
  action,
}: {
  name: string
  action: RouteDefinition<"delete">
}) {
  const [processing, setProcessing] = useState(false)

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 /> Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes the account and signs it out everywhere.
            Bookings assigned to it become unassigned. To keep the account but
            block access, disable it instead.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={processing}
            onClick={() =>
              router.delete(action.url, {
                onStart: () => setProcessing(true),
                onFinish: () => setProcessing(false),
              })
            }
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
