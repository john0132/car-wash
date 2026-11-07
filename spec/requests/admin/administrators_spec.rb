# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Admin administrators", type: :request do
  fixtures :users

  let(:admin) { users(:admin) }
  let(:support) { Role.create!(name: "Support") }
  let(:other_admin) do
    User.create!(name: "Sara", email: "sara@example.com", password: "a-very-long-password", role: :admin)
  end

  before { sign_in admin }

  describe "GET /admin/administrators" do
    it "lists administrators with their roles" do
      grant(admin, "admins.read")
      other_admin.roles << support

      get admin_administrators_path

      expect_inertia.to render_component("admin/administrators/index")
      row = inertia.props[:administrators].find { _1[:id] == other_admin.id }
      expect(row[:roles]).to eq([ { "id" => support.id, "name" => "Support" } ])
      expect(inertia.props[:administrators].pluck(:id)).not_to include(users(:employee).id)
    end
  end

  describe "GET /admin/administrators/:id" do
    it "shows roles and effective permissions" do
      grant(admin, "admins.read")
      support.permissions << Permission.find_or_create_by!(resource: "customers", action: "read")
      other_admin.roles << support

      get admin_administrator_path(other_admin)

      expect(inertia.props[:roles].first).to include(name: "Support", permissions: [ "customers.read" ])
      expect(inertia.props[:permissions]).to eq([ "customers.read" ])
    end
  end

  describe "POST /admin/administrators" do
    let(:params) do
      { user: { name: "Omar", last_name: "Hassan", email: "omar@example.com", password: "a-very-long-password",
                password_confirmation: "a-very-long-password", is_active: true, role_ids: [ support.id ] } }
    end

    it "creates an administrator with roles" do
      grant(admin, "admins.create")

      expect { post admin_administrators_path, params: params }.to change(User.admin, :count).by(1)

      created = User.find_by!(email: "omar@example.com")
      expect(created.roles).to eq([ support ])
      expect(response).to redirect_to(admin_administrator_path(created))
    end

    it "returns validation errors" do
      grant(admin, "admins.create")
      post admin_administrators_path, params: { user: params[:user].merge(password: "short", password_confirmation: "short") }

      expect(response).to redirect_to(new_admin_administrator_path)
      expect(session[:inertia_errors]).to include(:password)
    end

    it "is forbidden without admins.create" do
      grant(admin, "admins.read")
      expect { post admin_administrators_path, params: params }.not_to change(User, :count)
    end
  end

  describe "PATCH /admin/administrators/:id" do
    before { grant(admin, "admins.update") }

    it "updates profile and roles, keeping the password when left blank" do
      digest = other_admin.password_digest
      patch admin_administrator_path(other_admin),
        params: { user: { name: "Sarah", email: other_admin.email, password: "", role_ids: [ support.id ] } }

      other_admin.reload
      expect(other_admin.name).to eq("Sarah")
      expect(other_admin.roles).to eq([ support ])
      expect(other_admin.password_digest).to eq(digest)
    end

    it "does not save role changes when the rest of the update is invalid" do
      patch admin_administrator_path(other_admin), params: { user: { email: "", role_ids: [ support.id ] } }

      expect(response).to redirect_to(edit_admin_administrator_path(other_admin))
      expect(other_admin.reload.roles).to be_empty
    end

    it "ignores status and role changes on your own account" do
      own_roles = admin.role_ids
      patch admin_administrator_path(admin), params: { user: { name: "Me", is_active: false, role_ids: [] } }

      admin.reload
      expect(admin.name).to eq("Me")
      expect(admin.is_active).to be(true)
      expect(admin.role_ids).to match_array(own_roles)
    end
  end

  describe "PATCH /admin/administrators/:id/activation" do
    it "cannot disable yourself" do
      grant(admin, "admins.update")
      patch activation_admin_administrator_path(admin), params: { is_active: false }

      expect(admin.reload.is_active).to be(true)
      expect(flash[:alert]).to eq("You are not authorized to perform this action")
    end
  end

  describe "DELETE /admin/administrators/:id" do
    before { grant(admin, "admins.delete") }

    it "deletes another administrator" do
      other_admin
      expect { delete admin_administrator_path(other_admin) }.to change(User, :count).by(-1)
      expect(response).to redirect_to(admin_administrators_path)
    end

    it "cannot delete yourself" do
      expect { delete admin_administrator_path(admin) }.not_to change(User, :count)
    end
  end

  describe "privilege escalation" do
    let(:super_admin) do
      User.create!(name: "Root", email: "root@example.com", password: "a-very-long-password", role: :admin)
        .tap { _1.roles << Role.super_admin! }
    end

    it "does not let a non-Super Admin assign the Super Admin role" do
      grant(admin, "admins.update")
      other_admin

      patch admin_administrator_path(other_admin), params: { user: { role_ids: [ Role.super_admin!.id ] } }

      expect(other_admin.reload.roles).to be_empty
    end

    it "does not let an admin hand out roles with permissions they lack" do
      grant(admin, "admins.update")
      stronger = Role.create!(name: "Stronger")
      stronger.permissions << Permission.find_or_create_by!(resource: "roles", action: "delete")

      patch admin_administrator_path(other_admin), params: { user: { role_ids: [ stronger.id ] } }

      expect(other_admin.reload.roles).to be_empty
    end

    it "lets an admin hand out roles made of permissions they hold" do
      grant(admin, "admins.update", "customers.read")
      support.permissions << Permission.find_or_create_by!(resource: "customers", action: "read")

      patch admin_administrator_path(other_admin), params: { user: { role_ids: [ support.id ] } }

      expect(other_admin.reload.roles).to eq([ support ])
    end

    it "does not let a non-Super Admin edit a Super Admin account" do
      grant(admin, "admins.update")

      patch admin_administrator_path(super_admin), params: { user: { password: "brand-new-password-1", password_confirmation: "brand-new-password-1" } }

      expect(super_admin.reload.authenticate("brand-new-password-1")).to be(false)
    end

    it "does not let a non-Super Admin delete a Super Admin account" do
      grant(admin, "admins.delete")
      super_admin

      expect { delete admin_administrator_path(super_admin) }.not_to change(User, :count)
    end

    context "when the other admin holds permissions the signed-in admin lacks" do
      before do
        grant(admin, "admins.read", "admins.update", "admins.delete")
        grant(other_admin, "roles.delete")
      end

      it "does not let them reset that admin's email or password" do
        patch admin_administrator_path(other_admin), params: {
          user: { email: "taken-over@example.com", password: "brand-new-password-1", password_confirmation: "brand-new-password-1" }
        }

        other_admin.reload
        expect(other_admin.email).to eq("sara@example.com")
        expect(other_admin.authenticate("brand-new-password-1")).to be(false)
      end

      it "does not let them disable or delete that admin" do
        patch activation_admin_administrator_path(other_admin), params: { is_active: false }
        expect(other_admin.reload).to be_is_active

        expect { delete admin_administrator_path(other_admin) }.not_to change(User, :count)
      end

      it "offers no actions on that admin in the dashboard" do
        get admin_administrator_path(other_admin)
        expect(inertia.props[:abilities]).to include(update: false, destroy: false, manage_access: false)

        get admin_administrators_path
        row = inertia.props[:administrators].find { _1[:id] == other_admin.id }
        expect(row[:can_manage_access]).to be(false)
      end
    end

    it "lets an admin manage an admin whose permissions they all hold" do
      grant(admin, "admins.read", "admins.update", "admins.delete", "customers.read")
      grant(other_admin, "customers.read")

      patch admin_administrator_path(other_admin), params: { user: { name: "Sarah" } }
      expect(other_admin.reload.name).to eq("Sarah")

      get admin_administrator_path(other_admin)
      expect(inertia.props[:abilities]).to include(update: true, destroy: true, manage_access: true)
    end

    it "lets a Super Admin assign the Super Admin role" do
      sign_in super_admin

      patch admin_administrator_path(other_admin), params: { user: { role_ids: [ Role.super_admin!.id ] } }

      expect(other_admin.reload).to be_super_admin
    end
  end
end
