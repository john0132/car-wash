import { createInertiaApp } from "@inertiajs/react"

import {
  type PageModule,
  createPageResolver,
  inertiaAppOptions,
  titleFor,
} from "@/shared/lib/inertia"
import WebsiteShell from "@/website/layouts/website-shell"

void createInertiaApp({
  ...inertiaAppOptions,
  // Pages pass only their own part ("Our services"); the brand is appended.
  title: titleFor("Auto Atelier", "—"),
  // SSR entry (see vite.config.ts). Only website pages are bundled into this entrypoint.
  resolve: createPageResolver(
    "website",
    import.meta.glob<PageModule>("../website/pages/**/*.tsx"),
  ),
  layout: () => WebsiteShell,
}).catch((error) => {
  // This ensures this entrypoint is only loaded on Inertia pages
  // by checking for the presence of the root element (#app by default).
  if (document.getElementById("app")) {
    throw error
  } else {
    console.error(
      "Missing root element.\n\n" +
        "If you see this error, it probably means you loaded Inertia.js on non-Inertia pages.\n" +
        'Load <%= vite_tags "website.tsx" %> only from the Inertia-specific layout.',
    )
  }
})
