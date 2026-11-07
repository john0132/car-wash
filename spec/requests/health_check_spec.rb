# frozen_string_literal: true

require "rails_helper"

# kamal-proxy only sends traffic to a new release once /up answers 200.
RSpec.describe "Health check", type: :request do
  it "answers /up with 200, not the website's catch-all page route" do
    get "/up"

    expect(response).to have_http_status(:ok)
  end
end
