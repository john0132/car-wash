import { Head } from "@inertiajs/react"
import type { ReactNode } from "react"

import { SiteFooter } from "@/website/components/site-footer"
import { SiteHeader } from "@/website/components/site-header"
import { LIGHT_TOKENS } from "@/website/lib/light-theme"

// Shared chrome for the booking flow (checkout and a booking's own page): fonts,
// header, footer and the always-light ivory palette.
export default function BookingLayout({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <>
      <Head title={title}>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Italiana&family=Jost:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div
        style={{ ...LIGHT_TOKENS, fontFamily: "'Jost', system-ui, sans-serif" }}
        className="min-h-svh bg-[#F6F1E7] text-[#2B3A32]"
      >
        <SiteHeader />
        <main className="mx-auto max-w-6xl px-4 pt-10 pb-24 sm:px-6 lg:pt-14">
          {children}
        </main>
        <SiteFooter />
      </div>
    </>
  )
}
