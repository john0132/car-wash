import { Form } from "@inertiajs/react"
import { useState } from "react"

import { websitePasswords } from "@/routes"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { Spinner } from "@/shared/components/ui/spinner"
import {
  brandButton,
  brandInput,
  brandOutlineButton,
} from "@/website/components/brand"
import {
  ProfileCard,
  SectionHeading,
} from "@/website/features/profile/components/profile-card"
import { msg, useI18n } from "@/website/lib/i18n"

const toErrors = (messages?: string[]) =>
  messages?.map((message) => ({ message }))

const FIELDS = [
  {
    name: "password_challenge",
    label: msg("Current password"),
    autoComplete: "current-password",
  },
  {
    name: "password",
    label: msg("New password"),
    autoComplete: "new-password",
  },
  {
    name: "password_confirmation",
    label: msg("Confirm new password"),
    autoComplete: "new-password",
  },
] as const

export function PasswordForm() {
  const { t } = useI18n()

  const [open, setOpen] = useState(false)

  return (
    <ProfileCard id="password">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-72 flex-1">
          <SectionHeading
            title={t("Password")}
            description={t("Keep your account safe with a strong password.")}
          />
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={brandOutlineButton}
            >
              {t("Change password")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>{t("Change password")}</DialogTitle>
            <DialogDescription>
              {t(
                "Use at least 12 characters. You'll stay signed in on this device only.",
              )}
            </DialogDescription>
            <Form
              action={websitePasswords.update()}
              options={{ preserveScroll: true }}
              onSuccess={() => setOpen(false)}
              resetOnSuccess
              resetOnError={["password_challenge"]}
              className="space-y-5"
            >
              {({ errors, processing, resetAndClearErrors }) => (
                <>
                  {FIELDS.map(({ name, label, autoComplete }) => (
                    <Field key={name}>
                      <FieldLabel htmlFor={name}>{t(label)}</FieldLabel>
                      <Input
                        className={brandInput}
                        id={name}
                        name={name}
                        type="password"
                        autoComplete={autoComplete}
                        required
                      />
                      <FieldError errors={toErrors(errors[name])} />
                    </Field>
                  ))}

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={brandOutlineButton}
                        onClick={() => resetAndClearErrors()}
                      >
                        {t("Cancel")}
                      </Button>
                    </DialogClose>
                    <Button
                      type="submit"
                      className={brandButton}
                      disabled={processing}
                    >
                      {processing && <Spinner />}
                      {t("Update password")}
                    </Button>
                  </DialogFooter>
                </>
              )}
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </ProfileCard>
  )
}
