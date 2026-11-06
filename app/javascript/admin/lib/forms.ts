/** Field errors keyed by attribute path, e.g. `price` or `translations.2.name`. */
export type FormErrors = Record<string, string[] | undefined>

/**
 * A form's errors as Rails sends them. Inertia types `form.errors` as one string
 * per form field, but `withAllErrors: true` (shared/lib/inertia.ts) keeps every
 * message, and Rails also reports nested keys the form type doesn't name.
 */
export const formErrors = (form: { errors: object }) =>
  form.errors as FormErrors

/** Options every dashboard form submits with: stay in place and keep unsaved edits on errors. */
export const SUBMIT_OPTIONS = {
  preserveScroll: true,
  preserveState: "errors",
} as const
