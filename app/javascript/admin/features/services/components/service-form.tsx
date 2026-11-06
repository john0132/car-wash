import { Link, useForm } from "@inertiajs/react"

import { asFieldErrors } from "@/admin/components/form-fields"
import { SeoFields } from "@/admin/components/seo-fields"
import { TranslationFields } from "@/admin/components/translation-fields"
import { FormSection } from "@/admin/features/services/components/form-section"
import { HomePageFields } from "@/admin/features/services/components/home-page-fields"
import { ServiceContentFields } from "@/admin/features/services/components/service-content-fields"
import type {
  ServiceCategoryOption,
  ServiceDetail,
  ServiceTranslationEntry,
} from "@/admin/features/services/types"
import { serviceTranslationParams } from "@/admin/features/services/utils"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { Spinner } from "@/shared/components/ui/spinner"
import { Switch } from "@/shared/components/ui/switch"

interface ServiceFormData {
  service_category_id: number | null
  slug: string
  price: string
  sale_price: string
  duration_minutes: string
  is_active: boolean
  display_in_home_page: boolean
  image: ImageValue | null
  translations: ServiceTranslationEntry[]
}

/** Create/edit form for a service. Posts `{ service: {...} }`; a blank sale price clears it. */
export function ServiceForm({
  service,
  serviceCategoryId,
  translations,
  categories,
  action,
  cancelHref,
  submitLabel,
}: {
  service: ServiceDetail | null
  /** Preselected category for a new service. */
  serviceCategoryId: number | null
  translations: ServiceTranslationEntry[]
  categories: ServiceCategoryOption[]
  action: RouteDefinition<"post" | "patch">
  cancelHref: string
  submitLabel: string
}) {
  const form = useForm<ServiceFormData>({
    service_category_id: service?.service_category.id ?? serviceCategoryId,
    slug: service?.slug ?? "",
    price: service ? String(service.price) : "",
    sale_price: service?.sale_price != null ? String(service.sale_price) : "",
    duration_minutes:
      service?.duration_minutes != null ? String(service.duration_minutes) : "",
    is_active: service?.is_active ?? true,
    display_in_home_page: service?.display_in_home_page ?? false,
    image: service?.image ?? null,
    translations,
  })
  const { data, setData, processing } = form
  // Rails also reports `service_category` (the belongs_to), which isn't a form field.
  const errors = form.errors as Record<string, string[] | undefined>
  const categoryErrors = errors.service_category ?? errors.service_category_id

  form.transform((values) => ({
    service: {
      service_category_id: values.service_category_id,
      slug: values.slug,
      price: values.price,
      sale_price: values.sale_price,
      duration_minutes: values.duration_minutes,
      is_active: values.is_active,
      display_in_home_page: values.display_in_home_page,
      image: values.image?.signed_id ?? "",
      translations: serviceTranslationParams(values.translations),
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
        <Field data-invalid={categoryErrors ? true : undefined}>
          <FieldLabel htmlFor="service_category_id">Category</FieldLabel>
          <Select
            value={
              data.service_category_id ? String(data.service_category_id) : ""
            }
            onValueChange={(value) =>
              setData("service_category_id", Number(value))
            }
          >
            <SelectTrigger
              id="service_category_id"
              className="w-full sm:max-w-sm"
              aria-invalid={categoryErrors ? true : undefined}
            >
              <SelectValue placeholder="Choose a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={String(category.id)}>
                  {category.name}
                  {category.is_active ? "" : " (disabled)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {categories.length === 0 && (
            <FieldDescription>
              No categories yet. Create a service category first.
            </FieldDescription>
          )}
          <FieldError errors={asFieldErrors(categoryErrors)} />
        </Field>

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
            placeholder="exterior-wash"
            className="sm:max-w-sm"
          />
          <FieldDescription>
            The service page lives at /services/
            {data.slug || "your-slug"}. Leave blank to generate it from the
            name.
          </FieldDescription>
          <FieldError errors={asFieldErrors(errors.slug)} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
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
            />
            <FieldError errors={asFieldErrors(errors.price)} />
          </Field>

          <Field data-invalid={errors.sale_price ? true : undefined}>
            <FieldLabel htmlFor="sale_price">
              Sale price (EGP)
              <span className="text-muted-foreground font-normal">
                optional
              </span>
            </FieldLabel>
            <Input
              id="sale_price"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={data.sale_price}
              onChange={(event) => setData("sale_price", event.target.value)}
              aria-invalid={errors.sale_price ? true : undefined}
            />
            <FieldDescription>
              Must be below the price. Leave blank when not on sale.
            </FieldDescription>
            <FieldError errors={asFieldErrors(errors.sale_price)} />
          </Field>
        </div>

        <Field data-invalid={errors.duration_minutes ? true : undefined}>
          <FieldLabel htmlFor="duration_minutes">
            Duration (minutes)
            <span className="text-muted-foreground font-normal">optional</span>
          </FieldLabel>
          <Input
            id="duration_minutes"
            type="number"
            inputMode="numeric"
            min="1"
            max="1440"
            step="1"
            value={data.duration_minutes}
            onChange={(event) =>
              setData("duration_minutes", event.target.value)
            }
            aria-invalid={errors.duration_minutes ? true : undefined}
            className="sm:max-w-40"
          />
          <FieldDescription>
            How long the service takes. Shown to customers on its page.
          </FieldDescription>
          <FieldError errors={asFieldErrors(errors.duration_minutes)} />
        </Field>

        <HomePageFields
          noun="service"
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
              Turn off to stop customers from booking it without deleting it.
            </FieldDescription>
          </FieldContent>
        </Field>
      </FormSection>

      <FormSection
        title="Page content"
        description="The headline and description customers read on the service's page. Optional."
      >
        <ServiceContentFields
          translations={data.translations}
          onChange={(value) => setData("translations", value)}
        />
      </FormSection>

      <FormSection
        title="SEO"
        description="Shown in search results and link previews for the service's page. Optional."
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
