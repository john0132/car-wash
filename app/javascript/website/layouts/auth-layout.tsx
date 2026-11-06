import { Link } from "@inertiajs/react"
import type { ReactNode } from "react"

import { root } from "@/routes"
import { Logo } from "@/website/components/brand-mark"
import { useI18n } from "@/website/lib/i18n"

export default function AuthLayout({
  children,
  title,
  description,
}: {
  children: ReactNode
  title: string
  description: string
}) {
  const { t } = useI18n()

  return (
    <div className="bg-ivory text-pine flex min-h-svh flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href={root()} aria-label={t("Auto Atelier home")}>
            <Logo />
          </Link>
        </div>

        <div className="border-pine/10 rounded-2xl border bg-white/60 p-8 shadow-sm sm:p-10">
          <div className="mb-8 space-y-2 text-center">
            <h1 className="font-display text-pine text-3xl">{title}</h1>
            <p className="text-sage text-sm">{description}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
