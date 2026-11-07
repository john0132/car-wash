import type { SVGAttributes } from "react"

/** The app's mark in one color (currentColor), so it follows light and dark themes. */
export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
  return (
    <svg
      viewBox="0 0 140 140"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <circle
        cx="70"
        cy="72"
        r="54"
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
      />
      <path
        d="M34 96 C24 86 26 70 40 64 C36 80 38 92 34 96 Z"
        fill="currentColor"
      />
      <path
        d="M106 96 C116 86 114 70 100 64 C104 80 102 92 106 96 Z"
        fill="currentColor"
      />
      <line
        x1="70"
        y1="50"
        x2="70"
        y2="96"
        stroke="currentColor"
        strokeWidth="7"
      />
      <circle cx="70" cy="42" r="8" fill="currentColor" />
    </svg>
  )
}
