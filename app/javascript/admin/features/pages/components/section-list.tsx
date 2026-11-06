import { ChevronDown, ChevronRight, LayoutTemplate, Plus } from "lucide-react"
import { useState } from "react"

import { asFieldErrors } from "@/admin/components/form-fields"
import { ReorderButtons } from "@/admin/components/reorder-buttons"
import type { ComponentOption } from "@/admin/features/components/types"
import { SectionFields } from "@/admin/features/pages/components/section-fields"
import type { SectionState } from "@/admin/features/pages/types"
import {
  newSection,
  sectionErrors,
  sectionSummary,
} from "@/admin/features/pages/utils"
import { moveItem } from "@/admin/lib/lists"
import type { AdminLanguage } from "@/admin/types"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { FieldError } from "@/shared/components/ui/field"
import { Switch } from "@/shared/components/ui/switch"
import { cn } from "@/shared/lib/utils"

/** The page's ordered sections: each one a component instance with its own editor. */
export function SectionList({
  sections,
  onChange,
  components,
  language,
  multilingual,
  errors,
}: {
  sections: SectionState[]
  onChange: (sections: SectionState[]) => void
  components: ComponentOption[]
  language: AdminLanguage
  multilingual: boolean
  errors: Record<string, string[] | undefined>
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(
    () => new Set(sections.map((section) => section.uid)),
  )
  // Previews for images uploaded in this session (signed ids are unique, so one map serves every section).
  const [uploadedUrls, setUploadedUrls] = useState<Record<string, string>>({})
  const byId = new Map(components.map((c) => [c.id, c]))
  const addable = components.filter((c) => c.is_active)

  const update = (uid: string, patch: Partial<SectionState>) =>
    onChange(sections.map((s) => (s.uid === uid ? { ...s, ...patch } : s)))

  const toggle = (uid: string) =>
    setCollapsed((current) => {
      const next = new Set(current)
      if (next.has(uid)) next.delete(uid)
      else next.add(uid)
      return next
    })

  const addMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" disabled={addable.length === 0}>
          <Plus /> Add section
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel>Components</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {addable.map((component) => (
          <DropdownMenuItem
            key={component.id}
            className="flex-col items-start gap-0.5"
            onSelect={() => onChange([...sections, newSection(component)])}
          >
            <span className="font-medium">{component.name}</span>
            {component.description && (
              <span className="text-muted-foreground text-xs">
                {component.description}
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <div className="space-y-3">
      {sections.length === 0 && (
        <Card>
          <CardContent className="text-muted-foreground flex flex-col items-center gap-3 py-8 text-center text-sm">
            <LayoutTemplate className="size-8" />
            <p>This page has no sections yet. Add one to start building it.</p>
          </CardContent>
        </Card>
      )}

      {sections.map((section, index) => {
        const component = byId.get(section.component_id)
        const scoped = sectionErrors(errors, index)
        const hasErrors = Object.keys(scoped).length > 0
        const open = !collapsed.has(section.uid) || hasErrors
        const summary =
          component && sectionSummary(component.fields, section, language.id)

        return (
          <Card
            key={section.uid}
            className={cn(
              "gap-0 py-0",
              !section.is_active && "opacity-70",
              hasErrors && "border-destructive",
            )}
          >
            <div className="flex items-center gap-2 p-3">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7"
                aria-expanded={open}
                aria-label={open ? "Collapse section" : "Expand section"}
                onClick={() => toggle(section.uid)}
              >
                {open ? <ChevronDown /> : <ChevronRight />}
              </Button>
              <button
                type="button"
                className="min-w-0 flex-1 text-left"
                onClick={() => toggle(section.uid)}
              >
                <span className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs tabular-nums">
                    {index + 1}
                  </span>
                  <span className="font-medium">
                    {component?.name ?? "Unknown component"}
                  </span>
                  {!section.is_active && (
                    <Badge variant="secondary">Hidden</Badge>
                  )}
                  {component && !component.is_active && (
                    <Badge variant="outline">Component disabled</Badge>
                  )}
                  {hasErrors && <Badge variant="destructive">Errors</Badge>}
                </span>
                {summary && (
                  <span className="text-muted-foreground block truncate text-sm">
                    {summary}
                  </span>
                )}
              </button>

              <div className="flex items-center gap-1">
                <Switch
                  checked={section.is_active}
                  aria-label={
                    section.is_active ? "Hide section" : "Show section"
                  }
                  onCheckedChange={(is_active) =>
                    update(section.uid, { is_active })
                  }
                />
                <ReorderButtons
                  index={index}
                  count={sections.length}
                  noun="section"
                  onMove={(offset) =>
                    onChange(moveItem(sections, index, offset))
                  }
                  onRemove={() =>
                    onChange(sections.filter((s) => s.uid !== section.uid))
                  }
                />
              </div>
            </div>

            {open && (
              <CardContent className="space-y-3 border-t py-4">
                {component ? (
                  <SectionFields
                    idPrefix={section.uid}
                    fields={component.fields}
                    language={language}
                    multilingual={multilingual}
                    settings={section.settings}
                    content={section.content[language.id] ?? {}}
                    errors={scoped}
                    imageUrls={{ ...section.image_urls, ...uploadedUrls }}
                    onImageUploaded={(image) =>
                      setUploadedUrls((urls) => ({
                        ...urls,
                        [image.signed_id]: image.url,
                      }))
                    }
                    onChange={(settings, content) =>
                      update(section.uid, {
                        settings,
                        content: { ...section.content, [language.id]: content },
                      })
                    }
                  />
                ) : (
                  <p className="text-muted-foreground text-sm">
                    This section&apos;s component no longer exists.
                  </p>
                )}
                <FieldError
                  errors={asFieldErrors([
                    ...(scoped.component ?? []).map((m) => `Component ${m}`),
                    ...(scoped.images ?? []).map((m) => `Images ${m}`),
                  ])}
                />
              </CardContent>
            )}
          </Card>
        )
      })}

      {addMenu}
    </div>
  )
}
