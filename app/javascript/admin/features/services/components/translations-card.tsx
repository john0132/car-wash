import type { SeoTranslationEntry } from "@/admin/components/seo-fields"
import { textDirection } from "@/admin/components/translation-fields"
import type { ServiceTranslationEntry } from "@/admin/features/services/types"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"

const Missing = () => <span className="text-muted-foreground">—</span>

const Text = ({ value }: { value?: string }) =>
  value ? <>{value}</> : <Missing />

/** Name, title, description and SEO text per language, read-only. */
export function TranslationsCard({
  translations,
}: {
  translations: SeoTranslationEntry[] | ServiceTranslationEntry[]
}) {
  // Services also carry a title and description; categories only have SEO text.
  const entries: (SeoTranslationEntry &
    Partial<Pick<ServiceTranslationEntry, "title" | "description">>)[] =
    translations
  const withContent = entries.some((t) => t.title !== undefined)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Translations & SEO</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Language</TableHead>
              <TableHead>Name</TableHead>
              {withContent && <TableHead>Title</TableHead>}
              {withContent && <TableHead>Description</TableHead>}
              <TableHead>SEO title</TableHead>
              <TableHead>SEO description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((t) => (
              <TableRow key={t.language_id}>
                <TableCell className="font-medium">{t.language}</TableCell>
                <TableCell lang={t.code} dir={textDirection(t.code)}>
                  {t.name || <Missing />}
                </TableCell>
                {withContent && (
                  <TableCell lang={t.code} dir={textDirection(t.code)}>
                    <Text value={t.title} />
                  </TableCell>
                )}
                {withContent && (
                  <TableCell
                    lang={t.code}
                    dir={textDirection(t.code)}
                    className="max-w-md whitespace-normal"
                  >
                    <Text value={t.description} />
                  </TableCell>
                )}
                <TableCell lang={t.code} dir={textDirection(t.code)}>
                  {t.seo_title || <Missing />}
                </TableCell>
                <TableCell
                  lang={t.code}
                  dir={textDirection(t.code)}
                  className="max-w-md whitespace-normal"
                >
                  {t.seo_description || <Missing />}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
