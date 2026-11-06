import { Link, useForm } from "@inertiajs/react"

import { asFieldErrors } from "@/admin/components/form-fields"
import {
  SeoFields,
  type SeoTranslationEntry,
  seoTranslationParams,
} from "@/admin/components/seo-fields"
import { TranslationFields } from "@/admin/components/translation-fields"
import { FormSection } from "@/admin/features/services/components/form-section"
import type {
  ServiceCategoryOption,
  ServiceDetail,
} from "@/admin/features/services/types"
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
  price: string
  sale_price: string
  is_active: boolean
  translations: SeoTranslationEntry[]
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
  translations: SeoTranslationEntry[]
  categories: ServiceCategoryOption[]
  action: RouteDefinition<"post" | "patch">
  cancelHref: string
  submitLabel: string
}) {
  const form = useForm<ServiceFormData>({
    service_category_id: service?.service_category.id ?? serviceCategoryId,
    price: service ? String(service.price) : "",
    sale_price: service?.sale_price != null ? String(service.sale_price) : "",
    is_active: service?.is_active ?? true,
    translations,
  })
  const { data, setData, processing } = form
  // Rails also reports `service_category` (the belongs_to), which isn't a form field.
  const errors = form.errors as Record<string, string[] | undefined>
  const categoryErrors = errors.service_category ?? errors.service_category_id

  form.transform((values) => ({
    service: {
      service_category_id: values.service_category_id,
      price: values.price,
      sale_price: values.sale_price,
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
