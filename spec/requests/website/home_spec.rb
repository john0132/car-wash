# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Website home", type: :request do
  it "renders the website home page with the website layout" do
    get root_path

    expect(response).to have_http_status(:success)
    expect_inertia.to render_component("website/home/index")
    expect(response.body).to match(%r{assets/website-[\w-]+\.js})
    expect(response.body).not_to match(%r{assets/admin-[\w-]+\.js})
  end

  it "does not block older browsers from the public site" do
    old_safari = "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 " \
                 "(KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1"

    get root_path, headers: { "User-Agent" => old_safari }

    expect(response).to have_http_status(:success)
  end

  it "shares the header and footer content with every website page" do
    english
    create_header_item(label: "Services", url: "/#services")
    create_footer_item(label: "About", url: "/about")

    get root_path

    site = inertia.props[:site]
    expect(site[:header][:items].pluck(:label)).to eq([ "Services" ])
    expect(site[:footer][:columns].first[:items].pluck(:label)).to eq([ "About" ])

    get sign_in_path
    expect(inertia.props[:site][:header][:items].pluck(:label)).to eq([ "Services" ])
  end

  describe "homepage services and categories" do
    before { english }

    it "returns nothing when nothing is flagged" do
      create_service

      get root_path

      expect(inertia.props[:home_services]).to eq([])
      expect(inertia.props[:home_categories]).to eq([])
    end

    it "defaults new records to not displayed" do
      expect(create_service.display_in_home_page).to be(false)
      expect(create_service_category.display_in_home_page).to be(false)
    end

    it "returns only flagged, active services in active categories, with their image" do
      category = create_service_category("Exterior", display_in_home_page: false)
      shown = create_service("Full Wash", service_category: category, display_in_home_page: true, price: 400, sale_price: 350)
      shown.image.attach(uploaded_blob)
      create_service("Hidden", service_category: category)
      create_service("Disabled", service_category: category, display_in_home_page: true, is_active: false)
      create_service("In disabled category", display_in_home_page: true,
                     service_category: create_service_category("Old", is_active: false))

      get root_path

      expect(inertia.props[:home_services]).to match([
        a_hash_including(id: shown.id, name: "Full Wash", price: 400.0, sale_price: 350.0, category: "Exterior",
                         image: { url: a_string_matching(%r{\A/rails/active_storage/blobs/}) })
      ])
      expect(inertia.props[:home_categories]).to eq([])
    end

    it "returns only flagged, active categories, independent of their services" do
      shown = create_service_category("Interior", display_in_home_page: true)
      create_service("Vacuum", service_category: shown)
      create_service("Old vacuum", service_category: shown, is_active: false)
      create_service_category("Hidden")
      create_service_category("Disabled", display_in_home_page: true, is_active: false)

      get root_path

      expect(inertia.props[:home_categories])
        .to match([ a_hash_including(id: shown.id, name: "Interior", services_count: 1, image: nil) ])
      expect(inertia.props[:home_services]).to eq([])
    end

    it "drops a record on the next request once its flag is turned off" do
      category = create_service_category("Interior", display_in_home_page: true)

      get root_path
      expect(inertia.props[:home_categories].pluck(:id)).to eq([ category.id ])

      category.update!(display_in_home_page: false)

      get root_path
      expect(inertia.props[:home_categories]).to eq([])
    end

    it "avoids N+1 queries as the number of featured records grows" do
      count_queries = lambda do
        get root_path # warm the site-chrome caches that creating records invalidates
        queries = 0
        counter = ->(*, payload) { queries += 1 unless payload[:name] == "SCHEMA" || payload[:cached] }
        ActiveSupport::Notifications.subscribed(counter, "sql.active_record") { get root_path }
        queries
      end
      feature = lambda do |name|
        create_service(name, service_category: create_service_category("#{name} cat", display_in_home_page: true),
                             display_in_home_page: true).tap { |s| s.image.attach(uploaded_blob) }
      end

      2.times { |i| feature.("A#{i}") }
      with_two = count_queries.call
      2.times { |i| feature.("B#{i}") }
      with_four = count_queries.call
      4.times { |i| feature.("C#{i}") }
      with_eight = count_queries.call

      expect(with_four).to eq(with_two)
      expect(with_eight).to eq(with_two)
    end
  end
end
