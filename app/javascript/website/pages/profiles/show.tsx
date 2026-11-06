import { DeleteAccount } from "@/website/features/profile/components/delete-account"
import { DetailsForm } from "@/website/features/profile/components/details-form"
import { DevicesList } from "@/website/features/profile/components/devices-list"
import { PasswordForm } from "@/website/features/profile/components/password-form"
import { ProfileStats } from "@/website/features/profile/components/profile-stats"
import type {
  DeviceSession,
  ProfileData,
} from "@/website/features/profile/types"
import ProfileLayout from "@/website/layouts/profile-layout"
import { useI18n } from "@/website/lib/i18n"

interface Props {
  profile: ProfileData
  sessions: DeviceSession[]
}

export default function ProfileShow({ profile, sessions }: Props) {
  const { t } = useI18n()

  return (
    <ProfileLayout title={t("My profile")}>
      <ProfileStats profile={profile} />
      <DetailsForm profile={profile} />
      <PasswordForm />
      <DevicesList sessions={sessions} />
      <DeleteAccount />
    </ProfileLayout>
  )
}
