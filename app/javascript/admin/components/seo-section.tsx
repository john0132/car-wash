import {
  TextField,
  TextareaField,
  TranslatedSection,
} from "@/admin/components/form-fields"
import { ImageUploadField } from "@/admin/components/image-upload-field"
import { textDirection } from "@/admin/lib/languages"
import type { AdminLanguage, ImageValue } from "@/admin/types"
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/shared/components/ui/field"

const TITLE_LIMIT = 70
const DESCRIPTION_LIMIT = 170

export interface SeoValues {
  seo_title: string
  seo_description: string
  /** Only for records with a share image (pages, blog posts). */
  seo_image?: ImageValue | null
}

/**
 * One language's search-result and link-preview text. Pass `seo_image` in
 * `values` (even null) to show the share image input.
 */
export function SeoSection({
  language,
  values,
  onChange,
  errorFor,
  description = "How this appears in search results and link previews. The title is used when the SEO title is empty.",
}: {
  language: AdminLanguage
  values: SeoValues
  onChange: (patch: Partial<SeoValues>) => void
  errorFor: (attribute: string) => string[] | undefined
  description?: string
}) {
  const id = (attribute: string) => `${attribute}_${language.code}`
  const text = { dir: textDirection(language.code), lang: language.code }

  return (
    <TranslatedSection
      title="Search & sharing"
      language={language}
      description={description}
    >
      <TextField
        id={id("seo_title")}
        label="SEO title"
        value={values.seo_title}
        onChange={(seo_title) => onChange({ seo_title })}
        errors={errorFor("seo_title")}
        maxLength={TITLE_LIMIT}
        description={`${values.seo_title.length}/${TITLE_LIMIT} characters`}
        {...text}
      />
      <TextareaField
        id={id("seo_description")}
        label="SEO description"
        rows={3}
        value={values.seo_description}
        onChange={(seo_description) => onChange({ seo_description })}
        errors={errorFor("seo_description")}
        maxLength={DESCRIPTION_LIMIT}
        description={`${values.seo_description.length}/${DESCRIPTION_LIMIT} characters. Search engines usually show about 155.`}
        {...text}
      />
      {values.seo_image !== undefined && (
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
      )}
    </TranslatedSection>
  )
}
