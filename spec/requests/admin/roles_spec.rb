# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Admin roles", type: :request do
  fixtures :users

  let(:admin) { users(:admin) }

  before { sign_in admin }

  def create_role(name, *keys, **attrs)
    Role.create!(name: name, **attrs).tap { |role| role.update!(permission_keys: keys) }
  end

  describe "GET /admin/roles" do
    it "lists roles with permission and administrator counts, filtered by name" do
      grant(admin, "roles.read")
      editor = create_role("Editor", "pages.read", "pages.update", description: "Edits pages")
      editor.users << admin
      create_role("Support", "customers.read")

      get admin_roles_path

      expect_inertia.to render_component("admin/roles/index")
      row = inertia.props[:roles].find { _1[:name] == "Editor" }
      expect(row).to include(description: "Edits pages", permissions_count: 2, administrators_count: 1, super_admin: false)

      get admin_roles_path, params: { q: "supp" }
      expect(inertia.props[:roles].pluck(:name)).to eq(%w[Support])
    end

    it "is forbidden without roles.read" do
      get admin_roles_path

      expect(response).to redirect_to(admin_root_path)
      expect(flash[:alert]).to eq("You are not authorized to perform this action")
    end
  end

  describe "GET /admin/roles/:id" do
    it "shows the role's permissions, the catalog and its administrators" do
      grant(admin, "roles.read", "admins.read")
      role = create_role("Editor", "pages.read")
      role.users << admin

      get admin_role_path(role)

      expect_inertia.to render_component("admin/roles/show")
      expect(inertia.props[:role]).to include(name: "Editor", permission_keys: [ "pages.read" ])
      expect(inertia.props[:catalog]).to include(include(resource: "roles", actions: %w[read create update delete]))
      expect(inertia.props[:administrators_count]).to eq(1)
      expect(inertia.props[:administrators]).to contain_exactly(include(id: admin.id))
    end

    it "hides administrator names from users who can't list administrators" do
      grant(admin, "roles.read")
      role = create_role("Editor")
      role.users << admin

      get admin_role_path(role)

      expect(inertia.props[:administrators_count]).to eq(1)
      expect(inertia.props[:administrators]).to be_nil
    end
  end

  describe "POST /admin/roles" do
    it "creates a role with its permissions, ignoring keys outside the catalog" do
      grant(admin, "roles.create")

      post admin_roles_path, params: {
        role: { name: " Dispatcher ", description: "", permission_keys: %w[customers.read customers.update bogus.read] }
      }

      role = Role.find_by!(name: "Dispatcher")
      expect(response).to redirect_to(admin_role_path(role))
      expect(role.description).to be_nil
      expect(role.permission_keys).to eq(%w[customers.read customers.update])
    end

    it "returns errors for an invalid role and creates nothing" do
      grant(admin, "roles.create")

      expect {
        post admin_roles_path, params: { role: { name: "", permission_keys: %w[customers.read] } }
      }.not_to change(Role, :count)

      expect(response).to redirect_to(new_admin_role_path)
    end

    it "is forbidden without roles.create" do
      grant(admin, "roles.read")

      expect { post admin_roles_path, params: { role: { name: "X" } } }.not_to change(Role, :count)
    end
  end

  describe "PATCH /admin/roles/:id" do
    it "replaces the role's permissions" do
      grant(admin, "roles.update")
      role = create_role("Editor", "pages.read", "blogs.read")

      patch admin_role_path(role), params: { role: { name: "Writer", permission_keys: %w[blogs.read blogs.update] } }

      expect(response).to redirect_to(admin_role_path(role))
      expect(role.reload.name).to eq("Writer")
      expect(role.permission_keys).to eq(%w[blogs.read blogs.update])
    end

    it "keeps the old permissions when the role is invalid" do
      grant(admin, "roles.update")
      create_role("Taken")
      role = create_role("Editor", "pages.read")

      patch admin_role_path(role), params: { role: { name: "Taken", permission_keys: %w[blogs.read] } }

      expect(response).to redirect_to(edit_admin_role_path(role))
      expect(role.reload.permission_keys).to eq(%w[pages.read])
    end

    it "never edits the Super Admin role for an admin who doesn't hold it" do
      grant(admin, "roles.update")
      super_admin = Role.super_admin!

      patch admin_role_path(super_admin), params: { role: { name: "Renamed", permission_keys: [] } }

      expect(flash[:alert]).to eq("You are not authorized to perform this action")
      expect(super_admin.reload.name).to eq(Role::SUPER_ADMIN)
      expect(super_admin.permission_keys).to match_array(Permission.catalog_keys)
    end

    it "lets a Super Admin edit the Super Admin role, even though it's their own" do
      super_admin = Role.super_admin!
      admin.roles << super_admin

      patch admin_role_path(super_admin), params: { role: { name: "Renamed", permission_keys: %w[pages.read] } }

      expect(response).to redirect_to(admin_role_path(super_admin))
      expect(super_admin.reload.name).to eq("Renamed")
      expect(super_admin.permission_keys).to eq(%w[pages.read])
    end
  end

  describe "DELETE /admin/roles/:id" do
    it "deletes the role and unassigns it" do
      grant(admin, "roles.delete")
      role = create_role("Editor", "pages.read")
      role.users << admin

      delete admin_role_path(role)

      expect(response).to redirect_to(admin_roles_path)
      expect(Role.exists?(role.id)).to be(false)
      expect(admin.reload.roles).not_to include(role)
    end

    it "never deletes the Super Admin role" do
      grant(admin, "roles.delete")
      super_admin = Role.super_admin!

      delete admin_role_path(super_admin)

      expect(flash[:alert]).to eq("You are not authorized to perform this action")
      expect(Role.exists?(super_admin.id)).to be(true)
    end
  end
end
