import { Car } from "lucide-react"

import {
  ProfileCard,
  SectionHeading,
} from "@/website/features/profile/components/profile-card"
import ProfileLayout from "@/website/layouts/profile-layout"

export default function CarsIndex() {
  return (
    <ProfileLayout title="My cars">
      <ProfileCard id="cars">
        <div className="flex flex-col gap-8">
          <SectionHeading
            title="My cars"
            description="The cars you book services for."
          />
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[#2B3A32]/25 px-6 py-14 text-center">
            <Car className="size-8 text-[#2B3A32]/50" aria-hidden="true" />
            <p className="font-medium">No cars yet</p>
            <p className="max-w-sm text-sm text-[#2B3A32]/65">
              Saving your cars is coming soon, so booking will be even quicker.
            </p>
          </div>
        </div>
      </ProfileCard>
    </ProfileLayout>
  )
}
