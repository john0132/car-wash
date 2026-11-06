# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Website pages", type: :request do
  it "renders an active page by slug" do
    page = create_page(slug: "about-us", title: "About us")
    hero = create_component(key: "hero")
    page.page_sections.build(component: hero, position: 0).assign_values(
      settings: {},
      content_by_language: { english.id => { "heading" => "About us" } }
    )
    page.save!

    get page_path(slug: "about-us")

    expect(response).to have_http_status(:success)
    expect_inertia.to render_component("website/pages/show")
    expect(inertia.props[:page][:slug]).to eq("about-us")
    expect(inertia.props[:page][:sections].first[:component]).to eq("hero")
  end

  it "404s for an inactive page" do
    create_page(slug: "draft-page", is_active: false)

    get page_path(slug: "draft-page")

    expect(response).to have_http_status(:not_found)
  end

  it "404s for a slug with no matching page" do
    get page_path(slug: "does-not-exist")

    expect(response).to have_http_status(:not_found)
  end

  it "doesn't shadow the root route or the other named website routes" do
    get root_path
    expect_inertia.to render_component("website/home/index")

    get sign_in_path
    expect(response).to have_http_status(:success)
  end
end
