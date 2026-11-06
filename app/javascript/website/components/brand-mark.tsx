interface BrandMarkProps {
  className?: string
  tone?: "pine" | "ivory"
}

const TONES = {
  pine: { line: "#2B3A32", leaf: "#A97C50", bud: "#C98B6B" },
  ivory: { line: "#F6F1E7", leaf: "#C98B6B", bud: "#A97C50" },
} as const

export function BrandMark({ className, tone = "pine" }: BrandMarkProps) {
  const { line, leaf, bud } = TONES[tone]

  return (
    <svg
      viewBox="0 0 140 140"
      className={className}
      role="img"
      aria-label="Auto Atelier"
    >
      <circle
        cx="70"
        cy="72"
        r="54"
        stroke={line}
        strokeWidth="2"
        fill="none"
      />
      <path d="M34 96 C24 86 26 70 40 64 C36 80 38 92 34 96 Z" fill={leaf} />
      <path
        d="M106 96 C116 86 114 70 100 64 C104 80 102 92 106 96 Z"
        fill={leaf}
      />
      <line x1="70" y1="50" x2="70" y2="96" stroke={line} strokeWidth="2" />
      <circle cx="70" cy="42" r="7" fill={bud} />
    </svg>
  )
}

interface LogoProps {
  className?: string
  tone?: "pine" | "ivory"
  /** Drops the wordmark on the narrowest phones, where the header is tight. */
  compact?: boolean
}

export function Logo({ className, tone = "pine", compact }: LogoProps) {
  const textColor = tone === "pine" ? "#2B3A32" : "#F6F1E7"

  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <BrandMark tone={tone} className="h-7 w-7" />
      <span
        style={{ fontFamily: "'Italiana', serif", color: textColor }}
        className={`text-sm tracking-[0.2em] uppercase ${compact ? "max-[360px]:sr-only" : ""}`}
      >
        Auto Atelier
      </span>
    </span>
  )
}
