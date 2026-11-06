import { Link, useForm } from "@inertiajs/react"

import { asFieldErrors } from "@/admin/components/form-fields"
import {
  type TranslationEntry,
  TranslationFields,
  translationParams,
} from "@/admin/components/translation-fields"
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

interface ExtraFormData {
  price: string
  is_active: boolean
  translations: TranslationEntry[]
}

/** Create/edit form for a booking extra. Posts `{ extra: { price, is_active, translations } }`. */
export function ExtraForm({
  price,
  isActive,
  translations,
  action,
  cancelHref,
  submitLabel,
}: {
  price: number | null
  isActive: boolean
  translations: TranslationEntry[]
  action: RouteDefinition<"post" | "patch">
  cancelHref: string
  submitLabel: string
}) {
  const form = useForm<ExtraFormData>({
    price: price != null ? String(price) : "",
    is_active: isActive,
    translations,
  })
  const { data, setData, errors, processing } = form

  form.transform((values) => ({
    extra: {
      price: values.price,
      is_active: values.is_active,
      translations: translationParams(values.translations),
    },
  }))

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        form.submit(action, { preserveScroll: true })
      }}
      className="max-w-2xl space-y-6"
    >
      <Card>
        <CardContent className="space-y-6">
          <TranslationFields
            translations={data.translations}
            onChange={(value) => setData("translations", value)}
            errors={errors.translations}
          />

          <Field data-invalid={errors.price ? true : undefined}>
            <FieldLabel htmlFor="price">Price (EGP)</FieldLabel>
            <Input
              id="price"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={data.price}
              onChange={(event) => setData("price", event.target.value)}
              aria-invalid={errors.price ? true : undefined}
              required
              className="sm:max-w-xs"
            />
            <FieldError errors={asFieldErrors(errors.price)} />
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
                Turn off to stop customers from adding it to a booking without
                deleting it.
              </FieldDescription>
            </FieldContent>
          </Field>
        </CardContent>
      </Card>

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
