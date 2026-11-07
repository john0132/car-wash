# Car Wash

Rails + Inertia.js + React application.

## Stack

- [Ruby on Rails](https://rubyonrails.org) 8.1 on Ruby 4.0 (version pinned in `.ruby-version`)
- [Inertia Rails](https://inertia-rails.dev) with [React](https://react.dev) 19 + TypeScript, built with [Vite](https://vite.dev)
- [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) components
- PostgreSQL
- RSpec for tests, [Kamal](https://kamal-deploy.org) for deployment
- User authentication (sign up, log in, password reset, profile)

## Requirements

- Ruby (see `.ruby-version`), installed via [mise](https://mise.jdx.dev)
- Node.js (see `.node-version`)
- PostgreSQL running locally, with a role matching your system user:
  ```bash
  sudo -u postgres createuser --superuser "$USER"
  ```

## Setup

```bash
bin/setup --skip-server   # install gems + npm packages, create & migrate the database
bin/dev                   # start Rails (port 3000) + Vite dev server
```

Open http://localhost:3000.

## Databases

| Environment | Database               |
|-------------|------------------------|
| development | `car_wash_development` |
| test        | `car_wash_test`        |
| production  | `car_wash_production` (+ `_cache`, `_queue`, `_cable`), user `car_wash`, password from `CAR_WASH_DATABASE_PASSWORD` |

## Where things live

- `app/controllers/` — Rails controllers; render pages with `render inertia: "page/name", props: { ... }`
- `app/controllers/admin/`, `app/controllers/website/` — the staff dashboard and the public site/customer account
- `app/javascript/admin/` — dashboard app (`pages/`, `layouts/`, `components/`, `features/`, `hooks/`, `lib/`)
- `app/javascript/website/` — public website app, server-rendered, same structure
- `app/javascript/shared/` — domain-free code used by both (`components/ui/` holds shadcn/ui)
- `app/javascript/entrypoints/` — one Vite entrypoint per app
- `app/javascript/routes/` — generated from `config/routes.rb`; never edit by hand

Tests (`*.test.ts[x]`) sit next to the code they cover.

## Common commands

```bash
bundle exec rspec        # Ruby tests
npm run check            # TypeScript type check
npm test                 # Vitest (frontend unit/component tests)
npm run lint             # ESLint
npm run format:fix       # Prettier
bin/rails db:migrate     # run migrations
```

## Server-side rendering

SSR is enabled by default (`config.ssr_enabled = true` in
`config/initializers/inertia_rails.rb`, and `SSR_ENABLED=true` in the
`Dockerfile`/`config/deploy.yml` build args). To disable it, set
`config.ssr_enabled = false` and build production images without the
`SSR_ENABLED=true` build arg (or with `SSR_ENABLED=false`).

## Credits

Based on the [Inertia Rails React Starter Kit](https://github.com/inertia-rails/react-starter-kit)
by Evil Martians (MIT License, see `LICENSE`).
