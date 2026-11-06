import { Form, Head } from "@inertiajs/react"

import { websiteSessions, websiteUsers } from "@/routes"
import TextLink from "@/shared/components/text-link"
import { Button } from "@/shared/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { Spinner } from "@/shared/components/ui/spinner"
import { SocialLoginButtons } from "@/website/features/auth/components/social-login-buttons"
import AuthLayout from "@/website/layouts/auth-layout"

export default function Register() {
  return (
    <AuthLayout
      title="Create an account"
      description="Enter your details below to create your account"
    >
      <Head title="Register" />
      <Form
        action={websiteUsers.create()}
        resetOnSuccess={["password", "password_confirmation"]}
        disableWhileProcessing
        className="flex flex-col gap-6"
      >
        {({ processing, errors }) => (
          <>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  name="name"
                  required
                  autoFocus
                  tabIndex={1}
                  autoComplete="name"
                  disabled={processing}
                  placeholder="Full name"
                />
                <FieldError
                  errors={errors.name?.map((message) => ({ message }))}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email address</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  required
                  tabIndex={2}
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
                  tabIndex={3}
                  autoComplete="new-password"
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
                  required
                  tabIndex={4}
                  autoComplete="new-password"
                  placeholder="Confirm password"
                />
                <FieldError
                  errors={errors.password_confirmation?.map((message) => ({
                    message,
                  }))}
                />
              </Field>

              <Button
                type="submit"
                className="mt-2 h-11 w-full rounded-full bg-[#2B3A32] text-[#F6F1E7] hover:bg-[#1F2B25]"
                tabIndex={5}
              >
                {processing && <Spinner />}
                Create account
              </Button>
            </FieldGroup>

            <SocialLoginButtons verb="Sign up" />

            <div className="text-muted-foreground text-center text-sm">
              Already have an account?{" "}
              <TextLink href={websiteSessions.new()} tabIndex={6}>
                Log in
              </TextLink>
            </div>
          </>
        )}
      </Form>
    </AuthLayout>
  )
}
