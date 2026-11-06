import { Form } from "@inertiajs/react"

import { websiteUsers } from "@/routes"
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
import { brandInput, brandOutlineButton } from "@/website/components/brand"
import {
  ProfileCard,
  SectionHeading,
} from "@/website/features/profile/components/profile-card"
import { useI18n } from "@/website/lib/i18n"

export function DeleteAccount() {
  const { t } = useI18n()

  return (
    <ProfileCard id="delete" tone="danger">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-72 flex-1">
          <SectionHeading
            title={t("Delete account")}
            description={t(
              "Permanently removes your account and data. This cannot be undone.",
            )}
          />
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="destructive"
              className="bg-danger hover:bg-danger/90 h-11 rounded-full px-6 text-white"
            >
              {t("Delete account")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>
              {t("Are you sure you want to delete your account?")}
            </DialogTitle>
            <DialogDescription>
              {t(
                "Once your account is deleted, all of its data is permanently removed. Enter your password to confirm.",
              )}
            </DialogDescription>
            <Form
              action={websiteUsers.destroy()}
              options={{ preserveScroll: true }}
              resetOnSuccess
              className="space-y-6"
            >
              {({ resetAndClearErrors, processing, errors }) => (
                <>
                  <Field>
                    <FieldLabel htmlFor="delete_password" className="sr-only">
                      {t("Password")}
                    </FieldLabel>
                    <Input
                      className={brandInput}
                      id="delete_password"
                      type="password"
                      name="delete_password"
                      placeholder={t("Password")}
                      autoComplete="current-password"
                      autoFocus
                    />
                    <FieldError
                      errors={errors.delete_password?.map((message) => ({
                        message,
                      }))}
                    />
                  </Field>

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
                      variant="destructive"
                      className="bg-danger hover:bg-danger/90 h-11 rounded-full px-6 text-white"
                      disabled={processing}
                    >
                      {t("Delete account")}
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
