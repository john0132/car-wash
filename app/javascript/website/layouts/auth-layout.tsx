import { Link } from "@inertiajs/react"
import type { ReactNode } from "react"

import { root } from "@/routes"
import { Logo } from "@/website/components/brand-mark"
import { LIGHT_TOKENS } from "@/website/lib/light-theme"

export default function AuthLayout({
  children,
  title,
  description,
}: {
  children: ReactNode
  title: string
  description: string
}) {
  return (
    <div
      style={LIGHT_TOKENS}
      className="flex min-h-svh flex-col items-center justify-center bg-[#F6F1E7] px-6 py-10 text-[#2B3A32]"
    >
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href={root()} aria-label="Auto Atelier home">
            <Logo />
          </Link>
        </div>

        <div className="rounded-2xl border border-[#2B3A32]/10 bg-white/60 p-8 shadow-sm sm:p-10">
          <div className="mb-8 space-y-2 text-center">
            <h1
              style={{ fontFamily: "'Italiana', serif" }}
              className="text-3xl text-[#2B3A32]"
            >
              {title}
            </h1>
            <p className="text-sm text-[#5B6B5E]">{description}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
