import { describe, expect, it } from "vitest"

import {
  type LocaleProps,
  localizeHref,
  translate,
  translatePlural,
} from "@/website/lib/i18n"

const en: LocaleProps = { code: "en", dir: "ltr", default: "en", available: [] }
const ar: LocaleProps = { code: "ar", dir: "rtl", default: "en", available: [] }

describe("translate", () => {
  it("returns the English key when a language has no entry", () => {
    expect(translate("en", "Sign in")).toBe("Sign in")
    expect(translate("ar", "A string nobody translated")).toBe(
      "A string nobody translated",
    )
  })

  it("translates a known key", () => {
    expect(translate("ar", "Delete account")).toBe("حذف الحساب")
  })

  it("fills {placeholders} and leaves unknown ones", () => {
    expect(translate("en", "{m} min", { m: 45 })).toBe("45 min")
    expect(translate("en", "{a} and {b}", { a: "x" })).toBe("x and {b}")
  })
})

describe("translatePlural", () => {
  it("picks the English singular or plural form", () => {
    expect(translatePlural("en", 1, "{n} service", "{n} services")).toBe(
      "1 service",
    )
    expect(translatePlural("en", 3, "{n} service", "{n} services")).toBe(
      "3 services",
    )
  })
})

describe("localizeHref", () => {
  it("leaves the default language alone", () => {
    expect(localizeHref("/services", en)).toBe("/services")
  })

  it("prefixes site paths for other languages", () => {
    expect(localizeHref("/services", ar)).toBe("/ar/services")
    expect(localizeHref("/", ar)).toBe("/ar")
    expect(localizeHref("/#faq", ar)).toBe("/ar#faq")
  })

  it("does not double-prefix or touch external links", () => {
    expect(localizeHref("/ar/services", ar)).toBe("/ar/services")
    expect(localizeHref("https://example.com", ar)).toBe("https://example.com")
    expect(localizeHref("//cdn.example.com/x", ar)).toBe("//cdn.example.com/x")
  })
})
