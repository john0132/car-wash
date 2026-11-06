import type { ProfileData } from "@/website/features/profile/types"
import { useI18n } from "@/website/lib/i18n"

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-pine/12 min-w-32 flex-1 rounded-2xl border bg-white/55 px-5 py-3.5">
      <div className="text-sage text-xs tracking-[0.16em] uppercase">
        {label}
      </div>
      <div className="font-display text-[28px] leading-tight">{value}</div>
    </div>
  )
}

export function ProfileStats({ profile }: { profile: ProfileData }) {
  const { t, formatMonthYear } = useI18n()

  return (
    <div className="flex flex-wrap gap-3">
      <Stat label={t("Points")} value={String(profile.points)} />
      <Stat label={t("Wallet")} value={profile.wallet.toFixed(2)} />
      <Stat
        label={t("Member since")}
        value={formatMonthYear(profile.created_at)}
      />
    </div>
  )
}
