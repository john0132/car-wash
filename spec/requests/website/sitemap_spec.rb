# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Sitemap and robots", type: :request do
  before { english }

  it "lists the public pages in each language with alternates" do
    Language.find_or_create_by!(code: "ar") { |l| l.name = "العربية" }
    service = create_service("Full Wash")
    create_service("Hidden", is_active: false)

    get "/sitemap.xml"

    expect(response).to have_http_status(:success)
    expect(response.media_type).to eq("application/xml")
    body = response.body
    expect(body).to include("<loc>http://www.example.com/services/#{service.slug}</loc>")
    expect(body).to include("<loc>http://www.example.com/ar/services/#{service.slug}</loc>")
    expect(body).to include('hreflang="ar" href="http://www.example.com/ar/services/' + service.slug + '"')
    expect(body).to include("<loc>http://www.example.com/</loc>").and include("<loc>http://www.example.com/ar</loc>")
    expect(body).not_to include("hidden")
  end

  it "keeps private areas out of search and points to the sitemap" do
    get "/robots.txt"

    expect(response).to have_http_status(:success)
    expect(response.media_type).to eq("text/plain")
    expect(response.body).to include("Disallow: /admin").and include("Disallow: /ar/profile")
    expect(response.body).to include("Sitemap: http://www.example.com/sitemap.xml")
  end
end
