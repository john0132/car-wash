import { act, renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { useLanguageTabs } from "@/admin/hooks/use-language-tabs"
import type { FormErrors } from "@/admin/lib/forms"
import type { AdminLanguage } from "@/admin/types"

const languages: AdminLanguage[] = [
  { id: 1, code: "en", name: "English", default: true },
  { id: 2, code: "ar", name: "Arabic", default: false },
]

// Inertia keeps `errors` referentially stable between renders; so must the tests.
const NO_ERRORS: FormErrors = {}

describe("useLanguageTabs", () => {
  it("starts on the default language", () => {
    const { result } = renderHook(() => useLanguageTabs(languages, NO_ERRORS))
    expect(result.current.language?.code).toBe("en")
  })

  it("switches tabs on request", () => {
    const { result } = renderHook(() => useLanguageTabs(languages, NO_ERRORS))
    act(() => result.current.setCode("ar"))
    expect(result.current.language?.code).toBe("ar")
  })

  it("jumps to the first tab with errors when a save fails", () => {
    const { result, rerender } = renderHook(
      ({ errors }: { errors: FormErrors }) =>
        useLanguageTabs(languages, errors),
      { initialProps: { errors: NO_ERRORS } },
    )

    rerender({ errors: { "translations.2.name": ["can't be blank"] } })

    expect(result.current.language?.code).toBe("ar")
    expect(result.current.errorCodes).toEqual(["ar"])
    expect(result.current.errorFor("name")).toEqual(["can't be blank"])
  })

  it("stays put when the current tab already has errors", () => {
    const { result, rerender } = renderHook(
      ({ errors }: { errors: FormErrors }) =>
        useLanguageTabs(languages, errors),
      { initialProps: { errors: NO_ERRORS } },
    )

    rerender({
      errors: { "translations.1.name": ["x"], "translations.2.name": ["x"] },
    })

    expect(result.current.language?.code).toBe("en")
  })
})
