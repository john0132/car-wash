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
import {
  ProfileCard,
  SectionHeading,
} from "@/website/features/profile/components/profile-card"

export function DeleteAccount() {
  return (
    <ProfileCard id="delete" tone="danger">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-72 flex-1">
          <SectionHeading
            title="Delete account"
            description="Permanently removes your account and data. This cannot be undone."
          />
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="destructive"
              className="h-11 rounded-full bg-[#B3261E] px-6 text-white hover:bg-[#8E1F19]"
            >
              Delete account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>
              Are you sure you want to delete your account?
            </DialogTitle>
            <DialogDescription>
              Once your account is deleted, all of its data is permanently
              removed. Enter your password to confirm.
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
                      Password
                    </FieldLabel>
                    <Input
                      id="delete_password"
                      type="password"
                      name="delete_password"
                      placeholder="Password"
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
                        variant="secondary"
                        onClick={() => resetAndClearErrors()}
                      >
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      type="submit"
                      variant="destructive"
                      disabled={processing}
                    >
                      Delete account
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
