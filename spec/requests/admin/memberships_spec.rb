# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Admin memberships", type: :request do
  fixtures :users

  let(:admin) { users(:admin) }
  let!(:english) { Language.find_or_create_by!(code: "en") { _1.name = "English" } }
  let!(:arabic) { Language.find_or_create_by!(code: "ar") { _1.name = "Arabic" } }
  let!(:gold) { create_membership("Gold", egp_to_points: 1.5, points_to_egp: 0.15) }

  let(:valid_params) do
    {
      membership: {
        is_active: true, egp_to_points: "2", points_to_egp: "0.2",
        background_color: "#111111", text_color: "#FFFFFF",
        translations: {
          english.id.to_s => { name: "Platinum", description: "Top tier" },
          arabic.id.to_s => { name: "", description: "" }
        }
      }
    }
  end

  describe "GET /admin/memberships" do
    it "lists tiers with customer counts" do
      users(:one).update!(membership: gold)
      grant(admin, "memberships.read")
      sign_in admin

      get admin_memberships_path

      expect_inertia.to render_component("admin/memberships/index")
      expect(inertia.props[:memberships].first).to include(id: gold.id, name: "Gold", customers_count: 1)
      expect(inertia.props[:stats]).to include(total: 1, members: 1)
    end

    it "is forbidden without memberships.read" do
      sign_in admin
      get admin_memberships_path

      expect(response).to redirect_to(admin_root_path)
    end
  end

  describe "GET /admin/memberships/:id" do
    it "shows the tier, its translations and members" do
      users(:one).update!(membership: gold)
      grant(admin, "memberships.read")
      sign_in admin

      get admin_membership_path(gold)

      expect_inertia.to render_component("admin/memberships/show")
      expect(inertia.props[:translations].pluck(:code)).to eq(%w[en ar])
      expect(inertia.props[:stats]).to include(customers_count: 1)
      expect(inertia.props[:customers].pluck(:id)).to eq([ users(:one).id ])
    end
  end

  describe "POST /admin/memberships" do
    it "creates the tier with only the filled-in translations" do
      grant(admin, "memberships.create")
      sign_in admin

      expect { post admin_memberships_path, params: valid_params }.to change(Membership, :count).by(1)

      membership = Membership.order(:id).last
      expect(response).to redirect_to(admin_membership_path(membership))
      expect(membership.membership_translations.map(&:name)).to eq([ "Platinum" ])
    end

    it "requires an English name" do
      grant(admin, "memberships.create")
      sign_in admin
      valid_params[:membership][:translations][english.id.to_s][:name] = ""
      valid_params[:membership][:translations][arabic.id.to_s][:name] = "بلاتيني"

      expect { post admin_memberships_path, params: valid_params }.not_to change(Membership, :count)
      expect(response).to redirect_to(new_admin_membership_path)
      expect(session[:inertia_errors]).to include(translations: [ "must include a name in English" ])
    end

    it "keys a translation's own errors by language" do
      grant(admin, "memberships.create")
      sign_in admin
      # A description without a name keeps the Arabic translation, which then needs a name.
      valid_params[:membership][:translations][arabic.id.to_s][:description] = "أعلى فئة"

      expect { post admin_memberships_path, params: valid_params }.not_to change(Membership, :count)
      expect(session[:inertia_errors]).to include(:"translations.#{arabic.id}.name")
    end

    it "is forbidden without memberships.create" do
      grant(admin, "memberships.read")
      sign_in admin

      expect { post admin_memberships_path, params: valid_params }.not_to change(Membership, :count)
    end
  end

  describe "PATCH /admin/memberships/:id" do
    it "updates attributes and translations, removing blanked ones" do
      gold.membership_translations.create!(language: arabic, name: "ذهبي")
      grant(admin, "memberships.update")
      sign_in admin
      params = valid_params
      params[:membership][:translations][english.id.to_s][:name] = "Gold+"

      patch admin_membership_path(gold), params: params

      expect(response).to redirect_to(admin_membership_path(gold))
      expect(gold.reload.egp_to_points).to eq(2)
      expect(gold.membership_translations.reload.map(&:name)).to eq([ "Gold+" ])
    end

    it "keeps existing data when validation fails" do
      grant(admin, "memberships.update")
      sign_in admin
      params = valid_params
      params[:membership][:egp_to_points] = "0"

      patch admin_membership_path(gold), params: params

      expect(response).to redirect_to(edit_admin_membership_path(gold))
      expect(gold.reload.egp_to_points).to eq(1.5)
    end
  end

  describe "PATCH /admin/memberships/:id/activation" do
    it "disables the tier" do
      grant(admin, "memberships.update")
      sign_in admin

      patch activation_admin_membership_path(gold), params: { is_active: false }

      expect(gold.reload).not_to be_is_active
    end
  end
end
