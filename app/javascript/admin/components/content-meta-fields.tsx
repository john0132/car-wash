import { TextField, TranslatedSection } from "@/admin/components/form-fields"
import { textDirection } from "@/admin/lib/languages"
import type { AdminLanguage, ImageValue } from "@/admin/types"

/** Per-language text every page and blog post has (see Admin::ContentTranslations). */
export interface ContentMetaValues {
  name: string
  title: string
  subtitle: string
  seo_title: string
  seo_description: string
  seo_image: ImageValue | null
}

export const contentMetaValues = (
  translation: Partial<ContentMetaValues>,
): ContentMetaValues => ({
  name: translation.name ?? "",
  title: translation.title ?? "",
  subtitle: translation.subtitle ?? "",
  seo_title: translation.seo_title ?? "",
  seo_description: translation.seo_description ?? "",
  seo_image: translation.seo_image ?? null,
})

/** Submitted shape: images become their signed id ("" removes). */
export const contentMetaParams = <T extends ContentMetaValues>(values: T) => ({
  ...values,
  seo_image: values.seo_image?.signed_id ?? "",
})

/**
 * Name/title/subtitle for one language, the first section of page and blog
 * forms (render SeoSection with the same values last). `errorFor(attribute)`
 * returns that language's errors; `baseError` is the default-language rule.
 */
export function ContentTextSection({
  language,
  values,
  onChange,
  errorFor,
  baseError,
  nameDescription,
}: {
  language: AdminLanguage
  values: ContentMetaValues
  onChange: (patch: Partial<ContentMetaValues>) => void
  errorFor: (attribute: string) => string[] | undefined
  baseError?: string[]
  nameDescription: string
}) {
  const id = (attribute: string) => `${attribute}_${language.code}`
  const text = { dir: textDirection(language.code), lang: language.code }
  const required = language.default

  return (
    <TranslatedSection title="Text" language={language} baseError={baseError}>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id={id("name")}
          label="Name"
          description={nameDescription}
          value={values.name}
          onChange={(name) => onChange({ name })}
          errors={errorFor("name")}
          required={required}
          {...text}
        />
        <TextField
          id={id("title")}
          label="Title"
          value={values.title}
          onChange={(title) => onChange({ title })}
          errors={errorFor("title")}
          required={required}
          {...text}
        />
      </div>
      <TextField
        id={id("subtitle")}
        label="Subtitle"
        value={values.subtitle}
        onChange={(subtitle) => onChange({ subtitle })}
        errors={errorFor("subtitle")}
        {...text}
      />
    </TranslatedSection>
  )
}
