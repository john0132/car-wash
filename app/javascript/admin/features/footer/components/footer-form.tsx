import { Link, useForm } from "@inertiajs/react"
import { cn } from "cn"
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react"
import { useState } from "react"

import {
  FormSection,
  TextField,
  TextareaField,
  asFieldErrors,
} from "@/admin/components/form-fields"
import { ImageUploadField } from "@/admin/components/image-upload-field"
import { LanguageSwitcher } from "@/admin/components/language-switcher"
import type {
  ColumnProps,
  ColumnState,
  FooterTranslations,
  SocialLinkProps,
  SocialLinkState,
} from "@/admin/features/footer/types"
import { LinkList } from "@/admin/features/navigation/components/link-list"
import type { LinkOptions } from "@/admin/features/navigation/types"
import {
  linkPayload,
  moveItem,
  navigationErrorLanguageCodes,
  newUid,
  toLinkState,
  withoutUid,
} from "@/admin/features/navigation/utils"
import { textDirection } from "@/admin/lib/languages"
import type { AdminLanguage, ImageValue } from "@/admin/types"
import { adminDashboard, adminFooters } from "@/routes"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { FieldError } from "@/shared/components/ui/field"
import { Spinner } from "@/shared/components/ui/spinner"
import { Switch } from "@/shared/components/ui/switch"

interface FooterFormData {
  translations: FooterTranslations
  image: ImageValue | null
  social_links: SocialLinkState[]
  columns: ColumnState[]
}

const toColumnState = (column: ColumnProps): ColumnState => ({
  ...column,
  uid: `column-${column.id}`,
  items: column.items.map(toLinkState),
})

