# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Admin extras", type: :request do
  fixtures :users

  let(:admin) { users(:admin) }

  before do
    english
    arabic
    sign_in admin
  end

  def translations(en:, ar: "")
    { english.id.to_s => { name: en }, arabic.id.to_s => { name: ar } }
  end

  describe "GET /admin/extras" do
    it "lists extras, filtered by name and status" do
      grant(admin, "extras.read")
      create_extra("Air Freshener")
      create_extra("Wax", is_active: false)

      get admin_extras_path

      expect_inertia.to render_component("admin/extras/index")
      expect(inertia.props[:extras].pluck(:name)).to eq([ "Air Freshener", "Wax" ])

      get admin_extras_path, params: { q: "wax" }
      expect(inertia.props[:extras].pluck(:name)).to eq([ "Wax" ])

      get admin_extras_path, params: { status: "active" }
      expect(inertia.props[:extras].pluck(:name)).to eq([ "Air Freshener" ])
    end

    it "is forbidden without extras.read" do
      get admin_extras_path

      expect(response).to redirect_to(admin_root_path)
      expect(flash[:alert]).to eq("You are not authorized to perform this action")
    end
  end

  describe "GET /admin/extras/:id" do
    it "shows the extra with its bookings count" do
      grant(admin, "extras.read")
      extra = create_extra

      get admin_extra_path(extra)

      expect_inertia.to render_component("admin/extras/show")
      expect(inertia.props[:extra]).to include(id: extra.id, bookings_count: 0)
    end
  end

  describe "GET /admin/extras/new" do
    it "offers one blank translation per language, the default one first" do
      grant(admin, "extras.create")

      get new_admin_extra_path

      expect_inertia.to render_component("admin/extras/new")
      expect(inertia.props[:translations].pluck(:code, :default, :name)).to eq([ [ "en", true, "" ], [ "ar", false, "" ] ])
    end
  end

  describe "POST /admin/extras" do
    it "creates an extra with its translations" do
      grant(admin, "extras.create")

      post admin_extras_path, params: { extra: { price: 20, is_active: true, translations: translations(en: "Air Freshener", ar: "معطر") } }

      extra = Extra.last
      expect(response).to redirect_to(admin_extra_path(extra))
      expect(extra.price).to eq(20)
      expect(extra.extra_translations.map(&:name)).to contain_exactly("Air Freshener", "معطر")
    end

    it "requires an English name" do
      grant(admin, "extras.create")

      expect {
        post admin_extras_path, params: { extra: { price: 20, translations: translations(en: "", ar: "معطر") } }
      }.not_to change(Extra, :count)

      expect(response).to redirect_to(new_admin_extra_path)
      expect(session[:inertia_errors]).to include(:translations)
    end

    it "is forbidden without extras.create" do
      grant(admin, "extras.read")

      expect {
        post admin_extras_path, params: { extra: { price: 20, translations: translations(en: "Air Freshener") } }
      }.not_to change(Extra, :count)
    end
  end

  describe "PATCH /admin/extras/:id" do
    it "updates the price and name" do
      grant(admin, "extras.update")
      extra = create_extra("Air Freshener", price: 20)

      patch admin_extra_path(extra), params: { extra: { price: 35, is_active: false, translations: translations(en: "Premium Air Freshener") } }

      expect(response).to redirect_to(admin_extra_path(extra))
      extra.reload
      expect(extra.price).to eq(35)
      expect(extra).not_to be_is_active
      expect(extra.extra_translations.map(&:name)).to eq([ "Premium Air Freshener" ])
    end
  end

  describe "PATCH /admin/extras/:id/activation" do
    it "disables the extra" do
      grant(admin, "extras.update")
      extra = create_extra

      patch activation_admin_extra_path(extra), params: { is_active: false }

      expect(extra.reload).not_to be_is_active
    end
  end

  describe "DELETE /admin/extras/:id" do
    before { grant(admin, "extras.delete") }

    it "deletes an extra that isn't on any booking" do
      extra = create_extra

      delete admin_extra_path(extra)

      expect(response).to redirect_to(admin_extras_path)
      expect(Extra.exists?(extra.id)).to be(false)
    end
  end
end
