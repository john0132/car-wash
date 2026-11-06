import type { ReactNode } from "react"

export const fieldClass =
  "h-11 rounded-[10px] border-[#2B3A32]/25 bg-white px-3.5 text-[#2B3A32]"

export const primaryButtonClass =
  "h-11 rounded-full bg-[#2B3A32] px-7 text-[#F6F1E7] hover:bg-[#1F2B25]"

export const outlineButtonClass =
  "h-11 rounded-full border-[#2B3A32]/30 bg-transparent px-7 text-[#2B3A32] hover:bg-[#2B3A32]/5 hover:text-[#2B3A32]"

export function SectionHeading({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div>
      <h2
        style={{ fontFamily: "'Italiana', serif" }}
        className="text-[28px] leading-tight"
      >
        {title}
      </h2>
      <p className="mt-1 text-sm text-[#2B3A32]/65">{description}</p>
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
          ? "scroll-mt-24 rounded-[20px] border border-[#B3261E]/25 bg-[#B3261E]/5 p-6 sm:p-8"
          : "scroll-mt-24 rounded-[20px] border border-[#2B3A32]/10 bg-white/60 p-6 sm:p-8"
      }
    >
      {children}
    </section>
  )
}
