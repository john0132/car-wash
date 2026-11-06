import { cn } from "cn"
import { ArrowDown, ArrowUp, Link2, Plus, Trash2 } from "lucide-react"

import { TextField, asFieldErrors } from "@/admin/components/form-fields"
import {
  LINK_TYPES,
  type LinkOptions,
  type LinkState,
  type LinkType,
} from "@/admin/features/navigation/types"
import {
  moveItem,
  newLink,
  routeLabel,
} from "@/admin/features/navigation/utils"
import { textDirection } from "@/admin/lib/languages"
import type { AdminLanguage } from "@/admin/types"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { Switch } from "@/shared/components/ui/switch"

/**
 * An ordered, editable list of links (header items, or the links of one footer
 * column). The label is the only per-language input; the target, new-tab and
 * visibility settings are shared by every language.
 *
 * `errors` is the whole form's error bag and `errorPrefix` where this list
 * sits in it, e.g. `items` → `items.0.url`, `items.0.translations.1.label`.
 */
export function LinkList({
  links,
  onChange,
  language,
  options,
  errors,
  errorPrefix,
  idPrefix,
  emptyMessage,
}: {
  links: LinkState[]
  onChange: (links: LinkState[]) => void
  language: AdminLanguage
  options: LinkOptions
  errors: Record<string, string[] | undefined>
  errorPrefix: string
  idPrefix: string
  emptyMessage: string
}) {
  const update = (uid: string, patch: Partial<LinkState>) =>
    onChange(
      links.map((link) => (link.uid === uid ? { ...link, ...patch } : link)),
    )

  return (
    <div className="space-y-3">
      {links.length === 0 && (
        <p className="text-muted-foreground flex items-center gap-2 rounded-md border border-dashed p-4 text-sm">
          <Link2 className="size-4 shrink-0" /> {emptyMessage}
        </p>
      )}

      {links.map((link, index) => {
        const error = (attribute: string) =>
          errors[`${errorPrefix}.${index}.${attribute}`]
        const labelErrors = [
          ...(error(`translations.${language.id}.label`) ?? []),
          ...(language.default ? (error("translations") ?? []) : []),
        ]
        const id = `${idPrefix}-${link.uid}`
        const label = link.translations[language.id]?.label ?? ""
        const pageMissing = link.link_type === "page" && !link.page_id
        const pageDisabled =
          link.link_type === "page" &&
          options.pages.some((p) => p.id === link.page_id && !p.is_active)

        return (
          <Card
            key={link.uid}
            className={cn("gap-0 py-0", !link.is_active && "opacity-70")}
          >
            <CardContent className="space-y-3 p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField
                  id={`${id}-label`}
                  label="Label"
                  value={label}
                  onChange={(next) =>
                    update(link.uid, {
                      translations: {
                        ...link.translations,
                        [language.id]: { label: next },
                      },
                    })
                  }
                  errors={labelErrors.length ? labelErrors : undefined}
                  required={language.default}
                  dir={textDirection(language.code)}
                  lang={language.code}
                />

                <Field data-invalid={error("link_type") ? true : undefined}>
                  <FieldLabel htmlFor={`${id}-type`}>Links to</FieldLabel>
                  <Select
                    value={link.link_type}
                    onValueChange={(next) =>
                      update(link.uid, { link_type: next as LinkType })
                    }
                  >
                    <SelectTrigger id={`${id}-type`} className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LINK_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={asFieldErrors(error("link_type"))} />
                </Field>
              </div>

              {link.link_type === "page" && (
                <Field
                  data-invalid={error("page") || pageMissing ? true : undefined}
                >
                  <FieldLabel htmlFor={`${id}-page`}>Page</FieldLabel>
                  <Select
                    value={link.page_id ? String(link.page_id) : ""}
                    onValueChange={(next) =>
                      update(link.uid, { page_id: Number(next) })
                    }
                  >
                    <SelectTrigger id={`${id}-page`} className="w-full">
                      <SelectValue placeholder="Choose a page" />
                    </SelectTrigger>
                    <SelectContent>
                      {options.pages.map((page) => (
                        <SelectItem key={page.id} value={String(page.id)}>
                          {page.name}
                          <span className="text-muted-foreground">
                            /{page.slug}
                            {!page.is_active && " · disabled"}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {pageDisabled && (
                    <p className="text-muted-foreground text-sm">
                      This page is disabled, so the link is hidden on the
                      website until it is enabled.
                    </p>
                  )}
                  <FieldError errors={asFieldErrors(error("page"))} />
                </Field>
              )}

              {link.link_type === "route" && (
                <Field data-invalid={error("route_key") ? true : undefined}>
                  <FieldLabel htmlFor={`${id}-route`}>App screen</FieldLabel>
                  <Select
                    value={link.route_key}
                    onValueChange={(next) =>
                      update(link.uid, { route_key: next })
                    }
                  >
                    <SelectTrigger id={`${id}-route`} className="w-full">
                      <SelectValue placeholder="Choose a screen" />
                    </SelectTrigger>
                    <SelectContent>
                      {options.routes.map((route) => (
                        <SelectItem key={route} value={route}>
                          {routeLabel(route)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={asFieldErrors(error("route_key"))} />
                </Field>
              )}

              {link.link_type === "url" && (
                <TextField
                  id={`${id}-url`}
                  label="URL"
                  value={link.url}
                  onChange={(url) => update(link.uid, { url })}
                  errors={error("url")}
                  placeholder="https://…, /path, mailto:…, tel:… or /#section"
                  inputMode="url"
                />
              )}

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={link.open_in_new_tab}
                    onCheckedChange={(open_in_new_tab) =>
                      update(link.uid, { open_in_new_tab })
                    }
                  />
                  Open in a new tab
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={link.is_active}
                    onCheckedChange={(is_active) =>
                      update(link.uid, { is_active })
                    }
                  />
                  Visible
                </label>
                {!link.is_active && <Badge variant="secondary">Hidden</Badge>}

                <div className="ml-auto flex items-center gap-1">
                  <span className="text-muted-foreground mr-1 text-xs tabular-nums">
                    {index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    aria-label="Move link up"
                    disabled={index === 0}
                    onClick={() => onChange(moveItem(links, index, -1))}
                  >
                    <ArrowUp />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    aria-label="Move link down"
                    disabled={index === links.length - 1}
                    onClick={() => onChange(moveItem(links, index, 1))}
                  >
                    <ArrowDown />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    aria-label="Remove link"
                    onClick={() =>
                      onChange(links.filter((l) => l.uid !== link.uid))
                    }
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}

      <Button
        type="button"
        variant="outline"
        onClick={() => onChange([...links, newLink()])}
      >
        <Plus /> Add link
      </Button>
    </div>
  )
}
