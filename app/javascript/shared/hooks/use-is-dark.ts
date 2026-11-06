import { useSyncExternalStore } from "react"

const subscribe = (notify: () => void) => {
  const observer = new MutationObserver(notify)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  })
  return () => observer.disconnect()
}

/**
 * Whether the page is currently in dark mode (the `.dark` class on <html>).
 * The admin toggles it from its appearance setting; the website never does.
 */
export function useIsDark() {
  return useSyncExternalStore(
    subscribe,
    () => document.documentElement.classList.contains("dark"),
    () => false,
  )
}
