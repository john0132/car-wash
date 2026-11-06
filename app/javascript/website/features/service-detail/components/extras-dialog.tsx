import { router } from "@inertiajs/react"
import { Check, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { useState } from "react"

import { service as serviceRoute } from "@/routes"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog"
import { formatMoney } from "@/website/features/home-catalog/utils"
import type {
  ExtraOption,
  ExtrasPage,
} from "@/website/features/service-detail/types"

interface ExtrasDialogProps {
  serviceSlug: string
  /** Loaded on demand; undefined until the dialog is first opened. */
  extras: ExtrasPage | undefined
  selected: ExtraOption[]
  onConfirm: (extras: ExtraOption[]) => void
}

/**
 * A popup listing the add-on extras, a page at a time. Ticking extras only
 * changes a draft; "Add to booking" hands it to the parent, and closing the
 * popup any other way discards it. Paging is an Inertia partial reload of the
 * `extras` prop, so the visitor never leaves the page, and the draft survives it.
 */
export function ExtrasDialog({
  serviceSlug,
  extras,
  selected,
  onConfirm,
}: ExtrasDialogProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<ExtraOption[]>(selected)
  const [loading, setLoading] = useState(false)

  const load = (page: number) =>
    router.get(
      serviceRoute(serviceSlug),
      { extras_page: page },
      {
        only: ["extras"],
        preserveState: true,
        preserveScroll: true,
        replace: true,
        onStart: () => setLoading(true),
        onFinish: () => setLoading(false),
      },
    )

  const changeOpen = (next: boolean) => {
    if (next) {
      setDraft(selected)
      if (!extras) load(1)
    }
    setOpen(next)
  }

  const isPicked = (id: number) => draft.some((extra) => extra.id === id)
  const toggle = (extra: ExtraOption) =>
    setDraft((current) =>
      isPicked(extra.id)
        ? current.filter((e) => e.id !== extra.id)
        : [...current, extra],
    )

  const confirm = () => {
    onConfirm(draft)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="mt-6 h-auto w-full rounded-full border-[#2B3A32]/25 bg-transparent px-6 py-3.5 font-medium text-[#2B3A32] hover:bg-[#F6F1E7] hover:text-[#2B3A32] dark:border-[#2B3A32]/25 dark:bg-transparent dark:hover:bg-[#F6F1E7]"
        >
          <Plus aria-hidden />
          {selected.length === 0 ? "Add extras" : "Change extras"}
        </Button>
      </DialogTrigger>

      <DialogContent
        style={{ fontFamily: "'Jost', system-ui, sans-serif" }}
        className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden border-[#2B3A32]/10 bg-[#F6F1E7] p-0 text-[#2B3A32] sm:max-w-md"
      >
        <DialogHeader className="border-b border-[#2B3A32]/10 p-6 text-left">
          <DialogTitle
            style={{ fontFamily: "'Italiana', serif" }}
            className="text-3xl font-normal"
          >
            Add extras
          </DialogTitle>
          <DialogDescription className="text-[#5B6B5E]">
            Optional finishing touches for this service.
          </DialogDescription>
        </DialogHeader>

        <div
          className="flex-1 overflow-y-auto p-6"
          aria-busy={loading}
          aria-live="polite"
        >
          {!extras ? (
            <p className="text-[#5B6B5E]">Loading extras…</p>
          ) : extras.items.length === 0 ? (
            <p className="text-[#5B6B5E]">No extras are available right now.</p>
          ) : (
            <ul
              className={`space-y-3 transition-opacity ${loading ? "opacity-50" : ""}`}
            >
              {extras.items.map((extra) => {
                const on = isPicked(extra.id)
                return (
                  <li key={extra.id}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggle(extra)}
                      className={`flex w-full items-center justify-between gap-4 rounded-2xl border p-4 text-left transition-colors focus-visible:ring-2 focus-visible:ring-[#8A6240] focus-visible:outline-none ${
                        on
                          ? "border-[#2B3A32] bg-white"
                          : "border-[#2B3A32]/15 bg-white/60 hover:bg-white"
                      }`}
                    >
                      <span>
                        <span className="block font-medium">{extra.name}</span>
                        <span className="text-sm text-[#5B6B5E] tabular-nums">
                          + {formatMoney(extra.price)}
                        </span>
                      </span>
                      <span
                        aria-hidden
                        className={`flex size-6 shrink-0 items-center justify-center rounded-full border ${
                          on
                            ? "border-[#2B3A32] bg-[#2B3A32] text-[#F6F1E7]"
                            : "border-[#2B3A32]/30"
                        }`}
                      >
                        {on && <Check className="size-3.5" />}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <DialogFooter className="flex-col gap-4 border-t border-[#2B3A32]/10 p-6 sm:flex-col">
          {extras && extras.pages > 1 && (
            <nav
              aria-label="Extras pages"
              className="flex items-center justify-between"
            >
              <Button
                variant="ghost"
                size="sm"
                disabled={loading || extras.page <= 1}
                onClick={() => load(extras.page - 1)}
              >
                <ChevronLeft aria-hidden /> Previous
              </Button>
              <span className="text-sm text-[#5B6B5E] tabular-nums">
                Page {extras.page} of {extras.pages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={loading || extras.page >= extras.pages}
                onClick={() => load(extras.page + 1)}
              >
                Next <ChevronRight aria-hidden />
              </Button>
            </nav>
          )}
          <div className="flex items-center justify-between gap-3">
            <DialogClose asChild>
              <Button
                variant="ghost"
                className="rounded-full text-[#2B3A32] hover:bg-white"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={confirm}
              className="rounded-full bg-[#2B3A32] px-6 text-[#F6F1E7] hover:bg-[#1F2B25]"
            >
              {draft.length === 0
                ? "Continue without extras"
                : `Add ${draft.length} ${draft.length === 1 ? "extra" : "extras"}`}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
