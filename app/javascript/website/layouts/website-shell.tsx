import { usePage } from "@inertiajs/react"
import { Direction } from "radix-ui"
import type { ReactNode } from "react"

import { setBaseUrl } from "@/routes/runtime"
import PersistentLayout from "@/shared/layouts/persistent-layout"
import type { LocaleProps } from "@/website/lib/i18n"

/**
 * Wraps every website page: the language's reading direction for the Radix
 * widgets (selects, dialogs), the language prefix for the generated route
 * helpers (/ar/services), and the shared flash → toast layout.
 */
export default function WebsiteShell({ children }: { children: ReactNode }) {
  const { code, dir, default: defaultCode } = usePage<{ locale: LocaleProps }>()
    .props.locale

  // Set while rendering (before any page below calls a route helper); it is
  // idempotent, and SSR renders one request at a time.
  setBaseUrl(code === defaultCode ? "" : `/${code}`)

  return (
    <Direction.Provider dir={dir}>
      <PersistentLayout>{children}</PersistentLayout>
    </Direction.Provider>
  )
}
