# frozen_string_literal: true

require "rails_helper"

RSpec.describe Membership, type: :model do
  it "is valid with valid attributes" do
    expect(Membership.new(egp_to_points: 1, points_to_egp: 1, background_color: "#FFFFFF", text_color: "#000000")).to be_valid
  end

  it "requires egp_to_points to be greater than 0" do
    membership = Membership.new(egp_to_points: 0, points_to_egp: 1, background_color: "#FFFFFF", text_color: "#000000")
    expect(membership).not_to be_valid
  end

  it "requires background_color to be a hex color" do
    membership = Membership.new(egp_to_points: 1, points_to_egp: 1, background_color: "not-a-color", text_color: "#000000")
    expect(membership).not_to be_valid
  end

  it "defaults is_active to true" do
    membership = Membership.create!(egp_to_points: 1, points_to_egp: 1, background_color: "#FFFFFF", text_color: "#000000")
    expect(membership.is_active).to be(true)
  end
end
