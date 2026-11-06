import { Form } from "@inertiajs/react"

import { websiteIdentityPasswordResets, websiteSessions } from "@/routes"
import TextLink from "@/shared/components/text-link"
import { Button } from "@/shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { Spinner } from "@/shared/components/ui/spinner"
import { brandButton, brandInput } from "@/website/components/brand"
import { SeoHead } from "@/website/components/seo-head"
import AuthLayout from "@/website/layouts/auth-layout"

export default function ForgotPassword() {
  return (
    <AuthLayout
      title="Forgot password"
      description="Enter your email to receive a password reset link"
    >
      <SeoHead title="Forgot password" noindex />

      <div className="space-y-6">
        <Form action={websiteIdentityPasswordResets.create()}>
          {({ processing, errors }) => (
            <>
              <Field>
                <FieldLabel htmlFor="email">Email address</FieldLabel>
                <Input
                  className={brandInput}
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  autoFocus
                  placeholder="email@example.com"
                />
                <FieldError
                  errors={errors.email?.map((message) => ({ message }))}
                />
              </Field>

              <div className="my-6 flex items-center justify-start">
                <Button
                  className={`${brandButton} w-full`}
                  disabled={processing}
                >
                  {processing && <Spinner />}
                  Email password reset link
                </Button>
              </div>
            </>
          )}
        </Form>
        <div className="text-muted-foreground space-x-1 text-center text-sm">
          <span>Or, return to</span>
          <TextLink href={websiteSessions.new()}>log in</TextLink>
        </div>
      </div>
    </AuthLayout>
  )
}
