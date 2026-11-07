import { describe, expect, it } from "vitest"

import { emptyLanguageCodes, errorLanguageCodes } from "@/admin/lib/languages"
import type { AdminLanguage } from "@/admin/types"

const languages: AdminLanguage[] = [
  { id: 1, code: "en", name: "English", default: true },
  { id: 2, code: "ar", name: "Arabic", default: false },
]

describe("errorLanguageCodes", () => {
  it("maps a translation error to its language", () => {
    expect(
      errorLanguageCodes({ "translations.2.name": ["is blank"] }, languages),
    ).toEqual(["ar"])
  })

  it("finds nested translation errors", () => {
    expect(
      errorLanguageCodes(
        { "items.0.translations.2.label": ["is blank"] },
        languages,
      ),
    ).toEqual(["ar"])
  })

  it("puts the base 'must include English' error on the default language", () => {
    expect(
      errorLanguageCodes(
        { translations: ["must include a name in English"] },
        languages,
      ),
    ).toEqual(["en"])
  })

  it("returns codes in tab order", () => {
    const errors = {
      "translations.2.name": ["x"],
      "translations.1.name": ["x"],
    }
    expect(errorLanguageCodes(errors, languages)).toEqual(["en", "ar"])
  })
})

describe("emptyLanguageCodes", () => {
  it("marks optional languages with nothing filled in", () => {
    const translations = { 1: { name: "Wash" }, 2: { name: "<p> </p>" } }
    expect(emptyLanguageCodes(translations, languages)).toEqual(["ar"])
  })

  it("never marks the default language", () => {
    expect(
      emptyLanguageCodes({ 1: { name: "" }, 2: { name: "x" } }, languages),
    ).toEqual([])
  })
})
