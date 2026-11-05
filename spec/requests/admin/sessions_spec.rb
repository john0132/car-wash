# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Admin sessions", type: :request do
  fixtures :users

  describe "GET /admin/sign_in" do
    it "renders the admin sign in page" do
      get admin_sign_in_path

      expect(response).to have_http_status(:success)
      expect_inertia.to render_component("admin/sessions/new")
    end

    it "redirects signed-in users to the admin dashboard" do
      sign_in users(:admin)
      get admin_sign_in_path
      expect(response).to redirect_to(admin_root_path)
    end

    it "shows the form to signed-in customers so they can switch to a staff account" do
      sign_in users(:one)
      get admin_sign_in_path

      expect(response).to have_http_status(:success)
      expect_inertia.to render_component("admin/sessions/new")
    end
  end

  describe "POST /admin/sign_in" do
    it "replaces a signed-in customer's session with the staff session" do
      sign_in users(:one)

      expect {
        post admin_sign_in_path, params: { email: users(:admin).email, password: "Secret1*3*5*" }
      }.not_to change(Session, :count)

      expect(response).to redirect_to(admin_root_path)
      expect(users(:one).sessions.reload).to be_empty
    end

    it "signs staff in" do
      post admin_sign_in_path, params: { email: users(:employee).email, password: "Secret1*3*5*" }

      expect(response).to redirect_to(admin_root_path)
      expect(cookies[:session_token]).to be_present
    end

    it "rejects customers without creating a session" do
      expect {
        post admin_sign_in_path, params: { email: users(:one).email, password: "Secret1*3*5*" }
      }.not_to change(Session, :count)

      expect(response).to redirect_to(admin_sign_in_path)
      expect(flash[:alert]).to eq("That email or password is incorrect")
    end

    it "rejects disabled staff" do
      users(:employee).update!(is_active: false)

      expect {
        post admin_sign_in_path, params: { email: users(:employee).email, password: "Secret1*3*5*" }
      }.not_to change(Session, :count)
      expect(flash[:alert]).to eq("Your account has been disabled")
    end

    it "rejects invalid credentials" do
      post admin_sign_in_path, params: { email: users(:admin).email, password: "wrongpassword" }
      expect(response).to redirect_to(admin_sign_in_path)
    end
  end

  describe "DELETE /admin/sign_out" do
    it "signs out and returns to the admin sign in" do
      sign_in users(:admin)

      expect { delete admin_sign_out_path }.to change(Session, :count).by(-1)
      expect(response).to redirect_to(admin_sign_in_path)
    end
  end
end
