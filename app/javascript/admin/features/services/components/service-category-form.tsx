import { Link, useForm } from "@inertiajs/react"

import { asFieldErrors } from "@/admin/components/form-fields"
import {
  SeoFields,
  type SeoTranslationEntry,
  seoTranslationParams,
} from "@/admin/components/seo-fields"
import { TranslationFields } from "@/admin/components/translation-fields"
import { FormSection } from "@/admin/features/services/components/form-section"
import { HomePageFields } from "@/admin/features/services/components/home-page-fields"
import type { ServiceCategoryDetail } from "@/admin/features/services/types"
import type { ImageValue } from "@/admin/types"
import type { RouteDefinition } from "@/routes/runtime"
import { Button } from "@/shared/components/ui/button"
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

interface ServiceCategoryFormData {
  slug: string
  is_active: boolean
  display_in_home_page: boolean
  image: ImageValue | null
  translations: SeoTranslationEntry[]
}

/** Create/edit form for a service category. Posts `{ service_category: { slug, is_active, display_in_home_page, image, translations } }`. */
export function ServiceCategoryForm({
  category,
  translations,
  action,
  cancelHref,
  submitLabel,
}: {
  /** The category being edited; null when creating one. */
  category: ServiceCategoryDetail | null
  translations: SeoTranslationEntry[]
  action: RouteDefinition<"post" | "patch">
  cancelHref: string
  submitLabel: string
}) {
  const form = useForm<ServiceCategoryFormData>({
    slug: category?.slug ?? "",
    is_active: category?.is_active ?? true,
    display_in_home_page: category?.display_in_home_page ?? false,
    image: category?.image ?? null,
    translations,
  })
  const { data, setData, processing } = form
  const errors = form.errors as Record<string, string[] | undefined>

  form.transform((values) => ({
    service_category: {
      slug: values.slug,
      is_active: values.is_active,
      display_in_home_page: values.display_in_home_page,
      image: values.image?.signed_id ?? "",
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

        <Field data-invalid={errors.slug ? true : undefined}>
          <FieldLabel htmlFor="slug">
            URL slug
            <span className="text-muted-foreground font-normal">optional</span>
          </FieldLabel>
          <Input
            id="slug"
            value={data.slug}
            onChange={(event) =>
              setData(
                "slug",
                event.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-"),
              )
            }
            aria-invalid={errors.slug ? true : undefined}
            placeholder="exterior"
            className="sm:max-w-sm"
          />
          <FieldDescription>
            The category page lives at /categories/{data.slug || "your-slug"}.
            Leave blank to generate it from the name.
          </FieldDescription>
          <FieldError errors={asFieldErrors(errors.slug)} />
        </Field>

        <HomePageFields
          noun="category"
          image={data.image}
          onImageChange={(image) => setData("image", image)}
          display={data.display_in_home_page}
          onDisplayChange={(value) => setData("display_in_home_page", value)}
          errors={errors}
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
