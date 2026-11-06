import { useForm } from "@inertiajs/react"

import {
  FormSection,
  SelectField,
  SlugField,
  SwitchField,
  TextField,
  TextareaField,
  TranslatedSection,
} from "@/admin/components/form-fields"
import { FormLayout } from "@/admin/components/form-layout"
import { LanguageSwitcher } from "@/admin/components/language-switcher"
import { NoLanguages } from "@/admin/components/no-languages"
import { SeoSection } from "@/admin/components/seo-section"
import { HomePageFields } from "@/admin/features/services/components/home-page-fields"
import type {
  ServiceCategoryOption,
  ServiceDetail,
  ServiceTranslationEntry,
} from "@/admin/features/services/types"
import { useLanguageTabs } from "@/admin/hooks/use-language-tabs"
import { SUBMIT_OPTIONS, formErrors } from "@/admin/lib/forms"
import { emptyLanguageCodes, textDirection } from "@/admin/lib/languages"
import {
  blankValues,
  patchTranslation,
  translationValues,
} from "@/admin/lib/translations"
import type { AdminLanguage, ImageValue } from "@/admin/types"
import type { RouteDefinition } from "@/routes/runtime"

const FIELDS = [
  "name",
  "title",
  "description",
  "seo_title",
  "seo_description",
] as const
type ServiceText = Record<(typeof FIELDS)[number], string>

interface ServiceFormData {
  service_category_id: number | null
  slug: string
  price: string
  sale_price: string
  duration_minutes: string
  is_active: boolean
  display_in_home_page: boolean
  image: ImageValue | null
  translations: Record<number, ServiceText>
}

/**
 * Create/edit form for a service, one language at a time. Posts
 * `{ service: { …, translations: { <language_id>: {…} } } }`; a blank sale
 * price clears it.
 */
export function ServiceForm({
  service,
  serviceCategoryId,
  translations,
  languages,
  categories,
  action,
  cancelHref,
  submitLabel,
}: {
  service: ServiceDetail | null
  /** Preselected category for a new service. */
  serviceCategoryId: number | null
  translations: ServiceTranslationEntry[]
  languages: AdminLanguage[]
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
    translations: translationValues(translations, FIELDS),
  })
  const { data, setData, processing } = form
  // Rails also reports `service_category` (the belongs_to), which isn't a form field.
  const errors = formErrors(form)
  const tabs = useLanguageTabs(languages, errors)
  const { language } = tabs

  form.transform((values) => ({
    service: { ...values, image: values.image?.signed_id ?? "" },
  }))

  if (!language) return <NoLanguages />

  const current = data.translations[language.id] ?? blankValues(FIELDS)
  const setTranslation = (patch: Partial<ServiceText>) =>
    setData((previous) =>
      patchTranslation(previous, language.id, patch, blankValues(FIELDS)),
    )
  const text = { dir: textDirection(language.code), lang: language.code }
  const id = (attribute: string) => `${attribute}_${language.code}`

  return (
    <FormLayout
      onSubmit={() => form.submit(action, SUBMIT_OPTIONS)}
      tabs={
        <LanguageSwitcher
          languages={languages}
          value={language.code}
          onChange={tabs.setCode}
          errorCodes={tabs.errorCodes}
          emptyCodes={emptyLanguageCodes(data.translations, languages)}
        />
      }
      cancelHref={cancelHref}
      submitLabel={submitLabel}
      processing={processing}
    >
      <TranslatedSection
        title="Text"
        language={language}
        baseError={tabs.baseError}
      >
        <TextField
          id={id("name")}
          label="Name"
          value={current.name}
          onChange={(name) => setTranslation({ name })}
          errors={tabs.errorFor("name")}
          required={language.default}
          {...text}
        />
        <TextField
          id={id("title")}
          label="Title"
          description="The headline on the service's page."
          value={current.title}
          onChange={(title) => setTranslation({ title })}
          errors={tabs.errorFor("title")}
          maxLength={255}
          {...text}
        />
        <TextareaField
          id={id("description")}
          label="Description"
          description="Shown to customers on the service's page."
          rows={5}
          value={current.description}
          onChange={(description) => setTranslation({ description })}
          errors={tabs.errorFor("description")}
          {...text}
        />
      </TranslatedSection>

      <FormSection title="Details" shared>
        <SelectField
          id="service_category_id"
          label="Category"
          value={
            data.service_category_id ? String(data.service_category_id) : ""
          }
          onChange={(value) => setData("service_category_id", Number(value))}
          placeholder="Choose a category"
          options={categories.map((category) => ({
            value: String(category.id),
            label: category.is_active
              ? category.name
              : `${category.name} (disabled)`,
          }))}
          errors={errors.service_category ?? errors.service_category_id}
          description={
            categories.length === 0
              ? "No categories yet. Create a service category first."
              : undefined
          }
          required
          className="sm:max-w-sm"
        />

        <SlugField
          value={data.slug}
          onChange={(slug) => setData("slug", slug)}
          path="/services/"
          placeholder="exterior-wash"
          errors={errors.slug}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="price"
            label="Price (EGP)"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={data.price}
            onChange={(value) => setData("price", value)}
            errors={errors.price}
            required
          />
          <TextField
            id="sale_price"
            label="Sale price (EGP)"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={data.sale_price}
            onChange={(value) => setData("sale_price", value)}
            errors={errors.sale_price}
            description="Must be below the price. Leave blank when not on sale."
          />
        </div>

        <TextField
          id="duration_minutes"
          label="Duration (minutes)"
          type="number"
          inputMode="numeric"
          min="1"
          max="1440"
          step="1"
          value={data.duration_minutes}
          onChange={(value) => setData("duration_minutes", value)}
          errors={errors.duration_minutes}
          description="How long the service takes. Shown to customers on its page."
          className="sm:max-w-40"
        />

        <SwitchField
          id="is_active"
          label="Active"
          description="Turn off to stop customers from booking it without deleting it."
          checked={data.is_active}
          onChange={(checked) => setData("is_active", checked)}
        />
      </FormSection>

      <FormSection title="Homepage" shared>
        <HomePageFields
          noun="service"
          image={data.image}
          onImageChange={(image) => setData("image", image)}
          display={data.display_in_home_page}
          onDisplayChange={(value) => setData("display_in_home_page", value)}
          errors={errors}
        />
      </FormSection>

      <SeoSection
        language={language}
        values={current}
        onChange={setTranslation}
        errorFor={tabs.errorFor}
        description="Shown in search results and link previews for the service's page."
      />
    </FormLayout>
  )
}
