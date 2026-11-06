# frozen_string_literal: true

require "rails_helper"

RSpec.describe HeaderItem, type: :model do
  it "is valid with a target and a default-language label" do
    expect(create_header_item).to be_valid
  end

  it "requires a label in the default language" do
    english
    item = HeaderItem.new(link_type: "url", url: "/services")

    expect(item).not_to be_valid
    expect(item.errors[:translations]).to eq([ "must include a label in English" ])
  end

  describe "link targets" do
    it "requires a page for page links and resolves to its path" do
      expect(HeaderItem.new(link_type: "page").tap(&:valid?).errors[:page]).to be_present

      about = create_page(slug: "about-us")
      item = create_header_item(link_type: "page", page: about)
      expect(item.href).to eq("/about-us")
      expect(item).not_to be_external
    end

    it "links the home page to the root path" do
      item = create_header_item(link_type: "page", page: create_page(slug: "home"))
      expect(item.href).to eq("/")
    end

    it "follows the page when its slug changes and hides while the page is disabled" do
      about = create_page(slug: "about-us")
      item = create_header_item(link_type: "page", page: about)

      about.update!(slug: "who-we-are")
      expect(item.reload.href).to eq("/who-we-are")

      about.update!(is_active: false)
      expect(item.reload.href).to be_nil
    end

    it "only allows known app routes" do
      expect(HeaderItem.new(link_type: "route", route_key: "admin").tap(&:valid?).errors[:route_key]).to be_present

      item = create_header_item(link_type: "route", route_key: "sign_up")
      expect(item.href).to eq("/sign_up")
    end

    it "requires a valid url for url links and flags external ones" do
      expect(HeaderItem.new(link_type: "url").tap(&:valid?).errors[:url]).to be_present
      expect(HeaderItem.new(link_type: "url", url: "javascript:alert(1)").tap(&:valid?).errors[:url]).to be_present

      expect(create_header_item(url: "https://example.com")).to be_external
      expect(create_header_item(url: "/#services")).not_to be_external
      expect(create_header_item(url: "tel:+20100000000").href).to eq("tel:+20100000000")
    end

    it "clears targets that don't belong to the link type" do
      item = create_header_item(link_type: "route", route_key: "home", url: "/stale")
      expect(item.url).to be_nil
    end
  end

  it "is removed with its page" do
    about = create_page(slug: "about-us")
    create_header_item(link_type: "page", page: about)

    expect { about.destroy! }.to change(HeaderItem, :count).by(-1)
  end

  describe "service links" do
    it "links a category and a service by slug, hiding them while disabled" do
      category = create_service_category("Exterior")
      service = create_service("Full Wash", service_category: category)
      category_item = create_header_item(link_type: "service_category", service_category: category)
      service_item = create_header_item(link_type: "service", service: service)

      expect(category_item.href).to eq("/categories/#{category.slug}")
      expect(service_item.href).to eq("/services/#{service.slug}")

      category.update!(is_active: false)
      expect(category_item.reload.href).to be_nil
      expect(service_item.reload.href).to be_nil
    end

    it "requires the chosen target" do
      expect(HeaderItem.new(link_type: "service_category").tap(&:valid?).errors[:service_category]).to be_present
      expect(HeaderItem.new(link_type: "service").tap(&:valid?).errors[:service]).to be_present
    end

    it "is removed with its category" do
      category = create_service_category
      create_header_item(link_type: "service_category", service_category: category)

      expect { category.destroy! }.to change(HeaderItem, :count).by(-1)
    end
  end

  describe "nesting" do
    it "nests to any depth and removes descendants with their parent" do
      root = create_header_item(label: "Root")
      child = create_header_item(label: "Child", parent: root)
      create_header_item(label: "Grandchild", parent: child)

      expect(root.children).to eq([ child ])
      expect { root.destroy! }.to change(HeaderItem, :count).by(-3)
    end

    it "can't be its own parent or sit under a descendant" do
      root = create_header_item
      child = create_header_item(parent: root)

      expect(root.tap { |r| r.parent = r }).not_to be_valid
      expect(root.tap { |r| r.parent = child }).not_to be_valid
    end
  end
end
