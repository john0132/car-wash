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
import type {
  ExtraOption,
  ExtrasPage,
} from "@/website/features/service-detail/types"
import { useI18n } from "@/website/lib/i18n"

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
  const { t, formatMoney, tp } = useI18n()

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
          className="border-pine/25 text-pine hover:bg-ivory hover:text-pine mt-6 h-auto w-full rounded-full bg-transparent px-6 py-3.5 font-medium"
        >
          <Plus aria-hidden />
          {selected.length === 0 ? t("Add extras") : t("Change extras")}
        </Button>
      </DialogTrigger>

      <DialogContent className="border-pine/10 bg-ivory text-pine flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="border-pine/10 border-b p-6 text-start">
          <DialogTitle className="font-display text-3xl font-normal">
            {t("Add extras")}
          </DialogTitle>
          <DialogDescription className="text-sage">
            {t("Optional finishing touches for this service.")}
          </DialogDescription>
        </DialogHeader>

        <div
          className="flex-1 overflow-y-auto p-6"
          aria-busy={loading}
          aria-live="polite"
        >
          {!extras ? (
            <p className="text-sage">{t("Loading extras…")}</p>
          ) : extras.items.length === 0 ? (
            <p className="text-sage">
              {t("No extras are available right now.")}
            </p>
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
                      className={`focus-visible:ring-bronze flex w-full items-center justify-between gap-4 rounded-2xl border p-4 text-start transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                        on
                          ? "border-pine bg-white"
                          : "border-pine/15 bg-white/60 hover:bg-white"
                      }`}
                    >
                      <span>
                        <span className="block font-medium">{extra.name}</span>
                        <span className="text-sage text-sm tabular-nums">
                          + {formatMoney(extra.price)}
                        </span>
                      </span>
                      <span
                        aria-hidden
                        className={`flex size-6 shrink-0 items-center justify-center rounded-full border ${
                          on
                            ? "border-pine bg-pine text-ivory"
                            : "border-pine/30"
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

        <DialogFooter className="border-pine/10 flex-col gap-4 border-t p-6 sm:flex-col">
          {extras && extras.pages > 1 && (
            <nav
              aria-label={t("Extras pages")}
              className="flex items-center justify-between"
            >
              <Button
                variant="ghost"
                size="sm"
                disabled={loading || extras.page <= 1}
                onClick={() => load(extras.page - 1)}
              >
                <ChevronLeft aria-hidden className="rtl:rotate-180" />{" "}
                {t("Previous")}
              </Button>
              <span className="text-sage text-sm tabular-nums">
                {t("Page {page} of {pages}", {
                  page: extras.page,
                  pages: extras.pages,
                })}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={loading || extras.page >= extras.pages}
                onClick={() => load(extras.page + 1)}
              >
                {t("Next")}{" "}
                <ChevronRight aria-hidden className="rtl:rotate-180" />
              </Button>
            </nav>
          )}
          <div className="flex items-center justify-between gap-3">
            <DialogClose asChild>
              <Button
                variant="ghost"
                className="text-pine rounded-full hover:bg-white"
              >
                {t("Cancel")}
              </Button>
            </DialogClose>
            <Button
              onClick={confirm}
              className="bg-pine text-ivory hover:bg-pine-deep rounded-full px-6"
            >
              {draft.length === 0
                ? t("Continue without extras")
                : tp(draft.length, "Add {n} extra", "Add {n} extras")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
