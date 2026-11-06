# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Website service categories", type: :request do
  before do
    english
    arabic
  end

  let(:category) { create_service_category("Exterior") }

  def partial_get(path, params = {})
    get path, params: params, headers: {
      "X-Inertia" => "true", "X-Inertia-Version" => InertiaRails.configuration.version.to_s,
      "X-Inertia-Partial-Component" => "website/service_categories/show",
      "X-Inertia-Partial-Data" => "services,pagination,filters"
    }
    response.parsed_body["props"]
  end

  def count_queries(&block)
    count = 0
    counter = ->(*, payload) { count += 1 unless %w[SCHEMA TRANSACTION].include?(payload[:name]) || payload[:cached] }
    ActiveSupport::Notifications.subscribed(counter, "sql.active_record", &block)
    count
  end

  it "renders the category with its active services only" do
    create_service("Wax", service_category: category, price: 80)
    create_service("Hidden", service_category: category, price: 80, is_active: false)
    create_service("Other category", service_category: create_service_category("Interior"))

    get service_category_path(category.slug)

    expect_inertia.to render_component("website/service_categories/show")
    expect(inertia.props[:category]).to include(name: "Exterior", slug: category.slug)
    expect(inertia.props[:services].pluck(:name)).to eq([ "Wax" ])
    expect(inertia.props[:pagination]).to include(page: 1, pages: 1, total: 1)
  end

  it "404s for a disabled or unknown category" do
    category.update!(is_active: false)

    get service_category_path(category.slug)
    expect(response).to have_http_status(:not_found)

    get service_category_path("nope")
    expect(response).to have_http_status(:not_found)
  end

  it "paginates" do
    11.times { |i| create_service("Service #{format('%02d', i)}", service_category: category, price: 10 + i) }

    get service_category_path(category.slug)
    expect(inertia.props[:services].size).to eq(9)
    expect(inertia.props[:pagination]).to include(page: 1, pages: 2, total: 11, per_page: 9)

    get service_category_path(category.slug, page: 2)
    expect(inertia.props[:services].pluck(:name)).to eq([ "Service 09", "Service 10" ])

    get service_category_path(category.slug, page: 99)
    expect(inertia.props[:pagination][:page]).to eq(2)
  end

  describe "search and filters" do
    before do
      create_service("Quick Rinse", service_category: category, price: 50, duration_minutes: 20)
      create_service("Full Wash", service_category: category, price: 400, sale_price: 350, duration_minutes: 120)
      create_service("Wax", service_category: category, price: 200, duration_minutes: 60)
    end

    def names(params)
      get service_category_path(category.slug), params: params
      inertia.props[:services].pluck(:name)
    end

    it "searches by name, in any language" do
      Service.find_by!(slug: "wax").service_translations.create!(language: arabic, name: "تلميع")

      expect(names(q: "wash")).to eq([ "Full Wash" ])
      expect(names(q: "تلميع")).to eq([ "Wax" ])
      expect(names(q: "100%")).to eq([])
    end

    it "filters by effective price (sale price when set)" do
      expect(names(min_price: 300)).to eq([ "Full Wash" ])
      expect(names(max_price: 100)).to eq([ "Quick Rinse" ])
      expect(names(min_price: 100, max_price: 250)).to eq([ "Wax" ])
    end

    it "filters by duration and sale" do
      expect(names(max_duration: 60)).to eq([ "Quick Rinse", "Wax" ])
      expect(names(max_duration: 45)).to eq([ "Full Wash", "Quick Rinse", "Wax" ]) # not an offered step: ignored
      expect(names(on_sale: "1")).to eq([ "Full Wash" ])
    end

    it "sorts" do
      expect(names(sort: "price_asc")).to eq([ "Quick Rinse", "Wax", "Full Wash" ])
      expect(names(sort: "price_desc")).to eq([ "Full Wash", "Wax", "Quick Rinse" ])
      expect(names(sort: "bogus")).to eq([ "Full Wash", "Quick Rinse", "Wax" ])
    end

    it "ignores junk values" do
      expect(names(min_price: "abc", max_price: "-5", max_duration: "x")).to eq([ "Full Wash", "Quick Rinse", "Wax" ])
    end

    it "reports the sanitised filters and the unfiltered facets" do
      get service_category_path(category.slug), params: { q: " wax ", sort: "price_asc" }

      expect(inertia.props[:filters]).to include(q: "wax", sort: "price_asc", on_sale: false)
      expect(inertia.props[:facets]).to include(min_price: 50, max_price: 350, on_sale_count: 1)
    end
  end

  describe "database work" do
    it "does not grow with the number of services (no N+1)" do
      2.times { |i| create_service("Few #{i}", service_category: category) }
      few = count_queries { get service_category_path(category.slug) }

      7.times { |i| create_service("Many #{i}", service_category: category) }
      many = count_queries { get service_category_path(category.slug) }

      expect(many).to eq(few)
    end

    it "skips the category and facet queries on a filter reload, and the page query when empty" do
      create_service("Wax", service_category: category)

      full = count_queries { get service_category_path(category.slug) }
      partial = count_queries { partial_get(service_category_path(category.slug), q: "wax") }
      empty = count_queries { partial_get(service_category_path(category.slug), q: "zzz") }

      expect(partial).to be < full
      expect(empty).to be < partial
    end

    it "returns only services, pagination and filters on a partial reload" do
      create_service("Wax", service_category: category)

      props = partial_get(service_category_path(category.slug), q: "wax")

      expect(props.keys - [ "errors" ]).to contain_exactly("services", "pagination", "filters")
    end
  end
end
