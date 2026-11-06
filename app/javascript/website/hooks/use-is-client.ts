import { useSyncExternalStore } from "react"

// Nothing to subscribe to: the value only differs between server and browser.
const subscribe = () => () => undefined

/**
 * False during SSR and hydration, true once running in the browser. Use it to
 * render browser-only widgets (e.g. Leaflet maps) without a hydration mismatch.
 */
export function useIsClient() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
}
