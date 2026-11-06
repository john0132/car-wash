import { ArrowDown, ArrowUp, Trash2 } from "lucide-react"

import { Button } from "@/shared/components/ui/button"

/**
 * Move up / move down / remove buttons for an entry of an editable list
 * (page sections, links, fields…). `noun` names the entry for screen readers:
 * "Move link up", "Remove link".
 */
export function ReorderButtons({
  index,
  count,
  noun,
  onMove,
  onRemove,
}: {
  index: number
  count: number
  noun: string
  /** -1 moves the entry up one place, 1 down one place. */
  onMove: (offset: -1 | 1) => void
  onRemove: () => void
}) {
  return (
    <div className="flex items-center gap-0.5">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8"
        aria-label={`Move ${noun} up`}
        disabled={index === 0}
        onClick={() => onMove(-1)}
      >
        <ArrowUp />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8"
        aria-label={`Move ${noun} down`}
        disabled={index === count - 1}
        onClick={() => onMove(1)}
      >
        <ArrowDown />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8"
        aria-label={`Remove ${noun}`}
        onClick={onRemove}
      >
        <Trash2 />
      </Button>
    </div>
  )
}
