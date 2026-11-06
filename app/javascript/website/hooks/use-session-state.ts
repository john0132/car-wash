import { useCallback, useSyncExternalStore } from "react"

// Same-tab writes don't fire the `storage` event, so notify subscribers ourselves.
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function read(key: string): string | null {
  try {
    return sessionStorage.getItem(key)
  } catch {
    return null // storage blocked (e.g. some private modes)
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) sessionStorage.removeItem(key)
    else sessionStorage.setItem(key, value)
  } catch {
    // Storage blocked: the value just won't survive a refresh.
  }
  listeners.forEach((listener) => listener())
}

/** Forgets a value stored by `useSessionState`. */
export function clearSessionState(key: string) {
  write(key, null)
}

/**
 * Like `useState`, but kept in sessionStorage so it survives a refresh in this
 * tab (Inertia's `useRemember` is cleared on reload). The server render and
 * hydration use `fallback`; the stored value takes over right after.
 */
export function useSessionState<T>(
  key: string,
  fallback: T,
): [T, (value: T) => void] {
  const raw = useSyncExternalStore(
    subscribe,
    () => read(key),
    () => null,
  )
  const value = raw === null ? fallback : (JSON.parse(raw) as T)
  const setValue = useCallback(
    (next: T) => write(key, JSON.stringify(next)),
    [key],
  )

  return [value, setValue]
}
