import { useForm } from "@inertiajs/react"

import {
  FormSection,
  SlugField,
  SwitchField,
  TextField,
  TranslatedSection,
} from "@/admin/components/form-fields"
import { FormLayout } from "@/admin/components/form-layout"
import { LanguageSwitcher } from "@/admin/components/language-switcher"
import { NoLanguages } from "@/admin/components/no-languages"
import { SeoSection } from "@/admin/components/seo-section"
import { HomePageFields } from "@/admin/features/services/components/home-page-fields"
import type {
  ServiceCategoryDetail,
  ServiceCategoryTranslationEntry,
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

const FIELDS = ["name", "seo_title", "seo_description"] as const
type CategoryText = Record<(typeof FIELDS)[number], string>

interface ServiceCategoryFormData {
  slug: string
  is_active: boolean
  display_in_home_page: boolean
  image: ImageValue | null
  translations: Record<number, CategoryText>
}

/**
 * Create/edit form for a service category, one language at a time. Posts
 * `{ service_category: { slug, is_active, display_in_home_page, image, translations } }`.
 */
export function ServiceCategoryForm({
  category,
  translations,
  languages,
  action,
  cancelHref,
  submitLabel,
}: {
  /** The category being edited; null when creating one. */
  category: ServiceCategoryDetail | null
  translations: ServiceCategoryTranslationEntry[]
  languages: AdminLanguage[]
  action: RouteDefinition<"post" | "patch">
  cancelHref: string
  submitLabel: string
}) {
  const form = useForm<ServiceCategoryFormData>({
    slug: category?.slug ?? "",
    is_active: category?.is_active ?? true,
    display_in_home_page: category?.display_in_home_page ?? false,
    image: category?.image ?? null,
    translations: translationValues(translations, FIELDS),
  })
  const { data, setData, processing } = form
  const errors = formErrors(form)
  const tabs = useLanguageTabs(languages, errors)
  const { language } = tabs

  form.transform((values) => ({
    service_category: { ...values, image: values.image?.signed_id ?? "" },
  }))

  if (!language) return <NoLanguages />

  const current = data.translations[language.id] ?? blankValues(FIELDS)
  const setTranslation = (patch: Partial<CategoryText>) =>
    setData((previous) =>
      patchTranslation(previous, language.id, patch, blankValues(FIELDS)),
    )

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
        title="Name"
        language={language}
        baseError={tabs.baseError}
      >
        <TextField
          id={`name_${language.code}`}
          label="Name"
          value={current.name}
          onChange={(name) => setTranslation({ name })}
          errors={tabs.errorFor("name")}
          required={language.default}
          dir={textDirection(language.code)}
          lang={language.code}
        />
      </TranslatedSection>

      <FormSection title="Details" shared>
        <SlugField
          value={data.slug}
          onChange={(slug) => setData("slug", slug)}
          path="/categories/"
          placeholder="exterior"
          errors={errors.slug}
        />
        <SwitchField
          id="is_active"
          label="Active"
          description="Turn off to hide the category and its services from customers without deleting them."
          checked={data.is_active}
          onChange={(checked) => setData("is_active", checked)}
        />
      </FormSection>

      <FormSection title="Homepage" shared>
        <HomePageFields
          noun="category"
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
        description="Shown in search results and link previews for the category's page."
      />
    </FormLayout>
  )
}
