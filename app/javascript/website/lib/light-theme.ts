import type { CSSProperties } from "react"

// The ivory pages (auth, profile) are always light, so pin the theme tokens
// the shared form controls read to the brand palette; otherwise dark mode
// renders their text white on ivory.
export const LIGHT_TOKENS = {
  colorScheme: "light",
  "--background": "#F6F1E7",
  "--foreground": "#2B3A32",
  "--muted-foreground": "rgb(43 58 50 / 0.6)",
  "--border": "rgb(43 58 50 / 0.15)",
  "--input": "rgb(43 58 50 / 0.25)",
  "--ring": "#2B3A32",
  "--primary": "#2B3A32",
  "--primary-foreground": "#F6F1E7",
  "--destructive": "#B3261E",
} as CSSProperties
