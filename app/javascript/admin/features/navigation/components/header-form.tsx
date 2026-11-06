import { useForm } from "@inertiajs/react"

import { FormSection, asFieldErrors } from "@/admin/components/form-fields"
import { FormLayout } from "@/admin/components/form-layout"
import { LanguageSwitcher } from "@/admin/components/language-switcher"
import { NoLanguages } from "@/admin/components/no-languages"
import { LinkList } from "@/admin/features/navigation/components/link-list"
import type {
  LinkOptions,
  LinkProps,
  LinkState,
} from "@/admin/features/navigation/types"
import { linkPayload, toLinkState } from "@/admin/features/navigation/utils"
import { useLanguageTabs } from "@/admin/hooks/use-language-tabs"
import { SUBMIT_OPTIONS, formErrors } from "@/admin/lib/forms"
import type { AdminLanguage } from "@/admin/types"
import { adminDashboard, adminHeaderItems } from "@/routes"
import { FieldError } from "@/shared/components/ui/field"

interface HeaderFormData {
  items: LinkState[]
}

/**
 * The website header's links, edited as an ordered tree. Posts
 * `{ header: { items: [{ id, link_type, …, translations }] } }`; the list order
 * is the display order.
 */
export function HeaderForm({
  items,
  options,
  languages,
  canUpdate,
}: {
  items: LinkProps[]
  options: LinkOptions
  languages: AdminLanguage[]
  canUpdate: boolean
}) {
  const form = useForm<HeaderFormData>({ items: items.map(toLinkState) })
  const { data, setData, processing } = form
  const errors = formErrors(form)
  const tabs = useLanguageTabs(languages, errors)
  const { language } = tabs

  form.transform((values) => ({
    header: { items: values.items.map(linkPayload) },
  }))

  if (!language) return <NoLanguages />

  return (
    <FormLayout
      onSubmit={() => form.submit(adminHeaderItems.update(), SUBMIT_OPTIONS)}
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
      <FormSection
        title="Header links"
        description={
          <>
            Shown in the website header, in this order. Labels are edited in{" "}
            <span lang={language.code}>{language.name}</span>; link targets and
            visibility are shared by every language. Add child links to make a
            dropdown; they can nest as deep as you like. Links to disabled
            pages, categories or services are hidden automatically.
          </>
        }
      >
        <LinkList
          links={data.items}
          onChange={(next) => setData("items", next)}
          language={language}
          options={options}
          errors={errors}
          errorPrefix="items"
          nested
          idPrefix="header"
          emptyMessage="No header links yet. Add one to get started."
        />
        <FieldError errors={asFieldErrors(errors.items)} />
      </FormSection>
    </FormLayout>
  )
}
