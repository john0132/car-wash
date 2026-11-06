// Class recipes for the public website's controls. The shadcn primitives pick
// up the brand palette from the tokens in entrypoints/website.css; these add
// the shapes (pill buttons, rounded inputs) so every page shares one look.

/** Text inputs, textareas and select triggers. */
export const brandInput =
  "h-11 rounded-xl border-pine/25 bg-white px-3.5 text-pine shadow-none placeholder:text-sage/60 hover:border-pine/50 focus-visible:border-bronze focus-visible:ring-bronze/25"

/** Select triggers: same as inputs but Radix sets the height with a data attribute. */
export const brandSelect = `${brandInput} data-[size=default]:h-11 w-full`

/** Primary pill button. */
export const brandButton =
  "h-11 rounded-full bg-pine px-7 text-ivory hover:bg-pine-deep"

/** Secondary (outlined) pill button. */
export const brandOutlineButton =
  "h-11 rounded-full border-pine/30 bg-transparent px-7 text-pine hover:bg-pine/5 hover:text-pine"
