import type { ReactNode } from "react"

export function SectionHeading({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div>
      <h2 className="font-display text-[28px] leading-tight">{title}</h2>
      <p className="text-sage mt-1 text-sm">{description}</p>
    </div>
  )
}

export function ProfileCard({
  id,
  children,
  tone = "default",
}: {
  id: string
  children: ReactNode
  tone?: "default" | "danger"
}) {
  return (
    <section
      id={id}
      className={
        tone === "danger"
          ? "border-danger/25 bg-danger/5 scroll-mt-24 rounded-[20px] border p-6 sm:p-8"
          : "border-pine/10 scroll-mt-24 rounded-[20px] border bg-white/60 p-6 sm:p-8"
      }
    >
      {children}
    </section>
  )
}
