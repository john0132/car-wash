import { useForm } from "@inertiajs/react"
import { useState } from "react"

import {
  type ContentMetaValues,
  ContentTextSection,
  contentMetaParams,
  contentMetaValues,
} from "@/admin/components/content-meta-fields"
import {
  FormSection,
  SwitchField,
  TextField,
  asFieldErrors,
  slugify,
} from "@/admin/components/form-fields"
import { FormLayout } from "@/admin/components/form-layout"
import { LanguageSwitcher } from "@/admin/components/language-switcher"
import { NoLanguages } from "@/admin/components/no-languages"
import { SeoSection } from "@/admin/components/seo-section"
import type { ComponentOption } from "@/admin/features/components/types"
import { SectionList } from "@/admin/features/pages/components/section-list"
import type {
  PageDetail,
  PageTranslation,
  SectionProps,
  SectionState,
} from "@/admin/features/pages/types"
import { sectionState } from "@/admin/features/pages/utils"
import { useLanguageTabs } from "@/admin/hooks/use-language-tabs"
import { SUBMIT_OPTIONS, formErrors } from "@/admin/lib/forms"
import { emptyLanguageCodes } from "@/admin/lib/languages"
import { patchTranslation } from "@/admin/lib/translations"
import type { AdminLanguage } from "@/admin/types"
import type { RouteDefinition } from "@/routes/runtime"
import { FieldError } from "@/shared/components/ui/field"

interface PageFormData {
  slug: string
  is_active: boolean
  translations: Record<number, ContentMetaValues>
}

/**
 * Create/edit form for a page: its slug, per-language text and its ordered
 * sections. One language is edited at a time; everything is saved together as
 * `{ page: { …, translations: { <language_id>: {…} }, sections: [...] } }`.
 */
export function PageForm({
  page,
  translations,
  sections,
  components,
  languages,
  action,
  cancelHref,
  submitLabel,
}: {
  page: PageDetail
  translations: PageTranslation[]
  sections: SectionProps[]
  components: ComponentOption[]
  languages: AdminLanguage[]
  action: RouteDefinition<"post" | "patch">
  cancelHref: string
  submitLabel: string
}) {
  const [slugTouched, setSlugTouched] = useState(Boolean(page.slug))

  const form = useForm<PageFormData>({
    slug: page.slug,
    is_active: page.is_active,
    translations: Object.fromEntries(
      translations.map((t) => [t.language_id, contentMetaValues(t)]),
    ),
  })
  // Kept outside useForm: free-form JSON values are too deep for its form-data
  // types. form.transform below adds them to the submitted payload.
  const [sectionStates, setSectionStates] = useState<SectionState[]>(() =>
    sections.map(sectionState),
  )
  const { data, setData, processing } = form
  const errors = formErrors(form)
  const tabs = useLanguageTabs(languages, errors)
  const { language } = tabs

  form.transform((values) => ({
    page: {
      slug: values.slug,
      is_active: values.is_active,
      translations: Object.fromEntries(
        Object.entries(values.translations).map(([id, t]) => [
          id,
          contentMetaParams(t),
        ]),
      ),
      sections: sectionStates.map(
        ({ id, component_id, is_active, settings, content }) => ({
          id,
          component_id,
          is_active,
          settings,
          content,
        }),
      ),
    },
  }))

  if (!language) return <NoLanguages />

  const current = data.translations[language.id] ?? contentMetaValues({})
  const setTranslation = (patch: Partial<ContentMetaValues>) =>
    setData((previous) => ({
      ...patchTranslation(previous, language.id, patch, contentMetaValues({})),
      // The slug follows the default title until it's edited by hand.
      slug:
        !slugTouched && language.default && patch.title !== undefined
          ? slugify(patch.title)
          : previous.slug,
    }))

  return (
    <FormLayout
      // Keeps unsaved edits when validation fails; reloads fresh ids after a save.
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
      width="4xl"
    >
      <ContentTextSection
        key={`text-${language.code}`}
        language={language}
        values={current}
        onChange={setTranslation}
        errorFor={tabs.errorFor}
        baseError={tabs.baseError}
        nameDescription="Used in navigation and dashboard lists."
      />

      <section className="space-y-3" aria-labelledby="sections-heading">
        <div className="space-y-1">
          <h2 id="sections-heading" className="font-semibold">
            Sections · <span lang={language.code}>{language.name}</span>
          </h2>
          <p className="text-muted-foreground text-sm">
            The page is built from these components, top to bottom. Text is
            edited per language; fields marked with a globe are shared by every
            language.
          </p>
          <FieldError errors={asFieldErrors(errors.sections)} />
        </div>
        <SectionList
          sections={sectionStates}
          onChange={setSectionStates}
          components={components}
          language={language}
          multilingual={languages.length > 1}
          errors={errors}
        />
      </section>

      <FormSection title="Page" shared>
        <TextField
          id="slug"
          label="URL slug"
          description={`Lowercase letters, numbers and dashes, e.g. about-us.${slugTouched ? "" : " Follows the default language's title until you edit it."}`}
          value={data.slug}
          onChange={(slug) => {
            setSlugTouched(true)
            setData("slug", slug)
          }}
          errors={errors.slug}
          required
          className="sm:max-w-sm"
        />
        <SwitchField
          id="is_active"
          label="Published"
          description="Unpublished pages aren't shown on the website."
          checked={data.is_active}
          onChange={(checked) => setData("is_active", checked)}
        />
      </FormSection>

      <SeoSection
        key={`seo-${language.code}`}
        language={language}
        values={current}
        onChange={setTranslation}
        errorFor={tabs.errorFor}
      />
    </FormLayout>
  )
}
