# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Admin services", type: :request do
  fixtures :users

  let(:admin) { users(:admin) }
  let(:category) { create_service_category("Exterior") }

  before do
    english
    arabic
    sign_in admin
  end

  def translations(en:, ar: "", **seo)
    { english.id.to_s => { name: en, **seo }, arabic.id.to_s => { name: ar } }
  end

  def book(service)
    user = User.create!(name: "Jane", email: "jane-#{SecureRandom.hex(3)}@example.com", password: "a-very-long-password")
    Booking.create!(user: user).booking_items.create!(itemable: service, quantity: 1, price: service.price)
  end

  describe "title, description and duration" do
    it "stores them and exposes them in the props" do
      grant(admin, "services.create", "services.read")

      post admin_services_path, params: {
        service: { service_category_id: category.id, price: "100", duration_minutes: "45",
                   translations: translations(en: "Wash", ar: "غسيل", title: "The full wash", description: "Inside and out.") }
      }

      service = Service.last
      expect(service.duration_minutes).to eq(45)
      expect(service.translated(:title)).to eq("The full wash")

      get admin_service_path(service)
      expect(inertia.props[:service]).to include(duration_minutes: 45)
      expect(inertia.props[:service][:translations].first).to include(title: "The full wash", description: "Inside and out.")
    end

    it "rejects a non-positive duration" do
      grant(admin, "services.create")

      expect {
        post admin_services_path, params: { service: { service_category_id: category.id, price: "100", duration_minutes: "0", translations: translations(en: "Wash") } }
      }.not_to change(Service, :count)
    end
  end

  describe "slug" do
    it "is generated from the name when blank, and can be set explicitly" do
      grant(admin, "services.create")

      post admin_services_path, params: { service: { service_category_id: category.id, price: "100", translations: translations(en: "Full Wash") } }
      post admin_services_path, params: { service: { service_category_id: category.id, price: "100", slug: "Custom-Slug", translations: translations(en: "Full Wash") } }

      expect(Service.order(:id).pluck(:slug)).to eq(%w[full-wash custom-slug])
    end

    it "rejects a duplicate slug" do
      grant(admin, "services.create")
      create_service("Wash", service_category: category)

      expect {
        post admin_services_path, params: { service: { service_category_id: category.id, price: "100", slug: "wash", translations: translations(en: "Other") } }
      }.not_to change(Service, :count)
    end
  end

  describe "GET /admin/services" do
    it "lists services filtered by name, category and status" do
      grant(admin, "services.read")
      interior = create_service_category("Interior")
      create_service("Exterior Wash", service_category: category, price: 150)
      create_service("Interior Detailing", service_category: interior, price: 300, is_active: false)

      get admin_services_path

      expect_inertia.to render_component("admin/services/index")
      expect(inertia.props[:services].pluck(:name)).to eq([ "Exterior Wash", "Interior Detailing" ])
      expect(inertia.props[:services].first).to include(price: 150.0, sale_price: nil,
                                                        service_category: { id: category.id, name: "Exterior" })
      expect(inertia.props[:categories].pluck(:name)).to eq(%w[Exterior Interior])

      get admin_services_path, params: { q: "detail" }
      expect(inertia.props[:services].pluck(:name)).to eq([ "Interior Detailing" ])

      get admin_services_path, params: { service_category_id: category.id }
      expect(inertia.props[:services].pluck(:name)).to eq([ "Exterior Wash" ])
      expect(inertia.props[:filters]).to include(service_category_id: category.id)

      get admin_services_path, params: { status: "inactive" }
      expect(inertia.props[:services].pluck(:name)).to eq([ "Interior Detailing" ])
    end

    it "is forbidden without services.read" do
      get admin_services_path

      expect(response).to redirect_to(admin_root_path)
    end
  end

  describe "GET /admin/services/:id" do
    it "shows the service with how many bookings it is on" do
      grant(admin, "services.read")
      service = create_service(service_category: category)
      book(service)

      get admin_service_path(service)

      expect_inertia.to render_component("admin/services/show")
      expect(inertia.props[:service]).to include(id: service.id, bookings_count: 1)
    end
  end

  describe "GET /admin/services/new" do
    it "preselects the category from the query" do
      grant(admin, "services.create")

      get new_admin_service_path(service_category_id: category.id)

      expect_inertia.to render_component("admin/services/new")
      expect(inertia.props[:service_category_id]).to eq(category.id)
      expect(inertia.props[:translations].pluck(:code)).to eq(%w[en ar])
    end
  end

  describe "POST /admin/services" do
    before { grant(admin, "services.create") }

    it "creates a service with prices, translations and SEO text" do
      post admin_services_path, params: {
        service: {
          service_category_id: category.id, price: "400", sale_price: "350", is_active: true,
          translations: translations(en: "Full Wash", ar: "غسيل كامل", seo_description: "Inside and out")
        }
      }

      service = Service.last
      expect(response).to redirect_to(admin_service_path(service))
      expect(service).to have_attributes(service_category: category, price: 400, sale_price: 350)
      expect(service.service_translations.map(&:name)).to contain_exactly("Full Wash", "غسيل كامل")
      expect(service.translation(:en).seo_description).to eq("Inside and out")
    end

    it "treats a blank sale price as no sale" do
      post admin_services_path, params: {
        service: { service_category_id: category.id, price: "150", sale_price: "", translations: translations(en: "Wash") }
      }

      expect(Service.last.sale_price).to be_nil
    end

    it "rejects a sale price that isn't below the price" do
      expect {
        post admin_services_path, params: {
          service: { service_category_id: category.id, price: "100", sale_price: "100", translations: translations(en: "Wash") }
        }
      }.not_to change(Service, :count)

      expect(response).to redirect_to(new_admin_service_path(service_category_id: category.id))
      expect(session[:inertia_errors]).to include(:sale_price)
    end

    it "requires a category and an English name" do
      expect {
        post admin_services_path, params: { service: { price: "100", translations: translations(en: "") } }
      }.not_to change(Service, :count)

      expect(session[:inertia_errors]).to include(:service_category, :translations)
    end
  end

  describe "homepage display and image" do
    let(:service) { create_service(service_category: category) }

    it "defaults to hidden, with no image" do
      grant(admin, "services.update")

      get edit_admin_service_path(service)

      expect(inertia.props[:service]).to include(display_in_home_page: false, image: nil)
    end

    it "creates a service shown on the homepage with an image" do
      grant(admin, "services.create")
      blob = uploaded_blob

      post admin_services_path, params: {
        service: { service_category_id: category.id, price: "100", display_in_home_page: true,
                   image: blob.signed_id, translations: translations(en: "Full Wash") }
      }

      created = Service.last
      expect(created.display_in_home_page).to be(true)
      expect(created.image.blob).to eq(blob)
    end

    it "replaces, keeps and removes the image" do
      grant(admin, "services.update")
      old_blob = uploaded_blob
      service.image.attach(old_blob)
      new_blob = uploaded_blob
      params = ->(image) { { service: { price: "100", display_in_home_page: true, image: image } } }

      patch admin_service_path(service), params: params.(old_blob.signed_id)
      expect(service.reload.image.blob).to eq(old_blob)
      expect(service.display_in_home_page).to be(true)

      patch admin_service_path(service), params: params.(new_blob.signed_id)
      expect(service.reload.image.blob).to eq(new_blob)

      patch admin_service_path(service), params: params.("")
      expect(service.reload.image).not_to be_attached
    end

    it "leaves the image alone when the form doesn't send one" do
      grant(admin, "services.update")
      service.image.attach(uploaded_blob)

      patch admin_service_path(service), params: { service: { price: "120" } }

      expect(service.reload.image).to be_attached
    end
  end

  describe "PATCH /admin/services/:id" do
    it "updates prices, moves the service and clears the sale price" do
      grant(admin, "services.update")
      interior = create_service_category("Interior")
      service = create_service(service_category: category, price: 200, sale_price: 150)

      patch admin_service_path(service), params: {
        service: { service_category_id: interior.id, price: "250", sale_price: "", translations: translations(en: "Deluxe") }
      }

      expect(response).to redirect_to(admin_service_path(service))
      expect(service.reload).to have_attributes(service_category: interior, price: 250, sale_price: nil)
      expect(service.translation(:en).name).to eq("Deluxe")
    end

    it "rejects a language with text but no name instead of dropping its text" do
      grant(admin, "services.update")
      service = create_service("Wash", service_category: category)
      service.service_translations.create!(language: arabic, name: "غسيل", seo_title: "غسيل السيارات")

      patch admin_service_path(service), params: {
        service: { translations: { english.id.to_s => { name: "Wash" }, arabic.id.to_s => { name: "", seo_title: "غسيل السيارات" } } }
      }

      expect(response).to redirect_to(edit_admin_service_path(service))
      expect(session[:inertia_errors]).to include(:"translations.#{arabic.id}.name")
      expect(service.translation(:ar).reload.seo_title).to eq("غسيل السيارات")
    end

    it "is forbidden without services.update" do
      grant(admin, "services.read")
      service = create_service(service_category: category, price: 200)

      patch admin_service_path(service), params: { service: { price: "1" } }

      expect(service.reload.price).to eq(200)
    end
  end

  describe "PATCH /admin/services/:id/activation" do
    it "disables the service" do
      grant(admin, "services.update")
      service = create_service(service_category: category)

      patch activation_admin_service_path(service), params: { is_active: false }

      expect(service.reload).not_to be_is_active
    end
  end

  describe "DELETE /admin/services/:id" do
    before { grant(admin, "services.delete") }

    it "deletes a service that was never booked and returns to its category" do
      service = create_service(service_category: category)

      delete admin_service_path(service)

      expect(response).to redirect_to(admin_service_category_path(category))
      expect(Service.exists?(service.id)).to be(false)
    end

    it "refuses to delete a booked service" do
      service = create_service(service_category: category)
      book(service)

      delete admin_service_path(service)

      expect(Service.exists?(service.id)).to be(true)
      expect(flash[:alert]).to match(/booking items/i)
    end
  end
end
