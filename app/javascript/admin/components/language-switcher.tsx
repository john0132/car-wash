import { cn } from "cn"

import type { AdminLanguage } from "@/admin/types"
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"

/**
 * Picks the language a content form is editing. Translatable inputs show that
 * language's text; shared (non-translatable) inputs stay the same in every tab.
 * Languages in `errorCodes` get a red dot.
 */
export function LanguageSwitcher({
  languages,
  value,
  onChange,
  errorCodes = [],
  className,
}: {
  languages: AdminLanguage[]
  value: string
  onChange: (code: string) => void
  errorCodes?: string[]
  className?: string
}) {
  if (languages.length < 2) return null

  return (
    <Tabs value={value} onValueChange={onChange} className={className}>
      <TabsList aria-label="Editing language">
        {languages.map((language) => (
          <TabsTrigger key={language.id} value={language.code}>
            <span lang={language.code}>{language.name}</span>
            {language.default && (
              <span className="text-muted-foreground text-xs font-normal">
                default
              </span>
            )}
            <span
              aria-hidden
              className={cn(
                "bg-destructive size-1.5 rounded-full",
                !errorCodes.includes(language.code) && "invisible",
              )}
            />
            {errorCodes.includes(language.code) && (
              <span className="sr-only">(has errors)</span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
