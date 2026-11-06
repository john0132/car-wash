const BROWSERS: [RegExp, string][] = [
  [/Edg\//, "Edge"],
  [/OPR\/|Opera/, "Opera"],
  [/Firefox\//, "Firefox"],
  [/Chrome\//, "Chrome"],
  [/Safari\//, "Safari"],
]

const SYSTEMS: [RegExp, string][] = [
  [/iPhone/, "iPhone"],
  [/iPad/, "iPad"],
  [/Android/, "Android"],
  [/Windows/, "Windows"],
  [/Mac OS X|Macintosh/, "Mac"],
  [/Linux/, "Linux"],
]

/** "Chrome on Linux" from a raw user agent string. */
export function describeDevice(
  userAgent: string | null,
  t: (key: string, vars?: Record<string, string>) => string,
): string {
  if (!userAgent) return t("Unknown device")
  const browser = BROWSERS.find(([re]) => re.test(userAgent))?.[1]
  const system = SYSTEMS.find(([re]) => re.test(userAgent))?.[1]
  if (browser && system) return t("{browser} on {system}", { browser, system })
  return browser ?? system ?? t("Unknown device")
}

export function fullName(name: string, lastName: string | null): string {
  return [name, lastName].filter(Boolean).join(" ")
}
