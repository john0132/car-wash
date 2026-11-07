# frozen_string_literal: true

Rails.application.routes.draw do
  # Where Rails sends failed requests (config.exceptions_app = routes). Declared first so the
  # catch-all page slug below never shadows them.
  match "/404", to: "website/errors#show", via: :all
  match "/422", to: "website/errors#show", via: :all
  match "/500", to: "website/errors#show", via: :all

  # Health check for kamal-proxy: 200 if the app boots with no exceptions, otherwise 500.
  # Declared before the website's catch-all page slug, which would otherwise answer /up with a 404.
  get "up" => "rails/health#show", as: :rails_health_check

  get "/sitemap.xml", to: "website/sitemaps#show", as: :sitemap, defaults: { format: :xml }
  get "/robots.txt", to: "website/sitemaps#robots", as: :robots, defaults: { format: :text }

  # Admin dashboard — Admin::* controllers, rendered by the `admin.tsx` entrypoint.
  namespace :admin do
    get    "sign_in",  to: "sessions#new", as: :sign_in
    post   "sign_in",  to: "sessions#create"
    delete "sign_out", to: "sessions#destroy", as: :sign_out

    concern :activatable do
      patch :activation, on: :member
    end

    resources :customers, only: %i[index show], concerns: :activatable
    resources :cars, only: :index
    resources :bookings, only: %i[index show edit update]
    resources :memberships, except: :destroy, concerns: :activatable
    resources :service_categories, concerns: :activatable
    resources :services, concerns: :activatable
    resources :extras, concerns: :activatable
    resources :payment_methods, except: %i[show destroy], concerns: :activatable
    resources :payment_transactions, only: %i[index show]
    resources :administrators, concerns: :activatable
    resources :employees, concerns: :activatable
    resources :roles
    resources :cities, concerns: :activatable
    resources :areas, concerns: :activatable
    resources :pages, except: :show, concerns: :activatable
    resources :blogs, except: :show, concerns: :activatable
    resources :components, except: :show, concerns: :activatable
    resources :faqs, except: :show, concerns: :activatable
    resources :contact_messages, only: %i[index show destroy]
    resource :header_navigation, only: %i[edit update], controller: "header_items"
    resource :footer, only: %i[edit update]
    resources :direct_uploads, only: :create

    root "dashboard#index"
  end

  # Public website — Website::* controllers, rendered by the `website.tsx` entrypoint.
  # `scope module:` keeps URLs and route helper names unchanged.
  scope module: :website do
    get  "sign_in", to: "sessions#new", as: :sign_in
    post "sign_in", to: "sessions#create"
    get  "sign_up", to: "users#new", as: :sign_up
    post "sign_up", to: "users#create"

    resources :sessions, only: [ :destroy ]
    resource :users, only: [ :destroy ]

    namespace :identity do
      resource :password_reset,     only: [ :new, :edit, :create, :update ]
    end

    resource :profile, only: %i[show update]
    resource :password, only: :update

    # Customer account area: each is a tab of the profile sidebar.
    namespace :profile do
      resources :bookings, only: :index
      resources :addresses, only: %i[index create update destroy]
      resources :cars, only: %i[index create update destroy]
    end

    # Booking: one service (+ extras) checked out straight from its page, then
    # the booking's own page, which doubles as the thank-you page.
    resource :checkout, only: %i[show create]
    resources :bookings, only: :show

    resources :faqs, only: :index
    resource :contact, only: %i[show create]
    resources :blogs, only: %i[index show], param: :slug
    resources :services, only: %i[index show], param: :slug
    resources :service_categories, only: :show, param: :slug, path: "categories"

    root "home#index"

    # Any other active Page by slug (see Website::PagesController and the
    # admin-side Page/PageSection/Component CMS). Kept last so it never
    # shadows the named routes above.
    get ":slug", to: "pages#show", as: :page, constraints: { slug: Page::SLUG_SEGMENT }
  end

  # ActiveStorage's own direct-upload endpoint is open to anyone; send it through
  # the staff-only controller instead. App routes match before the engine's.
  post "/rails/active_storage/direct_uploads", to: "admin/direct_uploads#create"
end
