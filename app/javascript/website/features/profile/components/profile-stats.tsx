import type { ProfileData } from "@/website/features/profile/types"
import { formatMonthYear } from "@/website/features/profile/utils"

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
  return (
    <div className="flex flex-wrap gap-3">
      <Stat label="Points" value={String(profile.points)} />
      <Stat label="Wallet" value={profile.wallet.toFixed(2)} />
      <Stat label="Member since" value={formatMonthYear(profile.created_at)} />
    </div>
  )
}
