import { Form, Head } from "@inertiajs/react"

import AuthLayout from "@/admin/layouts/auth-layout"
import { adminSessions, newIdentityPasswordReset } from "@/routes"
import { Button } from "@/shared/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { Spinner } from "@/shared/components/ui/spinner"

export default function AdminLogin() {
  return (
    <AuthLayout
      title="Admin sign in"
      description="Staff access only. Enter your email and password to continue."
    >
      <Head title="Admin sign in" />
      <Form
        action={adminSessions.create()}
        resetOnSuccess={["password"]}
        className="flex flex-col gap-6"
      >
        {({ processing, errors }) => (
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email address</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoFocus
                tabIndex={1}
                autoComplete="email"
                placeholder="email@example.com"
              />
              <FieldError
                errors={errors.email?.map((message) => ({ message }))}
              />
            </Field>

            <Field>
              <div className="flex items-center">
                <FieldLabel htmlFor="password">Password</FieldLabel>
                {/* Password reset is part of the website app: plain link = full page load. */}
                <a
                  href={newIdentityPasswordReset().url}
                  className="text-foreground ml-auto text-sm underline decoration-neutral-300 underline-offset-4 dark:decoration-neutral-500"
                  tabIndex={4}
                >
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                name="password"
                required
                tabIndex={2}
                autoComplete="current-password"
                placeholder="Password"
              />
              <FieldError
                errors={errors.password?.map((message) => ({ message }))}
              />
            </Field>

            <Button
              type="submit"
              className="mt-4 w-full"
              tabIndex={3}
              disabled={processing}
            >
              {processing && <Spinner />}
              Sign in
            </Button>
          </FieldGroup>
        )}
      </Form>
    </AuthLayout>
  )
}
