import type { ProfileData } from "@/website/features/profile/types"
import { formatMonthYear } from "@/website/features/profile/utils"

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-32 flex-1 rounded-2xl border border-[#2B3A32]/12 bg-white/55 px-5 py-3.5">
      <div className="text-xs tracking-[0.16em] text-[#5B6B5E] uppercase">
        {label}
      </div>
      <div
        style={{ fontFamily: "'Italiana', serif" }}
        className="text-[28px] leading-tight"
      >
        {value}
      </div>
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
