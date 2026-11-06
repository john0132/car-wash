import type { AdminLanguage } from "@/admin/types"
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { cn } from "@/shared/lib/utils"

/**
 * Picks the language a multilingual form is editing. Translatable inputs show
 * that language's text; shared inputs stay the same in every tab. Languages in
 * `errorCodes` get a red dot; optional languages in `emptyCodes` are marked
 * "empty". Scrolls sideways when the tabs don't fit.
 */
export function LanguageSwitcher({
  languages,
  value,
  onChange,
  errorCodes = [],
  emptyCodes = [],
  className,
}: {
  languages: AdminLanguage[]
  value: string
  onChange: (code: string) => void
  errorCodes?: string[]
  emptyCodes?: string[]
  className?: string
}) {
  if (languages.length < 2) return null

  return (
    <Tabs
      value={value}
      onValueChange={onChange}
      className={cn("max-w-full min-w-0", className)}
    >
      <div className="max-w-full overflow-x-auto overflow-y-hidden">
        <TabsList aria-label="Editing language">
          {languages.map((language) => {
            const hasErrors = errorCodes.includes(language.code)
            return (
              <TabsTrigger key={language.id} value={language.code}>
                <span lang={language.code}>{language.name}</span>
                {language.default && (
                  <span className="text-muted-foreground text-xs font-normal">
                    default
                  </span>
                )}
                {!language.default && emptyCodes.includes(language.code) && (
                  <span className="text-muted-foreground text-xs font-normal">
                    empty
                  </span>
                )}
                <span
                  aria-hidden
                  className={cn(
                    "bg-destructive size-1.5 rounded-full",
                    !hasErrors && "invisible",
                  )}
                />
                {hasErrors && <span className="sr-only">(has errors)</span>}
              </TabsTrigger>
            )
          })}
        </TabsList>
      </div>
    </Tabs>
  )
}
