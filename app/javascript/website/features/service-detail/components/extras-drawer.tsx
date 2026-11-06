import { router } from "@inertiajs/react"
import { Check, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { useState } from "react"

import { service as serviceRoute } from "@/routes"
import { Button } from "@/shared/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet"
import { formatMoney } from "@/website/features/home-catalog/utils"
import type {
  ExtraOption,
  ExtrasPage,
} from "@/website/features/service-detail/types"

interface ExtrasDrawerProps {
  serviceSlug: string
  /** Loaded on demand; undefined until the drawer is first opened. */
  extras: ExtrasPage | undefined
  selected: ExtraOption[]
  onToggle: (extra: ExtraOption) => void
}

/**
 * A side drawer over the service page listing the add-on extras, a page at a time.
 * Paging is an Inertia partial reload of the `extras` prop, so the visitor never
 * leaves the page. Selections live in the parent and survive paging.
 */
export function ExtrasDrawer({
  serviceSlug,
  extras,
  selected,
  onToggle,
}: ExtrasDrawerProps) {
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

  const isSelected = (id: number) => selected.some((extra) => extra.id === id)
  const total = selected.reduce((sum, extra) => sum + extra.price, 0)

  return (
    <Sheet onOpenChange={(open) => open && !extras && load(1)}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="mt-6 h-auto w-full rounded-full border-[#2B3A32]/25 bg-transparent px-6 py-3.5 font-medium text-[#2B3A32] hover:bg-[#F6F1E7] hover:text-[#2B3A32]"
        >
          <Plus aria-hidden />
          {selected.length === 0
            ? "Add extras"
            : `${selected.length} ${selected.length === 1 ? "extra" : "extras"} added`}
        </Button>
      </SheetTrigger>

      <SheetContent
        style={{ fontFamily: "'Jost', system-ui, sans-serif" }}
        className="flex w-full flex-col gap-0 border-[#2B3A32]/10 bg-[#F6F1E7] text-[#2B3A32] sm:max-w-md"
      >
        <SheetHeader className="border-b border-[#2B3A32]/10 p-6">
          <SheetTitle
            style={{ fontFamily: "'Italiana', serif" }}
            className="text-3xl font-normal"
          >
            Add extras
          </SheetTitle>
          <SheetDescription className="text-[#5B6B5E]">
            Optional finishing touches for this service.
          </SheetDescription>
        </SheetHeader>

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
                const on = isSelected(extra.id)
                return (
                  <li key={extra.id}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => onToggle(extra)}
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

        <SheetFooter className="gap-4 border-t border-[#2B3A32]/10 p-6">
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
          <div className="flex items-baseline justify-between">
            <span className="text-[#5B6B5E]">
              {selected.length === 0
                ? "Nothing selected"
                : `${selected.length} selected`}
            </span>
            <span className="font-medium tabular-nums">
              {formatMoney(total)}
            </span>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
