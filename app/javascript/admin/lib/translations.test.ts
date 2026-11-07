import { describe, expect, it } from "vitest"

import {
  blankValues,
  languagesOf,
  patchTranslation,
  translationValues,
} from "@/admin/lib/translations"

const entries = [
  {
    language_id: 1,
    code: "en",
    language: "English",
    default: true,
    name: "Wash",
  },
  {
    language_id: 2,
    code: "ar",
    language: "Arabic",
    default: false,
    name: "",
  },
]

describe("translationValues", () => {
  it("keys each language's fields by language id, blank when missing", () => {
    expect(translationValues(entries, ["name"] as const)).toEqual({
      1: { name: "Wash" },
      2: { name: "" },
    })
  })
})

describe("languagesOf", () => {
  it("keeps the entry order, default first", () => {
    expect(languagesOf(entries).map((l) => [l.id, l.code, l.default])).toEqual([
      [1, "en", true],
      [2, "ar", false],
    ])
  })
})

describe("patchTranslation", () => {
  it("changes one language and leaves the others", () => {
    const data = { translations: { 1: { name: "Wash" }, 2: { name: "" } } }
    const next = patchTranslation(
      data,
      2,
      { name: "غسيل" },
      blankValues(["name"]),
    )
    expect(next.translations).toEqual({
      1: { name: "Wash" },
      2: { name: "غسيل" },
    })
    expect(data.translations[2].name).toBe("")
  })

  it("starts from blank values for a language not in state yet", () => {
    const data: {
      translations: Record<number, { name: string; slug: string }>
    } = {
      translations: {},
    }
    const next = patchTranslation(
      data,
      3,
      { name: "Wax" },
      blankValues(["name", "slug"]),
    )
    expect(next.translations[3]).toEqual({ name: "Wax", slug: "" })
  })
})
