import type { ReactNode } from "react"

import SiteLayout from "@/website/layouts/site-layout"

// Shared chrome for the booking flow (checkout and a booking's own page).
export default function BookingLayout({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <SiteLayout
      title={title}
      noindex
      mainClassName="mx-auto max-w-6xl px-4 pt-10 pb-24 sm:px-6 lg:pt-14"
    >
      {children}
    </SiteLayout>
  )
}
