import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar"
import { useInitials } from "@/shared/hooks/use-initials"
import type { ProfileData } from "@/website/features/profile/types"
import { formatMonthYear, fullName } from "@/website/features/profile/utils"

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-28 rounded-2xl border border-[#2B3A32]/12 bg-white/55 px-5 py-3.5">
      <div className="text-xs tracking-[0.16em] text-[#2B3A32]/65 uppercase">
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

export function ProfileHero({ profile }: { profile: ProfileData }) {
  const getInitials = useInitials()
  const name = fullName(profile.name, profile.last_name)

  return (
    <div className="flex flex-wrap items-center gap-6">
      <Avatar className="size-22">
        <AvatarFallback
          style={{ fontFamily: "'Italiana', serif" }}
          className="bg-[#2B3A32] text-[34px] text-[#F6F1E7]"
        >
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-64 flex-1">
        <h1
          style={{ fontFamily: "'Italiana', serif" }}
          className="text-4xl leading-tight sm:text-[44px]"
        >
          {name}
        </h1>
        <p className="mt-1.5 text-[15px] text-[#2B3A32]/65">
          {profile.email} · Member since {formatMonthYear(profile.created_at)}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Stat label="Points" value={String(profile.points)} />
        <Stat label="Wallet" value={profile.wallet.toFixed(2)} />
      </div>
    </div>
  )
}
