import type { CtaData } from "@/website/features/page-sections/components/cta-block"
import { CtaBlock } from "@/website/features/page-sections/components/cta-block"
import type { FeaturesData } from "@/website/features/page-sections/components/features-block"
import { FeaturesBlock } from "@/website/features/page-sections/components/features-block"
import { GenericBlock } from "@/website/features/page-sections/components/generic-block"
import type { HeroData } from "@/website/features/page-sections/components/hero-block"
import { HeroBlock } from "@/website/features/page-sections/components/hero-block"
import type { RichTextData } from "@/website/features/page-sections/components/rich-text-block"
import { RichTextBlock } from "@/website/features/page-sections/components/rich-text-block"
import {
  type PageSectionData,
  type SchemaField,
  hasRequiredFields,
} from "@/website/features/page-sections/types"

interface PageSectionsProps {
  sections: PageSectionData[]
  components: Record<string, SchemaField[]>
}

// Renders a Page's ordered PageSections by component key, matching the
// starter components (see db/seeds/components.rb): "hero", "features" and
// "cta" each get a dedicated block; an unknown staff-defined key falls back
// to a generic, schema-driven render (GenericBlock).
//
// The first two "features" sections get the `#services` / `#why-us` anchor
// ids and the first "cta" gets `#membership`, matching SiteHeader's nav —
// reordering or adding sections of the same kind on this page will drift
// from that nav until it becomes data-driven too.
// Nth occurrence (1-based) of `sections[index]`'s component key among the
// sections up to and including it. Pages are short, so the O(n²) scan here
// is cheap and keeps this a pure, non-mutating function of `sections`.
function occurrence(sections: PageSectionData[], index: number) {
  const key = sections[index].component
  return sections.slice(0, index + 1).filter((s) => s.component === key).length
}

export function PageSections({ sections, components }: PageSectionsProps) {
  return (
    <>
      {sections.map((section, index) => {
        const schema = components[section.component] ?? []
        const fallback = (
          <GenericBlock key={section.id} schema={schema} data={section.data} />
        )
        if (!hasRequiredFields(schema, section.data)) return fallback

        switch (section.component) {
          case "hero":
            return (
              <HeroBlock
                key={section.id}
                data={section.data as unknown as HeroData}
              />
            )
          case "rich_text":
            return (
              <RichTextBlock
                key={section.id}
                data={section.data as unknown as RichTextData}
              />
            )
          case "cta": {
            const nth = occurrence(sections, index)
            return (
              <CtaBlock
                key={section.id}
                data={section.data as unknown as CtaData}
                id={nth === 1 ? "membership" : undefined}
              />
            )
          }
          case "features": {
            const nth = occurrence(sections, index)
            return (
              <FeaturesBlock
                key={section.id}
                data={section.data as unknown as FeaturesData}
                tone={nth === 1 ? "white" : "ivory"}
                id={nth === 1 ? "services" : nth === 2 ? "why-us" : undefined}
              />
            )
          }
          default:
            return fallback
        }
      })}
    </>
  )
}
