# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Website error pages", type: :request do
  before { english }

  it "renders the branded not-found page for an unknown record" do
    get service_path("nope")

    expect(response).to have_http_status(:not_found)
    expect_inertia.to render_component("website/errors/show")
    expect(inertia.props[:status]).to eq(404)
  end

  it "keeps the visitor's language on the not-found page" do
    Language.find_or_create_by!(code: "ar") { |l| l.name = "العربية" }

    get "/ar/services/nope"

    expect(response).to have_http_status(:not_found)
    expect(response.body).to include('<html lang="ar" dir="rtl">')
    expect(inertia.props[:locale][:code]).to eq("ar")
  end

  # Rails calls `config.exceptions_app` from ShowExceptions, which sits above the
  # cookie and session middleware, so the page has to render without them.
  describe "exceptions_app" do
    # The page payload Inertia embeds in the HTML. Asserting on it (not on the
    # rendered text) keeps these specs independent of server-side rendering,
    # which needs the Vite dev server or a built SSR bundle.
    def inertia_page(html)
      JSON.parse(html[%r{<script data-page="app" type="application/json">(.*?)</script>}m, 1])
    end

    # The env the real middleware stack hands over (key generator, cookie settings…).
    def failed_request(path, original, **env)
      env = Rack::MockRequest.env_for(path, "action_dispatch.original_path" => original, **env)
      Rails.application.config.exceptions_app.call(env.merge(Rails.application.env_config))
    end

    it "renders the branded page for a missing route, in the visitor's language" do
      Language.find_or_create_by!(code: "ar") { |l| l.name = "العربية" }
      status, _headers, body = failed_request("/404", "/ar/missing", LocalePrefix::ENV_KEY => "ar")
      html = body.each.to_a.join

      expect(status).to eq(404)
      page = inertia_page(html)

      expect(html).to include('<html lang="ar" dir="rtl">')
      expect(page["component"]).to eq("website/errors/show")
      expect(page["props"]).to include("status" => 404, "locale" => include("code" => "ar", "dir" => "rtl"))
    end

    it "renders the branded page for a server error" do
      status, _headers, body = failed_request("/500", "/services")

      expect(status).to eq(500)
      page = inertia_page(body.each.to_a.join)

      expect(page["component"]).to eq("website/errors/show")
      expect(page["props"]).to include("status" => 500)
    end

    it "leaves the dashboard with the plain static page" do
      status, _headers, body = failed_request("/404", "/admin/nope")

      expect(status).to eq(404)
      expect(body.each.to_a.join).to include("Page not found (404)")
    end
  end
end
