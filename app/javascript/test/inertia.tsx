import type { AnchorHTMLAttributes, ReactNode } from "react"
import { vi } from "vitest"

/**
 * Stand-in for the parts of `@inertiajs/react` that components read. Use it as
 *
 *   vi.mock("@inertiajs/react", () => inertiaMock)
 *   setPageProps({ admin: { permissions: ["bookings.read"], is_super_admin: false } })
 *
 * `Link` renders a plain anchor, so tests can assert on hrefs.
 */
let pageProps: Record<string, unknown> = {}

export const setPageProps = (props: Record<string, unknown>) => {
  pageProps = props
}

export const inertiaMock: Record<string, unknown> = {
  usePage: () => ({ props: pageProps }),
  Link: ({
    href,
    children,
    ...rest
  }: AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string
    children?: ReactNode
    only?: string[]
    preserveScroll?: boolean
    preserveState?: boolean
  }) => {
    const { only, preserveScroll, preserveState, ...anchor } = rest
    void [only, preserveScroll, preserveState]
    return (
      <a href={href} {...anchor}>
        {children}
      </a>
    )
  },
  router: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}

/** The `locale` shared prop the website sends on every page. */
export const englishLocale = {
  code: "en",
  dir: "ltr",
  default: "en",
  available: [],
}
