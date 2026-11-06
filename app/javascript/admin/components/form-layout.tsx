import { Link } from "@inertiajs/react"
import type { ReactNode } from "react"

import { Button } from "@/shared/components/ui/button"
import { Spinner } from "@/shared/components/ui/spinner"
import { cn } from "@/shared/lib/utils"

const WIDTHS = {
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  full: "",
} as const

/**
 * Every dashboard create/edit form: a sticky toolbar with the language tabs
 * (when the form is multilingual) on the left and Cancel → Save on the right,
 * then the form's sections. The toolbar spans the page; it bleeds into the
 * page's `p-4` padding, so render this directly inside the page's `p-4` div.
 *
 * Width: "3xl" by default, "4xl" for long text (pages, blog posts, the role
 * matrix), "full" when a map or preview needs the room.
 */
export function FormLayout({
  onSubmit,
  tabs,
  cancelHref,
  submitLabel,
  processing,
  canSubmit = true,
  width = "3xl",
  children,
}: {
  onSubmit: () => void
  tabs?: ReactNode
  cancelHref: string
  submitLabel: string
  processing: boolean
  /** False hides Save, e.g. for read-only access. */
  canSubmit?: boolean
  width?: keyof typeof WIDTHS
  children: ReactNode
}) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
      className="space-y-6"
    >
      <div className="bg-background/95 supports-backdrop-filter:bg-background/80 sticky top-0 z-10 -mx-4 flex flex-wrap items-center gap-3 border-b px-4 py-3 backdrop-blur">
        {tabs}
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href={cancelHref}>Cancel</Link>
          </Button>
          {canSubmit && (
            <Button type="submit" disabled={processing}>
              {processing && <Spinner />}
              {submitLabel}
            </Button>
          )}
        </div>
      </div>
      <div className={cn("space-y-6", WIDTHS[width])}>{children}</div>
    </form>
  )
}
