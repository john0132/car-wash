import { cn } from "cn"
import { Plus } from "lucide-react"

import { TextField, asFieldErrors } from "@/admin/components/form-fields"
import { ReorderButtons } from "@/admin/components/reorder-buttons"
import type { ColumnState } from "@/admin/features/footer/types"
import { LinkList } from "@/admin/features/navigation/components/link-list"
import type { LinkOptions } from "@/admin/features/navigation/types"
import { newUid } from "@/admin/features/navigation/utils"
import type { FormErrors } from "@/admin/lib/forms"
import { textDirection } from "@/admin/lib/languages"
import { moveItem } from "@/admin/lib/lists"
import type { AdminLanguage } from "@/admin/types"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { FieldError } from "@/shared/components/ui/field"
import { Switch } from "@/shared/components/ui/switch"

/**
 * The footer's columns, each with a per-language title and its own list of
 * links. Titles are edited in `language`; visibility and links' targets are
 * shared by every language.
 */
export function FooterColumnsEditor({
  columns,
  onChange,
  language,
  options,
  errors,
}: {
  columns: ColumnState[]
  onChange: (columns: ColumnState[]) => void
  language: AdminLanguage
  options: LinkOptions
  errors: FormErrors
}) {
  const update = (uid: string, patch: Partial<ColumnState>) =>
    onChange(columns.map((c) => (c.uid === uid ? { ...c, ...patch } : c)))

  return (
    <div className="space-y-4">
      {columns.map((column, index) => {
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
              <div className="flex flex-wrap items-end gap-3">
                <div className="min-w-48 flex-1">
                  <TextField
                    id={`column-title-${column.uid}`}
                    label={`Column ${index + 1} title`}
                    value={column.translations[language.id]?.title ?? ""}
                    onChange={(title) =>
                      update(column.uid, {
                        translations: {
                          ...column.translations,
                          [language.id]: { title },
                        },
                      })
                    }
                    errors={titleErrors.length ? titleErrors : undefined}
                    required={language.default}
                    dir={textDirection(language.code)}
                    lang={language.code}
                  />
                </div>
                <label className="flex items-center gap-2 pb-2 text-sm">
                  <Switch
                    checked={column.is_active}
                    onCheckedChange={(is_active) =>
                      update(column.uid, { is_active })
                    }
                  />
                  Visible
                </label>
                <div className="pb-1">
                  <ReorderButtons
                    index={index}
                    count={columns.length}
                    noun="column"
                    onMove={(offset) =>
                      onChange(moveItem(columns, index, offset))
                    }
                    onRemove={() =>
                      onChange(columns.filter((c) => c.uid !== column.uid))
                    }
                  />
                </div>
              </div>

              <LinkList
                links={column.items}
                onChange={(items) => update(column.uid, { items })}
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
          onChange([
            ...columns,
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
  )
}
