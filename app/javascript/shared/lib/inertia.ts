import type { ComponentType } from "react"

const appName = import.meta.env.VITE_APP_NAME ?? "Car Wash"

/** createInertiaApp options common to every frontend app (admin, website). */
export const inertiaAppOptions = {
  title: (title?: string) => (title ? `${title} - ${appName}` : appName),
  strictMode: true,
  defaults: {
    form: {
      forceIndicesArrayFormatInFormData: false,
      withAllErrors: true,
    },
    visitOptions: () => ({
      queryStringArrayFormat: "brackets" as const,
    }),
  },
  progress: {
    color: "#4B5563",
  },
}

export interface PageModule {
  default: ComponentType
}

/**
 * Builds an Inertia `resolve` function for one frontend app.
 *
 * Rails renders `<app>/<controller_path>/<action>` (e.g. `Admin::UsersController#index`
 * renders `admin/users/index`), which maps to `app/javascript/<app>/pages/users/index.tsx`.
 * `pages` must be a literal `import.meta.glob` in the app's entrypoint so Vite only
 * bundles that app's pages.
 */
export function createPageResolver(
  app: string,
  pages: Record<string, () => Promise<PageModule>>,
) {
  const prefix = `${app}/`
  const pagesByName = Object.fromEntries(
    Object.entries(pages).map(([path, load]) => [
      path.replace(/^.*?\/pages\//, "").replace(/\.tsx$/, ""),
      load,
    ]),
  )

  return async (name: string) => {
    if (!name.startsWith(prefix)) {
      throw new Error(
        `[${app}] Cannot render "${name}": components for this app must start with "${prefix}". ` +
          `Is the Rails controller in the right namespace?`,
      )
    }

    const pageName = name.slice(prefix.length)
    const load = pagesByName[pageName]
    if (!load) {
      throw new Error(
        `[${app}] Page component "${name}" not found. ` +
          `Expected app/javascript/${app}/pages/${pageName}.tsx with a default export.`,
      )
    }

    return (await load()).default
  }
}
