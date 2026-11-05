import { createInertiaApp } from "@inertiajs/react"

import { initializeTheme } from "@/shared/hooks/use-appearance"
import PersistentLayout from "@/shared/layouts/persistent-layout"
import {
  type PageModule,
  createPageResolver,
  inertiaAppOptions,
} from "@/shared/lib/inertia"

void createInertiaApp({
  ...inertiaAppOptions,
  // Client-only (no SSR). Only admin pages are bundled into this entrypoint.
  resolve: createPageResolver(
    "admin",
    import.meta.glob<PageModule>("../admin/pages/**/*.tsx"),
  ),
  layout: () => PersistentLayout,
}).catch((error) => {
  // This ensures this entrypoint is only loaded on Inertia pages
  // by checking for the presence of the root element (#app by default).
  if (document.getElementById("app")) {
    throw error
  } else {
    console.error(
      "Missing root element.\n\n" +
        "If you see this error, it probably means you loaded Inertia.js on non-Inertia pages.\n" +
        'Load <%= vite_tags "admin.tsx" %> only from the Inertia-specific layout.',
    )
  }
})

// This will set light / dark mode on load...
initializeTheme()
