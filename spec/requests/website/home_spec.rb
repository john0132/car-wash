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
end
