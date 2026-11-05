import { Link, useForm } from "@inertiajs/react"

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
  FieldLabel,
} from "@/shared/components/ui/field"
import { Spinner } from "@/shared/components/ui/spinner"
import { Switch } from "@/shared/components/ui/switch"

interface CityFormData {
  is_active: boolean
  translations: TranslationEntry[]
}

/** Create/edit form for a city. Posts `{ city: { is_active, translations } }`. */
export function CityForm({
  isActive,
  translations,
  action,
  cancelHref,
  submitLabel,
}: {
  isActive: boolean
  translations: TranslationEntry[]
  action: RouteDefinition<"post" | "patch">
  cancelHref: string
  submitLabel: string
}) {
  const form = useForm<CityFormData>({ is_active: isActive, translations })
  const { data, setData, errors, processing } = form

  form.transform((values) => ({
    city: {
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

          <Field orientation="horizontal">
            <Switch
              id="is_active"
              checked={data.is_active}
              onCheckedChange={(checked) => setData("is_active", checked)}
            />
            <FieldContent>
              <FieldLabel htmlFor="is_active">Active</FieldLabel>
              <FieldDescription>
                Turn off to take the city out of service without deleting it.
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
