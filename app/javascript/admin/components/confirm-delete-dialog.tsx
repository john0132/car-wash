import { router } from "@inertiajs/react"
import { Trash2 } from "lucide-react"
import { type ReactNode, useState } from "react"

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

/** "Delete" button that asks for confirmation, then sends the DELETE request. */
export function ConfirmDeleteDialog({
  title,
  description,
  action,
}: {
  title: ReactNode
  description: ReactNode
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
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
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
