# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Admin dashboard", type: :request do
  fixtures :users

  describe "GET /admin" do
    it "redirects signed-out visitors to the admin sign in" do
      get admin_root_path
      expect(response).to redirect_to(admin_sign_in_path)
    end

    it "keeps customers out of the admin area" do
      sign_in users(:one)
      get admin_root_path
      expect(response).to redirect_to(root_path)
      expect(flash[:alert]).to eq("You are not authorized to access the admin area")
    end

    %i[admin employee].each do |role|
      it "renders the admin dashboard for #{role}s with the admin layout" do
        sign_in users(role)
        get admin_root_path

        expect(response).to have_http_status(:success)
        expect_inertia.to render_component("admin/dashboard/index")
        expect_inertia.to have_props(admin: { permissions: [] })
        expect(response.body).to match(%r{assets/admin-[\w-]+\.js})
        expect(response.body).not_to match(%r{assets/website-[\w-]+\.js})
      end
    end

    it "shares the permissions granted by the admin's roles" do
      users(:admin).roles << Role.super_admin!
      sign_in users(:admin)
      get admin_root_path

      expect_inertia.to have_props(admin: { permissions: users(:admin).permission_names })
      expect(users(:admin).permission_names).to include("customers.read", "admins.delete")
    end

    it "forces a full reload when a website client visits an admin page" do
      sign_in users(:admin)
      get admin_root_path, headers: { "X-Inertia" => "true", "X-Inertia-Version" => InertiaRails.configuration.version.to_s }

      expect(response).to have_http_status(:conflict)
    end
  end
end
