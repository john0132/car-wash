import { Link, useForm } from "@inertiajs/react"
import { useState } from "react"

import { FormSection, asFieldErrors } from "@/admin/components/form-fields"
import { LanguageSwitcher } from "@/admin/components/language-switcher"
import { LinkList } from "@/admin/features/navigation/components/link-list"
import type {
  LinkOptions,
  LinkProps,
  LinkState,
} from "@/admin/features/navigation/types"
import {
  linkPayload,
  navigationErrorLanguageCodes,
  toLinkState,
} from "@/admin/features/navigation/utils"
import type { AdminLanguage } from "@/admin/types"
import { adminDashboard, adminHeaderItems } from "@/routes"
import { Button } from "@/shared/components/ui/button"
import { FieldError } from "@/shared/components/ui/field"
import { Spinner } from "@/shared/components/ui/spinner"

interface HeaderFormData {
  items: LinkState[]
}

/**
 * The website header's links, edited as one ordered list. Posts
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
  const defaultLanguage = languages.find((l) => l.default) ?? languages[0]
  const [code, setCode] = useState(defaultLanguage?.code ?? "")
  const language = languages.find((l) => l.code === code) ?? defaultLanguage

  const form = useForm<HeaderFormData>({ items: items.map(toLinkState) })
  const { data, setData, processing } = form
  const errors = form.errors as Record<string, string[] | undefined>

  form.transform((values) => ({
    header: { items: values.items.map(linkPayload) },
  }))

  if (!language) {
    return (
      <p className="text-muted-foreground text-sm">
        No languages are set up yet. Add a Language record first.
      </p>
    )
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        form.submit(adminHeaderItems.update(), {
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

      <FormSection
        title="Header links"
        description="Shown in the website header, in this order. Links to disabled pages are hidden automatically."
      >
        <LinkList
          links={data.items}
          onChange={(next) => setData("items", next)}
          language={language}
          options={options}
          errors={errors}
          errorPrefix="items"
          idPrefix="header"
          emptyMessage="No header links yet. Add one to get started."
        />
        <FieldError errors={asFieldErrors(errors.items)} />
      </FormSection>
    </form>
  )
}
