import {
  FormSection,
  TextField,
  TextareaField,
} from "@/admin/components/form-fields"
import { ImageUploadField } from "@/admin/components/image-upload-field"
import { textDirection } from "@/admin/lib/languages"
import type { AdminLanguage, ImageValue } from "@/admin/types"
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/shared/components/ui/field"

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
 * Name/title/subtitle and SEO inputs for one language. `errorFor(attribute)`
 * returns that language's errors.
 */
export function ContentMetaFields({
  language,
  values,
  onChange,
  errorFor,
  nameDescription,
}: {
  language: AdminLanguage
  values: ContentMetaValues
  onChange: (patch: Partial<ContentMetaValues>) => void
  errorFor: (attribute: string) => string[] | undefined
  nameDescription: string
}) {
  const id = (attribute: string) => `${attribute}_${language.code}`
  const text = { dir: textDirection(language.code), lang: language.code }
  const optional = !language.default

  return (
    <>
      <FormSection
        title={`Text · ${language.name}`}
        description={
          optional
            ? "Optional. Leave every field empty to remove this language; the website then falls back to the default language."
            : "Required in the default language."
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id={id("name")}
            label="Name"
            description={nameDescription}
            value={values.name}
            onChange={(name) => onChange({ name })}
            errors={errorFor("name")}
            required={!optional}
            {...text}
          />
          <TextField
            id={id("title")}
            label="Title"
            value={values.title}
            onChange={(title) => onChange({ title })}
            errors={errorFor("title")}
            required={!optional}
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
      </FormSection>

      <FormSection
        title={`Search & sharing · ${language.name}`}
        description="How this appears in search results and link previews. The title is used when the SEO title is empty."
      >
        <TextField
          id={id("seo_title")}
          label="SEO title"
          value={values.seo_title}
          onChange={(seo_title) => onChange({ seo_title })}
          errors={errorFor("seo_title")}
          maxLength={70}
          {...text}
        />
        <TextareaField
          id={id("seo_description")}
          label="SEO description"
          rows={3}
          value={values.seo_description}
          onChange={(seo_description) => onChange({ seo_description })}
          errors={errorFor("seo_description")}
          maxLength={170}
          {...text}
        />
        <Field>
          <FieldLabel htmlFor={id("seo_image")}>Share image</FieldLabel>
          <ImageUploadField
            id={id("seo_image")}
            value={values.seo_image}
            onChange={(seo_image) => onChange({ seo_image })}
          />
          <FieldDescription>
            Shown when the link is shared. 1200 × 630 works best.
          </FieldDescription>
        </Field>
      </FormSection>
    </>
  )
}
