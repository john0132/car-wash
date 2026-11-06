import { Form } from "@inertiajs/react"

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
import { brandInput } from "@/website/components/brand"
import { SeoHead } from "@/website/components/seo-head"
import AuthLayout from "@/website/layouts/auth-layout"
import { useI18n } from "@/website/lib/i18n"

export default function Register() {
  const { t } = useI18n()

  return (
    <AuthLayout
      title={t("Create an account")}
      description={t("Enter your details below to create your account")}
    >
      <SeoHead title={t("Register")} noindex />
      <Form
        action={websiteUsers.create()}
        resetOnSuccess={["password", "password_confirmation"]}
        disableWhileProcessing
        className="flex flex-col gap-6"
      >
        {({ processing, errors }) => (
          <>
            <FieldGroup>
              <div className="grid gap-6 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="name">{t("First name")}</FieldLabel>
                  <Input
                    className={brandInput}
                    id="name"
                    type="text"
                    name="name"
                    required
                    autoFocus
                    autoComplete="given-name"
                    disabled={processing}
                  />
                  <FieldError
                    errors={errors.name?.map((message) => ({ message }))}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="last_name">{t("Last name")}</FieldLabel>
                  <Input
                    className={brandInput}
                    id="last_name"
                    type="text"
                    name="last_name"
                    autoComplete="family-name"
                    disabled={processing}
                  />
                  <FieldError
                    errors={errors.last_name?.map((message) => ({ message }))}
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="email">{t("Email address")}</FieldLabel>
                <Input
                  className={brandInput}
                  id="email"
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  placeholder={t("email@example.com")}
                />
                <FieldError
                  errors={errors.email?.map((message) => ({ message }))}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">{t("Password")}</FieldLabel>
                <Input
                  className={brandInput}
                  id="password"
                  type="password"
                  name="password"
                  required
                  autoComplete="new-password"
                  placeholder={t("Password")}
                />
                <FieldError
                  errors={errors.password?.map((message) => ({ message }))}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password_confirmation">
                  {t("Confirm password")}
                </FieldLabel>
                <Input
                  className={brandInput}
                  id="password_confirmation"
                  type="password"
                  name="password_confirmation"
                  required
                  autoComplete="new-password"
                  placeholder={t("Confirm password")}
                />
                <FieldError
                  errors={errors.password_confirmation?.map((message) => ({
                    message,
                  }))}
                />
              </Field>

              <Button
                type="submit"
                className="bg-pine text-ivory hover:bg-pine-deep mt-2 h-11 w-full rounded-full"
              >
                {processing && <Spinner />}
                {t("Create account")}
              </Button>
            </FieldGroup>

            <div className="text-muted-foreground text-center text-sm">
              {t("Already have an account?")}{" "}
              <TextLink href={websiteSessions.new()}>{t("Log in")}</TextLink>
            </div>
          </>
        )}
      </Form>
    </AuthLayout>
  )
}
