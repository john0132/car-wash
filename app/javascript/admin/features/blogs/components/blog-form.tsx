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
  TranslatedSection,
  asFieldErrors,
  slugify,
} from "@/admin/components/form-fields"
import { FormLayout } from "@/admin/components/form-layout"
import { ImageUploadField } from "@/admin/components/image-upload-field"
import { LanguageSwitcher } from "@/admin/components/language-switcher"
import { NoLanguages } from "@/admin/components/no-languages"
import { RichTextEditor } from "@/admin/components/rich-text-editor"
import { SeoSection } from "@/admin/components/seo-section"
import type { BlogDetail, BlogTranslation } from "@/admin/features/blogs/types"
import { useLanguageTabs } from "@/admin/hooks/use-language-tabs"
import { SUBMIT_OPTIONS, formErrors } from "@/admin/lib/forms"
import { emptyLanguageCodes, textDirection } from "@/admin/lib/languages"
import { languagesOf, patchTranslation } from "@/admin/lib/translations"
import type { ImageValue } from "@/admin/types"
import type { RouteDefinition } from "@/routes/runtime"
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field"

type BlogTranslationValues = ContentMetaValues & { body: string }

interface BlogFormData {
  slug: string
  is_active: boolean
  cover_image: ImageValue | null
  translations: Record<number, BlogTranslationValues>
}

const translationValues = (
  t: Partial<BlogTranslation>,
): BlogTranslationValues => ({ ...contentMetaValues(t), body: t.body ?? "" })

/**
 * Create/edit form for a blog post, one language at a time. Posts
 * `{ blog: { slug, is_active, cover_image, translations: { <language_id>: {…} } } }`.
 */
export function BlogForm({
  blog,
  translations,
  action,
  cancelHref,
  submitLabel,
}: {
  blog: BlogDetail
  translations: BlogTranslation[]
  action: RouteDefinition<"post" | "patch">
  cancelHref: string
  submitLabel: string
}) {
  const languages = languagesOf(translations)
  const [slugTouched, setSlugTouched] = useState(Boolean(blog.slug))

  const form = useForm<BlogFormData>({
    slug: blog.slug,
    is_active: blog.is_active,
    cover_image: blog.cover_image,
    translations: Object.fromEntries(
      translations.map((t) => [t.language_id, translationValues(t)]),
    ),
  })
  const { data, setData, processing } = form
  const errors = formErrors(form)
  const tabs = useLanguageTabs(languages, errors)
  const { language } = tabs

  form.transform((values) => ({
    blog: {
      slug: values.slug,
      is_active: values.is_active,
      cover_image: values.cover_image?.signed_id ?? "",
      translations: Object.fromEntries(
        Object.entries(values.translations).map(([id, t]) => [
          id,
          contentMetaParams(t),
        ]),
      ),
    },
  }))

  if (!language) return <NoLanguages />

  const current = data.translations[language.id] ?? translationValues({})
  const setTranslation = (patch: Partial<BlogTranslationValues>) =>
    setData((previous) => ({
      ...patchTranslation(previous, language.id, patch, translationValues({})),
      // The slug follows the default title until it's edited by hand.
      slug:
        !slugTouched && language.default && patch.title !== undefined
          ? slugify(patch.title)
          : previous.slug,
    }))

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
      width="4xl"
    >
      <ContentTextSection
        key={`text-${language.code}`}
        language={language}
        values={current}
        onChange={setTranslation}
        errorFor={tabs.errorFor}
        baseError={tabs.baseError}
        nameDescription="A short label for dashboard lists."
      />

      <TranslatedSection title="Body" language={language} description={null}>
        <Field data-invalid={tabs.errorFor("body") ? true : undefined}>
          <FieldLabel htmlFor={`body_${language.code}`} className="sr-only">
            Body
          </FieldLabel>
          <RichTextEditor
            key={`body-${language.code}`}
            id={`body_${language.code}`}
            value={current.body}
            onChange={(body) => setTranslation({ body })}
            dir={textDirection(language.code)}
            lang={language.code}
            invalid={Boolean(tabs.errorFor("body"))}
          />
          <FieldError errors={asFieldErrors(tabs.errorFor("body"))} />
        </Field>
      </TranslatedSection>

      <FormSection title="Post" shared>
        <TextField
          id="slug"
          label="URL slug"
          description={`Lowercase letters, numbers and dashes.${slugTouched ? "" : " Follows the default language's title until you edit it."}`}
          value={data.slug}
          onChange={(slug) => {
            setSlugTouched(true)
            setData("slug", slug)
          }}
          errors={errors.slug}
          required
          className="sm:max-w-sm"
        />
        <Field data-invalid={errors.cover_image ? true : undefined}>
          <FieldLabel htmlFor="cover_image">Cover image</FieldLabel>
          <ImageUploadField
            id="cover_image"
            value={data.cover_image}
            onChange={(image) => setData("cover_image", image)}
            invalid={Boolean(errors.cover_image)}
          />
          <FieldError errors={asFieldErrors(errors.cover_image)} />
        </Field>
        <SwitchField
          id="is_active"
          label="Published"
          description="Unpublished posts aren't shown on the website."
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
