# frozen_string_literal: true

require "rails_helper"

RSpec.describe Permission, type: :model do
  it "is valid with a resource and action" do
    expect(Permission.new(resource: "booking", action: "create")).to be_valid
  end

  it "requires a resource" do
    expect(Permission.new(action: "create")).not_to be_valid
  end

  it "requires an action" do
    expect(Permission.new(resource: "booking")).not_to be_valid
  end

  it "requires a unique action per resource" do
    Permission.create!(resource: "booking", action: "create")
    expect(Permission.new(resource: "booking", action: "create")).not_to be_valid
  end
end
