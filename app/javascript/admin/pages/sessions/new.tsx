import { Form, Head } from "@inertiajs/react"

import { DemoLoginPanel } from "@/admin/features/sessions/components/demo-login-panel"
import type { DemoLogin } from "@/admin/features/sessions/types"
import AuthLayout from "@/admin/layouts/auth-layout"
import { adminSessions } from "@/routes"
import { Button } from "@/shared/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { Spinner } from "@/shared/components/ui/spinner"

export default function AdminLogin({
  demo_login,
}: {
  demo_login: DemoLogin | null
}) {
  return (
    <AuthLayout
      title="Admin sign in"
      description="Staff access only. Enter your email and password to continue."
    >
      <Head title="Admin sign in" />
      {demo_login && <DemoLoginPanel {...demo_login} />}
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
              <FieldLabel htmlFor="password">Password</FieldLabel>
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
              <FieldDescription>
                Forgot your password? Ask an administrator to reset it.
              </FieldDescription>
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