const IconButton = ({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) => (
  <Button
    type="button"
    variant="ghost"
    size="icon"
    className="size-8"
    aria-label={label}
    disabled={disabled}
    onClick={onClick}
  >
    {children}
  </Button>
)

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
  const defaultLanguage = languages.find((l) => l.default) ?? languages[0]
  const [code, setCode] = useState(defaultLanguage?.code ?? "")
  const language = languages.find((l) => l.code === code) ?? defaultLanguage

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
  const errors = form.errors as Record<string, string[] | undefined>

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

  if (!language) {
    return (
      <p className="text-muted-foreground text-sm">
        No languages are set up yet. Add a Language record first.
      </p>
    )
  }

  const dir = textDirection(language.code)
  const content = data.translations[language.id] ?? {
    title: "",
    description: "",
  }
  const setContent = (patch: Partial<typeof content>) =>
    setData("translations", {
      ...data.translations,
      [language.id]: { ...content, ...patch },
    })

  const updateSocial = (uid: string, patch: Partial<SocialLinkState>) =>
    setData(
      "social_links",
      data.social_links.map((l) => (l.uid === uid ? { ...l, ...patch } : l)),
    )
  const updateColumn = (uid: string, patch: Partial<ColumnState>) =>
    setData(
      "columns",
      data.columns.map((c) => (c.uid === uid ? { ...c, ...patch } : c)),
    )

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        form.submit(adminFooters.update(), {
          preserveScroll: true,
          preserveState: "errors",
        })
      }}
      className="max-w-3xl space-y-6"
    >
      <div className="bg-background/95 supports-backdrop-filter:bg-background/80 sticky top-0 z-10 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 backdrop-blur">
        <LanguageSwitcher
          languages={languages}
          value={language.code}
          onChange={setCode}
          errorCodes={navigationErrorLanguageCodes(errors, languages)}
        />
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href={adminDashboard.index()}>Cancel</Link>
          </Button>
          {canUpdate && (
            <Button type="submit" disabled={processing}>
              {processing && <Spinner />}
              Save changes
            </Button>
          )}
        </div>
      </div>

      <FormSection title={`Content · ${language.name}`}>
        <TextField
          id={`footer_title_${language.code}`}
          label="Title"
          value={content.title}
          onChange={(title) => setContent({ title })}
          errors={errors[`translations.${language.id}.title`]}
          dir={dir}
          lang={language.code}
        />
        <TextareaField
          id={`footer_description_${language.code}`}
          label="Description"
          rows={3}
          value={content.description}
          onChange={(description) => setContent({ description })}
          errors={errors[`translations.${language.id}.description`]}
          dir={dir}
          lang={language.code}
        />
        <div className="space-y-2">
          <p className="text-sm font-medium">Image</p>
          <ImageUploadField
            id="footer_image"
            value={data.image}
            onChange={(image) => setData("image", image)}
          />
          <p className="text-muted-foreground text-sm">
            The same in every language.
          </p>
        </div>
      </FormSection>

      <FormSection
        title="Social links"
        description="Icons shown in the footer. The name is read aloud by screen readers."
      >
        <div className="space-y-3">
          {data.social_links.map((link, index) => {
            const error = (attribute: string) =>
              errors[`social_links.${index}.${attribute}`]
            return (
              <Card
                key={link.uid}
                className={cn("gap-0 py-0", !link.is_active && "opacity-70")}
              >
                <CardContent className="space-y-3 p-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <TextField
                      id={`social-name-${link.uid}`}
                      label="Name"
                      value={link.name}
                      onChange={(name) => updateSocial(link.uid, { name })}
                      errors={error("name")}
                      placeholder="Instagram"
                      required
                    />
                    <TextField
                      id={`social-url-${link.uid}`}
                      label="URL"
                      value={link.url}
                      onChange={(url) => updateSocial(link.uid, { url })}
                      errors={error("url")}
                      placeholder="https://instagram.com/…"
                      inputMode="url"
                      required
                    />
                  </div>
                  <ImageUploadField
                    id={`social-icon-${link.uid}`}
                    value={link.icon}
                    onChange={(icon) => updateSocial(link.uid, { icon })}
                  />
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm">
                      <Switch
                        checked={link.is_active}
                        onCheckedChange={(is_active) =>
                          updateSocial(link.uid, { is_active })
                        }
                      />
                      Visible
                    </label>
                    <div className="ml-auto flex items-center gap-1">
                      <IconButton
                        label="Move social link up"
                        disabled={index === 0}
                        onClick={() =>
                          setData(
                            "social_links",
                            moveItem(data.social_links, index, -1),
                          )
                        }
                      >
                        <ArrowUp />
                      </IconButton>
                      <IconButton
                        label="Move social link down"
                        disabled={index === data.social_links.length - 1}
                        onClick={() =>
                          setData(
                            "social_links",
                            moveItem(data.social_links, index, 1),
                          )
                        }
                      >
                        <ArrowDown />
                      </IconButton>
                      <IconButton
                        label="Remove social link"
                        onClick={() =>
                          setData(
                            "social_links",
                            data.social_links.filter((l) => l.uid !== link.uid),
                          )
                        }
                      >
                        <Trash2 />
                      </IconButton>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setData("social_links", [
                ...data.social_links,
                {
                  uid: newUid(),
                  id: null,
                  name: "",
                  url: "",
                  is_active: true,
                  icon: null,
                },
              ])
            }
          >
            <Plus /> Add social link
          </Button>
          <FieldError errors={asFieldErrors(errors.social_links)} />
        </div>
      </FormSection>

      <FormSection
        title="Columns"
        description="Each column has a title and its own list of links."
      >
        <div className="space-y-4">
          {data.columns.map((column, index) => {
            const error = (attribute: string) =>
              errors[`columns.${index}.${attribute}`]
            const titleErrors = [
              ...(error(`translations.${language.id}.title`) ?? []),
              ...(language.default ? (error("translations") ?? []) : []),
            ]

            return (
              <Card
                key={column.uid}
                className={cn("gap-0 py-0", !column.is_active && "opacity-70")}
              >
                <CardContent className="space-y-4 p-4">
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <TextField
                        id={`column-title-${column.uid}`}
                        label={`Column ${index + 1} title`}
                        value={column.translations[language.id]?.title ?? ""}
                        onChange={(title) =>
                          updateColumn(column.uid, {
                            translations: {
                              ...column.translations,
                              [language.id]: { title },
                            },
                          })
                        }
                        errors={titleErrors.length ? titleErrors : undefined}
                        required={language.default}
                        dir={dir}
                        lang={language.code}
                      />
                    </div>
                    <label className="flex items-center gap-2 pb-2 text-sm">
                      <Switch
                        checked={column.is_active}
                        onCheckedChange={(is_active) =>
                          updateColumn(column.uid, { is_active })
                        }
                      />
                      Visible
                    </label>
                    <div className="flex items-center gap-1 pb-1">
                      <IconButton
                        label="Move column up"
                        disabled={index === 0}
                        onClick={() =>
                          setData("columns", moveItem(data.columns, index, -1))
                        }
                      >
                        <ArrowUp />
                      </IconButton>
                      <IconButton
                        label="Move column down"
                        disabled={index === data.columns.length - 1}
                        onClick={() =>
                          setData("columns", moveItem(data.columns, index, 1))
                        }
                      >
                        <ArrowDown />
                      </IconButton>
                      <IconButton
                        label="Remove column"
                        onClick={() =>
                          setData(
                            "columns",
                            data.columns.filter((c) => c.uid !== column.uid),
                          )
                        }
                      >
                        <Trash2 />
                      </IconButton>
                    </div>
                  </div>

                  <LinkList
                    links={column.items}
                    onChange={(items) => updateColumn(column.uid, { items })}
                    language={language}
                    options={options}
                    errors={errors}
                    errorPrefix={`columns.${index}.items`}
                    idPrefix={column.uid}
                    emptyMessage="No links in this column yet."
                  />
                </CardContent>
              </Card>
            )
          })}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setData("columns", [
                ...data.columns,
                {
                  uid: newUid(),
                  id: null,
                  is_active: true,
                  translations: {},
                  items: [],
                },
              ])
            }
          >
            <Plus /> Add column
          </Button>
          <FieldError errors={asFieldErrors(errors.columns)} />
        </div>
      </FormSection>
    </form>
  )
}
