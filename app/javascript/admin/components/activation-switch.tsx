import { router } from "@inertiajs/react"
import { useState } from "react"

import type { RouteDefinition } from "@/routes/runtime"
import { Switch } from "@/shared/components/ui/switch"

/** Enables/disables a record (user, city, area, …) via its `PATCH …/:id/activation` member route. */
export function ActivationSwitch({
  active,
  name,
  action,
  disabled = false,
}: {
  active: boolean
  name: string
  action: RouteDefinition<"patch">
  disabled?: boolean
}) {
  const [pending, setPending] = useState(false)

  return (
    <Switch
      checked={active}
      disabled={disabled || pending}
      aria-label={`${active ? "Disable" : "Enable"} ${name}`}
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
}
