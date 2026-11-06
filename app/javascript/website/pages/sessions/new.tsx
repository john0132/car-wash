import { Form, Head } from "@inertiajs/react"

import {
  websiteIdentityPasswordResets,
  websiteSessions,
  websiteUsers,
} from "@/routes"
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

export default function Login() {
  return (
    <AuthLayout
      title="Log in to your account"
      description="Enter your email and password below to log in"
    >
      <Head title="Log in" />
      <Form
        action={websiteSessions.create()}
        resetOnSuccess={["password"]}
        className="flex flex-col gap-6"
      >
        {({ processing, errors }) => (
          <>
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
                  <TextLink
                    href={websiteIdentityPasswordResets.new()}
                    className="ml-auto text-sm"
                    tabIndex={5}
                  >
                    Forgot password?
                  </TextLink>
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
                className="mt-4 h-11 w-full rounded-full bg-[#2B3A32] text-[#F6F1E7] hover:bg-[#1F2B25]"
                tabIndex={4}
                disabled={processing}
              >
                {processing && <Spinner />}
                Log in
              </Button>
            </FieldGroup>

            <SocialLoginButtons verb="Sign in" />

            <div className="text-muted-foreground text-center text-sm">
              Don&apos;t have an account?{" "}
              <TextLink href={websiteUsers.new()} tabIndex={5}>
                Sign up
              </TextLink>
            </div>
          </>
        )}
      </Form>
    </AuthLayout>
  )
}
