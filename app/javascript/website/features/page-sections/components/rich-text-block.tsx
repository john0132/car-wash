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
        className="prose prose-headings:font-display prose-headings:font-normal prose-headings:text-pine prose-h1:text-4xl sm:prose-h1:text-5xl text-pine [&_a]:text-bronze mx-auto max-w-3xl"
        dangerouslySetInnerHTML={{ __html: data.body }}
      />
    </section>
  )
}
