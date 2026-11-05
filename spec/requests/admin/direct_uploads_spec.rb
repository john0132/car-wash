# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Admin direct uploads", type: :request do
  fixtures :users

  let(:admin) { users(:admin) }
  let(:blob_params) do
    { blob: { filename: "car.png", byte_size: 1024, checksum: Digest::MD5.base64digest("x"), content_type: "image/png" } }
  end

  [ "/admin/direct_uploads", "/rails/active_storage/direct_uploads" ].each do |path|
    describe "POST #{path}" do
      it "creates a blob for staff who can edit content" do
        grant(admin, "pages.update")
        sign_in admin

        expect { post path, params: blob_params, as: :json }.to change(ActiveStorage::Blob, :count).by(1)
        expect(response).to have_http_status(:ok)
        expect(response.parsed_body).to include("signed_id", "url", "direct_upload")
      end

      it "is forbidden without a content permission" do
        grant(admin, "cities.update")
        sign_in admin

        expect { post path, params: blob_params, as: :json }.not_to change(ActiveStorage::Blob, :count)
        expect(response).to have_http_status(:forbidden)
      end

      it "is forbidden when signed out" do
        post path, params: blob_params, as: :json
        expect(response).to have_http_status(:forbidden)
      end
    end
  end

  it "only accepts images up to 10 MB" do
    grant(admin, "blogs.create")
    sign_in admin

    post "/admin/direct_uploads", as: :json, params: { blob: blob_params[:blob].merge(content_type: "image/svg+xml") }
    expect(response).to have_http_status(:unprocessable_content)

    post "/admin/direct_uploads", as: :json, params: { blob: blob_params[:blob].merge(byte_size: 11.megabytes) }
    expect(response).to have_http_status(:unprocessable_content)
  end
end
