import { router } from "@inertiajs/react"
import { useId, useState } from "react"

import type { RouteDefinition } from "@/routes/runtime"
import { Label } from "@/shared/components/ui/label"
import { Switch } from "@/shared/components/ui/switch"

/**
 * Enables/disables a record (user, city, area, …) via its `PATCH …/:id/activation`
 * member route. In table rows the column header labels it; on detail pages pass
 * `label` ("Active", "Published") to show it next to the switch.
 */
export function ActivationSwitch({
  active,
  name,
  action,
  disabled = false,
  label,
}: {
  active: boolean
  name: string
  action: RouteDefinition<"patch">
  disabled?: boolean
  label?: string
}) {
  const [pending, setPending] = useState(false)
  const id = useId()

  const control = (
    <Switch
      id={id}
      checked={active}
      disabled={disabled || pending}
      aria-label={
        label ? undefined : `${active ? "Disable" : "Enable"} ${name}`
      }
      onCheckedChange={(checked) =>
        router.patch(
          action.url,
          { is_active: checked },
          {
            preserveScroll: true,
            preserveState: true,
            onStart: () => setPending(true),
            onFinish: () => setPending(false),
          },
        )
      }
    />
  )

  if (!label) return control

  return (
    <div className="flex items-center gap-2">
      {control}
      <Label htmlFor={id} className="text-sm font-normal">
        {label}
      </Label>
    </div>
  )
}
