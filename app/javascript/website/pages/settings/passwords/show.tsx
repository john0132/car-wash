import { Transition } from "@headlessui/react"
import { Form, Head } from "@inertiajs/react"

import { websiteSettingsPasswords } from "@/routes"
import HeadingSmall from "@/shared/components/heading-small"
import { Button } from "@/shared/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import type { BreadcrumbItem } from "@/shared/types"
import AppLayout from "@/website/layouts/app-layout"
import SettingsLayout from "@/website/layouts/settings-layout"

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Password settings",
    href: websiteSettingsPasswords.show().url,
  },
]

export default function Password() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={breadcrumbs[breadcrumbs.length - 1].title} />

      <SettingsLayout>
        <div className="space-y-6">
          <HeadingSmall
            title="Update password"
            description="Ensure your account is using a long, random password to stay secure"
          />

          <Form
            action={websiteSettingsPasswords.update()}
            options={{
              preserveScroll: true,
            }}
            resetOnError
            resetOnSuccess
            className="space-y-6"
          >
            {({ errors, processing, recentlySuccessful }) => (
              <>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="password_challenge">
                      Current password
                    </FieldLabel>

                    <Input
                      id="password_challenge"
                      name="password_challenge"
                      type="password"
                      autoComplete="current-password"
                      placeholder="Current password"
                    />

                    <FieldError
                      errors={errors.password_challenge?.map((message) => ({
                        message,
                      }))}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="password">New password</FieldLabel>

                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="New password"
                    />

                    <FieldError
                      errors={errors.password?.map((message) => ({ message }))}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="password_confirmation">
                      Confirm password
                    </FieldLabel>

                    <Input
                      id="password_confirmation"
                      name="password_confirmation"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Confirm password"
                    />

                    <FieldError
                      errors={errors.password_confirmation?.map((message) => ({
                        message,
                      }))}
                    />
                  </Field>
                </FieldGroup>

                <div className="flex items-center gap-4">
                  <Button disabled={processing}>Save password</Button>

                  <Transition
                    show={recentlySuccessful}
                    enter="transition ease-in-out"
                    enterFrom="opacity-0"
                    leave="transition ease-in-out"
                    leaveTo="opacity-0"
                  >
                    <p className="text-sm text-neutral-600">Saved</p>
                  </Transition>
                </div>
              </>
            )}
          </Form>
        </div>
      </SettingsLayout>
    </AppLayout>
  )
}
