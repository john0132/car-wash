import { usePage } from "@inertiajs/react"

import ar from "@/website/locales/ar.json"

/** The `locale` prop (Website::Localized#locale_props). */
export interface LocaleProps {
  code: string
  dir: "ltr" | "rtl"
  default: string
  /** The current page in each language, for the switcher. */
  available: { code: string; name: string; href: string }[]
}

type Vars = Record<string, string | number | null | undefined>
type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>>

// English strings are their own keys. A language only lists what differs, and
// anything missing falls back to English (npm run i18n:check lists the gaps).
const dictionaries: Record<string, Record<string, string | PluralForms>> = {
  ar,
}

/** Day-to-day numbers stay Latin ("12 services"); flip `-u-nu-latn` off for Arabic-Indic digits. */
const INTL_TAGS: Record<string, string> = {
  en: "en-EG",
  ar: "ar-EG-u-nu-latn",
}

/** Business time zone: SSR (server) and the browser must format dates identically. */
export const TIME_ZONE = "Africa/Cairo"

/**
 * Marks a string that is translated later (a module-level label table, say):
 * it returns the key unchanged, and the i18n check script finds it like a t call.
 * Translate it where it is shown: `t(LABELS[status])`.
 */
export const msg = (key: string) => key

const fill = (text: string, vars?: Vars) =>
  vars
    ? text.replace(/\{(\w+)\}/g, (match, name: string) =>
        name in vars ? String(vars[name] ?? "") : match,
      )
    : text

export function translate(code: string, key: string, vars?: Vars) {
  const entry = dictionaries[code]?.[key]
  return fill(typeof entry === "string" ? entry : key, vars)
}

/**
 * "1 service" / "3 services". `one` and `other` are the English forms and
 * `other` is the dictionary key; other languages list every plural form
 * they need ({ zero, one, two, few, many, other }).
 */
export function translatePlural(
  code: string,
  count: number,
  one: string,
  other: string,
  vars?: Vars,
) {
  const entry = dictionaries[code]?.[other]
  const forms = typeof entry === "object" ? entry : undefined
  const category = new Intl.PluralRules(INTL_TAGS[code] ?? code).select(count)
  const english = count === 1 ? one : other
  const text = forms ? (forms[category] ?? forms.other ?? english) : english
  return fill(text, { n: count, ...vars })
}

/** Prefixes a site-relative path with the language prefix (/services → /ar/services). */
export function localizeHref(href: string, locale: LocaleProps) {
  if (locale.code === locale.default) return href
  if (!href.startsWith("/") || href.startsWith("//")) return href
  const prefix = `/${locale.code}`
  if (href === prefix || href.startsWith(`${prefix}/`)) return href
  // "/" → "/ar", "/#faq" → "/ar#faq"
  return href === "/"
    ? prefix
    : href.startsWith("/#")
      ? `${prefix}${href.slice(1)}`
      : `${prefix}${href}`
}

/** Everything a component needs to speak the visitor's language. */
export function useI18n() {
  const locale = usePage<{ locale: LocaleProps }>().props.locale
  const code = locale.code
  const intlTag = INTL_TAGS[code] ?? code

  const t = (key: string, vars?: Vars) => translate(code, key, vars)
  const tp = (count: number, one: string, other: string, vars?: Vars) =>
    translatePlural(code, count, one, other, vars)

  const money = new Intl.NumberFormat(intlTag, {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 2,
  })

  return {
    t,
    tp,
    locale,
    dir: locale.dir,
    href: (path: string) => localizeHref(path, locale),
    formatMoney: (value: number) => money.format(value),
    /** 90 → "1 h 30 min", 45 → "45 min", null → null. */
    formatDuration: (minutes: number | null) => {
      if (!minutes) return null
      const hours = Math.floor(minutes / 60)
      const rest = minutes % 60
      if (hours === 0) return t("{m} min", { m: rest })
      if (rest === 0) return t("{h} h", { h: hours })
      return t("{h} h {m} min", { h: hours, m: rest })
    },
    /** A calendar date in the business time zone. */
    formatDate: (value: string | Date, dateStyle: "long" | "medium" = "long") =>
      new Intl.DateTimeFormat(intlTag, {
        dateStyle,
        timeZone: TIME_ZONE,
      }).format(new Date(value)),
    formatMonthYear: (value: string | Date) =>
      new Intl.DateTimeFormat(intlTag, {
        month: "long",
        year: "numeric",
        timeZone: TIME_ZONE,
      }).format(new Date(value)),
    /** An appointment time, in the business time zone. */
    formatWhen: (value: string | null) =>
      value
        ? new Intl.DateTimeFormat(intlTag, {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            timeZone: TIME_ZONE,
          }).format(new Date(value))
        : t("Date to be confirmed"),
    formatDateTime: (value: string | Date) =>
      new Intl.DateTimeFormat(intlTag, {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: TIME_ZONE,
      }).format(new Date(value)),
  }
}
