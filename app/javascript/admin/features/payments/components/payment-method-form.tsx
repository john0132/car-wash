import { Link, useForm } from "@inertiajs/react"
import type { ReactNode } from "react"

import type {
  PaymentMethodDetail,
  PaymentMethodFormData,
  PaymentMethodTranslation,
} from "@/admin/features/payments/types"
import type { RouteDefinition } from "@/routes/runtime"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { Spinner } from "@/shared/components/ui/spinner"
import { Switch } from "@/shared/components/ui/switch"

const asFieldErrors = (messages?: string[]) =>
  messages?.map((message) => ({ message }))

/** Create/edit form for a payment method. Posts `{ payment_method: {...} }`. */
export function PaymentMethodForm({
  paymentMethod,
  translations,
  action,
  cancelHref,
  submitLabel,
}: {
  paymentMethod: PaymentMethodDetail
  translations: PaymentMethodTranslation[]
  action: RouteDefinition<"post" | "patch">
  cancelHref: string
  submitLabel: string
}) {
  const form = useForm<PaymentMethodFormData>({
    code: paymentMethod.code,
    is_active: paymentMethod.is_active,
    translations: Object.fromEntries(
      translations.map((t) => [t.language_id, { name: t.name ?? "" }]),
    ),
  })
  const { data, setData, errors, processing } = form
  const fieldErrors = errors as Record<string, string[] | undefined>

  form.transform((values) => ({ payment_method: values }))

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        form.submit(action, { preserveScroll: true })
      }}
      className="max-w-2xl space-y-6"
    >
      <Section
        title="Name"
        description="Shown to customers in their language. Fill in at least one language."
      >
        {translations.map((t) => (
          <Field key={t.language_id} dir={t.code === "ar" ? "rtl" : undefined}>
            <FieldLabel htmlFor={`name_${t.language_id}`}>
              {t.language}
            </FieldLabel>
            <Input
              id={`name_${t.language_id}`}
              value={data.translations[t.language_id]?.name ?? ""}
              onChange={(event) =>
                setData("translations", {
                  ...data.translations,
                  [t.language_id]: { name: event.target.value },
                })
              }
            />
          </Field>
        ))}
        <FieldError errors={asFieldErrors(fieldErrors.translations)} />
      </Section>

      <Section title="Settings">
        <Field data-invalid={errors.code ? true : undefined}>
          <FieldLabel htmlFor="code">Code</FieldLabel>
          <Input
            id="code"
            value={data.code}
            onChange={(event) => setData("code", event.target.value)}
            aria-invalid={errors.code ? true : undefined}
            className="font-mono"
            placeholder="cash"
            required
          />
          <FieldDescription>
            Stable identifier used by the system, e.g. cash, card or wallet.
          </FieldDescription>
          <FieldError errors={asFieldErrors(fieldErrors.code)} />
        </Field>

        <Field orientation="horizontal">
          <Switch
            id="is_active"
            checked={data.is_active}
            onCheckedChange={(checked) => setData("is_active", checked)}
          />
          <FieldContent>
            <FieldLabel htmlFor="is_active">Active</FieldLabel>
            <FieldDescription>
              Disabled methods can&apos;t be chosen at checkout; past
              transactions are kept.
            </FieldDescription>
          </FieldContent>
        </Field>
      </Section>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={processing}>
          {processing && <Spinner />}
          {submitLabel}
        </Button>
        <Button variant="ghost" asChild>
          <Link href={cancelHref}>Cancel</Link>
        </Button>
      </div>
    </form>
  )
}

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <h2 className="font-medium">{title}</h2>
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
        </div>
        {children}
      </CardContent>
    </Card>
  )
}
