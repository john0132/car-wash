# frozen_string_literal: true

Rails.application.routes.draw do
  # Admin dashboard — Admin::* controllers, rendered by the `admin.tsx` entrypoint.
  namespace :admin do
    get    "sign_in",  to: "sessions#new", as: :sign_in
    post   "sign_in",  to: "sessions#create"
    delete "sign_out", to: "sessions#destroy", as: :sign_out

    concern :activatable do
      patch :activation, on: :member
    end

    resources :customers, only: %i[index show], concerns: :activatable
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
      resources :cars, only: :index
    end

    resources :faqs, only: :index
    resources :blogs, only: %i[index show], param: :slug
    resources :services, only: :show, param: :slug
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

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  get "up" => "rails/health#show", as: :rails_health_check
end
