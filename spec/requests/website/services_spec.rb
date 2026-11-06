# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Website services", type: :request do
  before do
    english
    arabic
  end

  let(:category) { create_service_category("Exterior") }

  it "lists active services grouped by active category" do
    create_service("Wax", service_category: category, price: 80)
    create_service("Hidden", service_category: category, price: 80, is_active: false)
    create_service("Off", service_category: create_service_category("Off", is_active: false))
    create_service_category("Empty")

    get services_path

    expect_inertia.to render_component("website/services/index")
    expect(inertia.props[:categories].pluck(:name)).to eq([ "Exterior" ])
    expect(inertia.props[:categories].first[:services].pluck(:name)).to eq([ "Wax" ])
  end

  it "renders an active service with its title, description and duration" do
    service = create_service("Exterior Wash", service_category: category, price: 150, duration_minutes: 45)
    service.service_translations.first.update!(title: "A careful hand wash", description: "Two paragraphs.")

    get service_path(service.slug)

    expect_inertia.to render_component("website/services/show")
    expect(inertia.props[:service]).to include(name: "Exterior Wash", title: "A careful hand wash",
                                               description: "Two paragraphs.", duration_minutes: 45, category: "Exterior")
  end

  it "lists other active services in the same category" do
    service = create_service("Exterior Wash", service_category: category, price: 150)
    create_service("Wax", service_category: category, price: 80)
    create_service("Hidden", service_category: category, price: 80, is_active: false)

    get service_path(service.slug)

    expect(inertia.props[:related].pluck(:name)).to eq([ "Wax" ])
  end

  it "does not load extras until asked, then pages through active ones" do
    service = create_service("Exterior Wash", service_category: category, price: 150)
    7.times { |i| create_extra("Extra #{i}", price: 10 + i) }
    create_extra("Hidden", is_active: false)

    get service_path(service.slug)
    expect(inertia.props).not_to have_key(:extras)

    get service_path(service.slug, extras_page: 2), headers: {
      "X-Inertia" => "true", "X-Inertia-Version" => InertiaRails.configuration.version.to_s, "X-Inertia-Partial-Component" => "website/services/show", "X-Inertia-Partial-Data" => "extras"
    }
    extras = response.parsed_body["props"]["extras"]
    expect(extras).to include("page" => 2, "pages" => 2, "total" => 7)
    expect(extras["items"].size).to eq(2)
  end

  it "404s for a disabled service" do
    service = create_service("Gone", service_category: category, price: 10, is_active: false)

    get service_path(service.slug)

    expect(response).to have_http_status(:not_found)
  end
end
