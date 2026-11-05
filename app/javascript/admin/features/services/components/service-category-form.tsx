import { Link, useForm } from "@inertiajs/react"

import {
  SeoFields,
  type SeoTranslationEntry,
  seoTranslationParams,
} from "@/admin/components/seo-fields"
import { TranslationFields } from "@/admin/components/translation-fields"
import { FormSection } from "@/admin/features/services/components/form-section"
import type { RouteDefinition } from "@/routes/runtime"
import { Button } from "@/shared/components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/shared/components/ui/field"
import { Spinner } from "@/shared/components/ui/spinner"
import { Switch } from "@/shared/components/ui/switch"

interface ServiceCategoryFormData {
  is_active: boolean
  translations: SeoTranslationEntry[]
}

/** Create/edit form for a service category. Posts `{ service_category: { is_active, translations } }`. */
export function ServiceCategoryForm({
  isActive,
  translations,
  action,
  cancelHref,
  submitLabel,
}: {
  isActive: boolean
  translations: SeoTranslationEntry[]
  action: RouteDefinition<"post" | "patch">
  cancelHref: string
  submitLabel: string
}) {
  const form = useForm<ServiceCategoryFormData>({
    is_active: isActive,
    translations,
  })
  const { data, setData, processing } = form
  const errors = form.errors as Record<string, string[] | undefined>

  form.transform((values) => ({
    service_category: {
      is_active: values.is_active,
      translations: seoTranslationParams(values.translations),
    },
  }))

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        form.submit(action, { preserveScroll: true })
      }}
      className="max-w-3xl space-y-6"
    >
      <FormSection title="Details">
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
              Turn off to hide the category and its services from customers
              without deleting them.
            </FieldDescription>
          </FieldContent>
        </Field>
      </FormSection>

      <FormSection
        title="SEO"
        description="Shown in search results and link previews for the category's page. Optional."
      >
        <SeoFields
          translations={data.translations}
          onChange={(value) => setData("translations", value)}
        />
      </FormSection>

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
