import { Form } from "@inertiajs/react"

import { websiteProfiles } from "@/routes"
import { Button } from "@/shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { Spinner } from "@/shared/components/ui/spinner"
import {
  ProfileCard,
  SectionHeading,
  fieldClass,
  primaryButtonClass,
} from "@/website/features/profile/components/profile-card"
import type { ProfileData } from "@/website/features/profile/types"

const toErrors = (messages?: string[]) =>
  messages?.map((message) => ({ message }))

export function DetailsForm({ profile }: { profile: ProfileData }) {
  return (
    <ProfileCard id="details">
      <Form
        action={websiteProfiles.update()}
        options={{ preserveScroll: true }}
        className="flex flex-col gap-6"
      >
        {({ errors, processing, recentlySuccessful }) => (
          <>
            <SectionHeading
              title="Personal details"
              description="How we address you and reach you."
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="name">First name</FieldLabel>
                <Input
                  id="name"
                  name="name"
                  defaultValue={profile.name}
                  required
                  autoComplete="given-name"
                  className={fieldClass}
                />
                <FieldError errors={toErrors(errors.name)} />
              </Field>

              <Field>
                <FieldLabel htmlFor="last_name">Last name</FieldLabel>
                <Input
                  id="last_name"
                  name="last_name"
                  defaultValue={profile.last_name ?? ""}
                  autoComplete="family-name"
                  className={fieldClass}
                />
                <FieldError errors={toErrors(errors.last_name)} />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="email">Email address</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={profile.email}
                required
                autoComplete="email"
                className={fieldClass}
              />
              <FieldError errors={toErrors(errors.email)} />
            </Field>

            <div className="flex items-center gap-4">
              <Button
                type="submit"
                disabled={processing}
                className={primaryButtonClass}
              >
                {processing && <Spinner />}
                Save changes
              </Button>
              {recentlySuccessful && (
                <p className="text-sm text-[#2B3A32]/65" role="status">
                  Saved
                </p>
              )}
            </div>
          </>
        )}
      </Form>
    </ProfileCard>
  )
}
