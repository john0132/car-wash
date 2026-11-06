import { useForm } from "@inertiajs/react"

import {
  FormSection,
  TextField,
  TextareaField,
  TranslatedSection,
} from "@/admin/components/form-fields"
import { FormLayout } from "@/admin/components/form-layout"
import { ImageUploadField } from "@/admin/components/image-upload-field"
import { LanguageSwitcher } from "@/admin/components/language-switcher"
import { NoLanguages } from "@/admin/components/no-languages"
import { FooterColumnsEditor } from "@/admin/features/footer/components/footer-columns-editor"
import { SocialLinksEditor } from "@/admin/features/footer/components/social-links-editor"
import type {
  ColumnProps,
  ColumnState,
  FooterTranslations,
  SocialLinkProps,
  SocialLinkState,
} from "@/admin/features/footer/types"
import type { LinkOptions } from "@/admin/features/navigation/types"
import {
  linkPayload,
  toLinkState,
  withoutUid,
} from "@/admin/features/navigation/utils"
import { useLanguageTabs } from "@/admin/hooks/use-language-tabs"
import { SUBMIT_OPTIONS, formErrors } from "@/admin/lib/forms"
import { textDirection } from "@/admin/lib/languages"
import { patchTranslation } from "@/admin/lib/translations"
import type { AdminLanguage, ImageValue } from "@/admin/types"
import { adminDashboard, adminFooters } from "@/routes"

interface FooterFormData {
  translations: FooterTranslations
  image: ImageValue | null
  social_links: SocialLinkState[]
  columns: ColumnState[]
}

const BLANK_CONTENT = { title: "", description: "" }

const toColumnState = (column: ColumnProps): ColumnState => ({
  ...column,
  uid: `column-${column.id}`,
  items: column.items.map(toLinkState),
})

/**
 * The website footer, saved in one request:
 * `{ footer: { translations, image, social_links, columns: [{ …, items }] } }`.
 * List order is display order. Title, description and column titles are
 * per-language; images, URLs and visibility are shared by every language.
 */
export function FooterForm({
  footer,
  translations,
  socialLinks,
  columns,
  options,
  languages,
  canUpdate,
}: {
  footer: { image: ImageValue | null }
  translations: FooterTranslations
  socialLinks: SocialLinkProps[]
  columns: ColumnProps[]
  options: LinkOptions
  languages: AdminLanguage[]
  canUpdate: boolean
}) {
  const form = useForm<FooterFormData>({
    translations,
    image: footer.image,
    social_links: socialLinks.map((link) => ({
      ...link,
      uid: `social-${link.id}`,
    })),
    columns: columns.map(toColumnState),
  })
  const { data, setData, processing } = form
  const errors = formErrors(form)
  const tabs = useLanguageTabs(languages, errors)
  const { language } = tabs

  form.transform((values) => ({
    footer: {
      translations: values.translations,
      image: values.image?.signed_id ?? null,
      social_links: values.social_links.map((link) => ({
        ...withoutUid(link),
        icon: link.icon?.signed_id ?? null,
      })),
      columns: values.columns.map((column) => ({
        ...withoutUid(column),
        items: column.items.map(linkPayload),
      })),
    },
  }))

  if (!language) return <NoLanguages />

  const content = data.translations[language.id] ?? BLANK_CONTENT
  const setContent = (patch: Partial<typeof content>) =>
    setData((previous) =>
      patchTranslation(previous, language.id, patch, BLANK_CONTENT),
    )
  const text = { dir: textDirection(language.code), lang: language.code }

  return (
    <FormLayout
      onSubmit={() => form.submit(adminFooters.update(), SUBMIT_OPTIONS)}
      tabs={
        <LanguageSwitcher
          languages={languages}
          value={language.code}
          onChange={tabs.setCode}
          errorCodes={tabs.errorCodes}
        />
      }
      cancelHref={adminDashboard.index().url}
      submitLabel="Save changes"
      processing={processing}
      canSubmit={canUpdate}
    >
      <TranslatedSection title="Content" language={language} description={null}>
        <TextField
          id={`footer_title_${language.code}`}
          label="Title"
          value={content.title}
          onChange={(title) => setContent({ title })}
          errors={tabs.errorFor("title")}
          {...text}
        />
        <TextareaField
          id={`footer_description_${language.code}`}
          label="Description"
          rows={3}
          value={content.description}
          onChange={(description) => setContent({ description })}
          errors={tabs.errorFor("description")}
          {...text}
        />
      </TranslatedSection>

      <FormSection title="Image" shared>
        <ImageUploadField
          id="footer_image"
          value={data.image}
          onChange={(image) => setData("image", image)}
        />
      </FormSection>

      <FormSection
        title="Social links"
        description="Icons shown in the footer. The name is read aloud by screen readers."
        shared
      >
        <SocialLinksEditor
          links={data.social_links}
          onChange={(links) => setData("social_links", links)}
          errors={errors}
        />
      </FormSection>

      <FormSection
        title="Columns"
        description={
          <>
            Each column has a title and its own list of links. Titles and link
            labels are edited in{" "}
            <span lang={language.code}>{language.name}</span>; everything else
            is shared by every language.
          </>
        }
      >
        <FooterColumnsEditor
          columns={data.columns}
          onChange={(next) => setData("columns", next)}
          language={language}
          options={options}
          errors={errors}
        />
      </FormSection>
    </FormLayout>
  )
}
