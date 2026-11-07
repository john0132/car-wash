# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

Rails 8.1 + [Inertia Rails](https://inertia-rails.dev) + React 19 (TypeScript), built with Vite. Tailwind CSS + shadcn/ui ("new-york" style, neutral base, see `components.json`). PostgreSQL, Solid Queue/Cache/Cable, RSpec, Kamal deploy. Based on the [Inertia Rails React Starter Kit](https://github.com/inertia-rails/react-starter-kit).

## Commands

```bash
bin/setup --skip-server   # install deps, create & migrate db
bin/dev                   # run Rails (:3000) + Vite dev server

bin/ci                    # run the FULL local pipeline — matches CI; run before considering work done
bin/rubocop                              # Ruby lint (Omakase style)
bin/rspec                                # all specs
bin/rspec spec/requests/sessions_spec.rb          # one file
bin/rspec spec/requests/sessions_spec.rb:12       # one example by line
bin/brakeman --no-pager                  # Ruby security static analysis
bin/bundler-audit                        # gem vulnerability audit

npm run lint          # ESLint
npm run lint:fix
npm run format        # Prettier check
npm run format:fix
npm run check         # tsc (app + node configs)
npm test              # Vitest unit/component tests (*.test.ts[x] next to the code); npm run test:watch to iterate
bin/rails typelizer:generate:refresh     # regenerate app/javascript/routes/* from Rails routes
```

`bin/ci` (defined in `config/ci.rb`) is the authoritative check: setup, rubocop, JS lint/format/typecheck/tests (Vitest), a freshness check on generated routes, gem/npm/Brakeman audits, then RSpec and a seed-replant check. CI (`.github/workflows/ci.yml`) runs the equivalent steps split across jobs.

## Architecture

**Auth is hand-rolled, not Devise.** `User` uses `has_secure_password` plus `generates_token_for` (Rails 7+ built-in) for password reset tokens (valid 20 minutes; there is no email verification) — no `authentication-zero`/Devise models beyond that gem being present in the Gemfile just to track its security advisories. Signed-in state is a `Session` row (`app/models/session.rb`) referenced by a signed, permanent `session_token` cookie; there is no server-side session store beyond that table. `Current` (`app/models/current.rb`, an `ActiveSupport::CurrentAttributes`) holds the request-scoped `session`/`user`/`user_agent`/`ip_address` and is populated in `ApplicationController#set_current_request_details` / `#perform_authentication`. Changing a user's password deletes all of their other sessions (`User#after_update` callback); disabling a user (`is_active` false) deletes all of their sessions. Customers are never deleted: "Delete account" on the website only sets `is_active` to false (bookings and payments stay), and sign-in rejects disabled accounts until staff re-enable them.

**Controller bases:** `ApplicationController` handles auth/CurrentAttributes/Pundit for every request and exposes the hooks `authentication_path` (where signed-out users are sent), `after_authentication_path` (where signed-in users land) and `start_new_session_for(user)`. `InertiaController < ApplicationController` is the `inertia_rails` `parent_controller` and shares the `auth: { user, session }` prop. Below it there are two area bases, and every new controller inherits one of them:
- `Website::BaseController` (`app/controllers/website/`): public site + customer account (sign in/up, password reset, `/profile/*`). Routes live in `scope module: :website` in `config/routes.rb`, so URLs/route helpers carry no prefix. Uses the `application` layout.
- `Admin::BaseController` (`app/controllers/admin/`): staff dashboard under `namespace :admin`. It sets `layout "admin"`, disables SSR, requires staff via the headless Pundit `AdminPolicy#access?` (`User#staff?` = admin or employee), redirects signed-out users to `/admin/sign_in`, and shares `admin: { permissions: ["resource.action", …], is_super_admin }``. Every admin action must still be authorized in Rails (Pundit); the permissions prop is for UI visibility only. Admins have **no implicit access**: their permissions come only from their `Role`s (`Permission::CATALOG` lists every `resource.action`; `Role.super_admin!`, run by seeds, holds them all). Nobody can gain access they don't hold: an admin may only grant roles and permissions they hold themselves (`User#can_grant_role?`, `RolesController#grantable_permission_keys`), and may only edit, disable or delete another admin whose permissions they all hold, with Super Admin accounts managed only by Super Admins (`UserPolicy#protected_record?`). Dashboard reports are likewise built only for admins who can read the underlying records. Only admins can hold roles; employees are field staff assigned to bookings (`Booking#employee`) and have no dashboard permissions. Admin has its own login (`Admin::SessionsController`) but uses the same `Session`/cookie auth.
Controllers that skip auth use `skip_before_action :authenticate` + `require_no_authentication`.

**Routing is type-safe end-to-end.** `app/javascript/routes/**` is generated by the `typelizer` gem from `config/routes.rb` — **never hand-edit it** (files are marked "DO NOT MODIFY" and regenerated via `bin/rails typelizer:generate:refresh`). Use the generated helpers from `@/routes` instead of hardcoding URLs: named routes (`root()`, `signIn()`, `profile()`, `adminRoot()`, `adminSignOut()`) or controller modules (`websiteSessions.create()`, `adminDashboard.index()`). `bin/ci` fails if the generated routes are stale relative to `config/routes.rb`.

**SSR:** only the website is server-rendered. The Vite SSR entry is `entrypoints/website.tsx` (`vite.config.ts`) and is built to `ssr/website.js` (`config.ssr_bundle`); `Admin::BaseController` sets `inertia_config ssr_enabled: false`. To disable SSR entirely, flip `config.ssr_enabled` in `config/initializers/inertia_rails.rb` and `ARG SSR_ENABLED` in `Dockerfile`.

## Frontend architecture: two apps + shared (follow strictly)

One Rails app, one React install, **two separate Inertia apps** (admin and website) plus a shared layer:

```
app/javascript/
├── entrypoints/  admin.tsx (client-only) · website.tsx (SSR) · application.css (shared by both)
├── routes/       generated by typelizer — never edit
├── shared/       generic, domain-free code: components/ui (shadcn), components, layouts, hooks, lib, types
├── admin/        pages/ layouts/ components/ features/ hooks/ lib/ types/   — staff dashboard only
└── website/      pages/ layouts/ components/ features/ hooks/ lib/ types/   — public site + customer account only
```

**Where code goes — decide before writing anything:**
- Working on the admin dashboard → write it in `admin/` (and Rails code in `app/controllers/admin/`).
- Working on the public website/customer account → write it in `website/` (and `app/controllers/website/`).
- Only code that is genuinely reusable and domain-independent (UI primitives, generic hooks, formatting utils, generic types) goes in `shared/`. Don't move code to `shared/` "just in case". Promote it when a second app actually needs it, and strip app/domain specifics (e.g. take a `logoHref` prop instead of importing a route).

**Import rules** (enforced by `import/no-restricted-paths` in `eslint.config.js`; `npm run lint` fails on violations):
- `admin/` may import `shared/`, `admin/` and `@/routes`. It must never import `website/`.
- `website/` may import `shared/`, `website/` and `@/routes`. It must never import `admin/`.
- `shared/` may import only `shared/` (not `@/routes`, not either app).
Use the single `@/` alias (`@/shared/...`, `@/admin/...`, `@/website/...`).

**Page resolution:** Rails' default component name is `<controller_path>/<action>`. So `Admin::UsersController#index` renders `admin/users/index`, which is `app/javascript/admin/pages/users/index.tsx`, and `Website::HomeController#index` renders `website/home/index`, which is `website/pages/home/index.tsx`. Each entrypoint resolves only its own `import.meta.glob("../<app>/pages/**/*.tsx")` through `createPageResolver` (`shared/lib/inertia.ts`), which throws a descriptive error for a missing page or a foreign prefix. Common `createInertiaApp` options live in `inertiaAppOptions` in the same file. Don't use the `inertia "path"` route helper inside `namespace :admin`: it goes through `InertiaRails::StaticController`, which gets the website layout and no staff gate. Write an admin controller action instead.

**Layouts:** Rails picks the bundle through its layout: `app/views/layouts/application.html.erb` loads `website.tsx` plus `inertia_ssr_head`, and `admin.html.erb` loads `admin.tsx`. Both render `layouts/_head.html.erb`. Every page in both apps is wrapped in `shared/layouts/persistent-layout.tsx` (flash→toast bridge via `useFlash` + `sonner` `Toaster`). Admin pages compose `admin/layouts/admin-layout` (sidebar) or `admin/layouts/auth-layout`. Website pages compose `website/layouts/site-layout` (document head via `SeoHead`, skip link, header, `<main id="main">`, footer) directly or through `marketing-layout` (CMS pages), `booking-layout` or `profile-layout`, and the sign-in/recovery pages use `auth-layout`. Do not repeat the head/header/footer in a page.

**Website styling:** the site is always light and on-brand. Brand colors and fonts are Tailwind tokens (`bg-pine`, `text-ivory`, `text-bronze`, `text-sage`, `font-display`; see `@theme` in `entrypoints/application.css`), and `entrypoints/website.css` (loaded only by the website layout) maps the shadcn tokens to the palette and self-hosts the fonts via `@fontsource`. Never write hex colors or inline `fontFamily` in website code, and never add `dark:` classes there (dark mode is admin-only: its inline script and `initializeTheme()` live in `admin.html.erb`/`admin.tsx`). Shape recipes for controls are in `website/components/brand.ts` (`brandInput`, `brandSelect`, `brandButton`, `brandOutlineButton`). Cross-feature pieces live in `website/components/` (`ImageOrMark`, `ServiceCard`, `Pagination`, `Breadcrumbs`) and `website/lib/` (`format`, `types`, `pagination`); one `ServiceSummary` type matches `Website::PublicProps#service_card_props`.

**Website languages (English + Arabic):** English has no URL prefix (`/services`); Arabic is `/ar/services`. `LocalePrefix` (`app/middleware/`) moves the prefix into `SCRIPT_NAME`, so `config/routes.rb` and every Rails URL helper/redirect stay as written and keep the visitor's language; `Website::Localized` sets `I18n.locale` and shares the `locale` prop (`code`, `dir`, switcher links); `<html lang dir>` comes from it. On the client, `WebsiteShell` calls `setBaseUrl("/ar")` so the generated `@/routes` helpers carry the prefix, and provides Radix's direction. Use the `useI18n()` hook (`website/lib/i18n.ts`) for every user-visible string: `t("English text")` (the English text is the key; `{name}` placeholders), `tp(count, "{n} service", "{n} services")` for plurals, `msg("…")` for strings in module-level tables (translate where shown: `t(LABELS[x])`), and `formatMoney/formatDate/formatDuration…` for numbers and dates (business time zone, so SSR and hydration agree). Arabic text lives in `website/locales/ar.json`; `npm run i18n:check` (part of `bin/ci`) fails on a missing entry, an unused one, or mismatched placeholders. Staff-written links go through `SmartLink` (adds `/ar`). Use logical utilities (`ms-`/`ps-`/`start-`/`text-start`, `rtl:` variants for icons) and `dir="auto"` on CMS text; server-side messages (flash, checkout errors, mails) are in `config/locales/website.{en,ar}.yml` (`t("website.flash.…")`), and content comes from the `*Translation` tables with English fallback. No page may use a language code as its slug.

**Website browser specs:** `spec/system/website/` drives headless Chrome (`on_a_phone`, `pick_option` for Radix selects, `horizontal_overflow?` in `spec/support/website_system_helpers.rb`) and runs axe-core on key pages in both languages. Add a spec there when you change the booking flow, filters, navigation or a language-specific behavior.

**Page titles:** pages pass only their own part to `SeoHead`/`SiteLayout` (`title="Our services"`); the Inertia title template appends "— Auto Atelier" (`titleFor` in `shared/lib/inertia.ts`) unless the title already names the brand. `allow_browser` applies to the admin only.

**Cross-app links:** admin uses an Inertia version of `admin-<digest>`, so any Inertia visit or redirect that crosses apps gets a 409 and a full page load into the right bundle. Still, prefer a plain `<a href>` for links to the other app, so the extra request is skipped.

**Feature structure:** keep pages thin. They read Inertia props and compose feature components. Domain UI and logic go in `<app>/features/<feature>/` (`components/`, `hooks/`, `types.ts`, `utils.ts`), and generic app chrome goes in `<app>/components/`.

**State:** server data comes from Inertia props, forms use Inertia `Form`/`useForm`, and local UI state uses `useState`. Filters, sorting and pagination belong in URL query params plus `router.get`, handled by Rails. Don't add Redux, React Query or axios data fetching. Add Zustand only for genuinely complex shared client state.

**shadcn/ui:** primitives live in `app/javascript/shared/components/ui/`. `components.json` aliases point to `@/shared/...`, so `npx shadcn add <component>` installs there. They're excluded from ESLint and Prettier as vendored code.

## Production notes

`config/environments/production.rb` sets `assume_ssl` and `force_ssl` (the `/up` health check is exempt): TLS is terminated by the proxy in front of the app, and Rails marks cookies `Secure`, sends HSTS and builds `https://` URLs. SMTP is intentionally not configured (portfolio project), and `config/deploy.yml` is still the Kamal template.

## Conventions

**Translatable fields live in a separate table, never as columns on the base model.** When a model has fields that need multi-language support, don't add those columns directly to the model's table. Instead create a `<Model>Translation` model/table (e.g. `ProductTranslation` for `Product`) holding the translatable columns plus a foreign key back to the base model and a standard `language_id` foreign key to a `Language` model. `Language` is a real model/table (id, code, name, etc.) — never a plain string or enum column. Use plain Rails conventions: `belongs_to :language`, column `language_id`.

## Admin UI standards

Build new admin screens from these pieces (all in `app/javascript/admin/`) instead of introducing new variants.

**Forms.** Every create/edit form renders `<FormLayout>` (`components/form-layout.tsx`): sticky toolbar, Cancel (ghost) then Save (primary) on the right, language tabs on the left when multilingual. Build the body from `FormSection`, `TextField`, `TextareaField`, `SwitchField`, `SelectField` and `SlugField` in `components/form-fields.tsx`; mark required fields with `required` (red `*`). Width is `3xl` by default, `4xl` for long text, `full` only when a map or preview needs it. Submit with `SUBMIT_OPTIONS` and read errors with `formErrors(form)` (`lib/forms.ts`), never a cast.

**Multilingual forms use language tabs, always.** `useLanguageTabs(languages, errors)` owns the current language, error dots, the base "must include a name in English" error (shown on the default tab) and auto-switching to the first tab with errors. Translated fields live in a `TranslatedSection` (title "… · Language"); everything shared by all languages goes in `FormSection shared`. Keep translations in form state as `Record<languageId, {...}>` (`lib/translations.ts`), set `dir`/`lang` on inputs with `textDirection`, and add `SeoSection` for SEO text. Backend: use `Admin::ContentTranslations` (`content_translations_props`, `assign_content_translations`, `content_errors`); the model calls `requires_default_translation`. A language is removed only when all its fields are blank.

**Lists.** `PageHeader` → `ListFilters` (never a hand-rolled search form; `showStatus={false}` when the record has no active flag, `statusLabels={PUBLISHED_LABELS}` for website content) → `ResourceTable` (`filtered={hasFilters(filters)}`) → `Pagination`. The first column's name links to the record's main page, so there is no separate pencil column.

**Record workflows.** Operational records (bookings, services, cities, customers…): list → show → edit, Delete on the show page. Website content (pages, blog, components, FAQs, payment methods): list → edit, Delete in the edit header. Detail pages show a *labeled* `ActivationSwitch` (`label="Active"`) and translations via `TranslationsCard`.

**Wording and badges.** "Published/Draft" for website content, "Active/Disabled" for everything else. Status badges are outline + icon + tint (see `BookingStatusBadge`). Use `pluralize()` instead of "(s)", and `ReorderButtons`/`moveItem` for editable lists.
