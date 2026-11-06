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
export function describeDevice(userAgent: string | null): string {
  if (!userAgent) return "Unknown device"
  const browser = BROWSERS.find(([re]) => re.test(userAgent))?.[1]
  const system = SYSTEMS.find(([re]) => re.test(userAgent))?.[1]
  if (browser && system) return `${browser} on ${system}`
  return browser ?? system ?? "Unknown device"
}

export function fullName(name: string, lastName: string | null): string {
  return [name, lastName].filter(Boolean).join(" ")
}

export function formatMonthYear(value: string): string {
  return new Date(value).toLocaleDateString("en", {
    month: "long",
    year: "numeric",
  })
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}
