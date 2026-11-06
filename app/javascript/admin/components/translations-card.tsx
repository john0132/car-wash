import { textDirection } from "@/admin/lib/languages"
import type { TranslationEntry } from "@/admin/types"
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

/** A column of TranslationsCard: a text attribute of the translations. */
export interface TranslationColumn<F extends string> {
  key: F
  label: string
  /** Long text: wraps instead of stretching the table. */
  long?: boolean
}

/** Every language's text for a record, read-only, on its detail page. */
export function TranslationsCard<F extends string>({
  translations,
  columns,
}: {
  translations: TranslationEntry<F>[]
  columns: TranslationColumn<F>[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Translations</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Language</TableHead>
              {columns.map((column) => (
                <TableHead key={column.key}>{column.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {translations.map((t) => (
              <TableRow key={t.language_id}>
                <TableCell className="font-medium">
                  {t.language}
                  {t.default && (
                    <span className="text-muted-foreground ml-1.5 text-xs font-normal">
                      default
                    </span>
                  )}
                </TableCell>
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    lang={t.code}
                    dir={textDirection(t.code)}
                    className={
                      column.long ? "max-w-md whitespace-normal" : undefined
                    }
                  >
                    {t[column.key] || (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
