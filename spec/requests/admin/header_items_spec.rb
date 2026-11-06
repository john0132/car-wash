# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Admin header navigation", type: :request do
  fixtures :users

  let(:admin) { users(:admin) }

  before do
    english
    arabic
    sign_in admin
  end

  def entry(label: "Services", **attrs)
    { link_type: "url", url: "/services", is_active: true,
      translations: { english.id.to_s => { label: label }, arabic.id.to_s => { label: "" } } }.merge(attrs)
  end

  describe "GET /admin/header_navigation/edit" do
    it "renders the links in order with the link options" do
      grant(admin, "header_items.read")
      create_header_item(label: "Second", position: 1)
      create_header_item(label: "First", position: 0)
      create_page(slug: "about-us")

      get edit_admin_header_navigation_path

      expect_inertia.to render_component("admin/header_items/edit")
      expect(inertia.props[:items].map { |i| i[:translations][english.id.to_s.to_sym][:label] }).to eq(%w[First Second])
      expect(inertia.props[:options][:pages].pluck(:slug)).to eq([ "about-us" ])
      expect(inertia.props[:options][:routes]).to eq(%w[home sign_in sign_up faqs services blogs contact])
    end

    it "is forbidden without header_items.read" do
      get edit_admin_header_navigation_path

      expect(response).to redirect_to(admin_root_path)
      expect(flash[:alert]).to eq("You are not authorized to perform this action")
    end
  end

  describe "PATCH /admin/header_navigation" do
    before { grant(admin, "header_items.read", "header_items.update") }

    it "creates links in the submitted order" do
      patch admin_header_navigation_path, params: { header: { items: [ entry(label: "One"), entry(label: "Two", url: "https://example.com") ] } }, as: :json

      expect(response).to redirect_to(edit_admin_header_navigation_path)
      expect(HeaderItem.ordered.map { |i| i.translated(:label) }).to eq(%w[One Two])
      expect(HeaderItem.ordered.map(&:position)).to eq([ 0, 1 ])
    end

    it "saves nested links, moving and deleting against the submitted tree" do
      category = create_service_category("Exterior")
      old = create_header_item(label: "Old", position: 0)
      moved = create_header_item(label: "Moved", parent: old)

      patch admin_header_navigation_path, as: :json, params: { header: { items: [
        entry(label: "Services", children: [
          entry(label: "Exterior", link_type: "service_category", service_category_id: category.id, url: nil,
                children: [ entry(id: moved.id, label: "Moved") ])
        ])
      ] } }

      expect(response).to redirect_to(edit_admin_header_navigation_path)
      expect(HeaderItem.exists?(old.id)).to be(false)
      services = HeaderItem.top_level.sole
      exterior = services.children.sole
      expect(exterior.service_category).to eq(category)
      expect(exterior.children).to eq([ moved.reload ])
    end

    it "reports errors on nested links by their path" do
      patch admin_header_navigation_path, as: :json, params: { header: { items: [
        entry(children: [ entry(url: "javascript:alert(1)") ])
      ] } }

      expect(response).to redirect_to(edit_admin_header_navigation_path)
      expect(HeaderItem.count).to eq(0)
      follow_redirect!
      expect(inertia.props[:errors]).to include("items.0.children.0.url")
      expect(inertia.props[:errors]).not_to include("items.0.url")
    end

    it "updates, reorders and removes links against what was submitted" do
      keep = create_header_item(label: "Keep", position: 0)
      drop = create_header_item(label: "Drop", url: "/drop", position: 1)

      patch admin_header_navigation_path, as: :json, params: { header: { items: [
        entry(label: "New"), entry(id: keep.id, label: "Kept")
      ] } }

      expect(HeaderItem.exists?(drop.id)).to be(false)
      expect(HeaderItem.ordered.map { |i| i.translated(:label) }).to eq(%w[New Kept])
      expect(keep.reload.position).to eq(1)
    end

    it "points a link at a page" do
      about = create_page(slug: "about-us")

      patch admin_header_navigation_path, as: :json, params: { header: { items: [ entry(link_type: "page", page_id: about.id, url: "") ] } }

      expect(HeaderItem.first.href).to eq("/about-us")
    end

    it "rejects invalid links with errors keyed by position and language, saving nothing" do
      patch admin_header_navigation_path, as: :json, params: { header: { items: [
        entry(label: "Fine"), entry(label: "", url: "javascript:x")
      ] } }

      expect(response).to redirect_to(edit_admin_header_navigation_path)
      expect(HeaderItem.count).to eq(0)
      follow_redirect!
      errors = inertia.props[:errors]
      expect(errors).to include("items.1.url", "items.1.translations")
      expect(errors).not_to include("items.0.url")
    end

    it "removes every link when none are submitted" do
      create_header_item

      patch admin_header_navigation_path, params: { header: { items: [] } }, as: :json

      expect(HeaderItem.count).to eq(0)
    end

    it "is forbidden without header_items.update" do
      Role.destroy_all
      admin.roles.clear
      grant(admin, "header_items.read")

      patch admin_header_navigation_path, params: { header: { items: [ entry ] } }, as: :json

      expect(HeaderItem.count).to eq(0)
      expect(flash[:alert]).to eq("You are not authorized to perform this action")
    end
  end
end
