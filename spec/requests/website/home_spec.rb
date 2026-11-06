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
end
