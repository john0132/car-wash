import { Form } from "@inertiajs/react"

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
import { brandInput } from "@/website/components/brand"
import { SeoHead } from "@/website/components/seo-head"
import AuthLayout from "@/website/layouts/auth-layout"
import { useI18n } from "@/website/lib/i18n"

export default function Login() {
  const { t } = useI18n()

  return (
    <AuthLayout
      title={t("Log in to your account")}
      description={t("Enter your email and password below to log in")}
    >
      <SeoHead title={t("Log in")} noindex />
      <Form
        action={websiteSessions.create()}
        resetOnSuccess={["password"]}
        className="flex flex-col gap-6"
      >
        {({ processing, errors }) => (
          <>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">{t("Email address")}</FieldLabel>
                <Input
                  className={brandInput}
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  placeholder={t("email@example.com")}
                />
                <FieldError
                  errors={errors.email?.map((message) => ({ message }))}
                />
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">{t("Password")}</FieldLabel>
                  <TextLink
                    href={websiteIdentityPasswordResets.new()}
                    className="ms-auto text-sm"
                  >
                    {t("Forgot password?")}
                  </TextLink>
                </div>
                <Input
                  className={brandInput}
                  id="password"
                  type="password"
                  name="password"
                  required
                  autoComplete="current-password"
                  placeholder={t("Password")}
                />
                <FieldError
                  errors={errors.password?.map((message) => ({ message }))}
                />
              </Field>

              <Button
                type="submit"
                className="bg-pine text-ivory hover:bg-pine-deep mt-4 h-11 w-full rounded-full"
                disabled={processing}
              >
                {processing && <Spinner />}
                {t("Log in")}
              </Button>
            </FieldGroup>

            <div className="text-muted-foreground text-center text-sm">
              {t("Don't have an account?")}{" "}
              <TextLink href={websiteUsers.new()}>{t("Sign up")}</TextLink>
            </div>
          </>
        )}
      </Form>
    </AuthLayout>
  )
}
