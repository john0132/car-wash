export interface RichTextData {
  body: string
}

// `body` is HTML sanitized server-side on save (HtmlSanitizer, see
// PageSection#clean_values / ComponentSchema#coerce) by staff with dashboard
// access, so rendering it here carries the same trust boundary as any other
// CMS field.
export function RichTextBlock({ data }: { data: RichTextData }) {
  return (
    <section className="bg-white px-6 py-16">
      <div
        className="prose mx-auto max-w-3xl text-[#2B3A32] [&_a]:text-[#8A6240]"
        dangerouslySetInnerHTML={{ __html: data.body }}
      />
    </section>
  )
}
