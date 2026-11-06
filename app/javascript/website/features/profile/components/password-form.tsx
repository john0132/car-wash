import { Form } from "@inertiajs/react"

import { websitePasswords } from "@/routes"
import { Button } from "@/shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { Spinner } from "@/shared/components/ui/spinner"
import {
  ProfileCard,
  SectionHeading,
  fieldClass,
  outlineButtonClass,
} from "@/website/features/profile/components/profile-card"

const toErrors = (messages?: string[]) =>
  messages?.map((message) => ({ message }))

const FIELDS = [
  {
    name: "password_challenge",
    label: "Current password",
    autoComplete: "current-password",
  },
  { name: "password", label: "New password", autoComplete: "new-password" },
  {
    name: "password_confirmation",
    label: "Confirm new password",
    autoComplete: "new-password",
  },
] as const

export function PasswordForm() {
  return (
    <ProfileCard id="password">
      <Form
        action={websitePasswords.update()}
        options={{ preserveScroll: true }}
        resetOnSuccess
        resetOnError={["password_challenge"]}
        className="flex flex-col gap-6"
      >
        {({ errors, processing, recentlySuccessful }) => (
          <>
            <SectionHeading
              title="Password"
              description="Use at least 12 characters."
            />

            <div className="grid gap-5 md:grid-cols-3">
              {FIELDS.map(({ name, label, autoComplete }) => (
                <Field key={name}>
                  <FieldLabel htmlFor={name}>{label}</FieldLabel>
                  <Input
                    id={name}
                    name={name}
                    type="password"
                    autoComplete={autoComplete}
                    required
                    className={fieldClass}
                  />
                  <FieldError errors={toErrors(errors[name])} />
                </Field>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <Button
                type="submit"
                variant="outline"
                disabled={processing}
                className={outlineButtonClass}
              >
                {processing && <Spinner />}
                Update password
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
