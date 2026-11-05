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
    resources :administrators, concerns: :activatable
    resources :employees, concerns: :activatable

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
      resource :email_verification, only: [ :show, :create ]
      resource :password_reset,     only: [ :new, :edit, :create, :update ]
    end

    namespace :settings do
      resource :profile, only: [ :show, :update ]
      resource :password, only: [ :show, :update ]
      resource :email, only: [ :show, :update ]
      resources :sessions, only: [ :index ]
      inertia :appearance
    end

    root "home#index"
  end

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  get "up" => "rails/health#show", as: :rails_health_check
end
