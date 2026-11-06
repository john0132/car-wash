import { Form } from "@inertiajs/react"

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
import { brandInput } from "@/website/components/brand"
import { SeoHead } from "@/website/components/seo-head"
import AuthLayout from "@/website/layouts/auth-layout"
import { useI18n } from "@/website/lib/i18n"

interface ResetPasswordProps {
  sid: string
  email: string
}

export default function ResetPassword({ sid, email }: ResetPasswordProps) {
  const { t } = useI18n()

  return (
    <AuthLayout
      title={t("Reset password")}
      description={t("Please enter your new password below")}
    >
      <SeoHead title={t("Reset password")} noindex />
      <Form
        action={websiteIdentityPasswordResets.update()}
        transform={(data) => ({ ...data, sid, email })}
        resetOnSuccess={["password", "password_confirmation"]}
      >
        {({ processing, errors }) => (
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">{t("Email")}</FieldLabel>
              <Input
                className={brandInput}
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
              <FieldLabel htmlFor="password">{t("Password")}</FieldLabel>
              <Input
                className={brandInput}
                id="password"
                type="password"
                name="password"
                autoComplete="new-password"
                required
                autoFocus
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
                autoComplete="new-password"
                required
                placeholder={t("Confirm password")}
              />
              <FieldError
                errors={errors.password_confirmation?.map((message) => ({
                  message,
                }))}
              />
            </Field>

            <Button type="submit" className="mt-4 w-full" disabled={processing}>
              {processing && <Spinner />}
              {t("Reset password")}
            </Button>
          </FieldGroup>
        )}
      </Form>
    </AuthLayout>
  )
}
