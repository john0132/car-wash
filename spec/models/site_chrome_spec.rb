# frozen_string_literal: true

require "rails_helper"

RSpec.describe SiteChrome do
  around do |example|
    store = ActiveSupport::Cache::MemoryStore.new
    original = Rails.cache
    Rails.cache = store
    example.run
  ensure
    Rails.cache = original
  end

  before { english }

  it "is empty with nothing configured" do
    expect(SiteChrome.props).to eq(header: { items: [] }, footer: nil)
  end

  it "lists active header links in order with their address" do
    create_header_item(label: "Second", url: "/second", position: 1)
    create_header_item(label: "First", url: "https://example.com", position: 0)
    create_header_item(label: "Hidden", url: "/hidden", position: 2, is_active: false)
    create_header_item(label: "Gone", link_type: "page", page: create_page(is_active: false), position: 3)

    items = SiteChrome.props[:header][:items]
    expect(items.pluck(:label)).to eq(%w[First Second])
    expect(items.first).to include(href: "https://example.com", external: true)
  end

  it "nests header links under their parent, hiding children of hidden parents" do
    services = create_header_item(label: "Services", position: 0)
    category = create_service_category("Exterior")
    category_item = create_header_item(label: "Exterior", link_type: "service_category", service_category: category, parent: services)
    create_header_item(label: "Full Wash", link_type: "service", service: create_service("Full Wash", service_category: category), parent: category_item)
    hidden = create_header_item(label: "More", position: 1, is_active: false)
    create_header_item(label: "Orphan", parent: hidden)

    items = SiteChrome.props[:header][:items]
    expect(items.pluck(:label)).to eq(%w[Services])
    expect(items.first[:children].pluck(:label)).to eq(%w[Exterior])
    expect(items.first[:children].first[:children].pluck(:label, :href)).to eq([ [ "Full Wash", "/services/full-wash" ] ])
  end

  it "builds the footer from its columns, links and socials" do
    footer = Footer.instance
    footer.footer_translations.create!(language: english, title: "Atelier", description: "Care")
    footer.footer_social_links.create!(name: "Instagram", url: "https://instagram.com/x", position: 1)
    footer.footer_social_links.create!(name: "Hidden", url: "https://x.test", is_active: false)
    column = create_footer_column(footer: footer, title: "Company")
    create_footer_item(column: column, label: "About", url: "/about")
    create_footer_column(footer: footer, title: "Off", is_active: false)

    props = SiteChrome.props[:footer]
    expect(props).to include(title: "Atelier", description: "Care", image: nil)
    expect(props[:socials].pluck(:name)).to eq([ "Instagram" ])
    expect(props[:columns].pluck(:title)).to eq([ "Company" ])
    expect(props[:columns].first[:items]).to eq([ { id: column.footer_items.first.id, label: "About", href: "/about", external: false } ])
  end

  it "falls back per field to the default language" do
    item = create_header_item(label: "Services")
    expect(SiteChrome.props(:ar)[:header][:items].first[:label]).to eq("Services")

    item.header_item_translations.create!(language: arabic, label: "الخدمات")
    expect(SiteChrome.props(:ar)[:header][:items].first[:label]).to eq("الخدمات")
    expect(SiteChrome.props(:en)[:header][:items].first[:label]).to eq("Services")
  end

  describe "caching" do
    it "reflects edits, deletions and page changes" do
      about = create_page(slug: "about-us")
      item = create_header_item(link_type: "page", page: about)
      expect(SiteChrome.props[:header][:items].first[:href]).to eq("/about-us")

      about.update!(slug: "who-we-are")
      expect(SiteChrome.props[:header][:items].first[:href]).to eq("/who-we-are")

      travel(1.minute) { item.header_item_translations.first.update!(label: "Renamed") }
      expect(SiteChrome.props[:header][:items].first[:label]).to eq("Renamed")

      item.destroy!
      expect(SiteChrome.props[:header][:items]).to be_empty
    end

    it "reflects footer edits made deep inside" do
      footer_item = create_footer_item(label: "About")
      expect(SiteChrome.props[:footer][:columns].first[:items].first[:label]).to eq("About")

      travel(1.minute) { footer_item.footer_item_translations.first.update!(label: "About us") }
      expect(SiteChrome.props[:footer][:columns].first[:items].first[:label]).to eq("About us")
    end
  end
end
