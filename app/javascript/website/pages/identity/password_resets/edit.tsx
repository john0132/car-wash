import { Form, Head } from "@inertiajs/react"

import { websiteIdentityPasswordResets } from "@/routes"
import { Button } from "@/shared/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { Spinner } from "@/shared/components/ui/spinner"
import AuthLayout from "@/website/layouts/auth-layout"

interface ResetPasswordProps {
  sid: string
  email: string
}

export default function ResetPassword({ sid, email }: ResetPasswordProps) {
  return (
    <AuthLayout
      title="Reset password"
      description="Please enter your new password below"
    >
      <Head title="Reset password" />
      <Form
        action={websiteIdentityPasswordResets.update()}
        transform={(data) => ({ ...data, sid, email })}
        resetOnSuccess={["password", "password_confirmation"]}
      >
        {({ processing, errors }) => (
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                readOnly
              />
              <FieldError
                errors={errors.email?.map((message) => ({ message }))}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                name="password"
                autoComplete="new-password"
                autoFocus
                placeholder="Password"
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
                type="password"
                name="password_confirmation"
                autoComplete="new-password"
                placeholder="Confirm password"
              />
              <FieldError
                errors={errors.password_confirmation?.map((message) => ({
                  message,
                }))}
              />
            </Field>

            <Button type="submit" className="mt-4 w-full" disabled={processing}>
              {processing && <Spinner />}
              Reset password
            </Button>
          </FieldGroup>
        )}
      </Form>
    </AuthLayout>
  )
}
