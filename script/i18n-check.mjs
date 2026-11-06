// Checks the website's Arabic dictionary against the strings used in the code.
//
//   npm run i18n:check          fail on missing / mismatched entries
//   npm run i18n:check -- --list   print every key still missing
//
// English strings are their own keys: t("Book your visit"), msg("Pending") and
// tp(n, "{n} service", "{n} services") in app/javascript/website. The Arabic text
// lives in app/javascript/website/locales/ar.json (plural entries are objects of
// plural forms). A string with no entry still renders, in English.
import fs from "node:fs"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")
const src = path.join(root, "app/javascript/website")
const dictPath = path.join(src, "locales/ar.json")

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) return walk(p)
    return /\.tsx?$/.test(e.name) ? [p] : []
  })

const STR = String.raw`("(?:[^"\\\n]|\\.)*")`
const single = new RegExp(String.raw`(?<![\w.])(?:t|msg)\(\s*${STR}`, "g")
const plural = new RegExp(String.raw`(?<![\w.])tp\(\s*[^,]+,\s*${STR}\s*,\s*${STR}`, "g")

const used = new Map() // key -> { plural: boolean, files: Set }
const note = (key, isPlural, file) => {
  const entry = used.get(key) ?? { plural: isPlural, files: new Set() }
  entry.files.add(path.relative(root, file))
  used.set(key, entry)
}

for (const file of walk(src)) {
  const text = fs.readFileSync(file, "utf8")
  for (const m of text.matchAll(single)) note(JSON.parse(m[1]), false, file)
  for (const m of text.matchAll(plural)) note(JSON.parse(m[2]), true, file)
}

const dict = JSON.parse(fs.readFileSync(dictPath, "utf8"))
const placeholders = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(",")
const problems = []
const missing = []

for (const [key, { plural: isPlural, files }] of used) {
  const entry = dict[key]
  if (entry === undefined) {
    missing.push(key)
    continue
  }
  if (isPlural !== (typeof entry === "object")) {
    problems.push(`"${key}": ${isPlural ? "needs plural forms (an object)" : "must be a string"}`)
    continue
  }
  const texts = typeof entry === "object" ? Object.values(entry) : [entry]
  for (const text of texts) {
    // plural forms may use {n} for the count even when the key spells it out
    const expected = placeholders(key)
    const got = placeholders(text)
    if (expected !== got && !(isPlural && got.split(",").every((p) => p === "n" || expected.includes(p)))) {
      problems.push(`"${key}": Arabic text has placeholders {${got}}, expected {${expected}}`)
    }
  }
}

const unused = Object.keys(dict).filter((key) => !used.has(key))

if (process.argv.includes("--list")) {
  for (const key of missing) console.log(JSON.stringify(key))
  process.exit(0)
}

for (const p of problems) console.error(`✖ ${p}`)
for (const key of unused) console.error(`✖ unused Arabic entry: "${key}"`)
if (missing.length) {
  console.error(`✖ ${missing.length} string(s) have no Arabic entry in ar.json:`)
  for (const key of missing.slice(0, 15)) console.error(`    ${JSON.stringify(key)}`)
  if (missing.length > 15) console.error(`    … and ${missing.length - 15} more (npm run i18n:check -- --list)`)
}

if (problems.length || unused.length || missing.length) process.exit(1)
console.log(`i18n: ${used.size} strings, all translated`)
