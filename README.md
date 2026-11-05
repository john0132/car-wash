# Car Wash

Rails + Inertia.js + React application.

## Stack

- [Ruby on Rails](https://rubyonrails.org) 8.1 on Ruby 4.0 (version pinned in `.ruby-version`)
- [Inertia Rails](https://inertia-rails.dev) with [React](https://react.dev) 19 + TypeScript, built with [Vite](https://vite.dev)
- [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) components
- PostgreSQL
- RSpec for tests, [Kamal](https://kamal-deploy.org) for deployment
- User authentication (sign up, log in, password reset, settings)

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
- `app/javascript/pages/` — React page components (Inertia pages)
- `app/javascript/components/` — shared React components (`ui/` holds shadcn/ui components)
- `app/javascript/layouts/` — app and auth layouts

## Common commands

```bash
bundle exec rspec        # Ruby tests
npm run check            # TypeScript type check
npm run lint             # ESLint
npm run format:fix       # Prettier
bin/rails db:migrate     # run migrations
```

## Server-side rendering (optional)

SSR is set up but turned off. To enable it, set `config.ssr_enabled = true` in
`config/initializers/inertia_rails.rb`. For production images, also build with the
`SSR_ENABLED=true` build arg (via `builder.args` in `config/deploy.yml`, or
`docker build --build-arg SSR_ENABLED=true -t car-wash .`).

## Credits

Based on the [Inertia Rails React Starter Kit](https://github.com/inertia-rails/react-starter-kit)
by Evil Martians (MIT License, see `LICENSE`).
