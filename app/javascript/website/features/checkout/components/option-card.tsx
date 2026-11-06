import type { ReactNode } from "react"

/** A native radio input styled as a selectable card. */
export function OptionCard({
  name,
  checked,
  onSelect,
  children,
  className = "",
}: {
  name: string
  checked: boolean
  onSelect: () => void
  children: ReactNode
  className?: string
}) {
  return (
    <label
      className={`has-[:focus-visible]:ring-bronze flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-colors has-[:focus-visible]:ring-2 ${
        checked
          ? "border-pine bg-white"
          : "border-pine/15 bg-white/60 hover:bg-white"
      } ${className}`}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onSelect}
        className="sr-only"
      />
      {children}
    </label>
  )
}
