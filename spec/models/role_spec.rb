# frozen_string_literal: true

require "rails_helper"

RSpec.describe Role, type: :model do
  it "is valid with a unique name" do
    expect(Role.new(name: "cashier")).to be_valid
  end

  it "requires a name" do
    expect(Role.new).not_to be_valid
  end

  it "requires a unique name" do
    Role.create!(name: "cashier")
    expect(Role.new(name: "cashier")).not_to be_valid
  end

  it "strips the name" do
    expect(Role.create!(name: "  cashier ").name).to eq("cashier")
  end

  describe "#permission_keys=" do
    it "replaces the permissions, ignoring keys outside the catalog" do
      role = Role.create!(name: "cashier")
      role.update!(permission_keys: %w[customers.read nope.read customers.update])
      expect(role.reload.permission_keys).to eq(%w[customers.read customers.update])

      role.update!(permission_keys: %w[cities.read])
      expect(role.reload.permission_keys).to eq(%w[cities.read])
    end
  end

  describe "Super Admin" do
    it "holds the whole catalog and can't be deleted" do
      role = Role.super_admin!

      expect(role.permission_keys).to match_array(Permission.catalog_keys)
      expect(role.destroy).to be(false)
      expect(role.errors[:base]).to include("The Super Admin role can't be deleted")
      expect(Role.exists?(role.id)).to be(true)
    end

    it "keeps its assignments when a delete is refused" do
      admin = User.create!(name: "A", email: "a@example.com", password: "password123456", role: :admin)
      role = Role.super_admin!
      admin.roles << role

      role.destroy

      expect(admin.reload.roles).to include(role)
    end
  end
end
