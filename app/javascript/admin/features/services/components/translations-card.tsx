import type { SeoTranslationEntry } from "@/admin/components/seo-fields"
import { textDirection } from "@/admin/components/translation-fields"
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

/** Name and SEO text per language, read-only. */
export function TranslationsCard({
  translations,
}: {
  translations: SeoTranslationEntry[]
}) {
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
              <TableHead>SEO title</TableHead>
              <TableHead>SEO description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {translations.map((t) => (
              <TableRow key={t.language_id}>
                <TableCell className="font-medium">{t.language}</TableCell>
                <TableCell lang={t.code} dir={textDirection(t.code)}>
                  {t.name || <Missing />}
                </TableCell>
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
